# Relatório — API REST Segura para Gerenciamento de Usuários

## 1. Introdução

O projeto implementa um sistema web composto por uma API REST e uma interface React. A API disponibiliza operações de cadastro, consulta, atualização, exclusão e autenticação de usuários.

O sistema utiliza JWT para autenticação e RBAC para autorização.

## 2. Modelagem

### Endpoint 1 — Login

- Método: POST
- URL: `/api/auth/login`
- Finalidade: validar e-mail e senha e gerar JWT.
- Resposta: `200 OK`.

### Endpoint 2 — Listagem

- Método: GET
- URL: `/api/users`
- Finalidade: listar usuários.
- Resposta: `200 OK`.

### Endpoint 3 — Cadastro

- Método: POST
- URL: `/api/users`
- Finalidade: criar um usuário.
- Resposta: `201 Created`.

### Endpoint 4 — Atualização

- Método: PUT
- URL: `/api/users/{id}`
- Finalidade: alterar dados de um usuário.
- Resposta: `200 OK`.

### Endpoint 5 — Exclusão

- Método: DELETE
- URL: `/api/users/{id}`
- Finalidade: remover um usuário.
- Resposta: `204 No Content`.

### Endpoint 6 — Usuário autenticado

- Método: GET
- URL: `/api/users/me`
- Finalidade: consultar os próprios dados.
- Resposta: `200 OK`.

## 3. Autenticação JWT

O usuário envia:

```json
{
  "email": "admin@exemplo.com",
  "password": "Admin@123"
}
```

O servidor consulta o usuário pelo e-mail e compara a senha informada com o hash armazenado utilizando bcrypt.

Se a senha estiver correta, o servidor cria um JWT.

O token possui:

- ID do usuário (`sub`);
- nome;
- perfil;
- emissão (`iat`);
- expiração (`exp`).

A validade definida é de **30 minutos**.

A escolha reduz o período em que um token roubado poderia ser utilizado.

## 4. Autorização RBAC

RBAC significa Role-Based Access Control.

O sistema possui:

### Administrador

Pode:
- listar usuários;
- consultar usuários;
- criar usuários;
- atualizar usuários;
- excluir usuários;
- alterar perfis.

### Operador

Pode:
- listar usuários;
- consultar usuários;
- atualizar nome e e-mail;
- não pode excluir;
- não pode criar;
- não pode alterar perfil;
- não pode alterar administrador.

### Cliente

Pode:
- consultar seu próprio perfil;
- atualizar seus próprios dados;
- não pode listar todos;
- não pode criar usuários;
- não pode excluir usuários;
- não pode alterar o próprio perfil.

## 5. OAuth 2.0

O OAuth 2.0 poderia ser usado para permitir que uma aplicação parceira acesse recursos sem receber a senha do usuário.

Fluxo conceitual:

```text
Aplicação parceira
       |
       v
Servidor de autorização
       |
       v
Usuário autoriza
       |
       v
Código de autorização
       |
       v
Aplicação parceira
       |
       v
Access Token
       |
       v
API REST
```

A aplicação parceira enviaria:

```http
Authorization: Bearer ACCESS_TOKEN
```

Benefícios:
- delegação de acesso;
- menor exposição de credenciais;
- possibilidade de escopos;
- tokens com validade;
- revogação de acesso.

Nesta atividade OAuth 2.0 foi explicado conceitualmente e não implementado.

## 6. Análise de riscos

### Roubo de JWT

Mitigação:
- HTTPS em produção;
- validade curta;
- armazenamento adequado;
- possibilidade de revogação/refresh token em arquitetura mais avançada.

### Senhas em texto puro

Mitigação:
- bcrypt;
- nunca devolver o hash pela API.

### Acesso indevido

Mitigação:
- autenticação JWT;
- autorização RBAC;
- validação do proprietário do recurso.

### Brute force

Mitigação:
- rate limit na rota de login.

### SQL Injection

Mitigação:
- consultas parametrizadas.

### CORS indevido

Mitigação:
- permitir apenas a origem configurada.

### Cabeçalhos inseguros

Mitigação:
- Helmet.

## 7. Autenticação x Autorização

Autenticação identifica o usuário.

Exemplo:

> O usuário apresentou e-mail e senha válidos?

Autorização verifica a permissão.

Exemplo:

> Este usuário, que é operador, pode excluir outro usuário?

No projeto, o JWT resolve a autenticação e o RBAC resolve a autorização.

## 8. Conclusão

A solução demonstra uma API REST funcional com operações CRUD, autenticação por JWT, autorização baseada em papéis e medidas de segurança para aplicações web.

O front-end React permite demonstrar visualmente as funcionalidades e as diferenças de acesso entre administrador, operador e cliente.
