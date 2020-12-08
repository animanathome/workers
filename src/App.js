import React, { Component } from 'react';
import * as PIXI from 'pixi.js'

class App extends Component {
  constructor(props) {
    super(props);

    this.worker = new Worker("worker.js");
    this.worker.onmessage = this.onmessage;
    this.imageRef = React.createRef();
  }

  onmessage = (e) => {
    const { data } = e;
    this.imageRef.current.src = data.imageSource;
  }

  componentDidMount() {
    this.renderer = new PIXI.Renderer({ width: 20, height: 20 });
    this.stage = new PIXI.Container();
    this.renderTexture = PIXI.RenderTexture.create({ width: 20, height: 20 });

    const graphics = new PIXI.Graphics();
    graphics.beginFill(0xDE3249);
    graphics.drawRect(5, 5, 10, 10);
    graphics.endFill();
    this.stage.addChild(graphics);

    // render to texture
    this.renderer.render(this.stage, this.renderTexture);

    // extract pixels from texture
    const pixels = this.renderer.extract.pixels(this.renderTexture);

    // convert pixels to a bmp
    const imageData = {
      width: this.renderer.width,
      height: this.renderer.height,
      data: pixels
    };
    this.worker.postMessage({action: "createBMP", imageData: imageData});
  }
  render() {
    return (
        <div className="container">
          <img ref={this.imageRef}/>
        </div>
    );
  }
}

export default App;
