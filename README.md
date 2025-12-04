# 🌱 Agrodiário  

Transforme o trabalho da sua propriedade rural em valor real.

<img src="https://i.imgur.com/8C3ba5b.jpeg" alt="Mockup Agrodiário" />

Agrodiário é um diário digital criado para agricultores familiares registrarem ações sustentáveis, como práticas de manejo do solo, saúde do solo, reflorestamento e outras iniciativas ambientais.
Esses registros formam um histórico de atividades que ajuda o produtor a se qualificar para créditos de carbono e outras certificações ambientais.

## Sumário

- [Pré-requisitos](#pré-requisitos)
- [Configuração do Ambiente](#configuração-do-ambiente)
  - [Criar o banco de dados](#criar-o-banco-de-dados)
  - [Configurar o arquivo env](#configurar-o-arquivo-env)
  - [Instalar dependências](#instalar-dependências)
- [Configuração do serviço de email](#configuração-do-serviço-de-email)
  - [Variáveis de Ambiente](#variáveis-de-ambiente)
  - [Provedores de email suportados](#provedores-de-email-suportados)
    - [SendGrid](#opção-1-sendgrid-recomendado-para-produção)
    - [Gmail](#opção-2-gmail)
  - [Testando a Configuração](#testando-a-configuração)
  - [Troubleshooting](#troubleshooting)
- [Executando o projeto](#executando-o-projeto)
  - [Front-end](#front-end)
  - [Back-end](#back-end)
- [Testes](#testes)
  - [Executando os Testes](#executando-os-testes)
  - [Cobertura de Testes](#cobertura-de-testes)
- [CI/CD](#cicd)
  - [Pipeline de Testes](#pipeline-de-testes)
  - [Jobs do Pipeline](#jobs-do-pipeline)
- [Figma Design](#figma-design)
- [Contribuições](#contribuições)

---

## Pré-requisitos
Antes de executar o projeto, certifique-se de ter instalado:

- **Node.js** (versão recomendada: 18+)
- **Yarn**
- **PostgreSQL**

---

## Configuração do Ambiente

### Criar o banco de dados
No PostgreSQL, execute:

```sql
CREATE DATABASE agrodiario;
```

### Configurar o arquivo ``.env``

Crie o arquivo ``.env`` no backend seguindo o modelo ``.env.example``:

```bash
cp .env.example .env
```

### Instalar dependências

```bash
yarn install
```

---

## Configuração do serviço de email

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

### Provedores de email suportados

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

## Executando o projeto
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

O projeto possui **133 testes unitários** no backend utilizando **Jest**.

### Executando os Testes

```bash
# Rodar todos os testes do backend
cd packages/backend
yarn test

# Rodar testes em modo watch (re-executa ao salvar)
yarn test:watch

# Rodar testes com cobertura de código
yarn test:cov
```

### Cobertura de Testes

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

---

## CI/CD

O projeto utiliza **GitHub Actions** para integração contínua.

### Pipeline de Testes

O workflow é executado automaticamente em:
- Push para `main` ou `develop`
- Pull requests para `main` ou `develop`

### Jobs do Pipeline

| Job | Descrição |
|-----|-----------|
| `test-backend` | Executa todos os 133 testes unitários com cobertura |
| `test-frontend` | Verificação de tipos TypeScript |
| `build` | Compilação do backend |

### Arquivo de Configuração

O workflow está definido em `.github/workflows/test.yml`.

---

## Figma Design
Visualize o protótipo do design:

👉 **Figma:** https://www.figma.com/design/5mupDJvETRMmNdbwiLXuQ7/AgroDi%C3%A1rio?node-id=11-1833&t=xX2ODMRWWHwvqowm-1

## Contribuições

Sinta-se à vontade para abrir issues, sugerir melhorias ou enviar pull requests.