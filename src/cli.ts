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
		'w': {
			alias: 'workspace',
			demandOption: true,
			type: 'string',
			normalize: true,
			describe: 'Folder where permanent data is stored',
		},
	})
	.help('h')
	.alias('h', 'help')
	.alias('v', 'version')
	.showHelpOnFail(false, 'whoops, something went wrong! run with --help')
	.argv;

var jinsta = require('jinsta');

var loop = jinsta.default;
var Config = jinsta.Config;

var config = new Config(
	args.username,
	args.password,
	args.workspace,
);

new loop(config).run();
