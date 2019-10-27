const sleep = (seconds: number): Promise<void> => new Promise(resolve => setTimeout(resolve, seconds * 1000));
const chance = (percentage: number): boolean => Math.random() < percentage;

export {
	sleep,
	chance,
};
