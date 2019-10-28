import { IgApiClient } from 'instagram-private-api';
import { Config } from '../core/config';
import { mediaFeed } from './utils';
import logger from '../core/logging';
import { liked$ } from '../streams/like';

async function hashtag(client: IgApiClient, config: Config): Promise<void> {
	for (const tag of config.tags) {
		let likeProgress = 0;
		let running = true;
		const sub = liked$.subscribe(() => {
			if ((++likeProgress) < config.likeLimit) return;

			logger.info('like limit for tag: %s reached', tag);
			// stop hashtag after like limit is reached
			running = false;
		});

		logger.info('starting with hashtag feed for tag: %s', tag);
		await mediaFeed(client, config, client.feed.tags(tag, 'recent'), () => running);

		sub.unsubscribe();
	}
}

export default hashtag;
