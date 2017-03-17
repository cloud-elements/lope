'use strict';

const {join} = require('path');
const {
	T, allPass, always, apply, complement, cond, identity, ifElse, is, isEmpty, isNil, nthArg, or, pipe, toPairs
} = require('ramda');
const {create, env} = require('sanctuary');

const {Left, Right, map} = create({checkTypes: false, env});

const isNotEmpty = complement(isEmpty);
const isNotNil = complement(isNil);

const validString = allPass([isNotNil, isNotEmpty, is(String)]);
const validOptions = allPass([isNotNil, is(Object)]);
const validPackage = validString;
const validRoot = validString;
const validScript = validString;

const run = shell => (root, pkg, script, options = {}) => {
	const parseOption = (key, value) => `--${pkg}:${key}=${value}`.replace(`${pkg}:${pkg}:`, `${pkg}:`);
	const parseOptions = pipe(
		toPairs,
		map(apply(parseOption)),
		opts => opts.join(' '),
		ifElse(isEmpty, always(''), opts => ` ${opts}`)
	);

	const validate = cond([
		[pipe(nthArg(0), complement(validRoot)), always(Left(new Error('Invalid root')))],
		[pipe(nthArg(1), complement(validPackage)), always(Left(new Error('Invalid package')))],
		[pipe(nthArg(2), complement(validScript)), always(Left(new Error('Invalid script')))],
		[pipe(nthArg(3), complement(validOptions)), always(Left(new Error('Invalid options')))],
		[T, (root, pkg, script, options) => {
			const cd = ifElse(
				root => or(root.endsWith('node_modules'), root.endsWith('node_modules/')),
				(root, pkg) => join(root, pkg),
				identity
			)(root, pkg);
			return Right(`cd ${cd} && npm run --silent ${script}${parseOptions(options)}`);
		}]
	]);

	return pipe(
		validate,
		map(shell)
	)(root, pkg, script, options);
};

module.exports = run;
