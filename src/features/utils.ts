import { IgApiClient } from 'instagram-private-api';
import { Feed } from 'instagram-private-api/dist/core/feed';
import { Config } from '../core/config';
import { media$ } from '../streams/like';
import { sleep } from '../core/utils';
import logger from '../core/logging';
import { addServerCalls } from '../core/store';

export async function mediaFeed<T>(client: IgApiClient, config: Config, feed: Feed<T>, cb = (): boolean => true): Promise<void> {
	const allMediaIDs: string[] = [];
	let running = true;
	let progress = 1;

	while (running) {
		const items = await feed.items();
		addServerCalls(1);

		// filter out old items
		const newItems = items.filter(item => !allMediaIDs.includes(item.id));
		allMediaIDs.push(...newItems.map(item => item.id));

		logger.info('got %d more media for user \'%s\'', newItems.length, config.username);

		// exit when no new items are there
		if (!newItems.length) running = false;

		for (const item of newItems) {
			logger.info('current progress: %d / %d', progress, allMediaIDs.length);
			media$.next(item);

			progress++;
			await sleep(config.mediaDelay);

			// break out when callback returns true
			if (!cb()) {
				running = false;
				break;
			}
		}
	}
}
