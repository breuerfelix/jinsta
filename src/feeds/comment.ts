import { IgApiClient } from 'instagram-private-api';
import Actions from '../actions';
import Constants from '../constants';
import Feed from './base';
import { UserFeed } from './user';
import { User } from '../types';

interface CommentMedia {
	pk: string;
	user_id: number;
	has_liked_comment: boolean;
	text: string;
}

class CommentFeed extends Feed<CommentMedia> {
	private comments: any;

	constructor(
		user: User,
		client: IgApiClient,
		actions: Actions,
		constants: Constants,
		mediaID: string,
	) {
		super(user, client, actions, constants, false);
		this.comments = this.client.feed.mediaComments(mediaID);
	}

	protected async getMoreMedia(): Promise<CommentMedia[]> {
		return await this.comments.items();
	}

	protected getInteractionInterest(media: CommentMedia): number {
		let interest = this.constants.base_interest;

		for (const key of this.constants.keywords) {
			if (media.text.includes(key)) {
				interest += this.constants.interest_inc;
			}
		}

		return interest;
	}

	protected async likeMedia(media: CommentMedia): Promise<void> {
		console.log('comment liking currently not supported');
		// TODO remove when function is implemented
		this.actions.likes--;
		this.actions.server_calls--;
	}

	alreadyLikedMedia = (media: CommentMedia): boolean => media.has_liked_comment;

	protected async runNewFeed(media: CommentMedia): Promise<void> {
		const userFeed = new UserFeed(
			this.user,
			this.client,
			this.actions,
			this.constants,
			media.user_id,
		);

		return await userFeed.run();
	}
}

export {
	CommentFeed,
	CommentMedia,
};
