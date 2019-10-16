import { IgApiClient } from 'instagram-private-api';
import { IConfig } from './config';
import session from './session';
import { User } from './types';

import Actions from './actions';
import Constants from './constants';

import {
	TimelineFeed,
} from './feeds';

class loop {
	private ig: IgApiClient;
	private config: IConfig;
	private constants: Constants;
	private session: session;
	private user?: User;

	constructor(config: IConfig, constants?: Constants) {
		// TODO check if config and constants are valid
		this.ig = new IgApiClient();
		this.config = config;
		this.session = new session(this.ig, this.config);
		this.constants = constants || new Constants();
	}

	async run(): Promise<void> {
		this.user = await this.session.login();

		const basefeed = new TimelineFeed(
			this.user!,
			this.ig,
			new Actions(),
			this.constants,
			true
		);

		console.log('start running basefeed');

		await basefeed.run();

		console.log('finished running basefeed');
	}
}

export default loop;
