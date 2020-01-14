import {PinTanClient} from 'fints-psd2-lib';

export interface FintsClientFactory {
  create(
    fintsBlz: string,
    fintsUrl: string,
    fintsUser: string,
    fintsPassword: string,
  ): PinTanClient;
}
