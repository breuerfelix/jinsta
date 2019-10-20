import { IgApiClient } from 'instagram-private-api';
import { Config } from './config';
import session from './session';
import { store } from './store';
import fs from 'fs';

import {
	TimelineFeed,
} from './feeds';

class loop {
	private ig: IgApiClient;
	private config: Config;
	private session: session;

	constructor(config: Config) {
		// TODO check if config is valid
		if (!fs.existsSync(config.workspacePath)) fs.mkdirSync(config.workspacePath);

		this.ig = new IgApiClient();
		this.config = config;
		this.session = new session(this.ig, this.config);

		if (config.likeLimit > 0) {
			// setup process exit when like limit reached
			store.pluck('imageLikes').subscribe(likes => {
				if (likes >= this.config.likeLimit) process.exit(0);
			});
		}
	}

	async run(): Promise<void> {
		this.config.user = await this.session.login();

		const basefeed = new TimelineFeed(
			this.ig,
			this.config,
			true
		);

		console.log('start running basefeed');

		await basefeed.run();

		console.log('finished running basefeed');
	}
}

export default loop;
