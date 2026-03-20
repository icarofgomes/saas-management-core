// src/app.ts
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user.routes';
import { ErrorHandler } from './middlewares/errorHandler';
import roleRoutes from './routes/role.routes';
import authRoutes from './routes/auth.routes';
import parentRoutes from './routes/parent.routes';
import addressRoutes from './routes/address.routes';
import studentRoutes from './routes/student.routes';
import teacherRoutes from './routes/teacher.routes';
import subjectRoutes from './routes/subject.routes';
import unitRoutes from './routes/unit.routes';
import roomRoutes from './routes/room.routes';
import lessonRoutes from './routes/lesson.routes';
import planRoutes from './routes/plan.routes';
import saleRoutes from './routes/sale.routes';
import invoiceRoutes from './routes/invoice.routes';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173', // Altere isso pro endereço do seu front
    credentials: true, // Se estiver usando cookies ou autenticação
  }),
);

app.use(express.json());

// Rotas
app.use('/api', userRoutes);
app.use('/api', roleRoutes);
app.use('/api', authRoutes);
app.use('/api', parentRoutes);
app.use('/api', addressRoutes);
app.use('/api', studentRoutes);
app.use('/api', teacherRoutes);
app.use('/api', subjectRoutes);
app.use('/api', unitRoutes);
app.use('/api', roomRoutes);
app.use('/api', lessonRoutes);
app.use('/api', planRoutes);
app.use('/api', saleRoutes);
app.use('/api', invoiceRoutes);

// Middleware de tratamento de erro
app.use(ErrorHandler.handle);

export { app };
