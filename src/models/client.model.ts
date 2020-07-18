import {Entity, model, property} from '@loopback/repository';

@model()
export class Client extends Entity {
  @property({
    id: true,
    generated: true,
  })
  id: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  constructor(data?: Partial<Client>) {
    super(data);
  }
}
