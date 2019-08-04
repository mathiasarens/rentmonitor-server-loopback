import { Getter } from '@loopback/core';
import { Count, DataObject, Filter, Options, Where } from '@loopback/repository';
import { ClientRepository } from '.';
import { RentmonitorDataSource } from '../datasources';
import { AccountSettings } from '../models';
export declare class AccountSettingsRepository {
    private proxy;
    private crypto;
    constructor(dataSource: RentmonitorDataSource, clientRepositoryGetter: Getter<ClientRepository>, password: string);
    create(entity: DataObject<AccountSettings>, options?: Options): Promise<AccountSettings>;
    find(filter?: Filter<AccountSettings>, options?: Options): Promise<AccountSettings[]>;
    exists(id: typeof AccountSettings.prototype.id, options?: Options): Promise<boolean>;
    deleteAll(where?: Where<AccountSettings>, options?: Options): Promise<Count>;
}
