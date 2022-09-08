import {BindingKey} from '@loopback/core';
import {PinTanClient} from '@mathiasarens/fints';
import {FintsClientFactory} from './fints-client.factory';

export class FintsClientFactoryImpl implements FintsClientFactory {
  create(
    fintsBlz: string,
    fintsUrl: string,
    fintsUser: string,
    fintsPassword: string,
  ): PinTanClient {
    return new PinTanClient({
      blz: fintsBlz,
      url: fintsUrl,
      name: fintsUser!,
      pin: fintsPassword!,
      productId: '9FA6681DEC0CF3046BFC2F8A6',
    });
  }
}

export namespace FintsClientBindings {
  export const FACTORY = BindingKey.create<FintsClientFactoryImpl>(
    'services.fints.client.factory',
  );
}
