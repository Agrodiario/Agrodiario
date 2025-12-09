import { Injectable, Logger } from '@nestjs/common';
import translate from 'translate-google';

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);

  /**
   * Translates text from English to Portuguese
   * @param text Text to translate
   * @returns Translated text in Portuguese
   */
  async translateToPortuguese(text: string): Promise<string> {
    try {
      this.logger.log(`Translating "${text}"...`);
      const translated = await translate(text, { from: 'en', to: 'pt' });
      this.logger.log(`Translated "${text}" to "${translated}"`);
      return typeof translated === 'string' ? translated : translated[0];
    } catch (error) {
      this.logger.error(`Translation error for "${text}": ${error.message}`);
      return text; // Return original text if translation fails
    }
  }

  /**
   * Translates multiple texts from English to Portuguese
   * @param texts Array of texts to translate
   * @returns Array of translated texts in Portuguese
   */
  async translateBatch(texts: string[]): Promise<string[]> {
    try {
      const translations = await Promise.all(texts.map((text) => this.translateToPortuguese(text)));
      return translations;
    } catch (error) {
      this.logger.error(`Batch translation error: ${error.message}`);
      return texts; // Return original texts if translation fails
    }
  }
}
