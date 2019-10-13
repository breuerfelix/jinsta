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
		isBaseFeed = false,
	) {
		this.user = user;
		this.client = client;
		this.actions = actions;
		this.constants = constants;
		this.isBaseFeed = isBaseFeed;
	}

	protected abstract async getMoreMedia(): Promise<T[]>;
	protected abstract getInteractionInterest(media: T): number;
	protected abstract async likeMedia(media: T): Promise<void>;
	protected abstract alreadyLikedMedia(media: T): boolean;
	protected abstract async runNewFeed(media: T): Promise<void>;

	public async run(): Promise<void> {
		while (this.running) {
			// fetch new media
			if (this.progress >= this.media.length) {
				const newMedia = await this.getMoreMedia();
				this.media.push(...newMedia);

				console.log('new media count:', this.media.length);

				this.actions.server_calls++;
			}

			if (this.progress >= this.media.length) {
				console.log('no more new media');
				break;
			}

			for (this.progress; this.progress < this.media.length; this.progress++) {
				console.log('current progress:', this.progress);
				// simulate looking at media
				// TODO look longer for different media types
				await sleep(this.constants.media_delay);

				const med: T = this.media[this.progress];

				// continue with next media
				if (!chance(this.getInteractionInterest(med))) {
					console.log('skip media!');
					continue;
				}

				console.log('interact with media');

				// interact with media
				if (!this.alreadyLikedMedia(med) && chance(this.constants.like_chance)) {
					console.log('like media');
					await this.likeMedia(med);

					this.actions.likes++;
					this.actions.server_calls++;

					// TODO delete this hard coded exit!
					if (this.actions.likes >= this.constants.like_limit) process.exit(0);
				}

				if (chance(this.constants.nested_feed_chance)) {
					console.log('generate new feed');
					await this.runNewFeed(med);
				}

				if (this.isBaseFeed) continue;

				// calculate chance to drop feed
				if (chance(this.constants.drop_feed_chance)) {
					console.log('drop current feed');
					break;
				}
			} // for loop
		} // while running loop

		console.log('running loop feed ended');
	}
}

export default Feed;
