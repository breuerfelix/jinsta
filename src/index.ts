import { IgApiClient } from 'instagram-private-api';
import dotenv from 'dotenv';
dotenv.config();

const { IG_USERNAME, IG_PASSWORD } = process.env;
console.log(IG_USERNAME, IG_PASSWORD);

const ig = new IgApiClient();

ig.state.generateDevice(IG_USERNAME!);

(async () => {
  await ig.simulate.preLoginFlow();
  const loggedInUser = await ig.account.login(IG_USERNAME!, IG_PASSWORD!);
  ig.simulate.postLoginFlow(); // dont await here

  const feed2 = ig.feed.timeline();
  const test2 = await feed2.items();
  for (const item of test2) {
    if (item.media_type == 1) {
      console.log(item);
      console.log(item.image_versions2.candidates)
      break;
    }
  }
})();
