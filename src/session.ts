import {
	IgApiClient,
	IgCheckpointError,
	IgLoginTwoFactorRequiredError,
} from 'instagram-private-api';
import { IConfig, saveSession } from './config';
import { User } from './types';
import inquirer from 'inquirer';

class session {
	private ig: IgApiClient;
	private config: IConfig;

	constructor(ig: IgApiClient, config: IConfig) {
		this.ig = ig;
		this.config = config;
	}

	async login(): Promise<User> {
		this.ig.state.generateDevice(this.config.seed);
		this.ig.request.end$.subscribe(this.saveSession.bind(this));

		if (this.config.restore) {
			await this.ig.state.deserializeCookieJar(this.config.cookie);
			return this.config.user;
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
				message: 'Enter sms code:',
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
		const cookies = await this.ig.state.serializeCookieJar();
		saveSession(this.config.sessionPath, cookies, this.config.seed, this.config.user);
	}
}

export default session;
