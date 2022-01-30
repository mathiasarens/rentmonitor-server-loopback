import {inject} from '@loopback/context';
import jwkToPem from 'jwk-to-pem';
import {TokenServiceBindings} from '../../keys';

export class AwsJwkService {
  pems: string[];

  constructor(
    @inject(TokenServiceBindings.AWS_COGNITO_JWK_URL)
    private jwkUrl: string,
  ) {
    this.fetchJwk().catch(error =>
      console.log('Could not load aws cognito jwk url', jwkUrl, error),
    );
  }

  async fetchJwk(): Promise<void> {
    const jwkResponse = await fetch(this.jwkUrl);
    if (jwkResponse.ok) {
      const jwks = await jwkResponse.json();
      this.pems = new Array(jwks.length);
      jwks.keys.forEach((element: jwkToPem.JWK, index: number) => {
        this.pems[index] = jwkToPem(element);
      });
    } else {
      throw new Error(
        'Failed to load jwk from ' +
          this.jwkUrl +
          ' response code ' +
          jwkResponse.status,
      );
    }
  }

  async getPems(): Promise<string[]> {
    return this.pems;
  }
}
