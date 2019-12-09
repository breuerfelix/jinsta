# jinsta

special thanks to [@timgrossmann](https://github.com/timgrossmann) for creating [instapy](https://github.com/timgrossmann/instapy) !! (:

check out our [discord channel](https://discord.gg/FDETsht) and chat me there to get an invite for the channel :)

**this bot is experimental!**  
unfortunately this approach doesnt seem to lower the blocks and bans of instagram bots. dont use this bot if you search for a stable one.

## getting started basic

- install [nodejs](https://nodejs.org)
- open the terminal
- `npm install -g jinsta`
- `jinsta -u instagram_username -p instagram_password -w workspace_path`
	- the `-w` parameter could be `./jinsta_data` for example
	- jinsta will save log files and session data in this folder
- run `jinsta --help` for additional information

## update

- `npm update -g jinsta`

## advanced configuration

### example index.js 

- install [nodejs](https://nodejs.org)
- open the terminal and create a new folder
	- the name the folder must be different than 'jinsta'
- `npm init -y`
- `npm install jinsta`
- create a new file `index.js`

#### plain javascript

```js
var jinsta = require('jinsta');

var setup = jinsta.default;
var Config = jinsta.Config;
var timeline = jinsta.timeline;
var hashtag = jinsta.hashtag;
var storyMassView = jinsta.storyMassView;

var config = new Config(
	'instagram_username',
	'instagram_password',
	'workspace_path' // like './jinsta_data'
);

var massview = true;

// have a look at https://github.com/breuerfelix/jinsta/blob/master/src/core/config.ts for an example
config.likeLimit = 30;
// you can edit every property you want
// just do it like we change the keywords here
config.keywords = [ 'vegan', 'climate', 'sports' ];

setup(config).then(function(client) {
	if (massview) {
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
```

- `node index.js` to start the bot

#### es6 javascript

```js
import {
	setup,
	Config,
	hashtag,
	timeline,
	storyMassView,
} from 'jinsta';

async function main() {
	const workspace = './workspace';

	const { IG_USERNAME, IG_PASSWORD } = process.env;
	const config = new Config(
		IG_USERNAME,
		IG_PASSWORD,
		workspace,
	);

	const massview = false;
	//config.tags = ['vegan', 'world'];
	//config.likeLimit = 10;

	const client = await setup(config);

	if (massview) {
		await storyMassView(client, config);
	}

	if (config.tags.length) {
		// run hashtag feed
		await hashtag(client, config);
	} else {
		// run timeline feed
		await timeline(client, config);
	}
}

main();
```

### proxy

if you're running jinsta on a server in the internet or in a cloud environment it could be really helpful to use a proxy, so it is not that easy for instagram to catch you up. if you are running jinsta from home this may not be needed.

there are two ways to achieve this:
1. append `--proxy ip.ip.ip.ip:port` on the commandline
2. set following configuration in the advanced configuration:  `config.proxy = 'ip.ip.ip.ip:port'` 

### like by hashtag

the bot will go through all `tags` and split the like limit randomly between given tags.  

**simple:** `jinsta --tags climate vegan sport --likeLimit 10`

**advanced:**  
```js
// the bot will like 10 images with the hashtag vegan
// and then 10 images with the hashtag climate
config.likeLimit = 10;
config.tags = ['vegan', 'climate', 'sport'];
```

## contribute

- clone this repo
- `npm install`
- create a file named `.env` in the root folder

```env
IG_USERNAME=instagram_username
IG_PASSWORD=instagram_password
```

- `npm run dev` to start the bot

## additional information / helpful another projects

- [jinsta_starter](https://github.com/demaya/jinsta_starter/): helpful for scheduling jinsta, e.g. on a raspberry pi at home

---

_we love lowercase_
