import { IgApiClient } from 'instagram-private-api';
import { Config } from './config';
import session from './session';
import { store } from './store';
import fs from 'fs';

import {
	TimelineFeed,
} from './feeds';
import logger, { addLogRotate } from './logging';

class loop {
	private ig: IgApiClient;
	private config: Config;
	private session: session;

	constructor(config: Config) {
		// must be the first thing in the application start
		addLogRotate(config.workspacePath);

		// TODO check if config is valid
		if (!fs.existsSync(config.workspacePath)) fs.mkdirSync(config.workspacePath);
		// use username as seed as default
		if (!config.seed) config.seed = config.username;

		this.ig = new IgApiClient();
		if (config.proxy) this.ig.state.proxyUrl = config.proxy;

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

		logger.info('start running basefeed');

		await basefeed.run();

		logger.info('finished running basefeed');
	}
}

export default loop;
