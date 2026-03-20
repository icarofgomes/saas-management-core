import request from 'supertest';
import { Application } from 'express';
import { app } from '../../src/app';
import { TestDatabase } from './TestDatabase';
import db from '../../src/models';
import argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

const { Role, User, Subject } = db;

export abstract class TestBase {
  protected app: Application;
  protected client: ReturnType<typeof request>;

  constructor(private shouldClearDb = false) {
    this.app = app;
    this.client = request(this.app);
  }

  public setupGlobalHooks(): void {
    beforeAll(async () => {
      await TestDatabase.connect();

      if (this.shouldClearDb) {
        await TestDatabase.clear();
      }

      await this.createRoles();
      await this.createAdminIfNotExists();
      await this.createRegularUserIfNotExists();
      await this.createSubjects();
      await this.createDefaultUnitIfNotExists();
      await this.createDefaultRoomIfNotExists();
    });

    afterAll(async () => {
      await TestDatabase.disconnect();
    });
  }

  protected generateUniqueEmail(baseName = 'user'): string {
    return `${baseName}.${uuidv4()}@example.com`;
  }

  protected generateRandomCPF(): string {
    let cpf = '';
    for (let i = 0; i < 11; i++) {
      cpf += Math.floor(Math.random() * 10).toString();
    }
    return cpf;
  }

  protected generateRandomPhoneNumber(): string {
    return `119${Math.floor(10000000 + Math.random() * 89999999)}`;
  }

  private async createRoles() {
    const adminRole = await Role.findOne({ where: { role: 'admin' } });
    const userRole = await Role.findOne({ where: { role: 'user' } });
    const parentRole = await Role.findOne({ where: { role: 'parent' } });
    const studentRole = await Role.findOne({ where: { role: 'student' } });
    const teacherRole = await Role.findOne({ where: { role: 'teacher' } });
    const unitRole = await Role.findOne({ where: { role: 'unit' } });

    if (!adminRole) {
      await Role.create({ role: 'admin' });
    }

    if (!userRole) {
      await Role.create({ role: 'user' });
    }

    if (!parentRole) {
      await Role.create({ role: 'parent' });
    }

    if (!studentRole) {
      await Role.create({ role: 'student' });
    }

    if (!teacherRole) {
      await Role.create({ role: 'teacher' });
    }

    if (!unitRole) {
      await Role.create({ role: 'unit' });
    }
  }

  private async createSubjects() {
    const portuguese = await Subject.findOne({
      where: { subject: 'Português' },
    });
    const math = await Subject.findOne({
      where: { subject: 'Matemática' },
    });

    if (!portuguese) {
      await Subject.create({ subject: 'Português' });
    }

    if (!math) {
      await Subject.create({ subject: 'Matemática' });
    }
  }

  private async createAdminIfNotExists() {
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123';

    const existingAdmin = await User.findOne({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const adminRole = await Role.findOne({ where: { role: 'admin' } });
      if (!adminRole) throw new Error('Role admin não encontrada');

      await User.create({
        email: adminEmail,
        password: await argon2.hash(adminPassword),
        phoneNumber: '00000000000',
        cpf: '00000000000',
        roleId: adminRole.id,
        isActive: true,
        emailVerified: true,
      });
    }
  }

  private async createRegularUserIfNotExists() {
    const userEmail = 'user@example.com';
    const userPassword = 'user123';

    const existingUser = await User.findOne({
      where: { email: userEmail },
    });

    if (!existingUser) {
      const userRole = await Role.findOne({ where: { role: 'user' } });
      if (!userRole) throw new Error('Role user não encontrada');

      await User.create({
        email: userEmail,
        password: await argon2.hash(userPassword),
        phoneNumber: '11999999999',
        cpf: this.generateRandomCPF(),
        roleId: userRole.id,
        isActive: true,
        emailVerified: true,
      });
    }
  }

  public async createDefaultUnitIfNotExists(): Promise<string> {
    const defaultUnitName = 'Unidade Padrão';
    const defaultSlug = 'unidade-padrao';

    const existing = await db.Unit.findOne({ where: { slug: defaultSlug } });
    if (existing) return existing.id;

    const response = await this.client.post('/api/units').send({
      name: defaultUnitName,
      email: this.generateUniqueEmail('unit.padrao'),
      password: 'senhaForte123',
      phoneNumber: this.generateRandomPhoneNumber(),
      cpf: this.generateRandomCPF(),
      maxRooms: 4,
    });

    if (response.status !== 201) {
      throw new Error(`Erro ao criar unidade padrão: ${response.status}`);
    }

    return response.body.data.unitId;
  }

  public async createDefaultRoomIfNotExists(): Promise<string> {
    // Primeiro, busca a unidade padrão pelo slug
    const defaultSlug = 'unidade-padrao';
    const unit = await db.Unit.findOne({ where: { slug: defaultSlug } });
    if (!unit) {
      throw new Error(
        'Unidade padrão não encontrada. Crie a unidade padrão antes.',
      );
    }

    // Verifica se já existe sala para essa unidade
    const existingRoom = await db.Room.findOne({
      where: { unitId: unit.id },
    });
    if (existingRoom) {
      return existingRoom.id;
    }

    // Cria a room padrão para essa unidade
    const room = await db.Room.create({
      name: 'Sala Padrão',
      unitId: unit.id,
      capacity: 2,
    });

    return room.id;
  }

  public async createDefaultPlanIfNotExists(): Promise<string> {
    const defaultPlanName = 'Plano Padrão';

    const existing = await db.Plan.findOne({
      where: { name: defaultPlanName },
    });
    if (existing) return existing.id;

    const plan = await db.Plan.create({
      name: defaultPlanName,
      description: 'Plano Padrão para testes',
      price: 100,
      durationMonths: 12,
    });

    return plan.id;
  }

  public async loginAndGetToken(
    email: string,
    password: string,
  ): Promise<string> {
    const res = await this.client.post('/api/login').send({ email, password });
    if (res.status !== 200) {
      throw new Error(`Falha ao fazer login: status ${res.status}`);
    }
    return res.body.token;
  }

  public async loginAsAdmin(): Promise<string> {
    return this.loginAndGetToken('admin@example.com', 'admin123');
  }

  public async loginAsRegularUser(): Promise<string> {
    return this.loginAndGetToken('user@example.com', 'user123');
  }

  public async getDefaultSubjectIds() {
    const subjects = await Subject.findAll({
      where: {
        subject: ['Português', 'Matemática'],
      },
    });

    // Verifica se encontrou as matérias
    expect(subjects.length).toBe(2); // Garantir que temos 2 matérias
    return subjects.map((subject) => subject.id);
  }
}
