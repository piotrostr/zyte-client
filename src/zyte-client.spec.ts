import { expect } from 'chai';
import ZyteClient from './zyte-client';

describe('ZyteClient', () => {
  let client: ZyteClient;

  let json: any;

  beforeAll(() => {
    client = new ZyteClient();
  });

  it('works', async () => {
    ({ json } = await client.get('https://httpbin.org/get', {
      headers: {
        'Domi-Eats-Boggers': 'no',
      },
    }));
    expect(json.headers['Domi-Eats-Boggers']).to.equal('no');
  });

  it('gets a sessionId', async () => {
    const sessionId = await client.getSessionId();
    expect(sessionId)
      .to.be.a('string')
      .of.length.gt(0);
  });

  it.skip('persists sessions', async () => {
    ({ json } = await client.get('https://httpbin.org/get'));
    const origin1 = json.origin;
    ({ json } = await client.get('https://httpbin.org/get'));
    const origin2 = json.origin;
    ({ json } = await client.get('https://httpbin.org/get'));
    const origin3 = json.origin;
    expect(origin1).to.equal(origin2);
    expect(origin2).to.equal(origin3);
    expect(origin3).to.equal(origin1);
  });
});
