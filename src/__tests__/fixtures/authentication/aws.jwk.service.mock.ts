import {inject} from '@loopback/context';
import jwkToPem from 'jwk-to-pem';
import {AwsJwkService} from '../../../authentication-strategies/services/aws.jwk.service';
import {TokenServiceBindings} from '../../../keys';
import {readFile} from '../../helpers/file.helper';

export class AwsJwkServiceMock implements AwsJwkService {
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
    const jwkBuffer = readFile(url);
    const jwkJson = JSON.parse(jwkBuffer);
    return jwkJson;
  }

  async getPems(): Promise<string[]> {
    if (!this.pems) {
      await this.fetchJwk();
    }
    return this.pems;
  }
}
