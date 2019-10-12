import { IgApiClient } from 'instagram-private-api';
import { IConfig, saveSession } from './config';

class session {
	private ig: IgApiClient;
	private config: IConfig;

	constructor(ig: IgApiClient, config: IConfig) {
		this.ig = ig;
		this.config = config;
	}

	async login(): Promise<any> {
		this.ig.state.generateDevice(this.config.seed);
		this.ig.request.end$.subscribe(this.saveSession.bind(this));

		if (this.config.restore) {
			await this.ig.state.deserializeCookieJar(this.config.cookie);
			return this.config.user;
		}

		await this.ig.simulate.preLoginFlow();
		const user = await this.ig.account.login(this.config.username, this.config.password);
		this.ig.simulate.postLoginFlow(); // dont await here
		this.config.user = user;
		return user;
	}

	async saveSession(): Promise<void> {
		const cookies = await this.ig.state.serializeCookieJar();
		saveSession(cookies, this.config.seed, this.config.user);
	}
}

export default session;
