import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from '@config/app.config';
import databaseConfig from '@config/database.config';
import { validationSchema } from '@config/validation.schema';
import { UsersModule } from '@modules/users/users.module';
import { AuthModule } from '@modules/auth/auth.module';
import { ActivityModule } from './modules/activities/activities.module';
import { EmbrapaModule } from './embrapa/embrapa.module';
import { PropertiesModule } from '@modules/properties/properties.module';
import { CulturesModule } from '@modules/cultures/cultures.module';

@Module({
  imports: [
    // Configuration module - loads .env file with validation
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, databaseConfig],
      validationSchema,
    }),

    // TypeORM module - Database connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        synchronize: configService.get<boolean>('database.synchronize'),
        logging: configService.get<boolean>('database.logging'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    UsersModule,
    AuthModule,
    ActivityModule,
    EmbrapaModule,
    PropertiesModule,
    CulturesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
