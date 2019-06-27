import React from 'react';

class DragAndDrop extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dragging: false,
    };
    this.dropRef = React.createRef();
    this.dragCounter = 0;

    this.handleDrag = this.handleDrag.bind(this);
    this.handleDragIn = this.handleDragIn.bind(this);
    this.handleDragOut = this.handleDragOut.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
  }
  handleDrag(evt) {
    evt.preventDefault()
    evt.stopPropagation()
  }
  handleDragIn(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.dragCounter++;
    if ((evt.dataTransfer.items) && (evt.dataTransfer.items.length > 0)) {
      this.setState({ dragging: true });
    }
  }
  handleDragOut(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.dragCounter--;
    if (this.dragCounter === 0) {
      this.setState({ dragging: false }); 
    }
  }
  handleDrop(evt) {
    evt.preventDefault()
    evt.stopPropagation()
    this.setState({ dragging: false })
    if (evt.dataTransfer.files && evt.dataTransfer.files.length > 0) {
      this.props.handleDrop(evt.dataTransfer.files)
      evt.dataTransfer.clearData();
      this.dragCounter = 0;
    }
  }
  componentDidMount() {
    this.dragCounter = 0;
    let div = this.dropRef.current;
    div.addEventListener('dragenter', this.handleDragIn)
    div.addEventListener('dragleave', this.handleDragOut)
    div.addEventListener('dragover', this.handleDrag)
    div.addEventListener('drop', this.handleDrop)
  }
  componentWillUnmount() {
    let div = this.dropRef.current;
    div.removeEventListener('dragenter', this.handleDragIn)
    div.removeEventListener('dragleave', this.handleDragOut)
    div.removeEventListener('dragover', this.handleDrag)
    div.removeEventListener('drop', this.handleDrop)
  }
  render() {
    return (
      <div ref={this.dropRef} style={{ display: 'inline-block', position: 'relative' }} >
        {this.props.children}
      </div>
    )
  }
}

export default DragAndDrop;
