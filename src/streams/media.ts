import { Subject } from 'rxjs';
import { TimelineFeedResponseMedia_or_ad } from 'instagram-private-api/dist/responses';

export const media$ = new Subject<TimelineFeedResponseMedia_or_ad>();