# Sistema de Gerenciamento de Usuários — API REST + React

Projeto acadêmico completo para demonstrar **API REST, Web Services, autenticação JWT, autorização RBAC e segurança de aplicações web**.

## 1. Tecnologias

### Back-end

- Node.js
- Express
- SQLite
- better-sqlite3
- JWT (`jsonwebtoken`)
- bcrypt
- Helmet
- CORS
- express-rate-limit
- express-validator

### Front-end

- React
- Vite
- Axios
- CSS puro

## 2. Perfis

| Perfil        | Permissões                                                         |
| ------------- | ------------------------------------------------------------------ |
| Administrador | Consulta, cadastro, edição e exclusão de usuários                  |
| Operador      | Consulta usuários e atualiza nome/e-mail                           |
| Cliente       | Consulta somente os próprios dados e atualiza nome/e-mail próprios |

O campo `role` só pode ser alterado por um Administrador.

## 3. Como executar

### Back-end

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

No Linux/macOS:

```bash
cp .env.example .env
npm install
npm run dev
```

API: `http://localhost:3000`

Na primeira execução, o banco SQLite é criado automaticamente e o sistema cria três usuários de demonstração.

### Front-end

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Interface: normalmente `http://localhost:5173`

> O front-end já aponta para `http://localhost:3000/api`.

## 4. Usuários de demonstração

| Perfil        | E-mail               | Senha        |
| ------------- | -------------------- | ------------ |
| Administrador | admin@exemplo.com    | Admin@123    |
| Operador      | operador@exemplo.com | Operador@123 |
| Cliente       | cliente@exemplo.com  | Cliente@123  |

## 5. Endpoints principais

| Método | Endpoint             | Finalidade                     | Resposta |
| ------ | -------------------- | ------------------------------ | -------- |
| POST   | `/api/auth/login`    | Autenticar usuário e gerar JWT | 200      |
| POST   | `/api/auth/register` | Cadastro público de cliente    | 201      |
| GET    | `/api/users`         | Listar usuários                | 200      |
| GET    | `/api/users/:id`     | Consultar usuário específico   | 200      |
| POST   | `/api/users`         | Criar usuário com perfil       | 201      |
| PUT    | `/api/users/:id`     | Atualizar usuário              | 200      |
| DELETE | `/api/users/:id`     | Excluir usuário                | 204      |
| GET    | `/api/me`            | Consultar usuário autenticado  | 200      |
| GET    | `/api/health`        | Verificar funcionamento da API | 200      |

## 6. JWT

O cliente envia:

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "admin@exemplo.com",
  "password": "Admin@123"
}
```

Após validar as credenciais, a API retorna:

```json
{
  "token": "JWT_AQUI",
  "user": {
    "id": 1,
    "name": "Administrador",
    "email": "admin@exemplo.com",
    "role": "admin"
  }
}
```

Para acessar uma rota protegida:

```http
Authorization: Bearer JWT_AQUI
```

### Conteúdo do token

O JWT contém:

- `sub`: ID do usuário;
- `name`: nome;
- `role`: perfil;
- `iat`: data/hora de emissão;
- `exp`: data/hora de expiração.

O token expira em **30 minutos**. A escolha reduz a janela de utilização caso o token seja roubado. Em uma aplicação real, poderia ser adotado um fluxo com refresh token.

> O JWT não deve armazenar senha ou outros dados secretos.

## 7. RBAC

O middleware `authenticate` verifica o JWT.

Depois, o middleware `authorize(...)` verifica o perfil.

Exemplos:

- `POST /api/users` → somente `admin`;
- `DELETE /api/users/:id` → somente `admin`;
- `GET /api/users` → `admin` e `operator`;
- `PUT /api/users/:id` → `admin` e `operator`, respeitando as regras de alteração;
- `GET /api/users/:id` → `admin` e `operator`; cliente somente pode consultar o próprio ID;
- `GET /api/me` → qualquer usuário autenticado.

Isso demonstra a diferença entre:

**Autenticação:** "Quem é você?"

**Autorização:** "O que você pode fazer?"

## 8. Segurança aplicada

### Senhas

As senhas não são armazenadas em texto puro. O sistema usa `bcrypt`.

### JWT

O token possui validade de 30 minutos e é necessário para as rotas protegidas.

### Helmet

Adiciona cabeçalhos HTTP de segurança.

### Rate limit

Limita tentativas na rota de login para reduzir ataques automatizados.

### Validação

Os dados recebidos são validados antes de serem processados.

### CORS

A API permite requisições somente do front-end configurado no `.env`.

### SQL

As consultas utilizam parâmetros, reduzindo risco de SQL Injection.

### Não exposição de senha

As respostas de usuários nunca retornam o hash da senha.

## 9. OAuth 2.0 — contexto da solução

Explicação do OAuth 2.0.

Uma aplicação parceira poderia usar um servidor de autorização:

1. A aplicação parceira redireciona o usuário para o servidor de autorização.
2. O usuário autentica e autoriza as permissões solicitadas.
3. O servidor de autorização devolve um código de autorização.
4. A aplicação parceira troca esse código por um access token.
5. A aplicação usa o access token para chamar a API:

```http
Authorization: Bearer ACCESS_TOKEN
```

### Benefícios

- O usuário não precisa entregar sua senha para a aplicação parceira.
- O acesso pode ser delegado com permissões específicas.
- Tokens podem ter escopo e validade.
- O acesso pode ser revogado sem necessariamente trocar a senha do usuário.

Em um cenário real, recomenda-se OAuth 2.0/OpenID Connect com um provedor de identidade confiável.

## 10. Análise de segurança

| Risco                          | Mitigação                                                |
| ------------------------------ | -------------------------------------------------------- |
| Roubo de JWT                   | HTTPS, validade curta e armazenamento cuidadoso do token |
| Senha em texto puro            | Hash com bcrypt                                          |
| Acesso indevido                | JWT + RBAC                                               |
| Brute force no login           | Rate limit                                               |
| SQL Injection                  | Queries parametrizadas                                   |
| Exposição de senha             | Nunca retornar `password_hash`                           |
| Requisições de origem indevida | CORS configurado                                         |
| Cabeçalhos HTTP inseguros      | Helmet                                                   |

## 11. Testando no navegador

Abra:

```text
http://localhost:5173
```

Faça login com um dos usuários de demonstração.

A interface muda as ações disponíveis conforme o perfil.

## 12. Testando com Postman

Importe:

```text
postman/Sistema-Gestao-Usuarios.postman_collection.json
```

A coleção contém exemplos de:

- Health Check;
- Login;
- Meu perfil;
- Listagem;
- Consulta;
- Cadastro;
- Atualização;
- Exclusão.

O script do login salva automaticamente o JWT na variável `token`.
