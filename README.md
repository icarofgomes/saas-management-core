# SaaS Management Core

## 🚀 Introdução

Este projeto é um **core SaaS multi-tenant** para gestão de unidades educacionais.  
Ele implementa autenticação, controle de acesso baseado em roles (RBAC), agendamento de aulas e gerenciamento de salas e alunos.

O objetivo principal é servir como **portfólio técnico de alto nível**, demonstrando boas práticas em Node.js, TypeScript, arquitetura em camadas, integração com banco relacional e engenharia de software sênior aplicada a problemas reais de produção.

---

## ⚙️ Setup & Instalação

Para rodar o projeto localmente, siga as instruções completas [aqui](./docs/SETUP.md).

---

## 🛠 Stack

- **Backend:** Node.js + TypeScript
- **API HTTP:** Express
- **Banco de dados:** MySQL (via Sequelize + sequelize-typescript)
- **Validação:** Joi
- **Autenticação:** JWT
- **Hash de senha:** argon2
- **Testes:** Jest + Supertest
- **Logging:** Pino (estruturado)
- **Observabilidade:** Captura de exceções pronta para Sentry

---

## 🏛 Arquitetura & Padrões

O projeto segue a arquitetura **em camadas**:

routes → controller → service → repository → model

- **Routes (`src/routes`)**: define endpoints e aplica middlewares (JWT, validação de payload)
- **Controllers (`src/controllers`)**: orquestram a requisição chamando os services
- **Services (`src/services`)**: regra de negócio (validações, fluxos, decisões)
- **Repositories (`src/repositories`)**: persistência (CRUD e consultas usando Models)
- **Models (`src/models`)**: entidades Sequelize e associações

### Middlewares importantes

- `authenticateToken` → valida JWT e injeta `req.user`
- `validateSchema` → valida `req.body` com Joi
- `requestLogger` → logging estruturado de requisições HTTP
- `errorHandler` → resposta padronizada de erros com contexto enriquecido
- `requestIdMiddleware` → correlação de requisições

---

## 🔑 Funcionalidades Principais

- **Multi-Tenant:** cada unidade gerencia suas próprias salas, professores, alunos e aulas
- **RBAC (Roles):** controle de acesso por roles (Admin, Teacher, Parent, Student, Unit)
- **Billing / Limites:** limite de salas por unidade, validação de capacidade de aulas
- **Gerenciamento de aulas:** criação, agendamento e matrícula de alunos em salas
- **Relacionamentos:** Users ↔ Roles, Lessons ↔ Students, Lessons ↔ Teachers, Lessons ↔ Rooms

---

## 💳 Payments & Webhook Reliability

O fluxo de pagamentos foi desenhado para lidar com **comportamentos reais de provedores**, incluindo callbacks duplicados e fora de ordem.

### Principais preocupações tratadas

- **Idempotência:** callbacks duplicados não alteram o estado inconsistente.
- **Eventos fora de ordem:** evita transições inválidas (`paid → failed`).
- **Consistência do estado:** pagamentos seguem modelo controlado de transição:

```
processing → pending → failed → paid
```

Uma vez `paid`, o pagamento se torna imutável.

- **Integridade transacional:** updates de payment e invoice são executados dentro de transações.
- **Segurança contra concorrência:** testes simulam callbacks concorrentes.

---

## 📊 Modelo de Dados (Resumo)

| Entidade | Principais Campos                      | Relacionamentos |
| -------- | -------------------------------------- | --------------- |
| User     | id, email, password, roleId            | → Role          |
| Role     | id, name                               | ← User          |
| Unit     | id, name, maxRooms                     | → Room          |
| Room     | id, name, capacity, unitId             | → Schedule      |
| Schedule | id, startDateTime, endDateTime, roomId | → Lesson        |
| Lesson   | id, subjectId, teacherId, scheduleId   | → Students      |
| Student  | id, firstName, lastName, userId        | → Lessons       |
| Teacher  | id, firstName, lastName, userId        | → Lessons       |
| Subject  | id, name                               | → Lessons       |

---

## ⚡ Exemplos de Uso

### Criar Aula

```http
POST /api/lessons
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "subjectId": 1,
  "teacherId": "teacher-uuid",
  "unitId": "unit-uuid",
  "startDateTime": "2026-03-20T10:00:00.000Z"
}
```

### Resposta

```json
{
  "status": "CREATED",
  "data": {
    "id": "lesson-uuid",
    "subjectId": 1,
    "teacherId": "teacher-uuid",
    "scheduleId": "schedule-uuid"
  }
}
```

---

## 📡 Observabilidade

- Logging estruturado com Pino
- RequestId para correlação
- Classificação de erros
- Contexto enriquecido
- Integração pronta para Sentry

---

## 📌 Conclusão

Este projeto demonstra:

- Arquitetura em camadas
- Boas práticas com TypeScript
- Multi-tenant SaaS
- RBAC
- Testes automatizados
- Observabilidade
- Idempotência em pagamentos
