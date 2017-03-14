'use strict';

const test = require('ava');
const {shell} = require('execa');
const {create, env} = require('sanctuary');
const lope = require('.')(shell, 'node_modules');

const {fromEither, either} = create({checkTypes: false, env});

test.serial('invalid package should return Left', t => either(
	err => t.is(err.message, 'Invalid path'),
	() => t.fail()
)(lope('invalid', 'true')));

test.serial('invalid script should return Left', t => either(
	err => t.is(err.message, 'Invalid script'),
	() => t.fail()
)(lope('lope-example', 0)));

test.serial('invalid options should return Left', t => either(
	err => t.is(err.message, 'Invalid options'),
	() => t.fail()
)(lope('lope-example', 'true', 0)));

test.serial('valid arguments should return Right', t => either(
	() => t.fail(),
	() => t.pass()
)(lope('lope-example', 'true')));

test.serial('valid and correct arguments awaited should return successful execa execution', async t => {
	const executed = await fromEither(null)(lope('lope-example', 'true'));

	t.is(executed.code, 0);
});

test.serial('valid and correct arguments including options awaited should return successful execa execution', async t => {
	const executed = await fromEither(null)(lope('lope-example', 'echo', {echo: 'hello'}));

	t.true(executed.stdout.indexOf('hello') >= 0);
});

test.serial('valid but incorrect arguments awaited should return failed execa execution', async t => {
	try {
		await fromEither(null)(lope('lope-example', 'false'));
		t.fail();
	} catch (err) {
		t.not(err.code, 0);
	}
});
