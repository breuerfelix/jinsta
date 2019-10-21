import { IgApiClient } from 'instagram-private-api';
import Feed from './base';
import { UserFeed } from './user';
import { Config } from '../config';
import { sleep } from '../utils';
import { store } from '../store';

interface CommentMedia {
	pk: string;
	user_id: number;
	has_liked_comment: boolean;
	text: string;
	user: {
		is_private: boolean;
	};
}

class CommentFeed extends Feed<CommentMedia> {
	private comments: any;

	private maxRefetch = 1;
	private refetchCount = 0;

	constructor(
		client: IgApiClient,
		config: Config,
		mediaID: string,
	) {
		super(client, config, false);
		this.comments = this.client.feed.mediaComments(mediaID);
	}

	protected async getMoreMedia(): Promise<CommentMedia[]> {
		if (this.refetchCount >= this.maxRefetch) return [];
		this.refetchCount++;
		return await this.comments.items();
	}

	protected isViolate(media: CommentMedia): boolean {
		for (const key of this.config.blacklist) {
			if (media.text.includes(key)) return true;
		}

		return false;
	}

	protected getInteractionInterest(media: CommentMedia): number {
		let interest = this.config.baseInterest;

		for (const key of this.config.keywords) {
			if (media.text.includes(key)) {
				interest += this.config.interestInc;
			}
		}

		return interest;
	}

	protected async likeMedia(media: CommentMedia): Promise<void> {
		console.log('comment liking currently not supported');
		// TODO remove when function is implemented
		store.change(({ imageLikes }) => ({ imageLikes: imageLikes-- }));
		store.change(({ serverCalls }) => ({ serverCalls: serverCalls-- }));
	}

	alreadyLikedMedia = (media: CommentMedia): boolean => media.has_liked_comment;

	protected async runNewFeed(media: CommentMedia): Promise<void> {
		if (media.user.is_private) {
			console.log('skipping private user');
			return await sleep(1);
		}

		const userFeed = new UserFeed(
			this.client,
			this.config,
			media.user_id,
		);

		return await userFeed.run();
	}
}

export {
	CommentFeed,
	CommentMedia,
};
