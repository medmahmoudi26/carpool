'use strict';

module.exports = datesBetween;

function *datesBetween(startDate, endDate) {
	startDate = startDate || new Date();
	endDate = endDate || startDate;
	const current = incrementDate(cloneDate(startDate), -1);
	while (current < endDate) {
		yield cloneDate(incrementDate(current));
	}
}

function cloneDate(date) {
	return new Date(date.valueOf());
}

function incrementDate(date, amount) {
	date.setDate(date.getDate() + defaultValue(amount, 1));
	return date;
}

function defaultValue(value, valueDefault) {
	return (typeof value === 'undefined' ? valueDefault : value);
}
