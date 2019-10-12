import { IgApiClient } from 'instagram-private-api';
import envConfig, { IConfig } from './config';
import session from './session';

class loop {
  private ig: IgApiClient;
  private config: IConfig;
  private session: any;

  constructor(config?: IConfig) {
    this.ig = new IgApiClient();
    this.config = config || envConfig;
    this.session = new session(this.ig, this.config);
  }

  async run() {
    await this.session.login();

    const feed2 = this.ig.feed.timeline();
    const test2 = await feed2.items();
    for (const item of test2) {
      if (item.media_type == 1) {
        console.log(item);
        break;
      }
    }
  }
}

const l = new loop();
l.run();
