import { IgApiClient } from 'instagram-private-api';
import { Config } from '../core/config';
import { store } from '../core/store';
import logger from '../core/logging';
import { Feed } from 'instagram-private-api/dist/core/feed';
import { StoryServiceInput } from 'instagram-private-api/dist/types';

async function story(client: IgApiClient, config: Config): Promise<void> {
	logger.info('starting with story feed');

	const storyTrayFeed = client.feed.reelsTray('cold_start');
	let storyTray = await storyTrayFeed.items();

	
	logger.info('%o',storyTray.find(item=>item.user.username==='gaetanogenovesimaestro'));
	storyTray = storyTray.filter(
		(item: any) => item.seen === 0 && item.user.username !== config.username
	);

	logger.info('%o',storyTray.find(item=>item.user.username==='gaetanogenovesimaestro'));

	const storyMediaFeed = client.feed.reelsMedia({
		userIds: storyTray.map(item => item.user.pk)
	});

	const stories = await storyMediaFeed.items();

	const res = await client.story.seen(stories);

	/*const targetUser = await client.user.searchExact("maniinpasta"); // getting exact user by login
	const reelsFeed = client.feed.reelsMedia({
		// working with reels media feed (stories feed)
		userIds: [targetUser.pk] // you can specify multiple user id's, "pk" param is user id
	});
	const storyItems = await reelsFeed.items(); // getting reels, see "account-followers.feed.example.ts" if you want to know how to work with feeds
	if (storyItems.length === 0) {
		// we can check items length and find out if the user does have any story to watch
		console.log(`${targetUser.username}'s story is empty`);
		return;
	}
	const seenResult = await client.story.seen(storyItems);*/

	logger.info('view stories %o', res);
}

export default story;
