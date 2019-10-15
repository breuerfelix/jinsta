import fs from 'fs';

function saveSession(path: string, cookie: any, seed: string, user: any): void {
	fs.writeFile(
		path,
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
	sessionPath: string;
}

export {
	IConfig,
	saveSession,
};
