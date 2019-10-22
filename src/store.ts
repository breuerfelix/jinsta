import createStore from 'unistore';
import { Observable } from 'rxjs'; 
import {
	publishReplay,
	pluck, filter,
	distinctUntilChanged,
} from 'rxjs/operators';

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
store.setState = (newState: Partial<State>): void => org_store.setState(newState);
store.getState = (): State => org_store.getState() as State;
store.change = (fn: changeFunction): void => org_store.setState(fn(org_store.getState() as State));
store.pluck = (key: string): Observable<any> => store.pipe(pluck(key), distinctUntilChanged());

const initState: Partial<State> = {
	imageLikes: 0,
	serverCalls: 0,
};

store.setState(initState);

// additional streams
const like$ = store.pipe(
	pluck('like$'),
	filter(media => !!media),
	distinctUntilChanged(),
);

export {
	store,
	State,
	UniStoreObservable,
	like$,
};
