import models from 'src/models';
import { TestBase } from 'tests/utils/TestBase';

class RoomTest extends TestBase {
  // Gera payload padrão para criar sala
  private generateRoomPayload(overrides = {}) {
    return {
      name: 'Sala Teste ' + Date.now(),
      capacity: 3,
      ...overrides,
    };
  }

  public run(): void {
    describe('Room API', () => {
      this.setupGlobalHooks();

      let defaultUnitId: string;

      beforeAll(async () => {
        // Pega a unidade padrão já criada no setup do TestBase
        defaultUnitId = await this.createDefaultUnitIfNotExists();
      });

      it('deve criar uma nova sala dentro da unidade padrão com sucesso', async () => {
        const payload = this.generateRoomPayload({ unitId: defaultUnitId });

        const res = await this.client.post('/api/rooms').send(payload);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('data.id');
        expect(res.body.data.name).toBe(payload.name);
        expect(res.body.data.unitId).toBe(defaultUnitId);
        expect(res.body.data.capacity).toBe(payload.capacity);

        // Verifica se a sala foi criada no banco
        const room = await models.Room.findByPk(res.body.data.id);
        expect(room).not.toBeNull();
        expect(room!.name).toBe(payload.name);
      });

      it('não deve permitir criar sala com nome duplicado na mesma unidade', async () => {
        const nameDuplicated = 'Sala Duplicada';

        // Cria a primeira sala com esse nome
        await this.client.post('/api/rooms').send({
          name: nameDuplicated,
          unitId: defaultUnitId,
          capacity: 3,
        });

        // Tenta criar outra sala com o mesmo nome na mesma unidade
        const res = await this.client.post('/api/rooms').send({
          name: nameDuplicated,
          unitId: defaultUnitId,
          capacity: 4,
        });

        expect(res.status).toBe(409);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toMatch(/já existe uma sala/i);
      });

      it('não deve permitir criar mais salas do que o limite da unidade', async () => {
        // Unidade padrão criada tem maxRooms = 1

        // Criar a primeira sala (ok)
        await this.client.post('/api/rooms').send({
          name: 'Sala Limite 1',
          unitId: defaultUnitId,
          capacity: 3,
        });

        // Tentar criar segunda sala (excede limite)
        const res = await this.client.post('/api/rooms').send({
          name: 'Sala Limite 2',
          unitId: defaultUnitId,
          capacity: 2,
        });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toMatch(/limite.*salas/i);
      });
    });
  }
}

new RoomTest().run();
