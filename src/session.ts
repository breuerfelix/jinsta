import {
	IgApiClient,
	IgCheckpointError,
	IgLoginTwoFactorRequiredError,
} from 'instagram-private-api';
import { Config } from './config';
import { User } from './types';
import inquirer from 'inquirer';
import fs from 'fs';
import logger from './logging';

interface sessionFile {
	cookie: any;
	user: any;
	seed: string;
	restore: boolean;
}

class session {
	private ig: IgApiClient;
	private config: Config;

	constructor(ig: IgApiClient, config: Config) {
		this.ig = ig;
		this.config = config;

		if (this.config.reset) return; // do not restore
		// try to parse session from file
		const additionalConfig = this.parseSession(this.config.sessionPath);
		this.config.restore = additionalConfig.restore;
		this.config.cookie = additionalConfig.cookie;
		this.config.seed = additionalConfig.seed;
		this.config.user = additionalConfig.user;
	}

	async login(): Promise<User> {
		this.ig.state.generateDevice(this.config.seed);
		this.ig.request.end$.subscribe(this.saveSession.bind(this));

		if (this.config.restore) {
			await this.ig.state.deserializeCookieJar(this.config.cookie);

			try {
				// check if session is still valid
				const tl = this.ig.feed.timeline('warm_start_fetch');
				await tl.items();
				return this.config.user;
			} catch {
				logger.info('session expired, going for relogin');
			}
		}

		await this.ig.simulate.preLoginFlow();
		let user = null;

		try {
			user = await this.ig.account.login(this.config.username, this.config.password);
		} catch (e) {
			if (e instanceof IgCheckpointError) {
				user = await this.solveChallenge();
			} else if (e instanceof IgLoginTwoFactorRequiredError) {
				user = await this.twoFactorLogin(e);
			}
		}

		this.ig.simulate.postLoginFlow(); // dont await here
		this.config.user = user;
		return user!;
	}

	async solveChallenge(): Promise<User> {
		await this.ig.challenge.auto(true); // Requesting sms-code or click "It was me" button
		const { code } = await inquirer.prompt([
			{
				type: 'input',
				name: 'code',
				message: 'Enter sms / email code:',
			},
		]);

		const res = await this.ig.challenge.sendSecurityCode(code);
		return res.logged_in_user!;
	}

	async twoFactorLogin(err: any): Promise<User> {
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
		return await this.ig.account.twoFactorLogin({
			username: this.config.username,
			verificationCode: code,
			twoFactorIdentifier,
			verificationMethod: '1', // '1' = SMS (default), '0' = OTP
			trustThisDevice: '1', // Can be omitted as '1' is used by default
		});
	}

	async saveSession(): Promise<void> {
		const cookie = await this.ig.state.serializeCookieJar();
		const { sessionPath, user, seed } = this.config;
		fs.writeFile(
			sessionPath,
			JSON.stringify({ cookie, seed, user }),
			'utf-8', err => err ? logger.error(err) : void 0,
		);
	}

	parseSession(filepath: string): sessionFile {
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
}

export default session;
