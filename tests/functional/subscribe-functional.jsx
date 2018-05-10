/* global require */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import subscribe from '../../src/subscribe';

class EventCounter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      count: 0,
      type: null
    };

    this._handleEvent = this._handleEvent.bind(this);
  }

  componentDidMount() {
    if (!this.props.disable) {
      subscribe(this.props.eventType, this._handleEvent, {
        throttleRate: this.props.throttleRate,
        useRAF: this.props.useRAF,
        enableScrollInfo: true
      });
    }
  }

  _handleEvent(e) {
    this.setState({
      count: this.state.count + 1,
      type: e.type
    });
  }

  render() {
    var text =
      this.props.eventType +
      (this.state.type ? ' (' + this.state.type + ')' : '') +
      (!isNaN(this.props.throttleRate)
        ? ' with throttle ' + this.props.throttleRate
        : '') +
      (this.props.useRAF ? ' with rAF' : '') +
      ':';
    var className =
      this.props.eventType +
      (!isNaN(this.props.throttleRate) ? '-' + this.props.throttleRate : '') +
      (this.props.useRAF ? '-raf' : '');

    return (
      <div className={this.props.disable ? 'Td(lt)' : ''}>
        <span>{text} </span>
        <span className={className}>{this.state.count}</span>
      </div>
    );
  }
}

EventCounter.propTypes = {
  eventType: PropTypes.string,
  throttleRate: PropTypes.number
};

EventCounter.defaultProps = {
  disable: false,
  eventType: 'scroll',
  throttleRate: undefined,
  useRAF: false
};

class SubscribeDemo extends Component {
  render() {
    return (
      <div className="Pos(f)">
        <h1>Client-utils tests</h1>
        <EventCounter eventType="scroll" throttleRate={0} />
        <EventCounter eventType="scroll" throttleRate={1000} />
        <EventCounter eventType="scroll" useRAF={true} />
        <EventCounter eventType="scroll" throttleRate={300} useRAF={true} />
        <EventCounter eventType="scrollStart" />
        <EventCounter eventType="scrollEnd" />
        <EventCounter eventType="resize" />
        <EventCounter eventType="resizeStart" />
        <EventCounter eventType="resizeEnd" />
        <EventCounter eventType="visibilitychange" />
        <EventCounter eventType="touchmoveStart" />
        <EventCounter eventType="touchmoveEnd" />
        <EventCounter eventType="touchmove" throttleRate={1000} />
        <EventCounter eventType="touchstart" throttleRate={1000} />
        <EventCounter eventType="touchend" throttleRate={1000} />
      </div>
    );
  }
}

export default SubscribeDemo;
