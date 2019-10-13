import { IgApiClient } from 'instagram-private-api';
import envConfig, { IConfig } from './config';
import session from './session';
import { User } from './types';
import {
	TimelineFeed,
} from './feeds';

class loop {
	private ig: IgApiClient;
	private config: IConfig;
	private session: session;
	private user?: User;

	constructor(config?: IConfig) {
		this.ig = new IgApiClient();
		this.config = config || envConfig;
		this.session = new session(this.ig, this.config);
	}

	async run(): Promise<void> {
		this.user = await this.session.login();

		const basefeed = new TimelineFeed(this.user!, this.ig);
		console.log('start running basefeed');

		await basefeed.run();

		console.log('finished running basefeed');
	}
}

export default loop;
