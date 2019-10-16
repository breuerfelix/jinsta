#!/usr/bin/env node

/* eslint-disable */

var args = require('yargs')
	.scriptName('jinflow')
	.usage('Usage: $0 [options]')
	.options({
		'u': {
			alias: 'username',
			demandOption: true,
			type: 'string',
			describe: 'Instagram Login Username',
			implies: 'password',
		},
		'p': {
			alias: 'password',
			demandOption: true,
			type: 'string',
			describe: 'Instagram Login Password',
			implies: 'username',
		},
		's': {
			alias: 'session',
			demandOption: true,
			type: 'string',
			normalize: true,
			describe: 'Filepath where to store the current Session',
		},
	})
	.help('h')
	.alias('h', 'help')
	.alias('v', 'version')
	.showHelpOnFail(false, 'whoops, something went wrong! run with --help')
	.argv;

var loop = require('jinflow').default;
var path = require('path');
var fs = require('fs');

var filepath = args.session;

var cookie, seed, user;
var restore = false;

if (fs.existsSync(filepath)) {
	var content = fs.readFileSync(filepath, 'utf-8');
	var data = JSON.parse(content);

	cookie = data.cookie;
	seed = data.seed;
	user = data.user;
	restore = true;
}

var config = {
	username: args.username,
	password: args.password,

	cookie: cookie,
	seed: seed,
	user: user,
	restore: restore,
	sessionPath: filepath,
};

new loop(config).run();
