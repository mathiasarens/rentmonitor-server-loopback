import {Client, expect} from '@loopback/testlab';
import {RentmonitorServerApplication} from '../..';
import {
  clearDatabase,
  setupApplication,
} from '../helpers/acceptance-test.helpers';

describe('VersionController', () => {
  let app: RentmonitorServerApplication;
  let http: Client;

  before('setupApplication', async () => {
    ({app, client: http} = await setupApplication());
  });

  beforeEach(() => clearDatabase(app));

  after(async () => {
    await app.stop();
  });

  // get

  it('should return version number', async () => {
    // test
    const result = await http.get(`/version`).expect(200);

    // asserts
    expect(result.text).to.eql('undefined');
  });
});
