import { IgApiClient } from 'instagram-private-api';
import Actions from '../actions';
import Constants from '../constants';
import { chance } from '../utils';
import Feed from './base';
import { User } from '../types';
import { CommentFeed } from './comment';

interface TimelineMedia {
	id: string;
	has_liked: boolean;
	caption: {
		text: string;
	};
}

class TimelineFeed extends Feed<TimelineMedia> {
	private timeline: any;

	constructor(user: User, client: IgApiClient) {
		super(user, client, new Actions(), new Constants(), true);
		this.timeline = this.client.feed.timeline('pagination');
	}

	protected async getMoreMedia(): Promise<TimelineMedia[]> {
		return await this.timeline.items();
	}

	protected getInteractionInterest(media: TimelineMedia): number {
		let interest = this.constants.base_interest;
		if (media.caption == null) return interest;

		for (const key of this.constants.keywords) {
			if (media.caption.text.includes(key)) {
				interest += this.constants.interest_inc;
			}
		}

		return interest;
	}

	protected async likeMedia(media: TimelineMedia): Promise<void> {
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

	alreadyLikedMedia = (media: TimelineMedia): boolean => media.has_liked;

	protected async runNewFeed(media: TimelineMedia): Promise<void> {
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
	TimelineFeed,
	TimelineMedia,
};
