/**
*
*/

// ******************************************************************
// Imports
// ******************************************************************

import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';

import UiModeSelect from './ui/UiModeSelect';
import UiEncoder from './ui/UiEncoder';
import UiDecoder from './ui/UiDecoder';

import Coder from './engine/Coder';

// ******************************************************************
// Const
// ******************************************************************
const APP_IN_SELECT_MODE = 0;
// const APP_IN_ENCODE_MODE = 1;
// const APP_IN_DECODE_MODE = 2;

// ******************************************************************
// Class app
// ******************************************************************

class App extends Component {
  constructor(props) {
    super(props);
    this.setMode = this.setMode.bind(this);
    this.state = {
      mode: APP_IN_SELECT_MODE,
    };
  }
  // test coder
  testCoder() {
    const coder = new Coder();
    let STR_PASS = 'ha';
    // let SRC_MSG = 'abcd1234абвг';
    let SRC_MSG = 'abcd';
    coder.init();
    coder.setPass(STR_PASS);
    coder.setMessageDecoded(STR_PASS, SRC_MSG);

    const ARR_SIZE = 64 * 64 * 4;
    const arr = new Uint8Array(ARR_SIZE);
    // coder.putToBitArray(arr, ARR_SIZE);
    coder.putToArray(arr, ARR_SIZE);

    STR_PASS = 'ha';
    coder.init();
    coder.setPass(STR_PASS);
    const strDecoded = coder.getFromArray(arr, ARR_SIZE);
    console.log(`decoded from bit arr = ${strDecoded}`);
  }
  componentDidMount() {
    // this.testCoder();
  }
  setMode(index) {
    this.setState({ mode: (index + 1) });
  }
  render() {
    const jsxModeSelect = <UiModeSelect setModeFunc={this.setMode}/>
    const jsxEncoder = <UiEncoder />;
    const jsxDecoder = <UiDecoder />;
    const jsxArr = [
      jsxModeSelect, jsxEncoder, jsxDecoder
    ];
    const jsxInside = jsxArr[this.state.mode];
    const jsxRow = <Row>
      <Col xs sm md lg xl="1">
      </Col>
      <Col xs sm md lg xl="10"> 
        {jsxInside}
      </Col>
      <Col xs sm md lg xl="1">
      </Col>
    </Row>;

    return jsxRow;
  }
} // class


export default App;
