import React, { Component } from 'react';

export default class Table extends Component {
    constructor(props) {
        super(props);
        this.setState(Table.buildState(props));
    }

    static buildState(props) {
        const randomPrefix = Math.random().toString();
        return {
            headers: props.headers.map(h => Object.assign({sortDirection: 0}, h)),
            randomPrefix,
            data: props.data.map((datum, index) => {
                datum.index = randomPrefix + index;
                return datum;
            })
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState(Table.buildState(nextProps));
    }

    render() {
        const props = this.props;
        if (!this.state)
            this.state = Table.buildState(props);
        const data = this.state.data;

        let i = 0;
        return (
            <table className="table">
                <thead>
                    <tr>
                        {
                            this.state.headers.map(h => (
                                <th key={i++} className="header" onClick={this.sort.bind(this, h)}>{h.name}</th>
                            ))
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        data.map(datum =>
                            <tr key={datum.index}>
                                {
                                    this.props.headers.map(h => {
                                        const value = datum[h.key];
                                        const renderer = h.renderer || String;
                                        return <td>{renderer(value)}</td>
                                    })
                                }
                            </tr>
                        )
                    }
                </tbody>
            </table>);
    }

    sort(header) {
        const dir = header.sortDirection ^= 1;
        const data = this.props.data.sort((a, b) => {
            return dir ^ (a[header.key] > b[header.key]);
        });
        this.setState({data});
    }
}