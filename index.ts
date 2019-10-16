/* eslint-disable */
import loop from './src';
import { parseSession } from './src';

require('dotenv').config();

const filepath = './session.json';

const config = parseSession(filepath);

const { IG_USERNAME, IG_PASSWORD } = process.env;
config.username = IG_USERNAME;
config.password = IG_PASSWORD;

new loop(config).run();
