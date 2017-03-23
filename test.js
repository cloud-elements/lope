'use strict';

const test = require('ava');
const {create, env} = require('sanctuary');
const lope = require('.');

const {fromEither, either} = create({checkTypes: false, env});

test('invalid root should return Left', t => either(
	err => t.is(err.message, 'Invalid path'),
	() => t.fail()
)(lope('', 'lope-example', 'true')));

test('invalid package should return Left', t => either(
	err => t.is(err.message, 'Invalid package'),
	() => t.fail()
)(lope('node_modules', '', 'true')));

test('invalid script should return Left', t => either(
	err => t.is(err.message, 'Invalid script'),
	() => t.fail()
)(lope('node_modules', 'lope-example', '')));

test('invalid options should return Left', t => either(
	err => t.is(err.message, 'Invalid options'),
	() => t.fail()
)(lope('node_modules', 'lope-example', 'true', '')));

test('valid arguments should return Right', t => either(
	() => t.fail(),
	() => t.pass()
)(lope('node_modules', 'lope-example', 'true')));

test('self-referencing package root with valid and correct arguments awaited should return successful execa execution', async t => {
	const ran = await fromEither(null)(lope('.', 'lope', 'true'));
	t.is(ran.code, 0);
});

test('self-referencing package root with valid and correct arguments including shorthand options awaited should return successful execa execution', async t => {
	const ran = await fromEither(null)(lope('.', 'lope', 'equals', {input: 'input'}));
	t.is(ran.code, 0);
});

test('self-referencing package root with valid and correct arguments including multiple shorthand options awaited should return successful execa execution', async t => {
	const ran = await fromEither(null)(lope('.', 'lope', 'equalsBoth', {input0: 'input0', input1: 'input1'}));
	t.is(ran.code, 0);
});

test('self-referencing package root with valid but incorrect arguments awaited should return failed execa execution', async t => {
	try {
		await fromEither(null)(lope('.', 'lope', 'false'));
		t.fail();
	} catch (err) {
		t.not(err.code, 0);
	}
});

test('local package root with valid and correct arguments awaited should return successful execa execution', async t => {
	const ran = await fromEither(null)(lope('node_modules', 'lope-example', 'true'));
	t.is(ran.code, 0);
});

test('local package root with valid and correct arguments including shorthand options awaited should return successful execa execution', async t => {
	const ran = await fromEither(null)(lope('node_modules', 'lope-example', 'equals', {input: 'input'}));
	t.is(ran.code, 0);
});

test('local package root with valid and correct arguments including multiple shorthand options awaited should return successful execa execution', async t => {
	const ran = await fromEither(null)(lope('node_modules', 'lope-example', 'equalsBoth', {input0: 'input0', input1: 'input1'}));
	t.is(ran.code, 0);
});

test('local package root with valid but incorrect arguments awaited should return failed execa execution', async t => {
	try {
		await fromEither(null)(lope('node_modules', 'lope-example', 'false'));
		t.fail();
	} catch (err) {
		t.not(err.code, 0);
	}
});
