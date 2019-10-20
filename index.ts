import loop from './src';
import { Config } from './src';

require('dotenv').config();

const workspace = './workspace';

const { IG_USERNAME, IG_PASSWORD } = process.env;
const config = new Config(
	IG_USERNAME,
	IG_PASSWORD,
	workspace,
);

new loop(config).run();
