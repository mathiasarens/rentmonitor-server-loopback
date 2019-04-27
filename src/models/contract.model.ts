import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Client, Tenant} from '.';
@model()
export class Contract extends Entity {
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

  @property({
    type: 'date',
  })
  start?: Date;

  @property({
    type: 'date',
  })
  end?: Date;

  @property({
    type: 'number',
  })
  rentDueEveryMonth?: number;

  @property({
    type: 'number',
  })
  rentDueDayOfMonth?: number;

  @property({
    type: 'number',
  })
  amount?: number;

  constructor(data?: Partial<Contract>) {
    super(data);
  }
}
