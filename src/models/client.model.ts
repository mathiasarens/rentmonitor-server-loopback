import {Entity, model, property} from '@loopback/repository';

@model()
export class Client extends Entity {
  @property({
    type: 'number',
    id: true,
    required: true,
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
