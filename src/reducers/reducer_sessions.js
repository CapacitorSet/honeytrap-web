import moment from 'moment';

import * as topojson from 'topojson';
import * as d3 from 'd3';

import { RECEIVED_METADATA, RECEIVED_HOT_COUNTRIES, CLEAR_HOT_COUNTRIES, CONNECTION_STATUS, RECEIVED_EVENTS, RECEIVED_EVENT, ADD_SESSION, FETCH_SESSIONS, FETCH_SESSION, FETCH_SESSION_CONTENT, FETCH_COUNTRIES } from '../actions/index';

const INITIAL_STATE = { all: [], events: [], session: null, content: [], metadata: null, hotCountries: [], connected: false, topology: {} };

export default function(state = INITIAL_STATE, action) {
    switch(action.type) {
    case CONNECTION_STATUS:
        return { ...state, connected: action.payload.connected };
    case RECEIVED_METADATA: {
        const metadata = action.payload;
        metadata.start = moment(metadata.start);
        return { ...state, metadata };
    }
    case FETCH_COUNTRIES: {
        const payload = action.payload;

        const world = payload[0].data;

        let names = payload[1].data;
        names = d3.tsvParse(names);

        const countries = topojson.feature(world, world.objects.countries).features.filter(d =>
            names.some(n => (d.id == n.iso_n3) && d.iso_a2 == n.iso_a2)
        ).sort((a, b) => a.iso_a2.localeCompare(b.iso_a2));

        return { ...state, topology: { countries, world, names } };
    }
    case RECEIVED_HOT_COUNTRIES: {
        const payload = action.payload;
        return { ...state, hotCountries: payload };
    }
    case RECEIVED_EVENTS: {
        const payload = action.payload;

        const events = payload.reduce((red, event) =>
            red.concat(Object.assign(event, {date: moment(event.date)}))
            , []);

        return { ...state, events};
    }
    case RECEIVED_EVENT: {
        const payload = action.payload;
        payload.date = moment(payload.date);
        return { ...state, ...payload, events: [payload, ...state.events]};
    }
    case ADD_SESSION:
        return { ...state, all: [action.payload, ...state.all] };
    case FETCH_SESSIONS:
        return { ...state, all: action.payload.data };
    case FETCH_SESSION:
        return { ...state, session: action.payload.data };
    case FETCH_SESSION_CONTENT:
        return { ...state, content: [ ...state.content, action.payload, ] }
    }


    return state;
}

// adword -> restaurant roka of ander account?
// logging -> restaurant roka?
