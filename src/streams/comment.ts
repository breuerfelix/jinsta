import { convertIDtoPost } from '../core/utils';
import { store } from '../core/store';
import { filter, flatMap, share, tap } from 'rxjs/operators';
import logger from '../core/logging';
import { media$ } from './media';

export const comment$ = media$.pipe(
	//execute action
	flatMap(async media => {
		const client = store.getState().client;
		const config = store.getState().config;

		let response: any = null;

		try {
			response = await client.media.comment({
				mediaId: media.id,
				text: config.chooseComment()
			});
		} catch (e) {
			if (e.message.includes('deleted')) {
				response.status = 'not okay';
				response.error = e;
			} else {
				throw e;
			} // throw the error
		}

		return { media, response };
	}),
	//check if actions was successfull
	filter(({ media, response }) => {
		if (response.content_type === 'comment' && response.status === 'Active')
			return true;

		logger.error(
			'[COMMENT] unable to comment media: %o - response: %o',
			convertIDtoPost(media.id),
			response
		);
		return false;
	}),

	//perform statistics and log computation
	tap(({ media, response }) => {
		const config = store.getState().config;
		logger.info(
			'[COMMENT] %d / %d - media: %s - text: %o',
			store.getState().imageComments + 1,
			config.commentLimit,
			convertIDtoPost(media.id),
			response.text
		);
		// increment image comments
		store.change(({ imageComments, serverCalls }) => ({
			imageComments: imageComments + 1,
			serverCalls: serverCalls + 1
		}));
	}),

	share()
);
