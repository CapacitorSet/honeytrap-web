import React, { Component, PureComponent } from 'react';

export default class Table extends Component {
    constructor(props) {
        super(props);
        this.state = Table.buildState(props);
    }

    static buildState(props) {
        const randomPrefix = Math.random().toString();
        const data = props.data.map((datum, index) => Object.assign(datum, {index: randomPrefix + index}));
        return {
            headers: props.headers.map(h => Object.assign(h, {sortDirection: 0})),
            randomPrefix,
            data,
            searchText: "",
            searchTags: [],
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState(Table.buildState(nextProps));
    }

    render() {
        let i = 0;

        const searchableHeaders = this.state.headers.filter(h => h.isSearchable);
        let data = this.state.data.filter(datum => {
            // Tag search
            if (this.state.searchTags.length === 0) return true;
            const datumTags = datum["yara-tags"].split(",");
            return this.state.searchTags.some(stag => datumTags.includes(stag));
        }).filter(datum => {
            // String search
            if (this.state.searchText === "") return true;
            return searchableHeaders.some(header => {
                let val = datum[header.key];
                if (typeof val !== "string") {
                    if (!header.stringify)
                        return false;
                    val = header.stringify(val);
                }
                return val.includes(this.state.searchText);
            });
        });
        if (this.state.sortingCol) {
            const dir = this.state.sortingCol.sortDirection;
            const key = this.state.sortingCol.key;
            data = data.sort((a, b) => dir ^ (a[key] > b[key]));
        }

        const updater = this.stringSearch.bind(this);
        const tagHandler = this.tagSearchDo.bind(this);
        const tagUndoHandler = this.tagSearchUndo.bind(this);
        return (<div>
            <input type="text" onInput={evt => updater(evt.target.value)} className="form-control" placeholder="Search..." />
            {
                this.state.searchTags.length > 0 &&
                    <p><br />Search by tags: {this.state.searchTags.map(name => <Tag handler={tagUndoHandler} text={name} />)}</p>
            }
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
                        data.length === 0 ?
                            (<tr><td colSpan={100}>No items available.</td></tr>) :
                            data.map(datum => <Row key={datum.index} datum={datum} tagHandler={tagHandler} headers={this.props.headers} />)
                    }
                </tbody>
            </table></div>);
    }

    sort(header) {
        header.sortDirection ^= 1;
        this.setState(Object.assign(
            this.state,
            {sortingCol: header}
        ));
    }

    stringSearch(searchText) {
        this.setState(Object.assign(
            this.state,
            {searchText}
        ));
    }

    tagSearchDo(text) {
        const searchTags = this.state.searchTags;
        if (!searchTags.includes(text))
            searchTags.push(text);
        this.setState(Object.assign(
            this.state,
            {searchTags}
        ));
    }

    tagSearchUndo(text) {
        this.setState(Object.assign(
            this.state,
            {searchTags: this.state.searchTags.filter(tag => tag !== text)}
        ));
    }
}

export class Row extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {more: false}
    }

    render() {
        return <React.Fragment>
            <tr onClick={this.toggleMore.bind(this)}>
                {
                    this.props.headers.map((h, i) => {
                        const value = this.props.datum[h.key];
                        const renderer = h.renderer || String;
                        return <td key={i}>{renderer(value, {tagHandler: this.props.tagHandler})}</td>
                    })
                }
            </tr>
            { this.state.more && <tr><td colSpan={100}>{
                Object.keys(this.props.datum).filter(key => key !== "index").map(key => {
                    const value = this.props.datum[key];
                    return <p key={key}><b>{key}</b>: {
                        typeof value === "string" ?
                        value :
                        JSON.stringify(value)
                    }</p>
                })
            }</td></tr> }
            </React.Fragment>
    }

    toggleMore() {
        this.setState({more: !this.state.more});
    }
}

export class Tag extends PureComponent {
    render() {
        return <span onClick={() => this.props.handler(this.props.text)} className="badge badge-secondary" style={{cursor: "pointer"}}>{this.props.text}</span>;
    }
}