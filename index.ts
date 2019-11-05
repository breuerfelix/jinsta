import {
	setup,
	Config,
	hashtag,
	timeline,
	storyMassView,
} from './src';

require('dotenv').config();

async function main(): Promise<void> {
	const workspace = './workspace';

	const { IG_USERNAME, IG_PASSWORD } = process.env;
	const config = new Config(
		IG_USERNAME,
		IG_PASSWORD,
		workspace,
	);

	const massview = true;
	//config.tags = ['vegan', 'world'];
	//config.likeLimit = 10;

	const client = await setup(config);

	if (massview) {
		await storyMassView(client, config);
	}

	if (config.tags.length) {
		// run hashtag feed
		await hashtag(client, config);
	} else {
		// run timeline feed
		await timeline(client, config);
	}
}

main();
