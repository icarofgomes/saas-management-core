# Project Context - saas-management-core

## Stack

- Node.js + TypeScript
- Express (API HTTP)
- Sequelize + sequelize-typescript (ORM)
- MySQL (dialeto via `DB_DIALECT`)
- Validação: Joi
- Autenticação: JWT
- Hash de senha: argon2

## Arquitetura (camadas)

O projeto segue uma separação clara de responsabilidades:

- `src/routes/*`: define endpoints (Express Router) e encadeia middlewares (JWT/validação).
- `src/controllers/*`: orquestra a requisição e chama o Service.
- `src/services/*`: regra de negócio (validações adicionais, fluxos e decisões).
- `src/repositories/*`: persistência (CRUD e consultas usando Models).
- `src/models/*`: entidades Sequelize + associações (`src/models/index.ts`).

## Middlewares e utilitários

- `src/middlewares/authenticateToken.ts`: valida JWT e injeta `req.user`.
- `src/middlewares/validateSchema.ts`: valida `req.body` com Joi e normaliza erro.
- `src/middlewares/errorHandler.ts`: erro global (responde JSON com `error` e `details`).
- `src/utils/wrapAsync.ts`: padroniza handlers async em rotas.

## Erros e mensagens

- `src/errors/AppError.ts`: erro tipado com `statusCode` e mensagem.
- `src/errors/ErrorMessages.ts`: centraliza mensagens/HTTP codes.

## Banco de dados e migrações

- Config Sequelize: `src/database/sequelize.ts`.
- Inicialização de modelos/associações: `src/models/index.ts`.
- Migrações: `src/migrations/*` via `sequelize-cli`.

## Convenções importantes

- Preferir sempre `routes -> controller -> service -> repository -> model`.
- Usar `validateSchema(schema)` nas rotas quando houver body.
- Para autenticação, usar `authenticateToken` quando o endpoint exigir `req.user`.
- Lançar `AppError` nas regras de negócio; deixar o `ErrorHandler` responder.

## Variáveis de ambiente (exemplo de uso)

O projeto espera `.env` com pelo menos:

- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE_NAME`, `MYSQL_USERNAME`, `MYSQL_USER_PASSWORD`, `MYSQL_CONNECTION_LIMIT`, `DB_DIALECT`
- `JWT_SECRET`
- `PORT`

## Dependências principais

- API: `express`, `cors`
- Validação: `joi`
- Auth/Security: `jsonwebtoken`, `argon2`
- ORM: `sequelize`, `sequelize-typescript`, `mysql2`
- Testes: `jest`, `ts-jest`, `supertest`
