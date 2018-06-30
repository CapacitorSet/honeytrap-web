import React, { Component } from 'react';

import { connect } from 'react-redux';

import Earth from './earth';

import View from './view';
import moment from 'moment';
import Flag from "react-flags";

import * as countries from 'i18n-iso-countries';

class Dashboard extends Component {
    constructor(props) {
        super(props);

        this.state = { now: moment() };
    }

    componentDidMount() {
        this.interval = setInterval(() => this.setState({ now: moment() }), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        const { start } = this.props.metadata;

        const { now } = this.state;

        const uptime = now.diff(moment(start), 'minutes');

        const hotCountries = this.props.hotCountries.sort((left, right) => {
            return right.count - left.count;
        }).slice(0, 10).map((country, i) => {
            const isocode = country['isocode'];

            return <tr key={i} style={{ fontFamily: 'courier', fontSize: '0.8em' }}>
                <td style={{ border: 'none', padding: '2px' }}>
                    { country["count"]  }
                </td>
                <td style={{ border: 'none', padding: '2px' }}>
                    <Flag
                        name={isocode || "_unknown"}
                        format="png"
                        basePath="images/flags"
                        pngSize={16}
                        shiny={false}
                    />
                </td>
                <td style={{ border: 'none', padding: '2px' }}>
                    { countries.getName(isocode.toUpperCase(), 'en') }
                </td>
            </tr>;
        });


        let prev = {};

        // sort on time
        const events = this.props.events.reduce((red, val) => {
            if (prev['source-ip'] == val["source-ip"])
                return red;

            prev = val;

            return red.concat({ 'source-ip': val['source-ip'], 'destination-port': val['destination-port'], 'category': [ val['category'] ], 'source.country.isocode': val['source.country.isocode'] });
        }, []).slice(0, 10).map((event, i) => {
            return <tr key={i} className={ (i < 20) ? "show" : ""} style={{ fontFamily: 'courier', fontSize: '0.8em' }}>
                <td style={{ border: 'none', padding: '2px' }}>
                    <Flag
                        name={event['source.country.isocode'] || "_unknown"}
                        format="png"
                        basePath="images/flags"
                        pngSize={16}
                        shiny={false}
                    />
                </td>
                <td style={{ border: 'none', padding: '2px' }}>
                    { event["source-ip"] }
                </td>
                <td style={{ border: 'none', padding: '2px' }}>
                    { event["category"] }
                </td>
                <td style={{ border: 'none', padding: '2px' }}>
                    { event["destination-port"] }
                </td>
            </tr>
        });

        prev = null;

        const exec = this.props.events.reduce((red, event) => {
            if (!event['ssh.exec'])
                return red;

            const val = event['ssh.exec'][0];

            if (prev == val)
                return red;

            prev = val;

            return red.concat(val);
        }, []).slice(0, 10).map((val, i) => {
            return <li key={i} style={{ fontFamily: 'courier', fontSize: '0.8em' }}>{ val }</li>;
        });

        const canvasWidth = "900px";

        return (
            <View title="Overview" subtitle="Dashboard">
                <div className="row" style={{ marginTop: '0px', marginBottom: "1em", width: canvasWidth, position: "relative" }}>
                    <div style={{ width: canvasWidth, background: 'black', opacity: 0.7, position: "absolute", bottom: 0 }}>
                        <div className='pull-left col-md-6' style={{paddingTop: "15px"}}>
                            <h4 style={{ fontFamily: 'monospace' }}>Last attacks</h4>
                            <table className="table table-condensed">
                                <tbody>
                                    { events }
                                </tbody>
                            </table>
                        </div>
                        <div className='pull-left col-md-6' style={{paddingTop: "15px"}}>
                            <h4 style={{ fontFamily: 'monospace' }}>Origin</h4>
                            <table className="table table-condensed">
                                <tbody>
                                    { hotCountries }
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <Earth countries={this.props.hotCountries}></Earth>
                    <ul className="list-unstyled hidden" style={{ position: 'absolute', bottom: '0px' }}>
                        { exec }
                    </ul>
                </div>
                <div>
                    <h4>Status</h4>
                    <ul className="list-unstyled" >
                        <li>
                            Uptime: { Math.floor(uptime / (60 * 24)) }d { Math.floor(uptime / 60) }h { Math.floor(uptime % 60) }m
                        </li>
                        <li>
                            Version: { this.props.metadata.version }
                        </li>
                        <li>
                            Commit ID: { this.props.metadata.shortcommitid }
                        </li>
                    </ul>
                </div>
            </View>
        );
    }
}

function mapStateToProps(state) {
    return {
        events: state.sessions.events.sort(function (left, right) {
            return moment(right.date).utc().diff(moment(left.date).utc());
        }),
        hotCountries: state.sessions.hotCountries,
        metadata: state.sessions.metadata,
    };
}

export default connect(mapStateToProps)(Dashboard);
