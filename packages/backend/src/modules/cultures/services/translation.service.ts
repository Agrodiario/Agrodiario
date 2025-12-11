import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://translation.googleapis.com/language/translate/v2';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_TRANSLATE_API_KEY') || 
                  'AIzaSyBOZcF_cjC_s_XexU1BKhiBo3v7XiJ841U';
    
    if (!this.apiKey) {
      this.logger.error('Google Translate API key not configured!');
    } else {
      this.logger.log('Google Cloud Translation API initialized');
    }
  }

  /**
   * Translates text from English to Portuguese using Google Cloud Translation API
   * @param text Text to translate
   * @returns Translated text in Portuguese
   */
  async translateToPortuguese(text: string): Promise<string> {
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return text;
    }

    const maxAttempts = 2;
    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        this.logger.debug(`[Attempt ${attempt}/${maxAttempts}] Translating: "${text}"`);
        
        const response = await axios.post(
          this.apiUrl,
          {
            q: text,
            source: 'en',
            target: 'pt',
            format: 'text'
          },
          {
            params: { key: this.apiKey },
            timeout: 10000
          }
        );
        
        const translatedText = response.data?.data?.translations?.[0]?.translatedText;
        
        // Valida se a tradução foi bem-sucedida
        if (translatedText && translatedText.trim() !== '' && translatedText.toLowerCase() !== text.toLowerCase()) {
          this.logger.log(`✓ Translated "${text}" → "${translatedText}"`);
          return translatedText;
        }
        
        // Se retornou o mesmo texto, considera que não traduziu
        if (translatedText && translatedText.toLowerCase() === text.toLowerCase()) {
          this.logger.warn(`Translation returned same text: "${text}"`);
          if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 200));
            continue;
          }
        }
        
        return translatedText || text;
      } catch (error) {
        lastError = error;
        const errorMessage = error.response?.data?.error?.message || error.message;
        this.logger.warn(`[Attempt ${attempt}/${maxAttempts}] Translation error: ${errorMessage}`);
        
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    }
    
    this.logger.error(`✗ Translation failed for "${text}" after ${maxAttempts} attempts: ${lastError?.response?.data?.error?.message || lastError?.message}`);
    return text; // Return original text if all attempts fail
  }

  /**
   * Translates multiple texts from English to Portuguese using batch API
   * @param texts Array of texts to translate
   * @returns Array of translated texts in Portuguese
   */
  async translateBatch(texts: string[]): Promise<string[]> {
    if (!texts || texts.length === 0) {
      return texts;
    }

    this.logger.log(`Starting batch translation of ${texts.length} items...`);

    try {
      // Remove duplicatas e mantém mapeamento
      const uniqueTexts = [...new Set(texts)];
      const translationMap = new Map<string, string>();
      
      this.logger.debug(`Unique texts to translate: ${uniqueTexts.length}`);
      
      // Google Cloud Translation API suporta até 128 textos por requisição
      const batchSize = 50;
      
      for (let i = 0; i < uniqueTexts.length; i += batchSize) {
        const batch = uniqueTexts.slice(i, i + batchSize);
        this.logger.debug(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(uniqueTexts.length / batchSize)}`);
        
        try {
          // Usa a API de lote do Google Cloud Translation
          const response = await axios.post(
            this.apiUrl,
            {
              q: batch,
              source: 'en',
              target: 'pt',
              format: 'text'
            },
            {
              params: { key: this.apiKey },
              timeout: 15000
            }
          );
          
          const translations = response.data?.data?.translations || [];
          
          batch.forEach((text, index) => {
            const translatedText = translations[index]?.translatedText || text;
            translationMap.set(text, translatedText);
          });
          
        } catch (error) {
          this.logger.error(`Batch API failed, falling back to individual translations: ${error.response?.data?.error?.message || error.message}`);
          
          // Fallback: traduz individualmente
          const translations = await Promise.all(
            batch.map(text => this.translateToPortuguese(text))
          );
          
          batch.forEach((text, index) => {
            translationMap.set(text, translations[index]);
          });
        }
        
        // Pequeno delay entre batches
        if (i + batchSize < uniqueTexts.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Mapeia de volta para a ordem original
      const result = texts.map(text => translationMap.get(text) || text);
      
      const translatedCount = result.filter((t, i) => t.toLowerCase() !== texts[i].toLowerCase()).length;
      this.logger.log(`✓ Batch translation complete: ${translatedCount}/${texts.length} items translated`);
      
      return result;
    } catch (error) {
      this.logger.error(`✗ Batch translation error: ${error.response?.data?.error?.message || error.message}`);
      return texts; // Return original texts if translation fails
    }
  }
}
