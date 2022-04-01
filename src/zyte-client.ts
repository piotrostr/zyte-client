import 'dotenv/config';
import { HttpsProxyAgent } from 'hpagent';
import fetch from 'node-fetch';
import { zyteAgent } from './zyte-agent';
import UserAgent from 'user-agents';

interface User {
  sessionId?: string;
  [key: string]: unknown;
}

export default class ZyteClient {
  agent: HttpsProxyAgent;
  sessionId: string | undefined;
  user: User;
  userAgent: string;

  constructor(user?: User) {
    this.agent = zyteAgent;
    this.user = user || { sessionId: undefined };
    this.sessionId = this.user.sessionId;
    this.userAgent = new UserAgent({ deviceCategory: 'desktop' }).toString();
  }

  async fetchSessionId() {
    const buf = Buffer.from(process.env.ZYTE_KEY + ':');
    const authorization = 'Basic ' + buf.toString('base64');
    const res = await fetch('http://proxy.zyte.com:8011/sessions', {
      method: 'POST',
      headers: {
        authorization,
      },
      body: JSON.stringify({}),
    });
    const sessionId = await res.text();
    console.log('sessionId: ' + sessionId);
    return sessionId;
  }

  async getSessionId() {
    if (!this.sessionId) {
      this.sessionId = await this.fetchSessionId();
      this.user.sessionId = this.sessionId;
    }
    return this.sessionId;
  }

  async get(url: string, options?: any): Promise<any> {
    const init: any = {
      method: 'GET',
      agent: this.agent,
      ...options,
      headers: {
        ...options?.headers,
        'X-Crawlera-Profile': 'pass',
        'X-Crawlera-Session': await this.getSessionId(), // await this.getSessionId(),
      },
    };
    const res = await fetch(url, init);
    if (res.headers.get('x-crawlera-error') === 'bad_session_id') {
      console.log('sessionId timeout');
      this.sessionId = await this.fetchSessionId();
      return await this.get(url, options);
    }
    const text = await res.text();
    if (text) {
      try {
        const json = JSON.parse(text);
        return { res, json };
      } catch {
        // pass
      }
    }
    return { res, text };
  }

  async post(url: string, options?: any): Promise<any> {
    const init = {
      method: 'POST',
      agent: this.agent,
      ...options,
      headers: {
        ...options.headers,
        'X-Crawlera-Profile': 'pass',
        'X-Crawlera-Session': await this.getSessionId(),
      },
    };
    const res = await fetch(url, init);
    if (res.headers.get('x-crawlera-error') === 'bad_session_id') {
      console.log('sessionId timeout');
      this.sessionId = await this.fetchSessionId();
      return await this.post(url, options);
    }
    const text = await res.text();
    if (text) {
      try {
        const json = JSON.parse(text);
        return { res, json };
      } catch {
        // pass
      }
    }
    return { res, text };
  }
}
