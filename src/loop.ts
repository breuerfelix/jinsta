import { IgApiClient } from 'instagram-private-api';
import { TimelineFeedResponseMedia_or_ad } from 'instagram-private-api/dist/responses';
import envConfig, { IConfig } from './config';
import session from './session';
import { sleep, chance } from './utils';

class loop {
	private ig: IgApiClient;
	private config: IConfig;
	private session: any;
	private running = true;
	private user: any = null;

	// has to be read in dynamically!
	private keywords = [ 'climate', 'sport', 'vegan', 'world', 'animal' ];

	private base_interest = .1;
	private interest_inc = .05;
	private item_delay = 2;
	private like_chance = .5;
	private follow_chance = .5;
	// -----

	constructor(config?: IConfig) {
		this.ig = new IgApiClient();
		this.config = config || envConfig;
		this.session = new session(this.ig, this.config);
	}

	async run(): Promise<void> {
		this.user = await this.session.login();

		// base feed
		const basefeed = {
			feed: this.ig.feed.timeline('pagination'),
			items: [] as TimelineFeedResponseMedia_or_ad[],
			item: 0,
		};
		const feeds = [basefeed];

		let test2 = 0
		while (this.running) {
			// current feed
			const cf = feeds[feeds.length - 1];

			// get new items
			if (cf.item == cf.items.length) {
				const newitems: TimelineFeedResponseMedia_or_ad[] = await cf.feed.items();
				cf.items.push(...newitems);
			}

			console.log('feed count:', cf.items.length)

			let test = 0
			// iterate over items
			for (let i = cf.item; i < cf.items.length; i++) {
				cf.item++;
				const it = cf.items[i];

				let interest = this.base_interest;
				for (const key of this.keywords) {
					if (it.caption.text.includes(key)) {
						interest += this.interest_inc;
					}
				}

				console.log('interest rate:', interest)

				if (!chance(interest)) {
					// do not interact
					console.log('do not interact!');
					await sleep(this.item_delay);
					continue;
				}

				// interact
				console.log('interact with item!')
				console.log(it)

				if (!it.has_liked && chance(this.like_chance)) {
					console.log('like post!')
					const response = await this.ig.media.like({
						mediaId: it.id,
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

				//const comments = await this.ig.feed.mediaComments(it.id).items();
				//console.log(comments)

				//console.log(it);
				if (test > 5) break
				test++

				await sleep(this.item_delay);
			}

			if (test2 > 3) break
			test2++
		}
	}
}

export default loop;
