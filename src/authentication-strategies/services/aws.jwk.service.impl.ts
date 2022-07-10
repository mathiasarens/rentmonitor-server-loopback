import {inject} from '@loopback/context';
import jwkToPem from 'jwk-to-pem';
import fetch from 'node-fetch';
import {TokenServiceBindings} from '../../keys';
import {AwsJwkService} from './aws.jwk.service';

export class AwsJwkServiceImpl implements AwsJwkService {
  pems: string[];

  constructor(
    @inject(TokenServiceBindings.AWS_COGNITO_JWK_URL)
    private jwkUrl: string,
  ) {}

  async fetchJwk(): Promise<void> {
    const jwks = await this.load(this.jwkUrl);
    this.pems = new Array(jwks.length);
    jwks.keys.forEach((element: jwkToPem.JWK, index: number) => {
      this.pems[index] = jwkToPem(element);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async load(url: string): Promise<any> {
    const jwkResponse = await fetch(url);
    if (jwkResponse.ok) {
      const jwks = await jwkResponse.json();
      return jwks;
    } else {
      console.error(
        `Failed to load jwk from ${url} response code: ${jwkResponse.status}`,
      );
      throw new Error(
        'Failed to load jwk from ' +
          url +
          ' response code ' +
          jwkResponse.status,
      );
    }
  }

  async getPems(): Promise<string[]> {
    if (!this.pems) {
      await this.fetchJwk();
    }
    return this.pems;
  }
}
