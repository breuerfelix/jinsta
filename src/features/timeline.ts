import { IgApiClient } from 'instagram-private-api';
import { Config } from '../core/config';
import { media$ } from '../streams/like';
import { sleep } from '../core/utils';
import logger from '../core/logging';
import { addServerCalls } from '../core/store';

async function timeline (client: IgApiClient, config: Config): Promise<void> {
	const allMediaIDs: string[] = [];
	const running = true;
	let progress = 1;

	const timeline = client.feed.timeline('pagination');

	while (running) {
		const items = await timeline.items();
		addServerCalls(1);

		// filter out old items
		const newItems = items.filter(item => !allMediaIDs.includes(item.id));
		allMediaIDs.push(...newItems.map(item => item.id));

		logger.info('got %d more timeline items for user \'%s\'', newItems.length, config.username);

		// exit when no new items are there
		if (!newItems.length) break;

		for (const item of newItems) {
			logger.info('current progress: %d / %d', progress, allMediaIDs.length);
			media$.next(item);
			await sleep(3);

			progress++;
		}
	}
}

export default timeline;
