import createStore from 'unistore';
import { IgApiClient } from 'instagram-private-api';
import { Observable } from 'rxjs'; 
import {
	publishReplay,
	pluck,
	distinctUntilChanged,
} from 'rxjs/operators';
import { Config } from './config';

interface State {
	imageLikes: number;
	serverCalls: number; // TODO add a limit for this

	config: Config;
	client: IgApiClient;
}

type changeFunction = (state: State) => Partial<State>;

interface UniStoreObservable extends Observable<State> {
	setState: (state: Partial<State>, overwrite?: boolean) => void;
	getState: () => State;
	connect: () => void;
	change: (fn: changeFunction) => void;
	pluck: (key: string) => Observable<any>;
}

// TODO without unistore
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

// useful functions
const addServerCalls = (amount = 1): void => store.change(({ serverCalls }) => ({ serverCalls: serverCalls + amount }));

export {
	store,
	State,
	UniStoreObservable,
	addServerCalls,
};
