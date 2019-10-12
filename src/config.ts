import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const {
	IG_USERNAME,
	IG_PASSWORD,
} = process.env;

const filepath = './data.json'; // TODO change this hardcoded string

let restore = false;
let cookie = null;
let user = null;
let seed = IG_USERNAME!;

// read in previous session
if (fs.existsSync(filepath)) {
	const content = fs.readFileSync(filepath, 'utf-8');
	const data = JSON.parse(content);

	cookie = data.cookie;
	seed = data.seed;
	user = data.user;
	restore = true;
}

const config: IConfig = {
	username: IG_USERNAME!,
	password: IG_PASSWORD!,

	seed,
	restore,
	cookie,
	user,
};

function saveSession(cookie: any, seed: string, user: any): void {
	fs.writeFile(
		filepath,
		JSON.stringify({ cookie, seed, user }),
		'utf-8', err => err ? console.error(err) : void 0
	);
}

interface IConfig {
	username: string;
	password: string;

	restore: boolean;
	seed: string;
	cookie: any;
	user: any;
}

export {
	IConfig,
	saveSession,
};

export default config;
