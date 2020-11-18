import {belongsTo, Entity, model, property} from '@loopback/repository';
import {AccountSettings} from './account-settings.model';
import {Booking} from './booking.model';
import {Client} from './client.model';

@model({
  settings: {
    // foreignKeys: {
    //   fkAccountTransactionClientId: {
    //     name: 'fk_accountTransaction_clientId',
    //     entity: 'Client',
    //     entityKey: 'id',
    //     foreignKey: 'clientid',
    //   },
    //   fkAccountTransactionAccountSettingsId: {
    //     name: 'fk_accountTransaction_accountSettingsId',
    //     entity: 'AccountSettings',
    //     entityKey: 'id',
    //     foreignKey: 'accountsettingsid',
    //   },
    // },
  },
})
export class AccountTransaction extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @belongsTo(() => Client)
  clientId: number;

  @belongsTo(() => AccountSettings)
  accountSettingsId: number;

  @property({
    type: 'date',
    required: true,
  })
  date: Date;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'string',
  })
  iban?: string;

  @property({
    type: 'string',
  })
  bic?: string;

  @property({
    type: 'string',
  })
  text?: string;

  @property({
    type: 'number',
  })
  amount?: number;

  @belongsTo(() => Booking)
  bookingId: number;

  constructor(data?: Partial<AccountTransaction>) {
    super(data);
  }
}
