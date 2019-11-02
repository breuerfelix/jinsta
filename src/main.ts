import { Config } from './core/config';
import login from './session';
import logger, { addLogRotate } from './core/logging';
import { IgApiClient } from 'instagram-private-api';
import fs from 'fs';
import { liked$ } from './streams/like';
import { store } from './core/store';
import { timeline, hashtag, storyMassView } from './features';

function setup(config: Config): IgApiClient {
	// must be the first thing in the application start
	addLogRotate(config.workspacePath);

	// TODO check if config is valid
	if (!fs.existsSync(config.workspacePath)) fs.mkdirSync(config.workspacePath);
	// use username as seed as default
	if (!config.seed) config.seed = config.username;

	const client = new IgApiClient();
	if (config.proxy) client.state.proxyUrl = config.proxy;

	return client;
}

async function run(config: Config): Promise<void> {
	const client = setup(config);

	config.user = await login(client, config);

	// push to store
	store.setState({ config, client });

	// trigger the like pipeline
	// TODO make it hot per default

	await storyMassView(client, config);

	liked$.subscribe();

	if (config.tags.length) {
		// run hashtag feed
		await hashtag(client, config);
	} else {
		// run timeline feed
		await timeline(client, config);
	}

	// TODO add information about the progress
	logger.info('finished, exiting');
}

export default run;
