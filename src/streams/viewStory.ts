import { Subject } from 'rxjs';
import { TimelineFeedResponseMedia_or_ad } from 'instagram-private-api/dist/responses';
import { chance, convertIDtoPost } from '../core/utils';
import { store, addServerCalls } from '../core/store';
import {
	withLatestFrom,
	filter,
	flatMap,
	share,
	tap,
	map,
} from 'rxjs/operators';
import { blacklistFilter, interestRate, media$ } from './utils';
import logger from '../core/logging';

export const viewStory$ = media$.pipe(
	filter(media => {
		logger.warn('Media info: %o', media);
		// TODO just a test, could be removed if this seems to be true
		// detecting ads and filter them out
		if (media.ad_id || media.link) {
			logger.warn('media was an ad with id: %s / link: %s', media.ad_id, media.link);
			return false;
		}

		return true;
	}),
	share(),
);

export const viewedStory$ = viewStory$.pipe(
	withLatestFrom(store.pluck('client')),
	/*flatMap(async ([media, client]) => {
		const { user } = config;
		const response = await client.media.like({
			mediaId: media.id,
			moduleInfo: {
				module_name: 'profile',
				user_id: user.pk,
				username: user.username,
			},
			// d means like by double tap (1), you cant unlike posts with double tap
			d: chance(.5) ? 0 : 1,
		});

		return { media, response, config };
	}),
	tap(({ response }) => {
		if (response.status != 'ok') {
			logger.error('like response is not okay: %o', response);
			logger.error('exiting process');
			process.exit(1);
		}
	}),

	// get current likes from store
	withLatestFrom(store.pluck('imageLikes')),
	map(([{ media, response, config }, imageLikes]) => ({ media, response, config, imageLikes })),

	tap(({ media, response, config, imageLikes }) => {
		let limit = config.likeLimit;
		if (config.tags.length) limit *= config.tags.length;

		logger.info('liked %d / %d - media: %s - response: %o', imageLikes + 1, limit, convertIDtoPost(media.id), response);
		// increment image likes
		store.setState({ imageLikes: imageLikes + 1 });
	}),

	// increment server calls for the like call
	tap(() => addServerCalls(1)),*/

	share(),
);
