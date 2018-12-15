'use strict';

const datesBetween = require('..');

const startDate = new Date('2016-01-01');
const endDate = new Date('2016-01-10');

const dates = Array.from(datesBetween(startDate, endDate));

console.log(dates);
