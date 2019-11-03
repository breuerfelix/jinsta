import { IgApiClient } from 'instagram-private-api';
import { Config } from '../core/config';
import { mediaFeed, likesForTags } from './utils';
import { store } from '../core/store';
import logger from '../core/logging';

async function hashtag(client: IgApiClient, config: Config): Promise<void> {
	if (config.likeLimit <= 0) {
		logger.error('like limit has to be set for like by hashtag!');
		return;
	}

	if (!config.tags) {
		logger.error('there are no tags given!');
		return;
	}

	const likeBoundsForTags = likesForTags(config);
	let currentTagIndex = 0;

	let hashtagRunning = true;
	let tagRunning = false;

	// setup process exit when like limit reached
	store.pluck('imageLikes').subscribe(likes => {
		if (likes >= config.likeLimit) {
			logger.info('like limit reached for hashtag feed');
			hashtagRunning = false;
			tagRunning = false;
			return;
		}

		// if it's the last tag then keep running untill likes >= imageLikes
		if (currentTagIndex == config.tags.length - 1) return;

		// the like limit for a tag of index i is equal to the sum of all the single tag limit between 0 and i.
		// if I've reached that limit simply go to the next tag.
		const currentTagLimit = likeBoundsForTags.reduce(
			(acc, val, index) => acc += index <= currentTagIndex ? val : 0
		);

		if (likes >= currentTagLimit) tagRunning = false;
	});

	for (const tag of config.tags) {
		// like limit is reached
		if (!hashtagRunning) break;

		tagRunning = true;
		logger.info(
			'starting hashtag feed for tag: %s. randomized number of likes: %i.',
			tag,
			likeBoundsForTags[currentTagIndex],
		);
		await mediaFeed(client, config, client.feed.tags(tag, 'recent'), () => tagRunning);
		currentTagIndex++;
	}
}

export default hashtag;
