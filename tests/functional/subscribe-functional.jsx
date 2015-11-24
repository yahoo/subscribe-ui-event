/* global require */
var subscribe = require('../../dist/subscribe');

var EventCounter = React.createClass({
    propTypes: {
        eventType: React.PropTypes.string,
        throttleRate: React.PropTypes.number
    },
    getDefaultProps: function () {
        return {
            disable: false,
            eventType: 'scroll',
            throttleRate: undefined,
            useRAF: false
        };
    },
    getInitialState: function () {
        return {
            count: 0,
            type: null
        };
    },
    _handleEvent: function (e) {
        this.setState({
            count: this.state.count + 1,
            type: e.type
        });
    },
    componentDidMount: function () {
        if (!this.props.disable) {
            subscribe(this.props.eventType, this._handleEvent, {
                throttleRate: this.props.throttleRate,
                useRAF: this.props.useRAF
            });
        }
    },
    render: function () {
        var text = this.props.eventType +
            (this.state.type ? ' (' + this.state.type + ')' : '') +
            (!isNaN(this.props.throttleRate) ? ' with throttle ' + this.props.throttleRate : '') +
            (this.props.useRAF ? ' with rAF' : '') + ':';
        var className = this.props.eventType +
            (!isNaN(this.props.throttleRate) ? '-' + this.props.throttleRate : '') +
            (this.props.useRAF ? '-raf' : '');
        return (
            <div className={this.props.disable ? 'Td(lt)' : ''}>
                <span>{text} </span>
                <span className={className}>{this.state.count}</span>
            </div>
        );
    }
});

var SubscribeDemo = React.createClass({
    render: function () {
        return (
            <div className='Pos(f)'>
                <h1>Client-utils tests</h1>
                <EventCounter eventType='scroll' throttleRate={0}/>
                <EventCounter eventType='scroll' throttleRate={1000}/>
                <EventCounter eventType='scroll' useRAF={true}/>
                <EventCounter eventType='scroll' throttleRate={300} useRAF={true}/>
                <EventCounter eventType='scrollStart'/>
                <EventCounter eventType='scrollEnd'/>
                <EventCounter eventType='resize'/>
                <EventCounter eventType='resizeStart'/>
                <EventCounter eventType='resizeEnd'/>
                <EventCounter eventType='visibilitychange'/>
            </div>
        );
    }
});

module.exports = SubscribeDemo;
