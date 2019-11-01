import { IgApiClient } from "instagram-private-api";
import { Config } from "../core/config";
import { mediaFeed, likesForTags } from "./utils";
import { store } from "../core/store";
import logger from "../core/logging";
import { liked$ } from "../streams/like";

async function hashtag(client: IgApiClient, config: Config): Promise<void> {
	if (config.likeLimit > 0 && config.tags) {
		const likeBoundsForTags = likesForTags(config);
		let currentTagIndex = 0;
		let running = false;

		// setup process exit when like limit reached
		store.pluck("imageLikes").subscribe(likes => {
			if (likes >= config.likeLimit) {
				logger.info("like limit reached. exiting process.");
				process.exit(0);
			}

			//if it's the last tag then keep running untill likes >= imageLikes
			if (currentTagIndex == config.tags.length - 1) return;

			//the like limit for a tag of index i is equal to the sum of all the single tag limit between 0 and i.
			//if I've reached that limit simply go to the next tag.
			const currentTagLimit = likeBoundsForTags.reduce(
				(acc, val, index) => acc += index <= currentTagIndex ? val : 0
			);
			if (likes >= currentTagLimit) {
				running = false;
			}
		});

		for (const tag of config.tags) {
			running = true;
			logger.info(
				"starting hashtag feed for tag: %s. randomized number of likes: %i.",
				tag,
				likeBoundsForTags[currentTagIndex]
			);
			await mediaFeed(client, config, client.feed.tags(tag, "recent"), () => running);
			currentTagIndex++;
		}
	}
}

export default hashtag;
