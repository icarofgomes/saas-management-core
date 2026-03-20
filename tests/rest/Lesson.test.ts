import { TestBase } from 'tests/utils/TestBase';
import { getNextMondayAt8AM } from 'src/utils/getNextMondayAt8AM';
import models from 'src/models';

class LessonTest extends TestBase {
  private unitId!: string;
  private subjectIds!: number[];
  private roomIds: string[] = [];
  private teacherId!: string;

  public run(): void {
    describe('Lesson API', () => {
      this.setupGlobalHooks();

      beforeAll(async () => {
        // Cria unidade nova isolada para esse suite
        const unitRes = await this.client.post('/api/units').send({
          name: 'Unidade Teste Isolada ' + Date.now(),
          email: this.generateUniqueEmail('unit.isolada'),
          password: 'senhaForte123',
          phoneNumber: this.generateRandomPhoneNumber(),
          cpf: this.generateRandomCPF(),
          maxRooms: 2,
        });
        this.unitId = unitRes.body.data.unitId;

        // Cria 2 salas nessa unidade
        for (let i = 1; i <= 2; i++) {
          const roomRes = await this.client.post('/api/rooms').send({
            name: `Sala Teste ${i} - ${Date.now()}`,
            capacity: 2,
            unitId: this.unitId,
          });
          this.roomIds.push(roomRes.body.data.id);
        }

        this.subjectIds = await this.getDefaultSubjectIds();

        // Agora cria o professor com uma das matérias
        const email = this.generateUniqueEmail('professor.lesson');
        const subjectId = this.subjectIds[0];

        const createTeacherRes = await this.client.post('/api/teachers').send({
          firstName: 'João',
          lastName: 'Teste',
          email,
          password: 'senhaSegura123',
          phoneNumber: this.generateRandomPhoneNumber(),
          cpf: this.generateRandomCPF(),
          street: 'Rua ABC',
          number: 123,
          complement: 'Baboseira',
          neighborhood: 'Bairro Teste',
          zip: '12345-678',
          city: 'São Paulo',
          acronym: 'SP',
          unitId: this.unitId,
          subjectIds: [subjectId],
        });

        // expect(createTeacherRes.status).toBe(201);
        if (createTeacherRes.status !== 201)
          throw new Error(
            'Falha ao criar professor: ' +
              JSON.stringify(createTeacherRes.body),
          );
        const userId = createTeacherRes.body.data.userId;

        // Busca teacherId via userId direto no banco
        const teacher = await models.Teacher.findOne({ where: { userId } });
        expect(teacher).not.toBeNull();

        this.teacherId = teacher!.id;
      });

      // Helper pra criar parent (retorna id e token)
      const createParent = async (unitId: string) => {
        const parentRes = await this.client.post('/api/parents').send({
          firstName: 'ParentTest',
          lastName: 'Test',
          email: this.generateUniqueEmail('parent.lesson'),
          password: 'senhaForte123',
          phoneNumber: this.generateRandomPhoneNumber(),
          cpf: this.generateRandomCPF(),
          street: 'Rua Teste',
          number: 123,
          neighborhood: 'Bairro Teste',
          zip: '12345-678',
          city: 'Cidade',
          acronym: 'CT',
          unitId,
        });
        expect(parentRes.status).toBe(201);

        const parentUserId = parentRes.body.data.userId;
        const token = parentRes.body.data.token;

        const parent = await models.Parent.findOne({
          where: { userId: parentUserId },
        });
        return { parentId: parent!.id, token };
      };

      // Helper para criar aluno dado parentId e token
      const createStudentForParent = async (
        parentId: string,
        token: string,
      ) => {
        const studentRes = await this.client
          .post(`/api/students/${parentId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            firstName: 'AlunoTest',
            lastName: 'Test',
            email: this.generateUniqueEmail('student.lesson'),
            password: 'senhaForte456',
            phoneNumber: this.generateRandomPhoneNumber(),
            school: 'Escola Teste',
            grade: 5,
            cycle: 'Fundamental I',
            birthdate: '10/10/2010',
            unitId: this.unitId,
          });

        expect(studentRes.status).toBe(201);
        return studentRes.body.data.id;
      };

      // Helper para criar lesson via API e retornar response
      const createLesson = async (startDateTime: Date) => {
        return await this.client.post('/api/lessons').send({
          subjectId: this.subjectIds[0],
          teacherId: null,
          unitId: this.unitId,
          startDateTime: startDateTime.toISOString(),
        });
      };

      it('não deve permitir criar aula antes das 08:00', async () => {
        const invalidDate = getNextMondayAt8AM();
        invalidDate.setHours(7, 30, 0, 0); // 07:30 - inválido

        const res = await createLesson(invalidDate);

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/horário inválido/i);
      });

      it('não deve permitir criar aula com minuto quebrado (ex: 15)', async () => {
        const invalidDate = getNextMondayAt8AM();
        invalidDate.setMinutes(15); // 08:15 - inválido

        const res = await createLesson(invalidDate);

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/horário inválido/i);
      });

      it('deve permitir criar aula iniciando às 19:00 (primeira sala)', async () => {
        const validDate = getNextMondayAt8AM();
        validDate.setHours(19, 0, 0, 0);

        const res = await createLesson(validDate);

        expect(res.status).toBe(201);
        expect(res.body.data).toHaveProperty('id');
      });

      it('deve permitir criar segunda aula iniciando às 19:00 (segunda sala)', async () => {
        const validDate = getNextMondayAt8AM();
        validDate.setHours(19, 0, 0, 0);

        const res = await createLesson(validDate);

        expect(res.status).toBe(201);
        expect(res.body.data).toHaveProperty('id');
      });

      it('não deve permitir criar terceira aula iniciando às 19:00 (sem sala disponível)', async () => {
        const validDate = getNextMondayAt8AM();
        validDate.setHours(19, 0, 0, 0);

        const res = await createLesson(validDate);

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/nenhuma sala disponível/i);
      });

      it('deve adicionar professor a uma aula com sucesso', async () => {
        const startDateTime = getNextMondayAt8AM();
        startDateTime.setHours(10, 0, 0, 0);

        const createLessonRes = await this.client.post('/api/lessons').send({
          subjectId: this.subjectIds[0],
          teacherId: null,
          unitId: this.unitId,
          startDateTime: startDateTime.toISOString(),
        });

        expect(createLessonRes.status).toBe(201);
        const lessonId: string = createLessonRes.body.data.id;

        // Faz a requisição para adicionar o professor
        const res = await this.client
          .patch(`/api/lessons/${lessonId}/add-teacher`)
          .send({
            teacherId: this.teacherId,
          });
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('SUCCESS');
        expect(res.body.data).toHaveProperty('teacherId', this.teacherId);
      });

      it('não deve permitir adicionar professor já ocupado em outra aula no mesmo horário', async () => {
        const startDateTime = getNextMondayAt8AM();
        startDateTime.setHours(12, 0, 0, 0); // horário fixo

        // Cria primeira aula e adiciona professor
        const lesson1Res = await this.client.post('/api/lessons').send({
          subjectId: this.subjectIds[0],
          teacherId: null,
          unitId: this.unitId,
          startDateTime: startDateTime.toISOString(),
        });
        expect(lesson1Res.status).toBe(201);
        const lesson1Id = lesson1Res.body.data.id;

        const addTeacherToLesson1 = await this.client
          .patch(`/api/lessons/${lesson1Id}/add-teacher`)
          .send({ teacherId: this.teacherId });
        expect(addTeacherToLesson1.status).toBe(200);

        // Cria segunda aula no mesmo horário
        const lesson2Res = await this.client.post('/api/lessons').send({
          subjectId: this.subjectIds[0],
          teacherId: null,
          unitId: this.unitId,
          startDateTime: startDateTime.toISOString(),
        });
        expect(lesson2Res.status).toBe(201);
        const lesson2Id = lesson2Res.body.data.id;

        // Tenta adicionar o mesmo professor nessa segunda aula no mesmo horário
        const addTeacherToLesson2 = await this.client
          .patch(`/api/lessons/${lesson2Id}/add-teacher`)
          .send({ teacherId: this.teacherId });

        expect(addTeacherToLesson2.status).toBe(400);
        expect(addTeacherToLesson2.body.error).toMatch(/professor.*alocado/i);
      });

      it('deve adicionar aluno a uma aula com sucesso', async () => {
        const startDateTime = getNextMondayAt8AM();
        startDateTime.setHours(9, 0, 0, 0);

        const lessonRes = await createLesson(startDateTime);
        expect(lessonRes.status).toBe(201);
        const lessonId: string = lessonRes.body.data.id;

        // Cria parent e aluno separadamente
        const { parentId, token } = await createParent(this.unitId);
        const studentId = await createStudentForParent(parentId, token);

        // Requisição para adicionar aluno na aula
        const addStudentRes = await this.client
          .patch(`/api/lessons/${lessonId}/add-student`)
          .send({ studentId });

        expect(addStudentRes.status).toBe(200);
        expect(addStudentRes.body.status).toBe('SUCCESS');
        expect(addStudentRes.body.data).toMatchObject({ lessonId, studentId });

        // Verifica diretamente no banco se aluno foi adicionado na aula
        const exists = await models.LessonStudent.findOne({
          where: { lessonId, studentId },
        });
        expect(exists).not.toBeNull();
      });

      it('deve permitir adicionar dois alunos na mesma aula', async () => {
        const startDateTime = getNextMondayAt8AM();
        startDateTime.setHours(14, 0, 0, 0);

        // Cria aula
        const lessonRes = await createLesson(startDateTime);
        expect(lessonRes.status).toBe(201);
        const lessonId = lessonRes.body.data.id;

        // Cria parent
        const { parentId, token } = await createParent(this.unitId);

        // Cria 2 alunos para o mesmo parent
        const student1Id = await createStudentForParent(parentId, token);
        const student2Id = await createStudentForParent(parentId, token);

        // Adiciona aluno 1 na aula
        let addRes = await this.client
          .patch(`/api/lessons/${lessonId}/add-student`)
          .send({ studentId: student1Id });
        expect(addRes.status).toBe(200);

        // Adiciona aluno 2 na aula
        addRes = await this.client
          .patch(`/api/lessons/${lessonId}/add-student`)
          .send({ studentId: student2Id });
        expect(addRes.status).toBe(200);
      });

      it('não deve permitir adicionar terceiro aluno em aula com capacidade 2', async () => {
        const startDateTime = getNextMondayAt8AM();
        startDateTime.setHours(15, 0, 0, 0);

        // Cria aula
        const lessonRes = await createLesson(startDateTime);
        expect(lessonRes.status).toBe(201);
        const lessonId = lessonRes.body.data.id;

        // Cria parent
        const { parentId, token } = await createParent(this.unitId);

        // Cria 3 alunos para o mesmo parent
        const student1Id = await createStudentForParent(parentId, token);
        const student2Id = await createStudentForParent(parentId, token);
        const student3Id = await createStudentForParent(parentId, token);

        // Adiciona aluno 1 e 2 com sucesso
        let addRes = await this.client
          .patch(`/api/lessons/${lessonId}/add-student`)
          .send({ studentId: student1Id });
        expect(addRes.status).toBe(200);

        addRes = await this.client
          .patch(`/api/lessons/${lessonId}/add-student`)
          .send({ studentId: student2Id });
        expect(addRes.status).toBe(200);

        // Tenta adicionar aluno 3 e espera erro (sala lotada)
        addRes = await this.client
          .patch(`/api/lessons/${lessonId}/add-student`)
          .send({ studentId: student3Id });

        expect(addRes.status).toBe(409);
        expect(addRes.body.error).toMatch(/cheia|lotada|capacidade/i);
      });

      it('deve retornar as aulas do parent pelo userId', async () => {
        // 1. Criar parent e aluno
        const { parentId, token } = await createParent(this.unitId);
        const studentId = await createStudentForParent(parentId, token);

        // 2. Criar aula
        const startDateTime = getNextMondayAt8AM();
        startDateTime.setHours(8, 0, 0, 0);
        const lessonRes = await createLesson(startDateTime);

        if (lessonRes.status !== 201) {
          console.error('Erro ao criar aula:', JSON.stringify(lessonRes));
          throw new Error(
            `Falha ao criar aula: status ${JSON.stringify(lessonRes)}`,
          );
        }

        expect(lessonRes.status).toBe(201);
        const lessonId = lessonRes.body.data.id;

        // 3. Adicionar aluno na aula
        const addStudentRes = await this.client
          .patch(`/api/lessons/${lessonId}/add-student`)
          .send({ studentId });
        expect(addStudentRes.status).toBe(200);

        // 4. Buscar aulas pelo userId do parent
        const parentUserId = (await models.Parent.findByPk(parentId))!.userId;

        const getLessonsRes = await this.client
          .get(`/api/lessons/parent/${parentUserId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(getLessonsRes.status).toBe(200);
        expect(getLessonsRes.body.status).toBe('SUCCESS');
        expect(Array.isArray(getLessonsRes.body.data)).toBe(true);

        // 5. Verifica se a aula criada está na lista
        const lessonIds = getLessonsRes.body.data.map(
          (lesson: any) => lesson.id,
        );
        expect(lessonIds).toContain(lessonId);
      });
    });
  }
}

new LessonTest().run();
