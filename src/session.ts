import {
	IgApiClient,
	IgCheckpointError,
	IgLoginTwoFactorRequiredError,
} from 'instagram-private-api';
import { Config } from './core/config';
import { User } from './types';
import inquirer from 'inquirer';
import fs from 'fs';
import logger from './core/logging';

interface sessionFile {
	cookie: any;
	user: any;
	seed: string;
	restore: boolean;
}

function parseSession(filepath: string): sessionFile {
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
	};

	return config;
}

function restore(config: Config): void {
	// try to parse session from file
	const additionalConfig = parseSession(config.sessionPath);
	config.restore = additionalConfig.restore;
	config.cookie = additionalConfig.cookie;
	config.seed = additionalConfig.seed;
	config.user = additionalConfig.user;
}

async function solveChallenge(client: IgApiClient): Promise<User> {
	await client.challenge.auto(true); // Requesting sms-code or click "It was me" button
	const { code } = await inquirer.prompt([{
		type: 'input',
		name: 'code',
		message: 'Enter sms / email code:',
	}]);

	const res = await client.challenge.sendSecurityCode(code);
	return res.logged_in_user!;
}

async function twoFactorLogin(client: IgApiClient, config: Config, err: any): Promise<User> {
	const twoFactorIdentifier = err.response.body.two_factor_info.two_factor_identifier;
	if (!twoFactorIdentifier) {
		throw 'Unable to login, no 2fa identifier found';
	}
	// At this point a code should have been received via SMS
	// Get SMS code from stdin
	const { code } = await inquirer.prompt([
		{
			type: 'input',
			name: 'code',
			message: 'Enter sms code:',
		},
	]);

	// Use the code to finish the login process
	return await client.account.twoFactorLogin({
		username: config.username,
		verificationCode: code,
		twoFactorIdentifier,
		verificationMethod: '1', // '1' = SMS (default), '0' = OTP
		trustThisDevice: '1', // Can be omitted as '1' is used by default
	});
}

async function saveSession(client: IgApiClient, config: Config): Promise<void> {
	const cookie = await client.state.serializeCookieJar();
	const { sessionPath, user, seed } = config;
	fs.writeFile(
		sessionPath,
		JSON.stringify({ cookie, seed, user }),
		'utf-8', err => err ? logger.error(err) : void 0,
	);
}

async function login(client: IgApiClient, config: Config): Promise<User> {
	if (!config.reset) restore(config);

	client.state.generateDevice(config.seed);
	client.request.end$.subscribe(() => saveSession(client, config));

	if (config.restore) {
		await client.state.deserializeCookieJar(config.cookie);

		try {
			// check if session is still valid
			const tl = client.feed.timeline('warm_start_fetch');
			await tl.items();
			return config.user;
		} catch {
			logger.info('session expired, going for relogin');
		}
	}

	await client.simulate.preLoginFlow();
	let user = null;

	try {
		user = await client.account.login(config.username, config.password);
	} catch (e) {
		if (e instanceof IgCheckpointError) {
			user = await solveChallenge(client);
		} else if (e instanceof IgLoginTwoFactorRequiredError) {
			user = await twoFactorLogin(client, config, e);
		}
	}

	client.simulate.postLoginFlow(); // dont await here
	config.user = user;
	return user!;
}

export default login;
