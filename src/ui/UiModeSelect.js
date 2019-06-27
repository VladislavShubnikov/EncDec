/**
*
*/

// ******************************************************************
// Imports
// ******************************************************************

import React, { Component } from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';


// ******************************************************************
// Const
// ******************************************************************

// ******************************************************************
// Class app
// ******************************************************************

class UiModeSelect extends Component {
  constructor(props) {
    super(props);

    this.onEncode = this.onEncode.bind(this);
    this.onDecode = this.onDecode.bind(this);

    this.m_callbackSetMode = null;
  }
  onEncode() {
    this.onButton(0);
  }
  onDecode() {
    this.onButton(1);
  }
  onButton(index) {
    this.m_callbackSetMode(index);
  }
  render() {
    this.m_callbackSetMode = this.props.setModeFunc;
    const jsx = <Card bg="info" text="white">
      <Card.Title className="text-center">
        <h1>
          Select mode
        </h1>
      </Card.Title>
      <Card.Body>
        <Row>
          <Col className="text-center">
            <Button onClick={this.onEncode} > 
              Encode
            </Button> 
          </Col>
          <Col className="text-center">
            <Button onClick={this.onDecode}> 
              Decode
            </Button> 
          </Col>
        </Row>
      </Card.Body>
    </Card>;
    return jsx;
  }
} // class


export default UiModeSelect;
