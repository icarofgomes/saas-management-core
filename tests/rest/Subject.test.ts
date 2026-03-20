import { TestBase } from 'tests/utils/TestBase';
import models from 'src/models';

class SubjectTest extends TestBase {
  private authTokenAdmin: string | null = null;
  private authTokenUser: string | null = null;
  private createdSubjectId: number | null = null;

  public run(): void {
    describe('Subject API', () => {
      this.setupGlobalHooks();

      beforeAll(async () => {
        this.authTokenAdmin = await this.loginAsAdmin();
        this.authTokenUser = await this.loginAsRegularUser();
      });

      it('deve permitir admin criar uma nova subject', async () => {
        const newSubject = { subjectName: 'Geografia' };

        const res = await this.client
          .post('/api/subjects')
          .set('Authorization', `Bearer ${this.authTokenAdmin}`)
          .send(newSubject);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('subject');
        expect(res.body.subject).toHaveProperty('id');
        expect(res.body.subject.subjectName).toBe(newSubject.subjectName);

        this.createdSubjectId = res.body.subject.id;
      });

      it('não deve permitir usuário comum criar matéria', async () => {
        const newSubject = { subjectName: 'Filosofia' };

        const res = await this.client
          .post('/api/subjects')
          .set('Authorization', `Bearer ${this.authTokenUser}`)
          .send(newSubject);

        expect(res.status).toBe(403);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message.toLowerCase()).toContain('não autorizado');
      });

      it('deve listar todas as subjects', async () => {
        const res = await this.client
          .get('/api/subjects')
          .set('Authorization', `Bearer ${this.authTokenAdmin}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('subjects');
        expect(Array.isArray(res.body.subjects)).toBe(true);

        const found = res.body.subjects.some(
          (subj: any) => subj.id === this.createdSubjectId,
        );
        expect(found).toBe(true);
      });

      it('não deve permitir criar uma subject que já existe (Matemática)', async () => {
        const duplicateSubject = { subjectName: 'Matemática' };

        const res = await this.client
          .post('/api/subjects')
          .set('Authorization', `Bearer ${this.authTokenAdmin}`)
          .send(duplicateSubject);

        expect(res.status).toBe(409);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error.toLowerCase()).toContain('já cadastrada');
      });

      it('deve retornar professores associados a uma matéria', async () => {
        if (!this.createdSubjectId) throw new Error('Subject não criada');

        // Cria uma unidade default se necessário
        const unitId = await this.createDefaultUnitIfNotExists();

        // Cria dois professores com a matéria criada
        const subjectId = this.createdSubjectId;

        const teacherBase = {
          firstName: 'João',
          lastName: 'Geógrafo',
          email: this.generateUniqueEmail('geo.prof'),
          password: 'senha12345',
          phoneNumber: this.generateRandomPhoneNumber(),
          cpf: this.generateRandomCPF(),
          street: 'Rua X',
          number: 123,
          complement: 'Sala 1',
          neighborhood: 'Centro',
          zip: '12345-678',
          city: 'São Paulo',
          acronym: 'SP',
          unitId,
          subjectIds: [subjectId],
        };

        const res1 = await this.client
          .post('/api/teachers')
          .send({ ...teacherBase });

        expect(res1.status).toBe(201);

        const res2 = await this.client.post('/api/teachers').send({
          ...teacherBase,
          email: this.generateUniqueEmail('geo.prof2'),
          cpf: this.generateRandomCPF(),
          phoneNumber: this.generateRandomPhoneNumber(),
          firstName: 'Maria',
          lastName: 'Cartógrafa',
        });

        expect(res2.status).toBe(201);

        // Faz a requisição para buscar professores da matéria
        const res = await this.client
          .get(`/api/subjects/${subjectId}/teachers`)
          .set('Authorization', `Bearer ${this.authTokenAdmin}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('teachers');
        expect(Array.isArray(res.body.teachers)).toBe(true);
        expect(res.body.teachers.length).toBeGreaterThanOrEqual(2);

        const names = res.body.teachers.map((t: any) => t.firstName);
        expect(names).toContain('João');
        expect(names).toContain('Maria');
      });
    });
  }
}

new SubjectTest().run();
