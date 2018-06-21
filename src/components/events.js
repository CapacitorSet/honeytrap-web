import React, { Component } from 'react';
import moment from 'moment';

import { connect } from 'react-redux';


import View from './view';
import Flag from "react-flags";

class Events extends Component {
    renderTable() {
        if(!this.props.events) {
            return (
                <div>Loading...</div>
            );
        }

        const { events } = this.props;

        // sort on time
        return events
            .filter(e => !("yara.rule" in e))
            .map(event => {
                event.date = moment(event.date).utc();
                return event;
            })
            .sort((left, right) => right.date.diff(left.date))
            .slice(0, 10)
            .map((event, i) => {
                let message = (event.message || event.payload);

                if (event.category == 'ssh') {
                    message = event['ssh.request-type'];
                }

                return (
                    <tr key={i}>
                        <td>{event.date.fromNow()}</td>
                        <td>{event.sensor}</td>
                        <td>{event.category}</td>
                        <td><Flag
                            name={event['source.country.isocode']}
                            basePath="images/flags"
                            format="png"
                            pngSize={16}
                            shiny={false}
                        />
                        {event["source-ip"] } ({event["source-port"] })</td>
                        <td>{event["destination-ip"] } ({event["destination-port"] })</td>
                        <td>{message}</td>
                    </tr>
                );
            });
    }

    render() {
        const events = this.renderTable();

        return (
            <View title="Overview" subtitle="Events">
                <table className="table">
                    <thead>
                        <tr>
                            <th className="header">Date</th>
                            <th className="header">Sensor</th>
                            <th className="header">Category</th>
                            <th className="header">Source</th>
                            <th className="header">Destination</th>
                            <th className="header">Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        { events }
                    </tbody>
                </table>
            </View>
        );
    }
}

function mapStateToProps(state) {
    return {
        events: state.sessions.events
    };
}

export default connect(mapStateToProps)(Events);
