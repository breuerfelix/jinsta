class Constants {
	public base_interest = .05;
	public interest_inc = .2; // should be adjusted if there are more / less keywords

	public media_delay = 3;

	// all these chances are getting multiplied by the base interest
	// example: chance to like a picture is .1 * .5 so .05
	public like_chance = .5;
	//public follow_chance = .3;
	public nested_feed_chance = .2;
	public drop_feed_chance = .2;

	public like_limit = 35;

	public keywords = [ 'climate', 'sport', 'vegan', 'world', 'animal' ];
	public blacklist = [
		'porn', 'naked', 'sex', 'vagina', 'penis', 'nude',
		'tits', 'boobs', 'like4like', 'nsfw', 'sexy', 'hot',
		'babe', 'binary', 'bitcoin', 'crypto', 'forex', 'dick',
		'squirt', 'gay', 'homo', 'nazi', 'jew', 'judaism',
		'muslim', 'islam', 'hijab', 'niqab', 'farright',
		'rightwing', 'conservative', 'death', 'racist', 'cbd',
		'drugs',
	];
}

export default Constants;
