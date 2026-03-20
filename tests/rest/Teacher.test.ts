import { TestBase } from 'tests/utils/TestBase';
import models from 'src/models';

class TeacherTest extends TestBase {
  private teacherData = {
    firstName: 'Carlos',
    lastName: 'Silva',
    email: this.generateUniqueEmail('carlos.silva'),
    password: 'senhaForte123',
    phoneNumber: this.generateRandomPhoneNumber(),
    cpf: this.generateRandomCPF(),
    street: 'Rua das Palmeiras',
    number: 456,
    complement: 'Sala 202',
    neighborhood: 'Centro',
    zip: '54321-987',
    city: 'Rio de Janeiro',
    acronym: 'RJ',
  };

  private createdUserId: string | null = null;
  private authToken: string | null = null;
  private addressId: string | null = null;
  private unitId: string | null = null; // ID da unidade

  private async createOtherTeacher(subjects?: { id: number }[]) {
    const email = this.generateUniqueEmail('invasor');
    const cpf = this.generateRandomCPF();
    const phoneNumber = this.generateRandomPhoneNumber();

    // Se não passar as matérias, buscar as matérias dinamicamente
    const subjectIds = subjects || (await this.getDefaultSubjectIds());

    const res = await this.client.post('/api/teachers').send({
      ...this.teacherData,
      email,
      cpf,
      phoneNumber,
      unitId: this.unitId, // Passa a unidade com ID
      subjectIds, // Passa as matérias com IDs
    });

    expect(res.status).toBe(201);

    const token = res.body.data.token;
    return { token, email };
  }

  public run(): void {
    describe('Teacher API', () => {
      this.setupGlobalHooks();

      it('deve criar um novo teacher com usuário, endereço, token de verificação, matérias e unidade', async () => {
        // Busca a unidade padrão ou cria caso não exista
        if (!this.unitId) {
          this.unitId = await this.createDefaultUnitIfNotExists();
        }

        // Buscar as matérias dinamicamente
        const subjects = await models.Subject.findAll({
          where: {
            subject: ['Português', 'Matemática'], // ou as matérias que você quer
          },
        });

        // Verifica se encontrou as matérias
        expect(subjects.length).toBe(2); // Garantir que tem 2 matérias

        // IDs das matérias que o professor vai ter
        const subjectIds = subjects.map((subject) => subject.id);

        const res = await this.client.post('/api/teachers').send({
          ...this.teacherData,
          unitId: this.unitId, // Passando a unidade com ID
          subjectIds, // Passando as matérias com IDs
        });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('data.token');
        expect(res.body).toHaveProperty('data.userId');

        this.createdUserId = res.body.data.userId;
        this.authToken = res.body.data.token;

        // Valida usuário criado
        const user = await models.User.findByPk(this.createdUserId!);
        expect(user).not.toBeNull();
        expect(user!.email).toBe(this.teacherData.email);
        expect(user!.roleId).toBeDefined();
        expect(user!.emailVerified).toBe(false);

        // Valida teacher criado
        const teacher = await models.Teacher.findOne({
          where: { userId: this.createdUserId },
        });
        expect(teacher).not.toBeNull();
        expect(teacher!.firstName).toBe(this.teacherData.firstName);

        // Valida unidade do teacher
        expect(teacher!.unitId).toBe(this.unitId); // Verifica se a unidade foi associada corretamente

        // Valida token de verificação criado
        const token = await models.UserToken.findOne({
          where: {
            user_id: this.createdUserId,
            type: 'email_verification',
            used_at: null,
          },
        });

        expect(token).not.toBeNull();
        expect(token!.token).toHaveLength(6);

        // Valida address criado
        const address = await models.Address.findOne({
          where: { userId: this.createdUserId },
        });
        expect(address).not.toBeNull();
        expect(address!.street).toBe(this.teacherData.street);
        expect(address!.number).toBe(this.teacherData.number);
        expect(address!.city).toBe(this.teacherData.city);

        this.addressId = (address as any).id;

        // Faz verificação do e-mail
        const verifyRes = await this.client
          .post('/api/users/verify-email-code')
          .send({
            userId: this.createdUserId,
            code: token!.token,
          });

        expect(verifyRes.status).toBe(200);
        expect(verifyRes.body.message).toBe('Código verificado com sucesso');

        // Valida campo emailVerified = true
        const verifiedUser = await models.User.findByPk(this.createdUserId!);
        expect(verifiedUser).not.toBeNull();
        expect(verifiedUser!.emailVerified).toBe(true);
      });

      it('deve buscar os dados do teacher por userId', async () => {
        if (!this.createdUserId || !this.authToken)
          throw new Error('Usuário não foi criado no teste anterior');

        const res = await this.client
          .get(`/api/teachers/user/${this.createdUserId}`)
          .set('Authorization', `Bearer ${this.authToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty(
          'firstName',
          this.teacherData.firstName,
        );
        expect(res.body).toHaveProperty('lastName', this.teacherData.lastName);
        expect(res.body).toHaveProperty('user');
        expect(res.body.user.email).toBe(this.teacherData.email);

        expect(res.body).toHaveProperty('subjects');
        expect(Array.isArray(res.body.subjects)).toBe(true);
        expect(res.body.subjects.length).toBeGreaterThanOrEqual(1);

        const subjectNames = res.body.subjects.map((s: any) => s.subject);
        expect(subjectNames).toEqual(
          expect.arrayContaining(['Português', 'Matemática']),
        );
      });

      it('deve listar todos os professores apenas se for admin', async () => {
        const token = await this.loginAsAdmin();

        const res = await this.client
          .get('/api/teachers')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('teachers');
        expect(Array.isArray(res.body.teachers)).toBe(true);
      });

      it('deve atualizar os dados do teacher com sucesso', async () => {
        if (!this.createdUserId || !this.authToken)
          throw new Error('Usuário não foi criado no teste anterior');

        // Novos dados para atualização
        const updatedData = {
          firstName: 'José',
          lastName: 'Pereira',
        };

        // Faz a requisição PUT para atualizar os dados do teacher
        const res = await this.client
          .put(`/api/teachers/${this.createdUserId}`)
          .set('Authorization', `Bearer ${this.authToken}`)
          .send(updatedData);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('SUCCESSFUL');
        expect(res.body.data).toHaveProperty('userId', this.createdUserId);
        expect(res.body.data).toHaveProperty(
          'firstName',
          updatedData.firstName,
        );
        expect(res.body.data).toHaveProperty('lastName', updatedData.lastName);

        // Verifica atualização no banco
        const updatedTeacher = await models.Teacher.findOne({
          where: { userId: this.createdUserId },
        });

        expect(updatedTeacher).not.toBeNull();
        expect(updatedTeacher!.firstName).toBe(updatedData.firstName);
        expect(updatedTeacher!.lastName).toBe(updatedData.lastName);

        // Verifica dados do usuário (email não muda)
        const updatedUser = await models.User.findByPk(this.createdUserId!);
        expect(updatedUser).not.toBeNull();
        expect(updatedUser!.email).toBe(this.teacherData.email);
      });

      it('deve atualizar o endereço do teacher com sucesso', async () => {
        if (!this.addressId || !this.authToken)
          throw new Error('Endereço não criado no teste anterior');

        const newAddress = {
          street: 'Av. Nova Esperança',
          number: 654,
          complement: 'Sala 10',
          neighborhood: 'Centro',
          zip: '87654-321',
          city: 'Rio de Janeiro',
          acronym: 'RJ',
        };

        // rota de update de endereço (ajuste se seu prefixo for diferente)
        const res = await this.client
          .put(`/api/addresses/${this.addressId}`)
          .set('Authorization', `Bearer ${this.authToken}`)
          .send(newAddress);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('SUCCESSFUL');
        expect(res.body.data).toMatchObject({
          addressId: this.addressId,
          ...newAddress,
        });

        const updated = await models.Address.findByPk(this.addressId);
        expect(updated).not.toBeNull();
        expect(updated!.street).toBe(newAddress.street);
        expect(updated!.number).toBe(newAddress.number);
        expect(updated!.city).toBe(newAddress.city);
      });

      it('não deve permitir acessar dados de outro professor', async () => {
        // Cria um segundo professor
        const { token: otherToken } = await this.createOtherTeacher();

        // Tenta acessar o primeiro professor com token do segundo
        const res = await this.client
          .get(`/api/teachers/${this.createdUserId}`)
          .set('Authorization', `Bearer ${otherToken}`);

        expect(res.status).toBe(403);
      });

      it('não deve permitir atualizar outro professor', async () => {
        const { token: otherToken } = await this.createOtherTeacher();

        const updatePayload = {
          firstName: 'Hackeado',
          lastName: 'Malicioso',
        };

        const res = await this.client
          .put(`/api/teachers/${this.createdUserId}`)
          .set('Authorization', `Bearer ${otherToken}`)
          .send(updatePayload);

        expect(res.status).toBe(403);
      });
    });
  }
}

new TeacherTest().run();
