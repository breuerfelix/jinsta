#!/usr/bin/env node

/* eslint-disable */

var args = require('yargs')
	.scriptName('jinsta')
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

var jinsta = require('jinsta');

var parseSession = jinsta.parseSession;
var loop = jinsta.default;

var filepath = args.session;

var config = parseSession(filepath);
config.username = args.username;
config.password = args.password;

new loop(config).run();
