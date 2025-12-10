import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api/v1'),

  // CORS
  CORS_ORIGIN: Joi.string().default('http://localhost:5173'),

  // Database - either DATABASE_URL or individual DB_* variables
  // When DATABASE_URL is provided, individual vars are optional
  DATABASE_URL: Joi.string().optional(),
  DB_TYPE: Joi.string().default('postgres'),
  DB_HOST: Joi.string().optional().default(''),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().optional().default(''),
  DB_PASSWORD: Joi.string().optional().allow('').default(''),
  DB_DATABASE: Joi.string().optional().default(''),
  DB_SYNCHRONIZE: Joi.boolean().default(false),

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().default('1d'),
  JWT_REMEMBER_ME_EXPIRATION: Joi.string().default('30d'),

  // Email
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().default(587),
  SMTP_SECURE: Joi.boolean().default(false),
  SMTP_USER: Joi.string().required(),
  SMTP_PASSWORD: Joi.string().required(),
  SMTP_FROM: Joi.string().required(),

  // Frontend
  FRONTEND_URL: Joi.string().required(),

  // Rate Limiting
  MAX_LOGIN_ATTEMPTS: Joi.number().default(5),
})
  // Custom validation: require either DATABASE_URL or all DB_* variables
  .custom((value, helpers) => {
    const hasDbUrl = !!value.DATABASE_URL;
    const hasIndividualVars =
      value.DB_HOST && value.DB_USERNAME && value.DB_DATABASE;

    if (!hasDbUrl && !hasIndividualVars) {
      return helpers.error('any.custom', {
        message:
          'Either DATABASE_URL or DB_HOST, DB_USERNAME, DB_PASSWORD, and DB_DATABASE must be provided',
      });
    }
    return value;
  });
