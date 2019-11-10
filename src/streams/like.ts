import { chance, convertIDtoPost } from '../core/utils';
import { store } from '../core/store';
import { filter, flatMap, share, tap } from 'rxjs/operators';
import logger from '../core/logging';
import { media$ } from './media';

export const like$ = media$.pipe(
	//execute action
	flatMap(async media => {
		const client = store.getState().client;
		const config = store.getState().config;
		const { user } = config;

		let response: any = null;

		try {
			response = await client.media.like({
				mediaId: media.id,
				moduleInfo: {
					module_name: 'profile',
					user_id: user.pk,
					username: user.username,
				},
				// d means like by double tap (1), you cant unlike posts with double tap
				d: chance(.5) ? 0 : 1
			});
		} catch (e) {
			if (e.message.includes('deleted')) {
				response.status = 'not okay';
				response.error = e;
			} else {
				throw e;
			}
		}

		return { media, response };
	}),
	//check if actions was successfull
	filter(({ media, response }) => {
		if (response.status == 'ok') return true;

		logger.error(
			'[LIKE] unable to like media: %o - response: %o',
			convertIDtoPost(media.id),
			response,
		);

		return false;
	}),

	//perform statistics and log computation
	tap(({ media, response }) => {
		const config = store.getState().config;
		logger.info(
			'[LIKE] %d / %d - media: %s - response: %o',
			store.getState().imageLikes + 1,
			config.likeLimit,
			convertIDtoPost(media.id),
			response,
		);

		store.change(({ imageLikes, serverCalls }) => ({
			imageLikes: imageLikes + 1,
			serverCalls: serverCalls + 1,
		}));
	}),

	share()
);
