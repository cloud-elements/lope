'use strict';

const {join} = require('path');
const execa = require('execa');
const {
	T, allPass, always, apply, complement, concat, cond, identity, ifElse, is, isEmpty, isNil, nthArg, or, pipe, toPairs
} = require('ramda');
const {create, env} = require('sanctuary');

const {Left, Right, map} = create({checkTypes: false, env});

const isNotEmpty = complement(isEmpty);
const isNotNil = complement(isNil);
const validString = allPass([isNotNil, isNotEmpty, is(String)]);
const validOptions = allPass([isNotNil, is(Object)]);
const validPackage = validString;
const validPath = validString;
const validScript = validString;

const run = (path, pkg, script, options = {}) => {
	const parseOption = (key, value) => `--${pkg}:${key}=${value}`.replace(`${pkg}:${pkg}:`, `${pkg}:`);
	const parseOptions = pipe(toPairs, map(apply(parseOption)));

	const validate = cond([
		[pipe(nthArg(0), complement(validPath)), always(Left(new Error('Invalid path')))],
		[pipe(nthArg(1), complement(validPackage)), always(Left(new Error('Invalid package')))],
		[pipe(nthArg(2), complement(validScript)), always(Left(new Error('Invalid script')))],
		[pipe(nthArg(3), complement(validOptions)), always(Left(new Error('Invalid options')))],
		[T, (path, pkg, script, options) => {
			const cwd = ifElse(
				path => or(path.endsWith('node_modules'), path.endsWith('node_modules/')),
				(path, pkg) => join(path, pkg),
				identity
			)(path, pkg);

			return Right({cwd, cmd: 'npm', args: concat(['run', '--silent', script], parseOptions(options))});
		}]
	]);

	return pipe(
		validate,
		map(obj => execa(obj.cmd, obj.args, {cwd: obj.cwd, stdio: 'inherit'}))
	)(path, pkg, script, options);
};

module.exports = run;
