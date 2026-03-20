import 'dotenv/config';
import { app } from './app';
import { sequelize } from './database/sequelize';

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database connected!');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
