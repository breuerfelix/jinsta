import { IgApiClient } from 'instagram-private-api';
import { Feed } from 'instagram-private-api/dist/core/feed';
import { Config } from '../core/config';
import { media$ } from '../streams/like';
import { sleep } from '../core/utils';
import logger from '../core/logging';
import { addServerCalls } from '../core/store';

export async function mediaFeed<T>(
	client: IgApiClient,
	config: Config,
	feed: Feed<T>,
	cb = (): boolean => true
): Promise<void> {
	const allMediaIDs: string[] = [];
	let running = true;
	let progress = 1;

	while (running) {
		const items = await feed.items();
		addServerCalls(1);

		// filter out old items
		const newItems = items.filter(item => !allMediaIDs.includes(item.id));
		allMediaIDs.push(...newItems.map(item => item.id));

		logger.info(
			'got %d more media for user \'%s\'',
			newItems.length,
			config.username
		);

		// exit when no new items are there
		if (!newItems.length) running = false;

		for (const item of newItems) {
			logger.info(
				'current progress: %d / %d',
				progress,
				allMediaIDs.length
			);
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

/**
	Used to calculate how many likes to give in each tag without exceding the maximum like number.
	Input: config with likeLimit and tags.
	Return: an array of length tags.length and as value integer number which together will sum up to be (approximately) likeLimit.
*/
export function likesForTags(config: Config): Array<number> {
	const likeNumber = config.likeLimit;
	const tagsNumber = config.tags ? config.tags.length : 0;
	if (!likeNumber || !tagsNumber) return [];
	let sum = 0;
	const array = [];
	for (let i = 0; i < tagsNumber; i++) {
		const current = Math.random() * 100;
		array.push(current);
		sum += current;
	}
	return array.map(i => Math.round((i / sum) * likeNumber));
}
