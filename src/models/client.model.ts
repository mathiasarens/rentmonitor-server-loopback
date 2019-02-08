import {Entity, model, property} from '@loopback/repository';

@model()
export class Client extends Entity {
  @property({
    id: true,
    type: 'number',
    required: false,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
    unique: true,
  })
  name: string;

  constructor(data?: Partial<Client>) {
    super(data);
  }
}
