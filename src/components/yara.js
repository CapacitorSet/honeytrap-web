import React, { Component } from 'react';
import moment from 'moment';

import { connect } from 'react-redux';

import View from './view';
import Flag from "react-flags";

import Table, {Tag} from './table';

class Yara extends Component {
    render() {
        if(!this.props.events) {
            return (
                <div>Loading...</div>
            );
        }

        const { events } = this.props;

        const data = events
            .filter(e => "yara.rule" in e)
            .map(event => {
                event.date = moment(event.date).utc();
                return event;
            })
            .sort((left, right) => right.date.diff(left.date))
            .slice(0, 10)
            .map(e => {
                let message = (e.message || e.payload);

                if (e.category == 'ssh') {
                    message = e['ssh.request-type'];
                }

                return Object.assign(e, {
                    "yara-rule": e["yara.rule"],
                    "yara-tags": e["yara.tags"],
                    source: {
                        isocode: e['source.country.isocode'],
                        ip: e["source-ip"],
                        port: e["source-port"]
                    },
                    destination: {
                        ip: e["destination-ip"],
                        port: e["destination-port"]
                    },
                    message: message || "",
                });
            });

        return (
            <View title="Overview" subtitle="Events">
                <Table headers={[{
                    name: "Rule",
                    key: "yara-rule",
                    isSearchable: true,
                }, {
                    name: "Tags",
                    key: "yara-tags",
                    isSearchable: true,
                    renderer: (tags, {tagHandler}) => tags.split(",").map(tag => <Tag text={tag} handler={tagHandler} />)
                }, {
                    name: "Date",
                    key: "date",
                    renderer: date => date.fromNow()
                }, {
                    name: "Sensor",
                    key: "sensor",
                    isSearchable: true,
                }, {
                    name: "Category",
                    key: "category",
                    isSearchable: true,
                }, {
                    name: "Source",
                    key: "source",
                    isSearchable: true,
                    renderer: ({isocode, ip, port}) => <span><Flag
                        name={isocode || "_unknown"}
                        basePath="images/flags"
                        format="png"
                        pngSize={16}
                        shiny={false}
                    /> {ip} ({port})</span>,
                    stringify: ({ip, port}) => ip + ":" + port,
                }, {
                    name: "Destination",
                    key: "destination",
                    isSearchable: true,
                    renderer: ({ip, port}) => ip + ":" + port,
                    stringify: ({ip, port}) => ip + ":" + port,
                }, {
                    name: "Message",
                    key: "message",
                    isSearchable: true,
                }]}
                data={data} />
            </View>
        );
    }
}

function mapStateToProps(state) {
    return {
        events: state.sessions.events
    };
}

export default connect(mapStateToProps)(Yara);
