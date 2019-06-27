/**
*
*/

// ******************************************************************
// Imports
// ******************************************************************

import React, { Component } from 'react';
import { Form, Card } from 'react-bootstrap';

import DragAndDrop from './UiDragNDrop';
import Coder from '../engine/Coder';

// ******************************************************************
// Class UiEncoder
// ******************************************************************

class UiDecoder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listOfFiles: '',
      codeWord: '',
      strTextExtracted: '',
      extractSuccess: false,
    };
    this.handleDrop = this.handleDrop.bind(this);
    this.onChangeCodeWord = this.onChangeCodeWord.bind(this);

    this.m_ref = React.createRef();
    this.m_image = null;
    this.m_canvas = null;
    this.m_numBytes = 0;
    this.m_pixels = null;
    this.m_coder = new Coder();
  }
  onChangeCodeWord(evt) {
    const strText = evt.target.value;
    this.setState({ codeWord: strText });
  }
  handleDrop(files) {
    const numFiles = files.length;
    // console.log(`handleDrop: num files = ${numFiles}`);
    if (numFiles !== 1) {
      console.log(`handleDrop: should be one file, but found ${numFiles}`);
      return;
    }
    const file = files[0];
    // console.log(`handleDrop: ${file.name}, ${file.type}`);
    if (file.type === 'image/png') {
      // console.log(`handleDrop: load image...`);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = evt.target.result;
        // console.log(`handleDrop: img = ${img}`);
        const imgObj = this.m_ref.current;
        imgObj.src = img;
        imgObj.onload = () => {
          // console.log(`handleDrop: img dims = ${imgObj.width} * ${imgObj.height} `);
          const canvas = document.createElement('canvas');
          this.m_canvas = canvas;
          canvas.width = imgObj.width;
          canvas.height = imgObj.height;
          canvas.getContext('2d').drawImage(imgObj, 0, 0, imgObj.width, imgObj.height);
          const imagePixels = canvas.getContext('2d').getImageData(0, 0, imgObj.width, imgObj.height).data;
          const numBytes = imagePixels.length;
          // if (numBytes !== imgObj.width * imgObj.height * 4) {
          //   console.log(`handleDrop: wrong pixel format num byges = ${numBytes} `);
          // }
          this.m_numBytes = numBytes;
          this.m_pixels = imagePixels;
          this.m_wImage = imgObj.width;
          this.m_hImage = imgObj.height;

          const coder = this.m_coder;
          coder.init();
          coder.setPass(this.state.codeWord);
          let textExtracted = coder.getFromArray(this.m_pixels, this.m_numBytes);
          // console.log(`strExtracted  = ${textExtracted}`);
          if (textExtracted.length === 0) {
            textExtracted = 'Text cant be extracted! Possible reasons:\n 1) no embedded text in image\n2) wrong password';
            this.setState({ extractSuccess: false });
          } else {
            this.setState({ extractSuccess: true });
          }
          this.setState({ strTextExtracted: textExtracted });
        }
        
      };
      reader.readAsDataURL(file);
    }
  } // hadnelDrop files
  render() {
    const codeReady = (this.state.codeWord.length > 0);
    const textExtractedReady = (this.state.strTextExtracted.length > 0);

    let strTextDrag = '';
    if (codeReady) {
      strTextDrag = 'Drop png file here';
    }
    if (textExtractedReady) {
      strTextDrag = '';
    }


    const jsxForm = <Form>
      <Form.Label className="text-left">
        Code word
      </Form.Label>
      <Form.Control autoFocus required type="password" placeholder="Enter code word here"
        defaultValue={this.state.codeWord} onChange={this.onChangeCodeWord} />
    </Form>;

    const strStyle = {
      height: '300px'
    };

    const jsxDrop = <div><DragAndDrop handleDrop={this.handleDrop}>
      <div style={strStyle} className="align-middle">
        {strTextDrag}
      </div>
    </DragAndDrop>
    <img src={this.m_image} alt="" ref={this.m_ref}  />
    </div>;

    const arrText = this.state.strTextExtracted.split('\n');

    const jsxTextResult = <Card bg="success" text="black">
      <Card.Title>
        {(this.state.extractSuccess) ? 'Extracted text' : 'Failed'}:
      </Card.Title>
      <Card.Body>
        {arrText.map( (strElem, i) => {
          const strKey = `id${i}`;
          // console.log(`map. elem = ${strElem}`);
          return <p key={strKey}> {strElem} </p>;
        })}
      </Card.Body>
    </Card>;

    const jsxExtra = (textExtractedReady) ? <div>{jsxTextResult}</div> : <p></p>;

    const jsxContent = (codeReady) ? <div> {jsxForm} {jsxDrop} {jsxExtra} </div> : <div> {jsxForm} </div>;
    const jsxDecoder = <Card bg="info" text="white">
      <Card.Title className="text-center">
        <h1 className="text-center">
          Decoder
        </h1>
      </Card.Title> 
      <Card.Body>
        {jsxContent}
      </Card.Body>

    </Card>;
    return jsxDecoder;
  } // render


} // class
export default UiDecoder;
