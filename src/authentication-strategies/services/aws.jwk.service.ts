import {inject} from '@loopback/context';
import fs from 'fs';
import jwkToPem from 'jwk-to-pem';
import {TokenServiceBindings} from '../../keys';

export class AwsJwkService {
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
    if (this.jwkUrl.startsWith('http')) {
      const jwkResponse = await fetch(this.jwkUrl);
      if (jwkResponse.ok) {
        const jwks = await jwkResponse.json();
        return jwks;
      } else {
        throw new Error(
          'Failed to load jwk from ' +
            this.jwkUrl +
            ' response code ' +
            jwkResponse.status,
        );
      }
    } else {
      const jwkBuffer = fs.readFileSync(url, 'utf8');
      const jwkJson = JSON.parse(jwkBuffer);
      return jwkJson;
    }
  }

  async getPems(): Promise<string[]> {
    if (!this.pems) {
      await this.fetchJwk();
    }
    return this.pems;
  }
}
