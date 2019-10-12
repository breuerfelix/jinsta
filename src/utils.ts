const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms * 1000));
const chance = (percentage: number): boolean => Math.random() < percentage;

export {
	sleep,
	chance,
};
