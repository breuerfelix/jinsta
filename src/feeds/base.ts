import { IgApiClient } from 'instagram-private-api';
import Actions from '../actions';
import Constants from '../constants';
import { chance, sleep } from '../utils';
import { User } from '../types';

abstract class Feed<T> {
	protected user: User;
	protected client: IgApiClient;
	protected actions: Actions;
	protected constants: Constants;

	private media: T[] = [];
	private progress = 0;
	private running = true;
	private isBaseFeed: boolean;

	constructor(
		user: User,
		client: IgApiClient,
		actions: Actions,
		constants: Constants,
		isBaseFeed = false
	) {
		this.user = user;
		this.client = client;
		this.actions = actions;
		this.constants = constants;
		this.isBaseFeed = isBaseFeed;
	}

	async abstract getMoreMedia(): Promise<T[]>;
	abstract getInteractionInterest(media: T): number;
	async abstract likeMedia(media: T): Promise<void>;
	abstract alreadyLikedMedia(media: T): boolean;
	async abstract runNewFeed(media: T): Promise<void>;

	public async run(): Promise<void> {
		while (this.running) {
			// fetch new media
			if (this.progress >= this.media.length) {
				const newMedia = await this.getMoreMedia();
				this.media.push(...newMedia);

				this.actions.server_calls++;
			}

			if (this.progress >= this.media.length) {
				console.log('no more new media');
				break;
			}

			for (this.progress; this.progress < this.media.length; this.progress++) {
				// simulate looking at media
				// TODO look longer for different media types
				await sleep(this.constants.media_delay);

				const med: T = this.media[this.progress];

				// continue with next media
				if (!chance(this.getInteractionInterest(med))) continue;

				// interact with media
				if (!this.alreadyLikedMedia(med) && chance(this.constants.like_chance)) {
					await this.likeMedia(med);

					this.actions.likes++;
					this.actions.server_calls++;
				}

				if (chance(this.constants.nested_feed_chance)) {
					await this.runNewFeed(med);
				}

				if (this.isBaseFeed) continue;

				// calculate chance to drop feed
				if (chance(this.constants.drop_feed_chance)) break;
			} // while running loop

			console.log('running loop feed ended');
		}
	}
}

export default Feed;
