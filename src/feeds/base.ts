import { IgApiClient } from 'instagram-private-api';
import { Config } from '../config';
import { chance, sleep } from '../utils';
import { store } from '../store';
import logger from '../logging';

abstract class Feed<T> {
	protected client: IgApiClient;
	protected config: Config;

	private media: T[] = [];
	private progress = 0;
	private running = true;
	private isBaseFeed: boolean;

	constructor(
		client: IgApiClient,
		config: Config,
		isBaseFeed = false,
	) {
		this.client = client;
		this.config = config;
		this.isBaseFeed = isBaseFeed;
	}

	protected abstract async getMoreMedia(): Promise<T[]>;
	protected abstract getInteractionInterest(media: T): number;
	protected abstract isViolate(media: T): boolean;
	protected abstract async likeMedia(media: T): Promise<void>;
	protected abstract alreadyLikedMedia(media: T): boolean;
	protected abstract async runNewFeed(media: T): Promise<void>;

	public async run(): Promise<void> {
		while (this.running) {
			// fetch new media
			if (this.progress >= this.media.length) {
				const newMedia = await this.getMoreMedia();
				this.media.push(...newMedia);

				logger.info('new media count: %d', this.media.length);

				store.change(({ serverCalls }) => ({ serverCalls: serverCalls++ }));
			}

			if (this.progress >= this.media.length) {
				logger.info('no more new media');
				break;
			}

			for (this.progress; this.progress < this.media.length; this.progress++) {
				logger.info('current progress: %d / %d', this.progress, this.media.length);
				// simulate looking at media
				// TODO look longer for different media types
				await sleep(this.config.mediaDelay);

				const med: T = this.media[this.progress];

				if (this.isViolate(med)) {
					logger.info('media is inappropiate');
					continue;
				}

				// continue with next media
				if (!chance(this.getInteractionInterest(med))) {
					logger.info('skip media!');
					continue;
				}

				logger.info('interact with media');

				// interact with media
				if (!this.alreadyLikedMedia(med) && chance(this.config.likeChance)) {
					logger.info('like media');
					await this.likeMedia(med);

					store.change(({ imageLikes }) => ({ imageLikes: imageLikes++ }));
					store.change(({ serverCalls }) => ({ serverCalls: serverCalls++ }));
					store.setState({ like$: med });
				}

				if (chance(this.config.nestedFeedChance)) {
					logger.info('generate new feed');
					await this.runNewFeed(med);
				}

				if (this.isBaseFeed) continue;

				// calculate chance to drop feed
				if (chance(this.config.dropFeedChance)) {
					logger.info('drop current feed');
					break;
				}
			} // for loop
		} // while running loop

		logger.info('running loop feed ended');
	}
}

export default Feed;
