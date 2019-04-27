import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Contract} from '.';
import {Client} from './client.model';
import {Tenant} from './tenant.model';
@model()
export class Booking extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @belongsTo(() => Client)
  clientId: number;

  @belongsTo(() => Tenant)
  tenantId: number;

  @belongsTo(() => Contract)
  contractId: number;

  @property({
    type: 'date',
    required: true,
  })
  date: Date;

  @property({
    type: 'string',
  })
  comment?: string;

  @property({
    type: 'number',
  })
  amount?: number;

  @property({
    type: 'string',
  })
  type?: string;

  constructor(data?: Partial<Booking>) {
    super(data);
  }
}

export enum BookingType {
  RENT_DUE = 'RENT_DUE',
}
