# 🌱 Agrodiário  

Turn the hard work of your farm into real value.

<img src="https://i.imgur.com/8C3ba5b.jpeg" alt="Agrodiário Mockup" />

**Agrodiário** is a digital diary designed for family farmers to record sustainable actions such as soil management practices, soil health, reforestation, and other environmental initiatives.  
These records form an activity log that helps farmers qualify for **carbon credits** and other environmental certifications.

---

## Prerequisites
Before running the project, make sure you have installed:

- **Node.js** (recommended version: 18+)
- **Yarn**
- **PostgreSQL**

---

## Environment setup

### Create the database
Run the following command in PostgreSQL:

```sql
CREATE DATABASE agrodiario;
```

### Configure the ``.env`` file

Create a ``.env`` file in the backend following the ``.env.example`` template:

```bash
cp .env.example .env
```

### Installing dependencies

```bash
yarn install
```

---

## Configuração do Serviço de Email

O Agrodiário utiliza emails para funcionalidades de autenticação:
- **Verificação de email** após o cadastro
- **Recuperação de senha** (esqueci minha senha)

### Variáveis de Ambiente

Adicione as seguintes variáveis ao arquivo `.env` do backend:

```env
# Email Configuration
SMTP_HOST=smtp.exemplo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-usuario
SMTP_PASSWORD=sua-senha
SMTP_FROM=AgroDiario <noreply@seudominio.com>

# URL do Frontend (usado nos links dos emails)
FRONTEND_URL=http://localhost:5173
```

### Provedores de Email Suportados

#### Opção 1: SendGrid (Recomendado para Produção)

SendGrid oferece 100 emails/dia gratuitos e é fácil de configurar.

1. Crie uma conta em [sendgrid.com](https://sendgrid.com)
2. Vá em **Settings → API Keys** e crie uma chave
3. Vá em **Settings → Sender Authentication** e verifique um email
4. Configure o `.env`:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=SG.sua-api-key-aqui
SMTP_FROM=AgroDiario <seu-email-verificado@dominio.com>
```

> **Importante:** O `SMTP_USER` deve ser literalmente `apikey` (não seu email).

#### Opção 2: Gmail

Para usar Gmail, você precisa criar uma **Senha de App**:

1. Ative a **Verificação em 2 etapas** na sua conta Google
2. Acesse [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Crie uma senha de app para "E-mail"
4. Configure o `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
SMTP_FROM=AgroDiario <seu-email@gmail.com>
```

> **Nota:** A senha de app tem 16 caracteres separados por espaços.

### Testando a Configuração

Para verificar se o email está funcionando:

1. Inicie o backend: `yarn dev:backend`
2. Acesse a página de login no frontend
3. Clique em "Esqueceu a senha?"
4. Digite um email cadastrado
5. Verifique se o email chegou

### Troubleshooting

| Erro | Solução |
|------|---------|
| `Invalid login` | Verifique usuário e senha SMTP |
| `Connection refused` | Verifique host e porta |
| `Self signed certificate` | Defina `SMTP_SECURE=false` |
| Email não chega | Verifique pasta de spam ou use Mailtrap para debug |

---

## Running the project
### Front-end
```bash
yarn dev:client
```

### Back-end
```bash
yarn dev:backend
```

---

## Testes

O projeto utiliza **Jest** como framework de testes para o backend.

### Executando os Testes

```bash
# Rodar todos os testes do backend
cd packages/backend
yarn test

# Rodar testes em modo watch (re-executa ao salvar)
yarn test:watch

# Rodar testes com cobertura de código
yarn test:cov

# Rodar apenas testes de autenticação e email
yarn test --testPathPattern="(email|auth)\.service\.spec\.ts"
```

### Estrutura dos Testes

Os arquivos de teste ficam junto aos arquivos de código fonte, com a extensão `.spec.ts`:

```
src/modules/
├── auth/
│   ├── auth.service.ts
│   └── auth.service.spec.ts    # 24 testes
├── email/
│   ├── email.service.ts
│   └── email.service.spec.ts   # 11 testes
└── ...
```

### Cobertura de Testes

| Módulo | Testes | Descrição |
|--------|--------|-----------|
| **AuthService** | 24 | Login, registro, recuperação de senha, verificação de email |
| **EmailService** | 11 | Envio de emails de verificação e recuperação |

### Escrevendo Novos Testes

Siga o padrão existente utilizando `@nestjs/testing`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';

describe('MeuService', () => {
  let service: MeuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeuService,
        { provide: DependenciaService, useValue: mockDependencia },
      ],
    }).compile();

    service = module.get<MeuService>(MeuService);
  });

  it('deve fazer algo', async () => {
    const result = await service.metodo();
    expect(result).toBeDefined();
  });
});
```

---

## CI/CD

O projeto utiliza **GitHub Actions** para integração contínua.

### Pipeline de Testes

O workflow é executado automaticamente em:
- Push para `main` ou `develop`
- Pull requests para `main` ou `develop`

### Jobs do Pipeline

| Job | Descrição | Obrigatório |
|-----|-----------|-------------|
| `test-auth-email` | Testes de autenticação e email (35 testes) | Sim |
| `test-backend-all` | Todos os testes do backend | Não* |
| `test-frontend` | Verificação de tipos TypeScript | Não* |
| `build` | Compilação do backend | Sim |

> *Estes jobs podem falhar sem bloquear o merge (continue-on-error)

### Verificando o Status

Após abrir um PR ou fazer push, verifique o status dos checks:

1. Acesse a aba **Actions** no GitHub
2. Clique no workflow run mais recente
3. Verifique se os jobs obrigatórios passaram

### Arquivo de Configuração

O workflow está definido em `.github/workflows/test.yml`.

---

## Figma Design
You can view the project’s design prototype on Figma:

🎨 **Figma Project:** https://www.figma.com/design/5mupDJvETRMmNdbwiLXuQ7/AgroDi%C3%A1rio?node-id=11-1833&t=xX2ODMRWWHwvqowm-1



## Contributions

Feel free to open issues, suggest improvements, or submit pull requests.
