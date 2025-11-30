import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EmbrapaService {
  private accessToken: string | null = null;
  private tokenExpiration: number = 0; 

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private async getAccessToken(): Promise<string> {
    const now = Date.now();

    if (this.accessToken && now < this.tokenExpiration - 60000) {
      return this.accessToken;
    }

    const key = this.configService.get<string>('EMBRAPA_CONSUMER_KEY');
    const secret = this.configService.get<string>('EMBRAPA_CONSUMER_SECRET');
    
    const authHeader = Buffer.from(`${key}:${secret}`).toString('base64');

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.cnptia.embrapa.br/token',
          'grant_type=client_credentials',
          {
            headers: {
              Authorization: `Basic ${authHeader}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      this.accessToken = response.data.access_token;
      console.log("Token Embrapa obtido:", this.accessToken);
      this.tokenExpiration = now + (response.data.expires_in * 1000);
      
      return this.accessToken;
    } catch (error) {
      console.error('Erro ao autenticar na Embrapa', error.response?.data || error.message);
      throw new InternalServerErrorException('Falha ao autenticar com serviço externo');
    }
  }

  async getInsumos(search?: string) {
    const token = await this.getAccessToken(); 
    try {
        const params: any = { 
            itens: 50,
            pagina: 1,
            marca_comercial: search 
          };
        
        const response = await firstValueFrom(
            this.httpService.get(
                'https://api.cnptia.embrapa.br/agrofit/v1/search/produtos-formulados', 
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: params
                },
            ),
        );
        const uniqueBrands = new Set();
        const options = [];

        for (const item of response.data) {
            if (!uniqueBrands.has(item.marca_comercial[0])) {
            uniqueBrands.add(item.marca_comercial[0]);
            options.push({
                label: item.marca_comercial[0], 
                value: item.marca_comercial[0],
            });
            }
        }

        return options;

    } catch (error) {
      console.error('Erro ao buscar insumos', error);
      return [];
    }
  }
}