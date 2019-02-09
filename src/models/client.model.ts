import {Entity, model, property} from '@loopback/repository';

@model()
export class Client extends Entity {
  @property({
    id: true,
    type: 'number',
    generated: true,
  })
  id: number;

  @property({
    type: 'string',
    required: true,
    index: {
      unique: true,
    },
  })
  name: string;

  constructor(data?: Partial<Client>) {
    super(data);
  }
}
