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
            defaultPrevented: false,
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
        e.preventDefault();
        this.setState({
            count: this.state.count + 1,
            defaultPrevented: e.defaultPrevented,
            type: e.type
        });
    },
    componentDidMount: function () {
        if (!this.props.disable) {
            subscribe(this.props.eventType, this._handleEvent, {
                throttleRate: this.props.throttleRate,
                useRAF: this.props.useRAF,
                enableScrollInfo: true
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
                <span className={this.state.defaultPrevented ? 'default-prevented' : 'default-not-prevented'} />
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
                <EventCounter eventType='touchmoveStart'/>
                <EventCounter eventType='touchmoveEnd'/>
                <EventCounter eventType='touchmove' throttleRate={1000}/>
                <EventCounter eventType='touchstart' throttleRate={1000}/>
                <EventCounter eventType='touchend' throttleRate={1000}/>
            </div>
        );
    }
});

module.exports = SubscribeDemo;
