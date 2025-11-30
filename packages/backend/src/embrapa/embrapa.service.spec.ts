import { Test, TestingModule } from '@nestjs/testing';
import { EmbrapaService } from './embrapa.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { InternalServerErrorException } from '@nestjs/common';
import { AxiosHeaders, AxiosResponse } from 'axios';

describe('EmbrapaService', () => {
  let service: EmbrapaService;
  let httpService: HttpService;
  let configService: ConfigService;

  const mockAuthResponse: AxiosResponse = {
    data: { access_token: 'fake_token', expires_in: 3600 },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: new AxiosHeaders() },
  };

  const mockProductsResponse: AxiosResponse = {
    data: {
      data: [
        { marca_comercial: ['Produto A'] },
        { marca_comercial: ['Produto A'] }, 
        { marca_comercial: ['Produto B'] },
      ],
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: new AxiosHeaders() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmbrapaService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'EMBRAPA_CONSUMER_KEY') return 'fake_key';
              if (key === 'EMBRAPA_CONSUMER_SECRET') return 'fake_secret';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EmbrapaService>(EmbrapaService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getInsumos', () => {
    it('should authenticate, fetch data, and return formatted options', async () => {
      jest.spyOn(httpService, 'post').mockReturnValue(of(mockAuthResponse));
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockProductsResponse));

      const result = await service.getInsumos('search_term');

      expect(configService.get).toHaveBeenCalledWith('EMBRAPA_CONSUMER_KEY');
      expect(httpService.post).toHaveBeenCalledWith(
        'https://api.cnptia.embrapa.br/token',
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Basic'),
          }),
        }),
      );

      expect(httpService.get).toHaveBeenCalledWith(
        'https://api.cnptia.embrapa.br/agrofit/v1/search/produtos-formulados',
        expect.objectContaining({
          headers: { Authorization: 'Bearer fake_token' },
          params: expect.objectContaining({ marca_comercial: 'search_term' }),
        }),
      );

      expect(result).toHaveLength(2);
      expect(result).toEqual([
        { label: 'Produto A', value: 'Produto A' },
        { label: 'Produto B', value: 'Produto B' },
      ]);
    });

    it('should reuse the access token if it is still valid', async () => {
      jest.spyOn(httpService, 'post').mockReturnValue(of(mockAuthResponse));
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockProductsResponse));

      await service.getInsumos();
      
      await service.getInsumos();

      expect(httpService.post).toHaveBeenCalledTimes(1);
      expect(httpService.get).toHaveBeenCalledTimes(2);
    });

    it('should return an empty array if the fetch request fails', async () => {
      jest.spyOn(httpService, 'post').mockReturnValue(of(mockAuthResponse));
      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => new Error('API Error')));

      const result = await service.getInsumos();

      expect(result).toEqual([]);
    });

    it('should throw InternalServerErrorException if authentication fails', async () => {
      jest.spyOn(httpService, 'post').mockReturnValue(throwError(() => ({
        response: { data: 'Auth Failed' },
      })));

      await expect(service.getInsumos()).rejects.toThrow(InternalServerErrorException);
    });
  });
});