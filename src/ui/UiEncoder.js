/**
*
*/

// ******************************************************************
// Imports
// ******************************************************************

import React, { Component } from 'react';
import { Card, Button, Form } from 'react-bootstrap';

import DragAndDrop from './UiDragNDrop';
import Screenshot from '../engine/Screenshot';
import Coder from '../engine/Coder';

// ******************************************************************
// Class UiEncoder
// ******************************************************************

class UiEncoder extends Component {
  constructor(props) {
    super(props);
    const strFileName = this.getFileNameByDate();
    this.state = {
      listOfFiles: '',
      codeWord: '',
      messageText: '',
      outFileName: strFileName,
    };
    this.handleDrop = this.handleDrop.bind(this);
    this.onChangeCodeWord = this.onChangeCodeWord.bind(this);
    this.onChangeMessage = this.onChangeMessage.bind(this);
    this.onChangeOutFileName = this.onChangeOutFileName.bind(this);
    this.onButtonSave = this.onButtonSave.bind(this);

    this.m_ref = React.createRef();
    this.m_image = null;
    this.m_canvas = null;
    this.m_numBytes = 0;
    this.m_pixels = null;
    this.m_coder = new Coder();

  }
  getFileNameByDate() {
    const today = new Date();
    const yy = today.getFullYear();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();
    let hh = today.getHours() + 1;
    let min = today.getMinutes() + 1;
    hh = (hh < 10) ? '0' + hh : hh;
    min = (min < 10) ? '0' + min : min;
    dd = (dd < 10) ? '0' + dd : dd;
    mm = (mm < 10) ? '0' + mm : mm;
    const strFileName = `dsx${yy}${mm}${dd}_${hh}${min}.png`;
    return strFileName;
  }
  componentDidMount() {
  }
  onButtonSave() {
    // console.log(`onButtonSave: num bytes in pixel array = ${this.m_numBytes}`);
    const coder = this.m_coder;

    coder.init();
    coder.setPass(this.state.codeWord);
    coder.setMessageDecoded(this.state.codeWord, this.state.messageText);
    const okPut = coder.putToArray(this.m_pixels, this.m_numBytes);
    if (!okPut) {
      alert('Too long text cant be embedde. Try to use more large image, or smaller text');
      return;
    }

    // check extract back
    // coder.init();
    // coder.setPass(this.state.codeWord);
    // const strExtracted = coder.getFromArray(this.m_pixels, this.m_numBytes);
    // console.log(`strExtracted  = ${strExtracted}`);

    // draw modified pixels to context
    const ctx = this.m_canvas.getContext('2d');
    ctx.putImageData(this.m_imageData, 0, 0);

    // save from canvas
    const imageUri = this.m_canvas.toDataURL();
    Screenshot.saveScreenShotToFile(imageUri, this.state.outFileName);

  }
  onChangeCodeWord(evt) {
    const strText = evt.target.value;
    this.setState({ codeWord: strText });
  }
  onChangeMessage(evt) {
    const strText = evt.target.value;
    this.setState({ messageText: strText });
  }
  onChangeOutFileName(evt) {
    const strText = evt.target.value;
    this.setState({ outFileName: strText });
  }
  handleDrop(files) {
    const numFiles = files.length;
    console.log(`handleDrop: num files = ${numFiles}`);
    if (numFiles !== 1) {
      console.log(`handleDrop: should be one file, but found ${numFiles}`);
      return;
    }
    const file = files[0];
    console.log(`handleDrop: ${file.name}, ${file.type}`);
    if (file.type === 'image/png') {
      console.log(`handleDrop: load image...`);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = evt.target.result;
        // console.log(`handleDrop: img = ${img}`);
        const imgObj = this.m_ref.current;
        imgObj.src = img;
        imgObj.onload = () => {
          console.log(`handleDrop: img dims = ${imgObj.width} * ${imgObj.height} `);


          const canvas = document.createElement('canvas');
          this.m_canvas = canvas;
          canvas.width = imgObj.width;
          canvas.height = imgObj.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(imgObj, 0, 0, imgObj.width, imgObj.height);
          this.m_imageData = ctx.getImageData(0, 0, imgObj.width, imgObj.height);
          const imagePixels = this.m_imageData.data;
          const numBytes = imagePixels.length;
          // console.log(`handleDrop: num bytes = ${numBytes} `);
          if (numBytes !== imgObj.width * imgObj.height * 4) {
            console.log(`handleDrop: wrong pixel format num byges = ${numBytes} `);
          }
          this.m_numBytes = numBytes;
          this.m_pixels = imagePixels;
          this.m_wImage = imgObj.width;
          this.m_hImage = imgObj.height;
          this.setState({ listOfFiles: file.name });
        }
        
      };
      reader.readAsDataURL(file);
    }
  }
  render() {
    const imgObj = this.m_ref.current;
    let imgLoaded = false;
    if (imgObj !== null) {
      if (imgObj.width > 0) {
        imgLoaded = true;
      } 
    }
    const codeReady = (this.state.codeWord.length > 0);
    const messageReady = (this.state.messageText.length > 0);

    const strTextDrag = (imgLoaded) ? '' : 'Drag & Drop here PNG image...';
    const strButton = (imgLoaded && codeReady && messageReady) ? <Button onClick={this.onButtonSave}> save.. </Button> : <p></p>;


    const strForm = (imgLoaded) ? <Form>
      <Form.Label className="text-left">
        Code word
      </Form.Label>
      <Form.Control required type="password" placeholder="Enter code word here"
        defaultValue={this.state.codeWord} onChange={this.onChangeCodeWord} />
      <Form.Label className="text-left">
        Your message
      </Form.Label>
      <Form.Control as="textarea" rows="8" required type="text" placeholder="Enter some message here"
        defaultValue={this.state.messageText} onChange={this.onChangeMessage} />
      <Form.Label className="text-left">
        saved file name
      </Form.Label>
      <Form.Control required type="text" placeholder="Replace if need"
        defaultValue={this.state.outFileName} onChange={this.onChangeOutFileName} />
    </Form> : <p></p>;

    const strStyle = {
      height: '300px'
    };

    const jsxEncoder = <Card bg="info" text="white">
      <Card.Title className="text-center">
        <h1 className="text-center">
          Encoder
        </h1>
      </Card.Title>
      <Card.Body>

        <DragAndDrop handleDrop={this.handleDrop}>
          <div style={strStyle} className="align-middle">
            {strTextDrag}
          </div>
        </DragAndDrop>
        <img src={this.m_image} alt="" ref={this.m_ref}  />
        {strForm}
        {strButton}

      </Card.Body>
    </Card>;
    return jsxEncoder;
  }
} // class


export default UiEncoder;
