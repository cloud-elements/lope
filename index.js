'use strict';

const {join} = require('path');
const {sync: exists} = require('path-exists');
const {
	T, allPass, always, apply, complement, cond, defaultTo, ifElse, is, isEmpty, isNil, nthArg, pipe, toPairs
} = require('ramda');
const {create, env} = require('sanctuary');

const {Left, map, Right} = create({checkTypes: false, env});

const isNotEmpty = complement(isEmpty);
const isNotNil = complement(isNil);

const validOptions = allPass([isNotNil, is(Object)]);
const validPath = exists;
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

const exec = (shell, prefix) => (pkg, script, options = {}) => {
	const path = join(defaultTo('.', prefix), 'node_modules', pkg);

	const validate = cond([
		[pipe(nthArg(0), complement(validPath)), always(Left(new Error('Invalid path')))],
		[pipe(nthArg(1), complement(validScript)), always(Left(new Error('Invalid script')))],
		[pipe(nthArg(2), complement(validOptions)), always(Left(new Error('Invalid options')))],
		[T, (path, script, opts) => Right(`cd ${path} && npm run ${script}${parseOptions(opts)}`)]
	]);

	return pipe(
		validate,
		map(shell)
	)(path, script, options);
};

module.exports = exec;
