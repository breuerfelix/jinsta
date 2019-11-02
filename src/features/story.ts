import { IgApiClient } from "instagram-private-api";
import { Config } from "../core/config";
import { store } from "../core/store";
import logger from "../core/logging";
import { Feed } from "instagram-private-api/dist/core/feed";
import { StoryServiceInput } from "instagram-private-api/dist/types";

async function story(client: IgApiClient, config: Config): Promise<void> {
	logger.info("starting with story feed");

	try {
		// get users who have stories to see in instagram tray (top bar)
		const storyTrayFeed = client.feed.reelsTray("cold_start");
		let storyTrayItems = await storyTrayFeed.items();
		storyTrayItems = storyTrayItems.filter(
			(item: any) =>
				item.seen < item.latest_reel_media &&
				item.user.username !== config.username
		);
		if (!storyTrayItems.length) {
			logger.info("no story left to view!");
			return;
		}

		//get all the stories from the users picked above
		const storyMediaFeed = client.feed.reelsMedia({
			userIds: storyTrayItems.map(item => item.user.pk)
		});
		const stories = await storyMediaFeed.items();
		if (!stories.length) {
			logger.info("no story left to view!");
			return;
		}

		//from all the stories of the user only get those how i've not yet seen.
		let lastSeenPerUser: any = {};
		storyTrayItems.map(
			({ seen, user: { pk } }) => (lastSeenPerUser[pk] = seen)
		);
		stories.filter(
			({ taken_at, user: { pk } }) => taken_at > lastSeenPerUser[pk]
		);

		//view stories
		await client.story.seen(stories);

		logger.info("%i latest stories has been viewed", stories.length);
		return;
	} catch (error) {
		logger.warn("error while viewing timeline stories: %o", error);
		return;
	}
}

export default story;
