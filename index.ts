/* eslint-disable */
import loop from './src';

const fs = require('fs');
require('dotenv').config();

const filepath = './session.json';

let cookie, seed, user;
let restore = false;

if (fs.existsSync(filepath)) {
	const content = fs.readFileSync(filepath, 'utf-8');
	const data = JSON.parse(content);

	cookie = data.cookie;
	seed = data.seed;
	user = data.user;
	restore = true;
}

const { IG_USERNAME, IG_PASSWORD } = process.env;
const config = {
	username: IG_USERNAME,
	password: IG_PASSWORD,

	cookie: cookie,
	seed: seed,
	user: user,
	restore: restore,
	sessionPath: filepath,
};

new loop(config).run();
