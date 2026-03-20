import { TestBase } from 'tests/utils/TestBase';
import models from 'src/models';

class ParentTest extends TestBase {
  private parentData = {
    firstName: 'Maria',
    lastName: 'Souza',
    email: this.generateUniqueEmail('maria.souza'),
    password: 'senhaForte123',
    phoneNumber: this.generateRandomPhoneNumber(),
    cpf: this.generateRandomCPF(),
    street: 'Rua das Flores',
    number: 123,
    complement: 'Apto 101',
    neighborhood: 'Jardim Primavera',
    zip: '12345-678',
    city: 'São Paulo',
    acronym: 'SP',
    unitId: '',
  };

  private createdUserId: string | null = null;
  private authToken: string | null = null;
  private addressId: string | null = null;

  public run(): void {
    describe('Parent API', () => {
      this.setupGlobalHooks();

      it('deve criar um novo parent com usuário, endereço e token de verificação', async () => {
        // A unidade já foi criada no setup, então podemos pegá-la automaticamente
        const unitId = await this.createDefaultUnitIfNotExists(); // Método que retorna o ID da unidade
        this.parentData.unitId = unitId; // Atribui o unitId ao parentData

        // Envia a requisição para criar o parent
        const res = await this.client
          .post('/api/parents')
          .send(this.parentData);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('data.token');
        expect(res.body).toHaveProperty('data.userId');

        this.createdUserId = res.body.data.userId;
        this.authToken = res.body.data.token;

        // Valida usuário criado
        const user = await models.User.findByPk(this.createdUserId!);
        expect(user).not.toBeNull();
        expect(user!.email).toBe(this.parentData.email);
        expect(user!.roleId).toBeDefined();
        expect(user!.emailVerified).toBe(false);

        // Valida parent criado
        const parent = await models.Parent.findOne({
          where: { userId: this.createdUserId },
        });
        expect(parent).not.toBeNull();
        expect(parent!.firstName).toBe(this.parentData.firstName);
        expect(parent!.unitId).toBe(unitId); // Valida se o unitId foi corretamente atribuído

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
        expect(address!.street).toBe(this.parentData.street);
        expect(address!.number).toBe(this.parentData.number);
        expect(address!.city).toBe(this.parentData.city);

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

      it('deve buscar os dados do parent por userId', async () => {
        if (!this.createdUserId || !this.authToken)
          throw new Error('Usuário não foi criado no teste anterior');

        const res = await this.client
          .get(`/api/parents/user/${this.createdUserId}`)
          .set('Authorization', `Bearer ${this.authToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('firstName', this.parentData.firstName);
        expect(res.body).toHaveProperty('lastName', this.parentData.lastName);
        expect(res.body).toHaveProperty('user');
        expect(res.body.user.email).toBe(this.parentData.email);
      });

      it('deve atualizar os dados do parent com sucesso', async () => {
        if (!this.createdUserId || !this.authToken)
          throw new Error('Usuário não foi criado no teste anterior');

        // Novos dados para atualização
        const updatedData = {
          firstName: 'João',
          lastName: 'Silva',
        };

        // Faz a requisição PUT para atualizar os dados do parent
        const res = await this.client
          .put(`/api/parents/${this.createdUserId}`)
          .set('Authorization', `Bearer ${this.authToken}`)
          .send(updatedData);

        // Valida se a resposta foi OK e se a atualização foi bem-sucedida
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('SUCCESSFUL');
        expect(res.body.data).toHaveProperty('userId', this.createdUserId);
        expect(res.body.data).toHaveProperty(
          'firstName',
          updatedData.firstName,
        );
        expect(res.body.data).toHaveProperty('lastName', updatedData.lastName);

        // Verifica se os dados foram de fato atualizados no banco de dados
        const updatedParent = await models.Parent.findOne({
          where: { userId: this.createdUserId },
        });

        expect(updatedParent).not.toBeNull();
        expect(updatedParent!.firstName).toBe(updatedData.firstName);
        expect(updatedParent!.lastName).toBe(updatedData.lastName);

        // Verifica se os dados de usuário também foram atualizados, caso haja lógica de atualização no usuário
        const updatedUser = await models.User.findByPk(this.createdUserId!);
        expect(updatedUser).not.toBeNull();
        expect(updatedUser!.email).toBe(this.parentData.email); // O e-mail não deve mudar
      });

      it('deve atualizar o endereço do parent com sucesso', async () => {
        if (!this.addressId || !this.authToken)
          throw new Error('Endereço não criado no teste anterior');

        const newAddress = {
          street: 'Rua Nova Primavera',
          number: 456,
          complement: 'Casa',
          neighborhood: 'Centro',
          zip: '98765-432',
          city: 'Rio de Janeiro',
          acronym: 'RJ',
        };

        // rota de update de endereço (ajuste se seu prefixo diferir)
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

        // Confere no banco
        const updated = await models.Address.findByPk(this.addressId);
        expect(updated).not.toBeNull();
        expect(updated!.street).toBe(newAddress.street);
        expect(updated!.number).toBe(newAddress.number);
        expect(updated!.city).toBe(newAddress.city);
      });
    });
  }
}

new ParentTest().run();
