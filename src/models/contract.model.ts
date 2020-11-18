import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Client, Tenant} from '.';
@model({
  settings: {
    // foreignKeys: {
    //   fkContractClientId: {
    //     name: 'fk_contract_clientId',
    //     entity: 'Client',
    //     entityKey: 'id',
    //     foreignKey: 'clientid',
    //   },
    //   fkContractTenantId: {
    //     name: 'fk_contract_tenantId',
    //     entity: 'Tenant',
    //     entityKey: 'id',
    //     foreignKey: 'tenantid',
    //   },
    // },
  },
})
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
  start: Date;

  @property({
    type: 'date',
  })
  end?: Date;

  @property({
    type: 'number',
  })
  rentDueEveryMonth: number;

  @property({
    type: 'number',
  })
  rentDueDayOfMonth: number;

  @property({
    type: 'number',
  })
  amount: number;

  @property({
    type: 'string',
  })
  accountSynchronisationName: string;

  private isActive(now: Date) {
    return now > this.start && now < this.end!;
  }

  constructor(data?: Partial<Contract>) {
    super(data);
  }
}
