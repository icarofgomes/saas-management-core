# SaaS Management Core

## 🚀 Introdução

Este projeto é um **core SaaS multi-tenant** para gestão de unidades educacionais.  
Ele implementa autenticação, controle de acesso baseado em roles (RBAC), agendamento de aulas e gerenciamento de salas e alunos.

O objetivo é servir como **portfólio técnico**, demonstrando boas práticas em Node.js, TypeScript, arquitetura em camadas e integração com banco de dados relacional.

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

---

## 🏛 Arquitetura & Padrões

O projeto segue a arquitetura **em camadas**:
routes → controller → service → repository → model

- **Routes (`src/routes`)**: define endpoints e aplica middlewares (JWT, validação de payload)
- **Controllers (`src/controllers`)**: orquestram a requisição chamando os services
- **Services (`src/services`)**: regra de negócio (validações, fluxos, decisões)
- **Repositories (`src/repositories`)**: persistência (CRUD e consultas usando Models)
- **Models (`src/models`)**: entidades Sequelize e associações

**Middlewares importantes**:

- `authenticateToken` → valida JWT e injeta `req.user`
- `validateSchema` → valida `req.body` com Joi
- `errorHandler` → resposta padronizada de erros

---

## 🔑 Funcionalidades Principais

- **Multi-Tenant:** cada unidade gerencia suas próprias salas, professores, alunos e aulas
- **RBAC (Roles):** controle de acesso por roles (Admin, Teacher, Parent, Student, Unit)
- **Billing / Limites:** limite de salas por unidade, validação de capacidade de aulas
- **Gerenciamento de aulas:** criação, agendamento e matrícula de alunos em salas
- **Relacionamentos:** Users ↔ Roles, Lessons ↔ Students, Lessons ↔ Teachers, Lessons ↔ Rooms

---

## 📊 Modelo de Dados (Resumo)

| Entidade | Principais Campos                              | Relacionamentos                              |
| -------- | ---------------------------------------------- | -------------------------------------------- |
| User     | id, email, password, roleId                    | → Role                                       |
| Role     | id, name                                       | ← User                                       |
| Unit     | id, name, maxRooms                             | → Room, → Schedule                           |
| Room     | id, name, capacity, unitId                     | → Schedule                                   |
| Schedule | id, startDateTime, endDateTime, roomId, unitId | → Lesson                                     |
| Lesson   | id, subjectId, teacherId, scheduleId           | → Teacher, → Students, → Subject, → Schedule |
| Student  | id, firstName, lastName, userId                | → Lessons (many-to-many)                     |
| Teacher  | id, firstName, lastName, userId                | → Lessons, → Subjects                        |
| Subject  | id, name                                       | → Lessons                                    |

---

## ⚡ Exemplos de Uso (Endpoints)

### Criar Aula

```http
POST /api/lessons
Authorization: Bearer <token>
Content-Type: application/json

{
  "subjectId": 1,
  "teacherId": "teacher-uuid",
  "unitId": "unit-uuid",
  "startDateTime": "2026-03-20T10:00:00.000Z"
}
```

**Resposta:**

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

### Adicionar Aluno a Aula

```http
POST /api/lessons/{lessonId}/students
Authorization: Bearer <token>
Content-Type: application/json

{
  "studentId": "student-uuid"
}
```

**Resposta:**

```json
{
  "status": "SUCCESS",
  "data": {
    "lessonId": "lesson-uuid",
    "studentId": "student-uuid"
  }
}
```

---

### Buscar Aulas por Usuário

```http
GET /api/lessons/parent/{userId}
Authorization: Bearer <token>
```

**Resposta:**

```json
{
  "status": "SUCCESS",
  "data": [
    {
      "id": "lesson-uuid",
      "subject": { "id": 1, "name": "Matemática" },
      "schedule": { "startDateTime": "2026-03-20T10:00:00.000Z" },
      "teacher": {
        "id": "teacher-uuid",
        "firstName": "Ana",
        "lastName": "Silva"
      },
      "student": {
        "id": "student-uuid",
        "firstName": "João",
        "lastName": "Pereira"
      }
    }
  ]
}
```

---

📈 Fluxo Principal (Aula → Sala → Alunos)

```
[User] --(role)--> [Dashboard]
   |
   v
[LessonService]
   |
   v
[LessonRepository] --(verifica sala disponível)--> [RoomRepository]
   |
   v
[ScheduleRepository] --(cria agendamento)
   |
   v
[LessonStudentRepository] --(matrícula alunos)
```

---

📌 Conclusão

Este projeto demonstra:

- Estrutura clara de camadas e responsabilidades
- Boas práticas de TypeScript + Node.js + Sequelize
- Controle de acesso RBAC
- Multi-tenant e escalabilidade por unidades
- Testes integrados com Jest + Supertest
