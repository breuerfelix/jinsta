import { IgApiClient } from 'instagram-private-api';
import { Config } from '../core/config';
import logger from '../core/logging';
import { sleep, random } from '../core/utils';

/**
	This function will attempt to see all the stories of a given user set.
	Input:
	- client: client to use
	- userIds: array of user's pk to see
	- lastSeenPerUser: 
		(optional) obj of the form {"user1.pk":"user1.seen","user2.pk":"user2.seen"}
		from all the retrieved stories of an user only those taken after the specified `seen` attribute will be actually viewed.
		For example this is used by storyMassView to avoid viewing multiple time stories.
*/
async function storyView(
	client: IgApiClient,
	userIds: number[],
	lastSeenPerUser?: any
): Promise<void> {
	//get all the stories from the users picked above
	if(!userIds || userIds.length === 0)
		logger.warn('[STORY] tried to view story without passing an array of user ids');

	let currentIndex = 0;
	let viewedStories = 0;
	while (currentIndex < userIds.length){
		const topIndex = random(currentIndex+1, Math.min(currentIndex+6, userIds.length));

		const storyMediaFeed = client.feed.reelsMedia({
			userIds: userIds.slice(currentIndex, topIndex)
		});
		let stories = await storyMediaFeed.items();
		if (!stories.length) {
			logger.info('[STORY] selected users has no story!');
			return;
		}

		if (lastSeenPerUser) {
			//from all the stories of the user only get those how i've not yet seen.
			stories = stories.filter(
				({ taken_at, user: { pk } }) =>
					!lastSeenPerUser[pk] || taken_at > lastSeenPerUser[pk]
			);
		}

		if (!stories.length) {
			logger.info('[STORY] no new story to view!');
			return;
		}

		logger.info('[STORY] stories viewed til now:%i. now viewing:%i. still %i users to fetch.',viewedStories, stories.length, Math.max(userIds.length - topIndex, 0));
		await sleep(random(5,10));
		//view stories
		await client.story.seen(stories);
		viewedStories += stories.length;
		currentIndex = topIndex+1;
	}
}

/**
	This function will attemp to view all the new (not yet seen) stories showed in the top of the timeline
*/
async function storyMassView(
	client: IgApiClient,
	config: Config
): Promise<void> {
	logger.info('[STORY_MASS_VIEW] starting viewing stories from story feed');

	// get users who have stories to see in instagram tray (top bar)
	const storyTrayFeed = client.feed.reelsTray('cold_start');
	let storyTrayItems = await storyTrayFeed.items();
	storyTrayItems = storyTrayItems.filter(
		(item: any) =>
			item.seen < item.latest_reel_media &&
			item.user.username !== config.username
	);
	if (!storyTrayItems.length) {
		logger.info('[STORY_MASS_VIEW] no story left to view!');
		return;
	}

	const userIds: number[] = [],
		lastSeenPerUser: any = {};
	storyTrayItems.map(({ seen, user: { pk } }) => {
		lastSeenPerUser[pk] = seen;
		userIds.push(pk);
	});

	//view stories
	await storyView(client, userIds, lastSeenPerUser);
}

export { storyView, storyMassView };
