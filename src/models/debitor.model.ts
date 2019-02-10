import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Client} from './client.model';
@model({
  indexes: {
    clientId_name_index: {
      keys: {clientId: 1, name: 1},
      options: {unique: true},
    },
  },
})
export class Debitor extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @belongsTo(() => Client)
  clientId: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
  })
  cron?: string;

  @property({
    type: 'number',
  })
  amount?: number;

  @property({
    type: 'date',
  })
  start?: string;

  @property({
    type: 'date',
  })
  end?: string;

  constructor(data?: Partial<Debitor>) {
    super(data);
  }
}
