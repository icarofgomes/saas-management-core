import { Request, Response } from 'express';
import { AddressService } from '../services/address.service';

export class AddressController {
  constructor(private readonly service = new AddressService()) {}

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const result = await this.service.update(id, req.body);
    return res.status(200).json(result);
  }
}
