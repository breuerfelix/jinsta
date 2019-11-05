import bigInt from 'big-integer';

const sleep = (seconds: number): Promise<void> => new Promise(resolve => setTimeout(resolve, seconds * 1000));
const chance = (percentage: number): boolean => Math.random() < percentage;

function convertIDtoPost(mediaID: string): string {
	let id = bigInt(mediaID.split('_', 1)[0]);
	const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
	let shortcode = '';

	while (id.greater(0)) {
		const division = id.divmod(64);
		id = division.quotient;
		shortcode = `${alphabet.charAt(Number(division.remainder))}${shortcode}`;
	}

	return 'https://instagram.com/p/' + shortcode;
}

//returns a random number between [lowerBound, upperBound). upperBound is not included
const random = (lowerBound: number, upperBound: number): number =>
	lowerBound + Math.floor(Math.random()*(upperBound - lowerBound));


export {
	sleep,
	chance,
	convertIDtoPost,
	random
};
