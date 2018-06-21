import React, { Component } from 'react';

export default class Table extends Component {
    constructor(props) {
        super(props);
        this.setState(Table.buildState(props));
    }

    static buildState(props) {
        const randomPrefix = Math.random().toString();
        const data = props.data.map((datum, index) => {
            datum.index = randomPrefix + index;
            datum.display = true;
            return datum;
        });
        return {
            headers: props.headers.map(h => Object.assign({sortDirection: 0}, h)),
            randomPrefix,
            data,
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
        const updater = this.stringSearch.bind(this);
        return (<div>
            <input type="text" onInput={evt => updater(evt.target.value)} className="form-control" placeholder="Search..." />
            <table className="table">
                <thead>
                    <tr>
                        {
                            this.props.headers.map(h => (
                                <th key={i++} className="header" onClick={this.sort.bind(this, h)}>{h.name}</th>
                            ))
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        data.filter(datum => datum.display).map(datum =>
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
            </table></div>);
    }

    sort(header) {
        const dir = header.sortDirection ^= 1;
        const data = this.props.data.sort((a, b) => {
            return dir ^ (a[header.key] > b[header.key]);
        });
        const newState = this.state;
        newState.data = data;
        this.setState(newState);
    }

    stringSearch(text) {
        const headers = this.state.headers.filter(h => h.isSearchable);
        const data = this.state.data.map(datum => {
            datum.display = headers.some(header => {
                let val = datum[header.key];
                if (typeof val !== "string") {
                    if (!header.stringify)
                        return false;
                    val = header.stringify(val);
                }
                return val.includes(text);
            });
            return datum;
        });
        const newState = this.state;
        newState.data = data;
        this.setState(newState);
    }
}