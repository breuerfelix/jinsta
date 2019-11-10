import { IgApiClient } from 'instagram-private-api';
import { Feed } from 'instagram-private-api/dist/core/feed';
import { of } from 'rxjs';
import { concatMap, delay } from 'rxjs/operators';
import { Config } from '../core/config';
import { media$ } from '../streams/media';
import { sleep, chance, random} from '../core/utils';
import logger from '../core/logging';
import { addServerCalls } from '../core/store';
import { User } from '../types';

export const defaultMediaValidator = (media: any, config: Config): boolean => {
	if (media.ad_id || media.link) {
		logger.info('[FILTER] media was an ad with id: %s / link: %s', media.ad_id, media.link);
		return false;
	}
	if (media.has_liked) {
		logger.warn('[FILTER] media was already liked. %s ', media.id);
		return false;
	}
	if (!media.caption) {
		logger.warn('[FILTER] media didn\'t have a caption. %s ', media.id);
		return false;
	}

	const { text } = media.caption;
	let badWord;
	if((badWord = config.findBlacklistedWord(text))){
		logger.warn('[FILTER] media %s matched blacklist word %s', media.id, badWord);
		return false;
	}

	const { baseInterest, interestInc } = config;
	return chance(config.getInterestRate(text, baseInterest, interestInc));
};

export async function mediaFeed<T>(
	client: IgApiClient,
	config: Config,
	feed: Feed<T>,
	cb = (): boolean => true,
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
			'[MEDIA FEED] got %d more media for user \'%s\'',
			newItems.length,
			config.username,
		);

		// exit when no new items are there
		if (!newItems.length) running = false;

		for (const item of newItems) {
			logger.info(
				'[MEDIA FEED] current progress: %d / %d',
				progress,
				allMediaIDs.length,
			);

			if(!defaultMediaValidator(item, config))
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
		sum += current;
		array.push(current);
	}

	return array.map(i => Math.round((i / sum) * likeNumber));
}


export async function getFollowers(
	client: IgApiClient,
	username: string
): Promise<object> {
	const id = await client.user.getIdByUsername(username);
	const userInfo = await client.user.info(id);
	const followersFeed = client.feed.accountFollowers(id);
	const followerList: object[] = [];
	let progress = 0;

	logger.info('starting to get follower list from %s. Total followers: %s',
		username,
		userInfo.follower_count
	);

	return new Promise<any>((resolve, reject) => 
		followersFeed.items$
			.pipe(
				concatMap(x => of(x)
					.pipe(
						delay(random(2000, 5000)))
				)
			)
			.subscribe(
				followers => {
					progress += followers.length;

					logger.info(
						'current progress: %d / %d',
						progress,
						userInfo.follower_count
					);
					
					followerList.push(followers.map((el: User) => el.pk));
				},
				error => reject(error),
				() => resolve([].concat(...followerList))
			)
	);
}
