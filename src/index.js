import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { Switch, Route } from 'react-router-dom';

import createHistory from 'history/createBrowserHistory'

// import { Intl }  from 'react-intl-es6';
// import { i18n } from './config';

import promise from 'redux-promise';
import './toolkit-inverse.min.css';
import './application.css';

import Websocket from './components/websocket';

import App from './components/app';

import reducers from './reducers';

import { ConnectedRouter, routerMiddleware } from 'react-router-redux'

import * as countries from 'i18n-iso-countries';
countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

const history = createHistory();

function configureStore() {
    return createStore(
        reducers,
        {},
        applyMiddleware(
            routerMiddleware(history),
            promise,
        ),
    );
}

const store = configureStore({
    sessions: { all: [], events: [], session: null, content: [], metadata: null, hotCountries: [], connected: false, topology: {} },
});

ReactDOM.render(
    <div>
        <Websocket store={store}/>
        <Provider store={store}>
            <ConnectedRouter history={history}>
                <Switch>
                    <Route path="/" component={App} / >
                </Switch>
            </ConnectedRouter>
        </Provider>
    </div>
    , document.querySelector('#root'));
