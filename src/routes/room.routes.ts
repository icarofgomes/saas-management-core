import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';
import validateSchema from '../middlewares/validateSchema';
import { wrapAsync } from '../utils/wrapAsync';
import { createRoomSchema } from 'src/schemas/room/roomSchema';

const router = Router();
const roomController = new RoomController();

router.post(
  '/rooms',
  validateSchema(createRoomSchema),
  wrapAsync(roomController.create.bind(roomController)),
);

export default router;
