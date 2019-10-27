import logger from '../core/logging';

export function blacklistFilter(text: string, blacklist: string[]): boolean {
	if (!text) return true;

	for (const key of blacklist) {
		if (text.includes(key)) {
			logger.info('description is matching blacklisted word: %s', key);
			return false;
		}
	}

	return true;
}

export function interestRate(text: string, keywords: string[], base: number, inc: number): number {
	if (!text) return base;
	let interest = base;

	for (const key of keywords) {
		if (text.includes(key)) interest += inc;
	}

	return interest;
}
