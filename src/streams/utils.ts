import logger from '../core/logging';

export const blacklistFilter = (text: string, blacklist: string[]): boolean => {
	for (const key of blacklist) {
		if (text.includes(key)) {
			logger.info('description is matching blacklisted word: %s', key);
			return false;
		}
	}

	return true;
};

export const interestRate = (text: string, keywords: string[], base: number, inc: number): number => {
	let interest = base;

	for (const key of keywords) {
		if (text.includes(key)) interest += inc;
	}

	return interest;
};

