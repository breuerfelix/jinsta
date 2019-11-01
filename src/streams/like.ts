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
import { blacklistFilter, interestRate } from './utils';
import logger from '../core/logging';

export const media$ = new Subject<TimelineFeedResponseMedia_or_ad>();

export const like$ = media$.pipe(
	filter(media => {
		// TODO just a test, could be removed if this seems to be true
		// detecting ads and filter them out
		if (media.ad_id || media.link) {
			logger.warn('media was an ad with id: %s / link: %s', media.ad_id, media.link);
			return false;
		}

		return true;
	}),
	filter(media => !media.has_liked),
	withLatestFrom(store.pluck('config')),
	filter(([media, { blacklist }]) => {
		if (!media.caption) return true;
		const { text } = media.caption;
		return blacklistFilter(text, blacklist);
	}),
	filter(([media, { keywords, baseInterest, interestInc }]) => {
		if (!media.caption) return true;
		const { text } = media.caption;
		return chance(interestRate(text, keywords, baseInterest, interestInc));
	}),
	share(),
);

export const liked$ = like$.pipe(
	withLatestFrom(store.pluck('client')),
	map(([[media, config], client]) => ([ media, config, client ])),
	flatMap(async ([media, config, client]) => {
		const { user } = config;

		try {
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
		} catch {
			const response = {status: 'not okay', message: 'unable to like a media'};
			return { media, response, config };
		}
	}),
	filter(({ media, response}) => {
		if (response.status != 'ok') {
			logger.warn('unable to like media: %o\nresponse: %o', response, media);
			return false;
		}
		return true;
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
	tap(() => addServerCalls(1)),

	share(),
);
