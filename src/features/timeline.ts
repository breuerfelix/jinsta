import { IgApiClient } from 'instagram-private-api';
import { Config } from '../core/config';
import { mediaFeed } from './utils';
import { store } from '../core/store';
import logger from '../core/logging';

async function timeline(client: IgApiClient, config: Config): Promise<void> {
	// exit when like limit is reached
	if (config.likeLimit > 0) {
		// setup process exit when like limit reached
		store.pluck('imageLikes').subscribe(likes => {
			if (likes >= config.likeLimit) {
				logger.info('like limit reached. exiting process.');
				process.exit(0);
			}
		});
	}

	logger.info('starting with timeline feed');
	return await mediaFeed(client, config, client.feed.timeline('pagination'));
}

export default timeline;
