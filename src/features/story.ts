import { IgApiClient } from 'instagram-private-api';
import { Config } from '../core/config';
import { store } from '../core/store';
import logger from '../core/logging';
import { Feed } from 'instagram-private-api/dist/core/feed';
import { StoryServiceInput } from 'instagram-private-api/dist/types';

async function story(client: IgApiClient, config: Config): Promise<void> {
	logger.info('starting with story feed');

	// get users who have stories to see in instagram tray (top bar)
	const storyTrayFeed = client.feed.reelsTray('cold_start');
	let storyTrayItems = await storyTrayFeed.items();

	const pizza = storyTrayItems.find(item => item.user.username === 'pizzanapoletanaofficial');
	logger.warn('hello %s', pizza.seen);
	logger.warn('hello %s', pizza.latest_reel_media);
	logger.warn('hello %s', pizza.seen < pizza.latest_reel_media);

	storyTrayItems = storyTrayItems.filter(
		(item: any) => item.seen < item.latest_reel_media && item.user.username !== config.username
	);
	if(!storyTrayItems.length){
		logger.info('No story left to view!');
		return;
	}

	logger.warn('stories to see len: %o %o %o', storyTrayItems[0].user.username, storyTrayItems[1].user.username, storyTrayItems.length);
	return;

	//get stories from stories and view them
	const storyMediaFeed = client.feed.reelsMedia({
		userIds: storyTrayItems.map(item => item.user.pk)
	});
	const stories = await storyMediaFeed.items();
	const res = await client.story.seen(stories);

	return;

}

export default story;
