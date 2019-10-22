import { IgApiClient } from 'instagram-private-api';
import { chance } from '../utils';
import { Config } from '../config';
import Feed from './base';
import { CommentFeed } from './comment';
import logger from '../logging';

interface TimelineMedia {
	id: string;
	has_liked: boolean;
	caption: {
		text: string;
	};
}

class TimelineFeed extends Feed<TimelineMedia> {
	private timeline: any;

	constructor(
		client: IgApiClient,
		config: Config,
		isBaseFeed: boolean,
	) {
		super(client, config, isBaseFeed);
		this.timeline = this.client.feed.timeline('pagination');
	}

	protected isViolate(media: TimelineMedia): boolean {
		if (media.caption == null) return false;
		for (const key of this.config.blacklist) {
			if (media.caption.text.includes(key)) {
				logger.info('description is matching blacklisted word: %s', key);
				return true;
			}
		}

		return false;
	}

	protected async getMoreMedia(): Promise<TimelineMedia[]> {
		logger.info('getting more timeline items for user \'%s\'', this.config.username);
		return await this.timeline.items();
	}

	protected getInteractionInterest(media: TimelineMedia): number {
		let interest = this.config.baseInterest;
		if (media.caption == null) return interest;

		for (const key of this.config.keywords) {
			if (media.caption.text.includes(key)) {
				interest += this.config.interestInc;
			}
		}

		return interest;
	}

	protected async likeMedia(media: TimelineMedia): Promise<void> {
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

		logger.info('response from like: %s', response);
	}

	alreadyLikedMedia = (media: TimelineMedia): boolean => media.has_liked;

	protected async runNewFeed(media: TimelineMedia): Promise<void> {
		const commentFeed = new CommentFeed(
			this.client,
			this.config,
			media.id,
		);

		return await commentFeed.run();
	}
}

export {
	TimelineFeed,
	TimelineMedia,
};
