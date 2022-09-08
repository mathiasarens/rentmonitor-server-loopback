import {PinTanClient} from '@mathiasarens/fints';

export interface FintsClientFactory {
  create(
    fintsBlz: string,
    fintsUrl: string,
    fintsUser: string,
    fintsPassword: string,
  ): PinTanClient;
}
