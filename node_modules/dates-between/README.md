
# Dates Between

Get all of the dates between two given dates, with [generators].

[![NPM version][shield-npm]][info-npm]
[![Node.js version support][shield-node]][info-node]
[![Build status][shield-build]][info-build]
[![Code coverage][shield-coverage]][info-coverage]
[![Dependencies][shield-dependencies]][info-dependencies]
[![MIT licensed][shield-license]][info-license]

```js
const startDate = new Date('2016-01-01');
const endDate = new Date('2017-01-01');

for (const date of datesBetween(startDate, endDate)) {
    console.log(date);
}
```


## Table of Contents

  * [Requirements](#requirements)
  * [Usage](#usage)
  * [Contributing](#contributing)
  * [License](#license)


## Requirements

Dates Between requires the following to run:

  * [Node.js] 4+
  * [npm] (normally comes with Node.js)


## Usage

Install Dates Between with [npm]:

```sh
npm install dates-between
```

Then you can load the module into your code with a `require` call:

```js
const datesBetween = require('dates-between');
```

The `datesBetween` function accepts two arguments, a start date and an end date. Both of these must be `Date` objects:

```js
datesBetween(new Date('2016-01-01'), new Date('2016-02-01'));
```

This returns an [iterable] which can be iterated over in a `for..of` construct. The yielded dates include both the start and end date that were passed in.

```js
for (const date of datesBetween(startDate, endDate)) {
    console.log(date);
}
```

Because `datesBetween` returns an iterable, you can also create a `Set` or `Array` from it:

```js
const dates = new Set(datesBetween(startDate, endDate));
```

```js
const dates = Array.from(datesBetween(startDate, endDate));
```

Usage examples can be found in the [`example` directory](example) of this repository.


## Contributing

To contribute to Dates Between, clone this repo locally and commit your code on a separate branch. Please write unit tests for your code, and run the linter before opening a pull-request:

```sh
make test    # run all tests
make verify  # run all linters
```


## License

Dates Between is licensed under the [MIT] license.  
Copyright &copy; 2016–2017, Rowan Manning



[generators]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*
[iterable]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators#Iterables
[mit]: LICENSE
[node.js]: https://nodejs.org/
[npm]: https://www.npmjs.com/

[info-coverage]: https://coveralls.io/github/rowanmanning/dates-between
[info-dependencies]: https://gemnasium.com/rowanmanning/dates-between
[info-license]: LICENSE
[info-node]: package.json
[info-npm]: https://www.npmjs.com/package/dates-between
[info-build]: https://travis-ci.org/rowanmanning/dates-between
[shield-coverage]: https://img.shields.io/coveralls/rowanmanning/dates-between.svg
[shield-dependencies]: https://img.shields.io/gemnasium/rowanmanning/dates-between.svg
[shield-license]: https://img.shields.io/badge/license-MIT-blue.svg
[shield-node]: https://img.shields.io/badge/node.js%20support-4–8-brightgreen.svg
[shield-npm]: https://img.shields.io/npm/v/dates-between.svg
[shield-build]: https://img.shields.io/travis/rowanmanning/dates-between/master.svg
