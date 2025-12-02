# Agrodiario Backend - NestJS API

A RESTful API built with NestJS following MVC architecture patterns for agricultural management.

## Architecture

This project follows a **Model-View-Controller (MVC)** architecture adapted for NestJS:

- **Models**: Entities (TypeORM) + DTOs (Data Transfer Objects)
- **Controllers**: HTTP route handlers (thin layer)
- **Services**: Business logic layer
- **Views**: JSON responses (automatically handled)

## Project Structure

```
src/
├── main.ts                          # Application entry point & bootstrap
├── app.module.ts                    # Root module (imports all feature modules)
├── app.controller.ts                # Health check & info routes
├── app.service.ts                   # Basic app services
│
├── config/                          # Configuration files
│   ├── app.config.ts                # Application settings
│   ├── database.config.ts           # Database settings
│   └── validation.schema.ts         # Environment validation (Joi)
│
├── database/
│   ├── entities/
│   │   └── base.entity.ts           # Base entity (id, createdAt, updatedAt)
│   ├── migrations/                  # Database migrations
│   └── seeds/                       # Database seeders
│
├── common/                          # Shared utilities
│   ├── decorators/                  # Custom decorators
│   ├── dto/                         # Shared DTOs
│   ├── filters/
│   │   ├── http-exception.filter.ts # HTTP exception handler
│   │   └── all-exceptions.filter.ts # Global exception handler
│   ├── interceptors/
│   │   ├── transform.interceptor.ts # Response transformation
│   │   └── logging.interceptor.ts   # Request/response logging
│   ├── pipes/                       # Custom validation pipes
│   └── guards/                      # Auth guards (future)
│
└── modules/                         # Feature modules (MVC pattern)
    └── users/                       # Example CRUD module
        ├── users.module.ts          # Module definition
        ├── users.controller.ts      # HTTP routes (Controller layer)
        ├── users.service.ts         # Business logic (Service layer)
        ├── entities/
        │   └── user.entity.ts       # Database model (Model layer)
        └── dto/
            ├── create-user.dto.ts   # Request validation
            ├── update-user.dto.ts   # Request validation
            └── user-response.dto.ts # Response serialization
```

## Technology Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.1.3
- **Database**: PostgreSQL (via TypeORM)
- **Validation**: class-validator + class-transformer
- **Testing**: Jest
- **Package Manager**: Yarn (monorepo)

## Getting Started

### Prerequisites

- Node.js >= 20.18.1
- Yarn package manager
- PostgreSQL 14+

### Installation

1. **Install dependencies** (from project root):
   ```bash
   yarn install
   ```

2. **Configure environment variables**:
   ```bash
   cd packages/backend
   cp .env.example .env
   ```

3. **Update database credentials** in `.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_DATABASE=agrodiario
   DB_SYNCHRONIZE=true  # Auto-sync schema (dev only!)
   ```

4. **Create database**:
   ```bash
   createdb agrodiario
   # or
   psql -U postgres -c "CREATE DATABASE agrodiario;"
   ```

5. **Start the application**:
   ```bash
   yarn start:dev
   ```

The API will be available at: `http://localhost:3000/api/v1`

## Available Scripts

### Development
- `yarn start` - Start the application
- `yarn start:dev` - Start with watch mode (auto-reload)
- `yarn start:debug` - Start with debugger

### Building
- `yarn build` - Compile TypeScript to dist/

### Code Quality
- `yarn lint` - Run ESLint with auto-fix
- `yarn format` - Format code with Prettier

### Testing
- `yarn test` - Run unit tests
- `yarn test:watch` - Run tests in watch mode
- `yarn test:cov` - Run tests with coverage
- `yarn test:e2e` - Run end-to-end tests

## Testes Unitários

O projeto possui **133 testes unitários** cobrindo os principais módulos:

| Módulo | Arquivo | Testes | Descrição |
|--------|---------|--------|-----------|
| Auth | `auth.service.spec.ts` | 24 | Autenticação, registro, verificação de email, reset de senha |
| Email | `email.service.spec.ts` | 11 | Envio de emails (reset de senha, verificação) |
| Activities | `activities.controller.spec.ts` | 6 | Endpoints de atividades |
| Activities | `activities.service.spec.ts` | 9 | Lógica de negócio de atividades |
| Cultures | `cultures.controller.spec.ts` | 5 | Endpoints de culturas |
| Cultures | `cultures.service.spec.ts` | 9 | Lógica de negócio de culturas |
| Cultures | `create-culture.dto.spec.ts` | 65 | Validação de DTOs |
| Embrapa | `embrapa.service.spec.ts` | 4 | Integração com API externa |

### Executando os Testes

```bash
# Executar todos os testes
yarn test

# Executar com cobertura
yarn test:cov

# Executar em modo watch (desenvolvimento)
yarn test:watch

# Executar testes específicos
yarn test --testPathPattern="auth.service"
```

## API Endpoints

### Health Check
- `GET /api/v1/health` - Health check endpoint
- `GET /api/v1/info` - API information

### Users (Example CRUD)
- `GET /api/v1/users` - List all users (with pagination)
  - Query params: `?page=1&limit=10`
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create new user
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Soft delete user
- `DELETE /api/v1/users/:id/hard` - Permanently delete user

### Example Request (Create User)
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }'
```

## Creating a New Module

Follow the MVC pattern to create new feature modules:

### 1. Generate Module Scaffold
```bash
nest generate module modules/products
nest generate controller modules/products
nest generate service modules/products
```

### 2. Create Entity (Model)
```typescript
// src/modules/products/entities/product.entity.ts
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column('decimal')
  price: number;
}
```

### 3. Create DTOs
```typescript
// src/modules/products/dto/create-product.dto.ts
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;
}
```

### 4. Implement Service (Business Logic)
```typescript
// src/modules/products/products.service.ts
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(dto);
    return await this.productsRepository.save(product);
  }

  // ... other methods
}
```

### 5. Implement Controller (Routes)
```typescript
// src/modules/products/products.controller.ts
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  // ... other routes
}
```

### 6. Register in Module
```typescript
// src/modules/products/products.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
```

### 7. Import in AppModule
```typescript
// src/app.module.ts
@Module({
  imports: [
    // ... other imports
    ProductsModule,
  ],
})
export class AppModule {}
```

## Features

### ✅ Implemented
- [x] MVC architecture pattern
- [x] TypeORM database integration
- [x] Environment configuration with validation
- [x] Global validation pipes
- [x] Exception filters for error handling
- [x] Logging interceptor
- [x] CORS support
- [x] Base entity with timestamps
- [x] Example CRUD module (Users)
- [x] DTO validation with class-validator
- [x] Pagination support

### 🚧 Future Enhancements
- [ ] Authentication & Authorization (JWT)
- [ ] Role-based access control (RBAC)
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Rate limiting
- [ ] Caching (Redis)
- [ ] File upload support
- [ ] Database migrations
- [x] Unit test coverage (133 tests)
- [ ] Docker support
- [x] CI/CD pipeline (GitHub Actions)

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 3000 |
| `API_PREFIX` | API route prefix | api/v1 |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:5173 |
| `DB_TYPE` | Database type | postgres |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_USERNAME` | Database username | postgres |
| `DB_PASSWORD` | Database password | postgres |
| `DB_DATABASE` | Database name | agrodiario |
| `DB_SYNCHRONIZE` | Auto-sync schema (dev only!) | true |

## Best Practices

1. **Controllers**: Keep them thin - only handle HTTP requests/responses
2. **Services**: Contain all business logic and database operations
3. **DTOs**: Use for request validation and response serialization
4. **Entities**: Extend BaseEntity for consistent timestamps
5. **Error Handling**: Let global filters handle exceptions
6. **Validation**: Use class-validator decorators in DTOs
7. **Dependency Injection**: Use constructor injection
8. **Type Safety**: Leverage TypeScript's type system

## Troubleshooting

### Database Connection Issues
```
Error: password authentication failed for user "postgres"
```
**Solution**: Update database credentials in `.env` file

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Change `PORT` in `.env` or kill the process using port 3000

### Module Not Found
```
Error: Cannot find module '@modules/...'
```
**Solution**: TypeScript path aliases are configured in `tsconfig.json`. Make sure you've built the project with `yarn build`

## Contributing

When adding new features:
1. Follow the MVC pattern structure
2. Add validation to all DTOs
3. Handle errors properly in services
4. Write unit tests for services
5. Write e2e tests for controllers
6. Update this README

## License

Private - Agrodiario Project
