import React, { Component } from 'react';
import { connect } from 'react-redux';

import Header from './header';

class View extends Component {
    render() {
        return (
            <div className="col-sm-9 content">
                <div className="dashhead">
                    <Header title={ this.props.title } subtitle={ this.props.subtitle } />
                    <img src="/images/logo.png" style={{ width: '90px', float: 'right' }} className='pull-right' />
                    <div className="btn-toolbar dashhead-toolbar">
                        <div className="btn-toolbar-item input-with-icon">
                            <span className="icon"></span>
                        </div>
                    </div>
                </div>
                <hr className="m-t" />
                { this.props.children }
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

export default connect(mapStateToProps)(View);
