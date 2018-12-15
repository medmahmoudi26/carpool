'use strict';

const datesBetween = require('..');

const startDate = new Date('2016-01-01');
const endDate = new Date('2016-01-10');

const dates = new Set(datesBetween(startDate, endDate));

console.log(dates);
