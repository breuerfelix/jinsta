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
		's': {
			alias: 'seed',
			type: 'string',
			default: null,
			describe: 'Seed for generating the Device ID',
		},
		'r': {
			alias: 'reset',
			type: 'boolean',
			default: false,
			describe: 'Force to reset the Session',
		},
		't': {
			alias: [ 'tags', 'tag' ],
			type: 'array',
			default: [],
			describe: 'Uses given Tags for like by Hashtag',
		},
		'likeLimit': {
			alias: [ 'likelimit', 'like-limit' ],
			type: 'number',
			default: null,
			describe: 'Like limit when the bot should exit',
		},
		'storyMassView': {
			alias: [ 'storymassview', 'story-mass-view', 'smv' ],
			type: 'boolean',
			default: false,
			describe: 'All your not seen stories will instantly get seen',
		},
		'proxy': {
			type: 'string',
			default: null,
			describe: 'Proxy URL',
		},
	})
	.help('h')
	.alias('h', 'help')
	.alias('v', 'version')
	.showHelpOnFail(false, 'whoops, something went wrong! run with --help')
	.argv;

var jinsta = require('jinsta');

var setup = jinsta.setup;
var Config = jinsta.Config;
var timeline = jinsta.timeline;
var hashtag = jinsta.hashtag;
var storyMassView = jinsta.storyMassView;

var config = new Config(
	args.username,
	args.password,
	args.workspace,
);

config.reset = args.reset;
config.seed = args.seed;
config.proxy = args.proxy;

config.tags = args.tags;
if (args.likeLimit) config.likeLimit = args.likeLimit;

setup(config).then(function(client) {
	if (args.storrymassview) {
		storyMassView(client, config);
	}

	if (config.tags.length) {
		// run hashtag feed
		hashtag(client, config);
	} else {
		// run timeline feed
		timeline(client, config);
	}
});
