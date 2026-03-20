import { sequelize } from 'src/database/sequelize';

export class TestDatabase {
  // Conectar ao banco de dados
  static async connect(): Promise<void> {
    try {
      await sequelize.authenticate();
      console.log('Conexão com o banco de dados estabelecida com sucesso.');
    } catch (error) {
      console.error('Erro ao conectar ao banco de dados:', error);
      throw error;
    }
  }

  // Limpar o banco de dados apenas uma vez no início
  static async clear(): Promise<void> {
    try {
      // Limpar o banco de dados uma vez, antes de qualquer teste
      await sequelize.sync({ force: true });
      console.log('Banco de dados limpo com sucesso.');
    } catch (error) {
      console.error('Erro ao limpar o banco de dados:', error);
      throw error;
    }
  }

  // Desconectar do banco de dados após todos os testes
  static async disconnect(): Promise<void> {
    try {
      await sequelize.close();
      console.log('Conexão com o banco de dados encerrada.');
    } catch (error) {
      console.error('Erro ao desconectar do banco de dados:', error);
      throw error;
    }
  }
}
