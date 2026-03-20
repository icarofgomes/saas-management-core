import { Request, Response } from 'express';
import { RoomService } from '../services/room.service';

export class RoomController {
  private roomService = new RoomService();

  async create(req: Request, res: Response) {
    const result = await this.roomService.createRoom(req.body);
    return res.status(201).json(result);
  }
}
