# youneedfriends ?

## getting started

- install node
- clone this repo
- cd into folder
- `npm install`

create a file named `.env` with the following content:
```env
IG_USERNAME=insert_username_here
IG_PASSWORD=insert_password here
```

- `npm run dev` to start the bot
- adjust values in `src/constants.ts` to play around

## why did we stop working on instapy ?

right now we experience alot of blocks and bans on the current version of instapy. in our opinion this is due to the following reasons:

- instapy uses instagram through the browser
	- more than 90% of the instagram userbase is accessing it through their official app
- instapy is working sequentially
	- for example it is performing all like actions, then all follow actions, then all unfollow actions
	- a normal user doenst use instagram like this
- instapy is using direct links
	- when accessing a user profile to follow him, instapy visit this profile via the direct url
	- a normal user is accessing the user through their timeline
	- instagram is able to detect that

to change these behaviours in instapy, we would need to rewrite it from scratch.  
since there is no maintained python library for the inofficial instagram api, we switched to javascript / typescript instead.

## what about the new algorithm ?

the new algorithm should act more like a casual user on instagram.  
the bot starts with a 'basefeed' like the current users timeline. now it starts looking through all pictures and is calculating an interest rating for each picture based on the keywords and photo description.  
based on this rating the bot will interact with the picture and like it. it will also maybe start scrolling through the comments and calculating a rating for each comment.  
based on this rating, it will interact with the timeline from the user who wrote that comment.  
now we start at the beginning again calculating a rating for each photo of this users posts...

the bot is diving deeper and deeper into random user feeds and liking / following them.

in every 'feed' we also got some chances of exiting the feed and going back one feed.

this should just visualize the basic idea behind the new algorithm.

if you got any ideas or improvements, feel free to write some issues or contact me at discord!  
since this is in pre alpha, there is alot to improve (:

---

_we love lowercase_
