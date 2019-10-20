import createStore from 'unistore';
import { Observable } from 'rxjs'; 
import { publishReplay, pluck, filter } from 'rxjs/operators';

// types
interface State {
	imageLikes: number;
	serverCalls: number;
	like$: any; // stream of liked media
}

type changeFunction = (state: State) => Partial<State>;

interface UniStoreObservable extends Observable<State> {
	setState: (state: Partial<State>, overwrite?: boolean) => void;
	getState: () => State;
	connect: () => void;
	change: (fn: changeFunction) => void;
	pluck: (key: string) => Observable<any>;
}

const org_store = createStore();
const store: UniStoreObservable = Observable.create((observer: any) => {
	org_store.subscribe((state: any) => {
		observer.next(state);
	});
}).pipe(publishReplay(1));

store.connect(); // make it a hot observable

// define store functions
store.setState = org_store.setState;
store.getState = org_store.getState as () => State;
store.change = (fn: changeFunction): void => store.setState(fn(store.getState()));
store.pluck = (key: string): Observable<any> => store.pipe(pluck(key));

const initState: Partial<State> = {
	imageLikes: 0,
	serverCalls: 0,
};

store.setState(initState);

// additional streams
const like$ = store.pipe(
	pluck('like$'),
	filter(media => !!media),
);

export {
	store,
	State,
	UniStoreObservable,
	like$,
};
