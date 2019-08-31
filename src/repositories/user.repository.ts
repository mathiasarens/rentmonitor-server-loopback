// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  juggler,
  repository,
} from '@loopback/repository';
import {ClientRepository} from '.';
import {Client, User} from '../models';

export type Credentials = {
  email: string;
  password: string;
};

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id
> {
  public readonly client: BelongsToAccessor<Client, typeof User.prototype.id>;
  constructor(
    @inject('datasources.rentmonitor') protected datasource: juggler.DataSource,
    @repository.getter('ClientRepository')
    clientRepositoryGetter: Getter<ClientRepository>,
  ) {
    super(User, datasource);
    this.client = this.createBelongsToAccessorFor(
      'client',
      clientRepositoryGetter,
    );
  }
}
