import path from 'path';
import { User } from '../types';

class Config {
	public username: string;
	public password: string;
	public proxy: string;

	// only for session restor
	public reset = false;
	public restore = false;
	public seed: string;
	public cookie: any;
	public user: User;

	// paths
	public workspacePath: string;
	public sessionPath: string;

	// application config
	public baseInterest = .2;
	public interestInc = .3; // should be adjusted if there are more / less keywords

	public mediaDelay = 3;

	// all these chances are getting multiplied by the base interest
	// example: chance to like a picture is =>
	// (baseInterest + (number of matching keywords * interestInc)) * likeChance
	public likeChance = .5;
	public nestedFeedChance = .2;
	public dropFeedChance = .2;

	// program will exit when reached
	public likeLimit = 35; // 0 for disable

	public tags: string[] = [];

	public keywords = [
		'climate', 'sport', 'vegan', 'world', 'animal',
		'vegetarian', 'savetheworld',
	];

	public blacklist = [
		'porn', 'naked', 'sex', 'vagina', 'penis', 'nude',
		'tits', 'boobs', 'like4like', 'nsfw', 'sexy', 'drugs',
		'babe', 'binary', 'bitcoin', 'crypto', 'forex', 'dick',
		'squirt', 'gay', 'homo', 'nazi', 'jew', 'judaism',
		'muslim', 'islam', 'hijab', 'niqab', 'farright',
		'rightwing', 'conservative', 'death', 'racist', 'cbd',
	];

	constructor(
		username: string,
		password: string,
		workspace: string,
	) {
		this.username = username;
		this.password = password;
		this.workspacePath = path.resolve(path.normalize(workspace));
		this.sessionPath = path.resolve(this.workspacePath, 'session.json');
	}
}

export {
	Config,
};
