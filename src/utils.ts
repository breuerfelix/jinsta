import fs from 'fs';

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms * 1000));

const chance = (percentage: number): boolean => Math.random() < percentage;

function parseSession(filepath: string): any {
	let cookie = null;
	let user = null;
	let seed = null;
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
		cookie,
		user,
		seed,
		restore,
		sessionPath: filepath,
	};

	return config;
}

export {
	parseSession,
	sleep,
	chance,
};
