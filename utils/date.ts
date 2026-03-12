export const deliveryDate = (deliveryInDays: number) => {
	const date = new Date();
	date.setDate(date.getDate() + deliveryInDays);
	return date.toDateString().slice(0, 10);
};
