import { IgApiClient } from 'instagram-private-api';
import Feed from './base';
import { Config } from '../config';
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

	private maxRefetch = 1;
	private refetchCount = 0;

	constructor(
		client: IgApiClient,
		config: Config,
		userID: number,
	) {
		super(client, config, false);
		this.posts = this.client.feed.user(userID);
	}

	protected async getMoreMedia(): Promise<UserMedia[]> {
		if (this.refetchCount >= this.maxRefetch) return [];
		this.refetchCount++;
		return await this.posts.items();
	}

	protected isViolate(media: UserMedia): boolean {
		if (media.caption == null) return false;
		for (const key of this.config.blacklist) {
			if (media.caption.text.includes(key)) return true;
		}

		return false;
	}

	protected getInteractionInterest(media: UserMedia): number {
		let interest = this.config.baseInterest;
		if (media.caption == null) return interest;

		for (const key of this.config.keywords) {
			if (media.caption.text.includes(key)) {
				interest += this.config.interestInc;
			}
		}

		return interest;
	}

	protected async likeMedia(media: UserMedia): Promise<void> {
		const { user } = this.config;
		const response = await this.client.media.like({
			mediaId: media.id,
			moduleInfo: {
				module_name: 'profile',
				user_id: user.pk,
				username: user.username,
			},
			// d means like by double tap (1), you cant unlike posts with double tap
			d: chance(.5) ? 0 : 1,
		});

		console.log('response from like:', response);
	}

	alreadyLikedMedia = (media: UserMedia): boolean => media.has_liked;

	protected async runNewFeed(media: UserMedia): Promise<void> {
		const commentFeed = new CommentFeed(
			this.client,
			this.config,
			media.id,
		);

		return await commentFeed.run();
	}
}

export {
	UserFeed,
	UserMedia,
};
