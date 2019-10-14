class Constants {
	public base_interest = .1;
	public interest_inc = .05; // should be adjusted if there are more / less keywords

	public media_delay = 3;

	// all these chances are getting multiplied by the base interest
	// example: chance to like a picture is .1 * .5 so .05
	public like_chance = .5;
	//public follow_chance = .3;
	public nested_feed_chance = .3;
	public drop_feed_chance = .2

	public like_limit = 50;

	public keywords = [ 'climate', 'sport', 'vegan', 'world', 'animal' ];
}

export default Constants;
