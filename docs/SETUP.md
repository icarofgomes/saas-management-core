# 🛠 Setup - SaaS Management Core

Este documento descreve como configurar e rodar o projeto **SaaS Management Core** localmente.

---

## 1️⃣ Requisitos

- Node.js >= 18
- MySQL
- Docker + Docker Compose

---

## 2️⃣ Clonar repositório

```bash
git clone URL_DO_REPOSITORIO
cd saas-management-core
```

---

## 3️⃣ Criar arquivo de variáveis de ambiente

```bash
cp .env-example .env
```

Ajuste variáveis como `MYSQL_USER_PASSWORD`, `ADMIN_EMAIL` e `JWT_SECRET` conforme seu ambiente local.

---

## 4️⃣ Subir ambiente com Docker

```bash
docker-compose up -d
```

Certifique-se de ter configurado o `.env` antes deste passo.

---

## 5️⃣ Rodar migrações do banco de dados

```bash
env $(cat .env) npx sequelize db:migrate
```

Isso cria todas as tabelas necessárias no MySQL.

---

## 6️⃣ Rodar testes (opcional)

```bash
npm test
```

---

## 7️⃣ Rodar o projeto localmente

```bash
npm run dev
```

Por padrão, a API vai rodar em http://localhost:3001.

---

## 8️⃣ Comandos úteis

| Comando                                    | Descrição                                          |
| ------------------------------------------ | -------------------------------------------------- |
| `npm install`                              | Instala dependências do Node.js                    |
| `npm run dev`                              | Roda servidor em modo desenvolvimento (hot reload) |
| `npm run build`                            | Compila TypeScript                                 |
| `npm run start`                            | Inicia servidor em modo local (build)              |
| `npm test`                                 | Roda testes automatizados                          |
| `env $(cat .env) npx sequelize db:migrate` | Executa migrações do banco                         |
| `npm run reset-db`                         | Reseta o banco (drop + create + migrate)           |

---

## 9️⃣ Observações

- Não é necessário rodar `npm install` se estiver usando o Docker Compose.
- Ajuste variáveis do `.env` conforme seu ambiente local.
- Para resetar o banco, rode:

```bash
npx sequelize db:migrate:undo:all
```

Depois execute novamente as migrações.

---

## ✅ Pronto!

Agora você deve ter:

- Banco MySQL rodando com todas as tabelas
- API pronta para receber requisições
- Testes funcionando

Pronto para usar ou desenvolver novas funcionalidades!
