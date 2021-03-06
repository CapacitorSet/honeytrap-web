import React, { PureComponent } from 'react';

class Header extends PureComponent {
    render() {
        return (
            <div className="dashhead-titles">
                <h6 className="dashhead-subtitle">{ this.props.subtitle }</h6>
                <h2 className="dashhead-title">{ this.props.title }</h2>
            </div>
        );
    }
}

export default Header;
