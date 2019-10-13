import { IgApiClient } from 'instagram-private-api';
import Actions from '../actions';
import Constants from '../constants';
import Feed from './base';
import { User } from '../types';
import { chance } from '../utils';
import { CommentFeed } from './comment';

interface UserMedia {
	id: string;
	has_liked: boolean;
	caption: {
		text: string;
	};
}

class UserFeed extends Feed<UserMedia> {
	private posts: any;

	constructor(
		user: User,
		client: IgApiClient,
		actions: Actions,
		constants: Constants,
		userID: number,
	) {
		super(user, client, actions, constants, false);
		this.posts = this.client.feed.user(userID);
	}

	protected async getMoreMedia(): Promise<UserMedia[]> {
		return await this.posts.items();
	}

	protected getInteractionInterest(media: UserMedia): number {
		let interest = this.constants.base_interest;
		if (media.caption == null) return interest;

		for (const key of this.constants.keywords) {
			if (media.caption.text.includes(key)) {
				interest += this.constants.interest_inc;
			}
		}

		return interest;
	}

	protected async likeMedia(media: UserMedia): Promise<void> {
		const response = await this.client.media.like({
			mediaId: media.id,
			moduleInfo: {
				module_name: 'profile',
				user_id: this.user.pk,
				username: this.user.username,
			},
			// d means like by double tap (1), you cant unlike posts with double tap
			d: chance(.5) ? 0 : 1,
		});

		console.log('response from like:', response);
	}

	alreadyLikedMedia = (media: UserMedia): boolean => media.has_liked;

	protected async runNewFeed(media: UserMedia): Promise<void> {
		const commentFeed = new CommentFeed(
			this.user,
			this.client,
			this.actions,
			this.constants,
			media.id,
		);

		return await commentFeed.run();
	}
}

export {
	UserFeed,
	UserMedia,
};
