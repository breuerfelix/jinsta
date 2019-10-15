import loop from './src';
import fs from 'fs';

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

const config = {
	username: 'ENTER_USERNAME_HERE',
	password: 'ENTER_PASSWORD_HERE',

	cookie: cookie,
	seed: seed,
	user: user,
	restore: restore,
	sessionPath: filepath,
};

new loop(config).run();
