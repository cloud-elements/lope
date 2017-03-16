'use strict';

const test = require('ava');
const {shell} = require('execa');
const {create, env} = require('sanctuary');
const lope = require('.')(shell);

const {fromEither, either} = create({checkTypes: false, env});

test.serial('invalid package should return Left', t => either(
	err => t.is(err.message, 'Invalid package'),
	() => t.fail()
)(lope('', 'true')));

test.serial('invalid script should return Left', t => either(
	err => t.is(err.message, 'Invalid script'),
	() => t.fail()
)(lope('lope-example', '')));

test.serial('invalid options should return Left', t => either(
	err => t.is(err.message, 'Invalid options'),
	() => t.fail()
)(lope('lope-example', 'true', '')));

test.serial('valid arguments should return Right', t => either(
	() => t.fail(),
	() => t.pass()
)(lope('lope-example', 'true')));

test.serial('valid and correct arguments awaited should return successful execa execution', async t => {
	const ran = await fromEither(null)(lope('lope-example', 'true'));

	t.is(ran.code, 0);
});

test.serial('valid and correct arguments including shorthand options awaited should return successful execa execution', async t => {
	const ran = await fromEither(null)(lope('lope-example', 'echo', {echo: 'hello'}));

	t.is(ran.stdout, 'hello');
});

test.serial('valid but incorrect arguments awaited should return failed execa execution', async t => {
	try {
		await fromEither(null)(lope('lope-example', 'false'));
		t.fail();
	} catch (err) {
		t.not(err.code, 0);
	}
});

test.serial('valid and correct arguments against self-referencing project awaited should return successful execa execution', async t => {
	const ran = await fromEither(null)(lope(null, 'echo', {echo: 'hello'}));

	t.is(ran.stdout, 'hello');
});
