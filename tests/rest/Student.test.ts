// tests/student/student.test.ts
import { TestBase } from 'tests/utils/TestBase';
import models from 'src/models';

class StudentTest extends TestBase {
  private parentUserId: string | null = null;
  private authToken: string | null = null;
  private studentUserId: string | null = null;
  private studentId: string | null = null;
  private createdParentId: string | null = null;
  private unitId: string | null = null; // Adicionando o unitId

  private parentData = {
    firstName: 'Teste',
    lastName: 'Responsável',
    email: this.generateUniqueEmail('responsavel'),
    password: 'senhaForte123',
    phoneNumber: this.generateRandomPhoneNumber(),
    cpf: this.generateRandomCPF(),
    street: 'Rua 1',
    number: 10,
    neighborhood: 'Centro',
    zip: '12345-000',
    city: 'São Paulo',
    acronym: 'SP',
  };

  private studentData = {
    firstName: 'Joãozinho',
    lastName: 'Teste',
    email: this.generateUniqueEmail('aluno'),
    password: 'senhaForte456',
    phoneNumber: this.generateRandomPhoneNumber(),
    school: 'Escola Exemplo',
    grade: 5,
    cycle: 'Fundamental I',
    birthdate: '10/10/2010',
  };

  private async createOtherParent() {
    const email = this.generateUniqueEmail('invasor');
    const cpf = this.generateRandomCPF();
    const phoneNumber = this.generateRandomPhoneNumber();

    const res = await this.client.post('/api/parents').send({
      ...this.parentData,
      email,
      cpf,
      phoneNumber,
      unitId: this.unitId, // Incluindo unitId ao criar o parent
    });

    expect(res.status).toBe(201);

    const token = res.body.data.token;
    return { token, email };
  }

  public run(): void {
    describe('Student API', () => {
      this.setupGlobalHooks();

      it('deve criar uma unidade, um parent e um aluno vinculado', async () => {
        // Cria a unidade padrão
        this.unitId = await this.createDefaultUnitIfNotExists(); // Obtém o id da unidade

        // Cria o parent
        const parentRes = await this.client
          .post('/api/parents')
          .send({ ...this.parentData, unitId: this.unitId });

        expect(parentRes.status).toBe(201);

        this.parentUserId = parentRes.body.data.userId;
        this.authToken = parentRes.body.data.token;

        // Verifica o email
        const token = await models.UserToken.findOne({
          where: {
            user_id: this.parentUserId,
            type: 'email_verification',
          },
        });

        await this.client.post('/api/users/verify-email-code').send({
          userId: this.parentUserId,
          code: token!.token,
        });

        // 🔥 IMPORTANTE: pega o `id` real da tabela `parents` (e não o userId)
        const parent = await models.Parent.findOne({
          where: { userId: this.parentUserId },
        });

        expect(parent).not.toBeNull();
        this.createdParentId = parent!.id;

        // Cria o estudante usando o `parent.id` verdadeiro e `unitId`
        const studentRes = await this.client
          .post(`/api/students/${this.createdParentId}`)
          .set('Authorization', `Bearer ${this.authToken}`)
          .send({ ...this.studentData, unitId: this.unitId }); // Incluindo unitId ao criar o estudante

        expect(studentRes.status).toBe(201);
        expect(studentRes.body).toHaveProperty('data.id');

        this.studentId = studentRes.body.data.id;

        const student = await models.Student.findByPk(this.studentId!);
        expect(student).not.toBeNull();
        this.studentUserId = student!.userId;
      });

      it('deve buscar um aluno pelo userId', async () => {
        const res = await this.client
          .get(`/api/students/${this.studentUserId}`)
          .set('Authorization', `Bearer ${this.authToken}`);

        expect(res.status).toBe(200);
      });

      it('deve buscar um aluno por ID vinculado ao parent', async () => {
        const res = await this.client
          .get(`/api/students/byparent/${this.studentId}`)
          .set('Authorization', `Bearer ${this.authToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty(
          'firstName',
          this.studentData.firstName,
        );
      });

      it('deve listar todos os alunos (admin)', async () => {
        const adminToken = await this.loginAsAdmin();

        const res = await this.client
          .get('/api/students')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body.some((s: any) => s.id === this.studentId)).toBe(true);
      });

      it('deve permitir que o admin visualize os dados do aluno', async () => {
        const adminToken = await this.loginAsAdmin();

        const res = await this.client
          .get(`/api/students/${this.studentUserId}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty(
          'firstName',
          this.studentData.firstName,
        );
        expect(res.body).toHaveProperty('lastName', this.studentData.lastName);
      });

      it('deve atualizar os dados do aluno', async () => {
        const updates = {
          firstName: 'Atualizado',
          lastName: 'Aluno',
          school: 'Nova Escola',
          grade: 6,
          cycle: 'Fundamental II',
        };

        const res = await this.client
          .put(`/api/students/${this.studentId}`)
          .set('Authorization', `Bearer ${this.authToken}`)
          .send(updates);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('SUCCESSFUL');
        expect(res.body.data).toMatchObject({
          studentId: this.studentId,
          ...updates,
        });

        const updated = await models.Student.findByPk(this.studentId!);
        expect(updated).not.toBeNull();
        expect(updated!.firstName).toBe(updates.firstName);
        expect(updated!.grade).toBe(updates.grade);
      });

      it('deve permitir que o próprio aluno se atualize', async () => {
        const res = await this.client
          .put(`/api/students/${this.studentId}`)
          .set(
            'Authorization',
            `Bearer ${await this.loginAndGetToken(
              this.studentData.email,
              this.studentData.password,
            )}`,
          )
          .send({
            firstName: 'Auto',
            lastName: 'Atualizado',
            school: 'Escola do Próprio',
            grade: 7,
            cycle: 'Fundamental II',
          });

        expect(res.status).toBe(200);
        expect(res.body.data).toMatchObject({
          studentId: this.studentId,
          firstName: 'Auto',
          lastName: 'Atualizado',
        });
      });

      it('deve negar acesso a outro parent tentando visualizar o aluno', async () => {
        const { token } = await this.createOtherParent();

        const res = await this.client
          .get(`/api/students/${this.studentUserId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(403);
      });

      it('deve negar acesso a outro parent tentando atualizar o aluno', async () => {
        const { token } = await this.createOtherParent();

        const res = await this.client
          .put(`/api/students/${this.studentId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            firstName: 'Invasão',
            lastName: 'Não Permitida',
            school: 'Escola Hacker',
            grade: 9,
            cycle: 'Ensino Médio',
          });

        expect(res.status).toBe(403);
      });
    });
  }
}

new StudentTest().run();
