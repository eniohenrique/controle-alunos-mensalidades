# Controle de Alunos e Mensalidades

Sistema web para controle de alunos, mensalidades, pagamentos, vencimentos, inadimplência e relatório financeiro.

O projeto foi criado para ser genérico, podendo ser usado por studios, academias, escolas, professores particulares, aulas de dança, música, pilates, natação, entre outros negócios que trabalham com alunos e mensalidades.

---

## Tecnologias utilizadas

### Frontend

- React
- Vite
- Axios
- Lucide React

### Backend

- Node.js
- Express
- PostgreSQL
- JWT
- Bcrypt
- Multer

### Banco de dados

- PostgreSQL

---

## Estrutura do projeto

```txt
controle-alunos-mensalidades/
  backend/
  frontend/
  database/
```

---

# Como rodar o projeto localmente

## 1. Clonar o projeto

```bash
git clone URL_DO_REPOSITORIO
cd controle-alunos-mensalidades
```

---

# Banco de dados local

Crie um banco PostgreSQL chamado:

```sql
CREATE DATABASE controle_mensalidades;
```

Depois execute o script:

```txt
database/schema.sql
```

Esse script cria as tabelas:

```txt
empresas
usuarios
alunos
aluno_horarios
mensalidades
```

---

# Configurar o backend local

Entre na pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo:

```txt
backend/.env
```

Exemplo para ambiente local:

```env
PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_NAME=controle_mensalidades
DB_USER=postgres
DB_PASSWORD=sua_senha_local

JWT_SECRET=sua_chave_jwt_super_secreta

FRONTEND_URL=http://localhost:5173
```

Se estiver usando banco online, também é possível usar:

```env
DATABASE_URL=postgresql://usuario:senha@host:porta/database
```

Quando `DATABASE_URL` existir, o backend usa ela automaticamente.

Rodar o backend em desenvolvimento:

```bash
npm run dev
```

Rodar o backend em produção local:

```bash
npm start
```

Testar se o backend está online:

```txt
GET http://localhost:3001/healthcheck
```

Resposta esperada:

```json
{
  "status": "ok"
}
```

Testar conexão com o banco:

```txt
GET http://localhost:3001/api/teste/db
```

Resposta esperada:

```json
{
  "status": "ok",
  "banco": "conectado",
  "agora": "2026-05-07T12:35:59.155Z"
}
```

---

# Configurar o frontend local

Entre na pasta do frontend:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo:

```txt
frontend/.env
```

Exemplo local:

```env
VITE_API_URL=http://localhost:3001
```

Rodar o frontend:

```bash
npm run dev
```

Acesse:

```txt
http://localhost:5173
```

Gerar build:

```bash
npm run build
```

Testar build:

```bash
npm run preview
```

---

# Como usar a API

## URL base local

```txt
http://localhost:3001
```

---

# Autenticação

A maioria das rotas precisa de autenticação JWT.

Depois de fazer login, copie o token retornado e envie nas próximas requisições no header:

```txt
Authorization: Bearer SEU_TOKEN_AQUI
```

---

# Fluxo para testar a API do zero

## 1. Criar uma conta

Essa rota cria uma nova empresa e também o usuário administrador principal dessa empresa.

### Endpoint

```txt
POST /api/auth/criar-conta
```

### URL local

```txt
POST http://localhost:3001/api/auth/criar-conta
```

### Body JSON

```json
{
  "nome": "Teste",
  "email": "teste@teste.com",
  "senha": "123456",
  "nome_empresa": "Studio Teste",
  "telefone_empresa": "(99) 98765-4321"
}
```

### Resposta esperada

```json
{
  "message": "Conta criada com sucesso.",
  "empresa": {
    "id": 1,
    "nome": "Studio Teste"
  },
  "usuario": {
    "id": 1,
    "empresa_id": 1,
    "nome": "Teste",
    "email": "teste@teste.com",
    "role": "ADMIN"
  }
}
```

### Exemplo criando outra empresa

```json
{
  "nome": "João",
  "email": "joao@academia.com",
  "senha": "123456",
  "nome_empresa": "Academia do João",
  "telefone_empresa": "(99) 99999-9999"
}
```

Cada empresa fica isolada pelo campo:

```txt
empresa_id
```

Ou seja, um usuário de uma empresa não vê alunos e mensalidades de outra empresa.

---

## 2. Fazer login

### Endpoint

```txt
POST /api/auth/login
```

### URL local

```txt
POST http://localhost:3001/api/auth/login
```

### Body JSON

```json
{
  "email": "teste@teste.com",
  "senha": "123456"
}
```

### Resposta esperada

```json
{
  "message": "Login realizado com sucesso.",
  "token": "TOKEN_JWT_AQUI",
  "usuario": {
    "id": 1,
    "empresa_id": 1,
    "nome": "Teste",
    "email": "teste@teste.com",
    "role": "ADMIN",
    "ativo": true,
    "empresa_nome": "Studio Teste"
  }
}
```

Copie o valor do campo `token`. Ele será usado nas próximas chamadas.

---

## 3. Alterar senha do usuário logado

Essa rota altera a senha do usuário autenticado.

### Endpoint

```txt
PATCH /api/auth/alterar-senha
```

### URL local

```txt
PATCH http://localhost:3001/api/auth/alterar-senha
```

### Header obrigatório

```txt
Authorization: Bearer SEU_TOKEN_AQUI
```

### Body JSON

```json
{
  "senha_atual": "123456",
  "nova_senha": "novaSenhaForte123"
}
```

### Resposta esperada

```json
{
  "message": "Senha alterada com sucesso."
}
```

Depois de alterar a senha, faça login novamente usando a nova senha:

```json
{
  "email": "teste@teste.com",
  "senha": "novaSenhaForte123"
}
```

---

# Alunos

## 4. Criar aluno

### Endpoint

```txt
POST /api/alunos
```

### URL local

```txt
POST http://localhost:3001/api/alunos
```

### Header obrigatório

```txt
Authorization: Bearer SEU_TOKEN_AQUI
```

### Body JSON

```json
{
  "nome": "Maria Fernanda",
  "data_nascimento": "1998-05-10",
  "cpf": "123.456.789-00",
  "telefone": "19999999999",
  "dia_vencimento": 10,
  "valor_mensalidade": 150.0,
  "ativo": true,
  "observacao": "Aluna teste",
  "horarios": [
    {
      "dia_semana": "SEGUNDA",
      "horario": "09:00"
    },
    {
      "dia_semana": "QUARTA",
      "horario": "11:00"
    }
  ]
}
```

### Resposta esperada

```json
{
  "message": "Aluno cadastrado com sucesso.",
  "aluno": {
    "id": 1,
    "empresa_id": 1,
    "nome": "Maria Fernanda",
    "data_nascimento": "1998-05-10T03:00:00.000Z",
    "cpf": "123.456.789-00",
    "telefone": "19999999999",
    "dia_vencimento": 10,
    "valor_mensalidade": "150.00",
    "ativo": true,
    "observacao": "Aluna teste"
  }
}
```

---

## 5. Listar alunos

### Endpoint

```txt
GET /api/alunos
```

### URL local

```txt
GET http://localhost:3001/api/alunos
```

### Header obrigatório

```txt
Authorization: Bearer SEU_TOKEN_AQUI
```

### Resposta esperada

```json
[
  {
    "id": 1,
    "nome": "Maria Fernanda",
    "data_nascimento": "1998-05-10T03:00:00.000Z",
    "cpf": "123.456.789-00",
    "telefone": "19999999999",
    "dia_vencimento": 10,
    "valor_mensalidade": "150.00",
    "ativo": true,
    "observacao": "Aluna teste",
    "horarios": [
      {
        "id": 1,
        "dia_semana": "SEGUNDA",
        "horario": "09:00"
      },
      {
        "id": 2,
        "dia_semana": "QUARTA",
        "horario": "11:00"
      }
    ]
  }
]
```

---

## 6. Editar aluno

### Endpoint

```txt
PUT /api/alunos/:id
```

### Exemplo local

```txt
PUT http://localhost:3001/api/alunos/1
```

### Header obrigatório

```txt
Authorization: Bearer SEU_TOKEN_AQUI
```

### Body JSON

```json
{
  "nome": "Maria Fernanda Silva",
  "data_nascimento": "1998-05-10",
  "cpf": "123.456.789-00",
  "telefone": "19988887777",
  "dia_vencimento": 15,
  "valor_mensalidade": 180.0,
  "ativo": true,
  "observacao": "Aluna atualizada",
  "horarios": [
    {
      "dia_semana": "TERCA",
      "horario": "09:00"
    },
    {
      "dia_semana": "QUINTA",
      "horario": "11:00"
    }
  ]
}
```

### Resposta esperada

```json
{
  "message": "Aluno atualizado com sucesso.",
  "aluno": {
    "id": 1,
    "empresa_id": 1,
    "nome": "Maria Fernanda Silva",
    "data_nascimento": "1998-05-10T03:00:00.000Z",
    "cpf": "123.456.789-00",
    "telefone": "19988887777",
    "dia_vencimento": 15,
    "valor_mensalidade": "180.00",
    "ativo": true,
    "observacao": "Aluna atualizada"
  }
}
```

Observação: ao editar o aluno, os horários antigos são removidos e substituídos pelos horários enviados no body.

---

# Mensalidades

## 7. Listar mensalidades do mês

### Endpoint

```txt
GET /api/mensalidades
```

### URL local

```txt
GET http://localhost:3001/api/mensalidades
```

### Header obrigatório

```txt
Authorization: Bearer SEU_TOKEN_AQUI
```

Por padrão, a API lista o mês e ano atual.

Também é possível passar mês e ano:

```txt
GET http://localhost:3001/api/mensalidades?mes=5&ano=2026
```

### Resposta esperada

```json
[
  {
    "aluno_id": 1,
    "aluno_nome": "Maria Fernanda Silva",
    "telefone": "19988887777",
    "dia_vencimento": 15,
    "valor_mensalidade": "180.00",
    "ativo": true,
    "mensalidade_id": null,
    "mes": 5,
    "ano": 2026,
    "valor": "180.00",
    "status": "PENDENTE",
    "forma_pagamento": null,
    "data_pagamento": null,
    "comprovante_url": null,
    "observacao": null,
    "status_calculado": "PENDENTE"
  }
]
```

---

## Status da mensalidade

O campo `status_calculado` pode retornar:

```txt
PAGO
PENDENTE
ATRASADO
```

A mensalidade fica como `ATRASADO` quando:

```txt
O aluno está ativo
A mensalidade ainda não foi paga
O vencimento do mês já passou
```

---

## 8. Listar mensalidades atrasadas

Essa rota é usada para o sininho de notificação.

### Endpoint

```txt
GET /api/mensalidades/atrasadas
```

### URL local

```txt
GET http://localhost:3001/api/mensalidades/atrasadas
```

Também aceita mês e ano:

```txt
GET http://localhost:3001/api/mensalidades/atrasadas?mes=5&ano=2026
```

### Header obrigatório

```txt
Authorization: Bearer SEU_TOKEN_AQUI
```

### Resposta esperada

```json
{
  "quantidade": 1,
  "alunos": [
    {
      "aluno_id": 1,
      "aluno_nome": "Maria Fernanda Silva",
      "telefone": "19988887777",
      "dia_vencimento": 15,
      "valor_mensalidade": "180.00",
      "ativo": true,
      "mensalidade_id": null,
      "status": "PENDENTE",
      "forma_pagamento": null,
      "data_pagamento": null,
      "comprovante_url": null,
      "mes": 5,
      "ano": 2026,
      "valor": "180.00",
      "status_calculado": "ATRASADO"
    }
  ]
}
```

---

## 9. Registrar pagamento em dinheiro

### Endpoint

```txt
POST /api/mensalidades/:aluno_id/pagamento
```

### Exemplo local

```txt
POST http://localhost:3001/api/mensalidades/1/pagamento
```

### Header obrigatório

```txt
Authorization: Bearer SEU_TOKEN_AQUI
```

### Body JSON

```json
{
  "mes": 5,
  "ano": 2026,
  "valor": 180.0,
  "forma_pagamento": "DINHEIRO",
  "observacao": "Pagamento recebido em dinheiro"
}
```

### Resposta esperada

```json
{
  "message": "Pagamento registrado com sucesso.",
  "mensalidade": {
    "id": 1,
    "aluno_id": 1,
    "mes": 5,
    "ano": 2026,
    "valor": "180.00",
    "status": "PAGO",
    "forma_pagamento": "DINHEIRO",
    "data_pagamento": "2026-05-07T12:00:00.000Z",
    "comprovante_url": null,
    "observacao": "Pagamento recebido em dinheiro"
  }
}
```

---

## 10. Enviar comprovante PIX

Antes de registrar pagamento via PIX, envie o comprovante.

### Endpoint

```txt
POST /api/upload/comprovante
```

### URL local

```txt
POST http://localhost:3001/api/upload/comprovante
```

### Header obrigatório

```txt
Authorization: Bearer SEU_TOKEN_AQUI
```

### Body

Usar `form-data`.

```txt
Key: comprovante
Type: File
Value: imagem ou PDF
```

Formatos aceitos:

```txt
JPG
PNG
WEBP
PDF
```

Limite:

```txt
5MB
```

### Resposta esperada

```json
{
  "message": "Comprovante enviado com sucesso.",
  "url": "/uploads/comprovante-1715000000000-123456789.png",
  "arquivo": "comprovante-1715000000000-123456789.png"
}
```

Copie o valor do campo `url`. Ele será usado no pagamento via PIX.

---

## 11. Registrar pagamento via PIX

Para PIX, o comprovante é obrigatório.

### Endpoint

```txt
POST /api/mensalidades/:aluno_id/pagamento
```

### Exemplo local

```txt
POST http://localhost:3001/api/mensalidades/1/pagamento
```

### Header obrigatório

```txt
Authorization: Bearer SEU_TOKEN_AQUI
```

### Body JSON

```json
{
  "mes": 5,
  "ano": 2026,
  "valor": 180.0,
  "forma_pagamento": "PIX",
  "comprovante_url": "/uploads/comprovante-1715000000000-123456789.png",
  "observacao": "Pagamento via PIX com comprovante"
}
```

### Resposta esperada

```json
{
  "message": "Pagamento registrado com sucesso.",
  "mensalidade": {
    "id": 1,
    "aluno_id": 1,
    "mes": 5,
    "ano": 2026,
    "valor": "180.00",
    "status": "PAGO",
    "forma_pagamento": "PIX",
    "data_pagamento": "2026-05-07T12:00:00.000Z",
    "comprovante_url": "/uploads/comprovante-1715000000000-123456789.png",
    "observacao": "Pagamento via PIX com comprovante"
  }
}
```

---

## 12. Abrir comprovante enviado

Depois de enviado, o comprovante pode ser aberto pela URL:

```txt
http://localhost:3001/uploads/NOME_DO_ARQUIVO.png
```

Exemplo:

```txt
http://localhost:3001/uploads/comprovante-1715000000000-123456789.png
```

---

# Observação sobre comprovantes

Em hospedagens gratuitas ou ambientes sem disco persistente, arquivos locais podem ser perdidos em redeploy, restart ou troca de instância.

Hoje o sistema salva os comprovantes em:

```txt
backend/src/uploads
```

E no banco salva apenas o caminho:

```txt
comprovante_url
```

Para produção real, recomenda-se futuramente usar:

```txt
Supabase Storage
Cloudflare R2
Amazon S3
```

Ou remover o upload de comprovante, se o objetivo for manter o sistema mais simples.

---

# Teste completo via Postman usando localhost

## Passo 1: Criar conta

```txt
POST http://localhost:3001/api/auth/criar-conta
```

Body:

```json
{
  "nome": "Teste",
  "email": "teste@teste.com",
  "senha": "123456",
  "nome_empresa": "Studio Teste",
  "telefone_empresa": "(99) 98765-4321"
}
```

---

## Passo 2: Fazer login

```txt
POST http://localhost:3001/api/auth/login
```

Body:

```json
{
  "email": "teste@teste.com",
  "senha": "123456"
}
```

Copie o token.

---

## Passo 3: Alterar senha

```txt
PATCH http://localhost:3001/api/auth/alterar-senha
```

Header:

```txt
Authorization: Bearer TOKEN_AQUI
```

Body:

```json
{
  "senha_atual": "123456",
  "nova_senha": "novaSenhaForte123"
}
```

---

## Passo 4: Cadastrar aluno

```txt
POST http://localhost:3001/api/alunos
```

Header:

```txt
Authorization: Bearer TOKEN_AQUI
```

Body:

```json
{
  "nome": "Maria Fernanda",
  "data_nascimento": "1998-05-10",
  "cpf": "123.456.789-00",
  "telefone": "19999999999",
  "dia_vencimento": 10,
  "valor_mensalidade": 150.0,
  "ativo": true,
  "observacao": "Aluna teste",
  "horarios": [
    {
      "dia_semana": "SEGUNDA",
      "horario": "09:00"
    },
    {
      "dia_semana": "QUARTA",
      "horario": "11:00"
    }
  ]
}
```

---

## Passo 5: Listar alunos

```txt
GET http://localhost:3001/api/alunos
```

Header:

```txt
Authorization: Bearer TOKEN_AQUI
```

---

## Passo 6: Listar mensalidades

```txt
GET http://localhost:3001/api/mensalidades
```

Header:

```txt
Authorization: Bearer TOKEN_AQUI
```

---

## Passo 7: Registrar pagamento

```txt
POST http://localhost:3001/api/mensalidades/1/pagamento
```

Header:

```txt
Authorization: Bearer TOKEN_AQUI
```

Body:

```json
{
  "mes": 5,
  "ano": 2026,
  "valor": 150.0,
  "forma_pagamento": "DINHEIRO",
  "observacao": "Pagamento recebido"
}
```

---

# Deploy

O projeto pode ser publicado usando:

```txt
Frontend: Vercel, Netlify ou Firebase Hosting
Backend: Render, Koyeb, Railway ou servidor próprio
Banco: PostgreSQL local, Supabase ou outro PostgreSQL gerenciado
```

## Variáveis de ambiente do backend em produção

```env
DATABASE_URL=postgresql://usuario:senha@host:porta/database
JWT_SECRET=sua_chave_forte
FRONTEND_URL=https://url-do-frontend
```

## Variável de ambiente do frontend em produção

```env
VITE_API_URL=https://url-do-backend
```

---

# Segurança

Nunca subir arquivos `.env` para o GitHub.

Arquivos protegidos pelo `.gitignore`:

```txt
backend/.env
frontend/.env
node_modules/
dist/
backend/src/uploads/*
```

Arquivos permitidos:

```txt
backend/.env.example
frontend/.env.example
backend/src/uploads/.gitkeep
```

---

# Comandos Git úteis

```bash
git status
git add .
git commit -m "mensagem do commit"
git push
```

---

# Autor

Projeto criado por Ênio Henrique.
