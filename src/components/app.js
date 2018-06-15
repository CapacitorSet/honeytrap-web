import React, { Component } from 'react';
import { connect } from 'react-redux';

import Dashboard from './dashboard';
import Events from './events';
import Agents from './agents';
/*
import SessionShow from './components/session-show';
import Socket from './components/socket';
import Server from './components/server';
import Random from './components/random';
*/

import Navigation from './navigation';

import ConfigurationOverview from './configuration-overview';
import NotFoundPage from './not-found';

import { Redirect, Switch, Route } from 'react-router-dom';

class App extends Component {
    render() {
        if (!this.props.metadata)
            return <div className="loading">Loading&#8230;</div>;

        let disconnected = null;
        if (!this.props.connected) {
            disconnected = (
                <div className="alert alert-danger" role="alert">
                    Connection with sensor has been lost.
                </div>
            );
        }

        let versionAvailable = null;
        /*
        if (...) {
            versionAvailable =
                <div className="alert alert-warning" role="alert">
                    New version available. <a>Upgrade</a>.
                </div>;
        }
        */

        return (
            <div className="container">
                <div className="row">
                    { disconnected }
                    <div className="col-sm-3 sidebar">
                        <nav className="sidebar-nav">
                            <div className="sidebar-header">
                                <a className="sidebar-brand img-responsive" href="/">
                                    <span className="icon">Honeytrap</span>
                                </a>
                            </div>
                            <div className="collapse nav-toggleable-sm" id="nav-toggleable-sm">
                                { versionAvailable }
                                <Navigation />
                                <hr className="visible-xs m-t" />
                            </div>
                        </nav>
                    </div>
                    <Switch>
                        <Route exact path="/" component={Dashboard} / >
                        <Route exact path="/agents" component={Agents} />
                        <Route exact path="/events" component={Events} />
                        <Route exact path="/configuration" component={ConfigurationOverview} />
                        <Route path="/404" component={NotFoundPage} />
                        {/*
                        <Route path="/session/:id" component={SessionShow} />
                        <Route path="/session/:id" component={SessionShow} />
                        <Route path="/socket" component={Socket} />
                        <Route path="/server" component={Server} />
                        <Route path="/random" component={Random} />
                        */}
                        <Redirect from='*' to='/404' />
                    </Switch>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        connected: state.sessions.connected,
        metadata: state.sessions.metadata
    };
}

export default connect(mapStateToProps)(App);
