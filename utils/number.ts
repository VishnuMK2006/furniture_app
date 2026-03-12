export const offPercentage = (currentPrice: number, previousPrice: number) => {
	return Math.abs(
		((currentPrice - previousPrice) / previousPrice) * 100
	).toFixed(0);
};
