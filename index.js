'use strict';

const {join} = require('path');
const {
	T, allPass, always, apply, complement, cond, ifElse, is, isEmpty, isNil, nthArg, pipe, toPairs
} = require('ramda');
const {create, env} = require('sanctuary');

const {Left, map, Right} = create({checkTypes: false, env});

const isNotEmpty = complement(isEmpty);
const isNotNil = complement(isNil);

const validOptions = allPass([isNotNil, is(Object)]);
const validPackage = allPass([isNotNil, isNotEmpty, is(String)]);
const validScript = allPass([isNotNil, isNotEmpty, is(String)]);

const parseOption = (key, value) => `${key}:${value}`;
const parseOptions = pipe(
	toPairs,
	map(apply(parseOption)),
	opts => opts.join(' '),
	ifElse(
		isEmpty,
		always(''),
		opts => ` -- ${opts}`
	)
);

const exec = (shell, root = 'node_modules') => (pkg, script, options = {}) => {
	const validate = cond([
		[pipe(nthArg(0), complement(validPackage)), always(Left(new Error('Invalid package')))],
		[pipe(nthArg(1), complement(validScript)), always(Left(new Error('Invalid script')))],
		[pipe(nthArg(2), complement(validOptions)), always(Left(new Error('Invalid options')))],
		[T, (pkg, script, opts) => Right(`cd ${join(root, pkg)} && npm run --silent ${script}${parseOptions(opts)}`)]
	]);

	return pipe(
		validate,
		map(shell)
	)(pkg, script, options);
};

module.exports = exec;
