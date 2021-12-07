import React from "react";
import ReactDOM from "react-dom";

import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import "./styles.css";

class App extends React.Component {
  videoRef = React.createRef();
  canvasRef = React.createRef();

  componentDidMount() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const webCamPromise = navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: "environment"
          }
        })
        .then(stream => {
          window.stream = stream;
          this.videoRef.current.srcObject = stream;
          return new Promise((resolve, reject) => {
            this.videoRef.current.onloadedmetadata = () => {
              resolve();
            };
          });
        });
      const modelPromise = cocoSsd.load();
      Promise.all([modelPromise, webCamPromise])
        .then(values => {
          this.detectFrame(this.videoRef.current, values[0]);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }

  detectFrame = (video, model) => {
    model.detect(video).then(predictions => {
      this.renderPredictions(predictions);
      requestAnimationFrame(() => {
        this.detectFrame(video, model);
      });
    });
  };

  renderPredictions = predictions => {
    const ctx = this.canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // Font options.
    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";
    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];
      prediction.score = Math.round(prediction.score * 100);
      if (prediction.score <= 50) ctx.strokeStyle = "#F30000";
      else if (prediction.score <= 75) ctx.strokeStyle = "#fff600";
      else ctx.strokeStyle = "#00FF00";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);
      // Draw the label background.
      if (prediction.score <= 50) ctx.fillStyle = "#F30000";
      else if (prediction.score <= 75) ctx.fillStyle = "#fff600";
      else ctx.fillStyle = "#00FF00";
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x, y, textWidth + 50, textHeight + 4);
    });

    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      // Draw the text last to ensure it's on top.
      ctx.fillStyle = "#000000";
      ctx.fillText(prediction.class + " " + prediction.score + "%", x, y);
    });
  };

  render() {
    return (
      <div>
        <video
          className="size"
          autoPlay
          playsInline
          muted
          ref={this.videoRef}
          width="600"
          height="450"
        />
        <canvas
          className="size"
          ref={this.canvasRef}
          width="600"
          height="450"
        />
        <div style={{ marginTop: "480px" }}>
          <a href="https://www.deep-projects.eu/">
            <img
              src="https://www.deep-projects.eu/images/materials/DEEPprojects_blue.png"
              alt=""
              height="70px"
            />
          </a>
          <a href="https://www.hi.is/idnadarverkfraedi_velaverkfraedi_og_tolvunarfraedideild">
            <img
              src="http://honnunarstadall.hi.is/sites/honnunarstadall.hi.is/files/admin/hi_logo_positiv_is_horiz.jpg"
              alt=""
              height="70px"
            />
          </a>
          <a href="http://cocodataset.org/#explore">
            <img
              src="https://tech.amikelive.com/wp-content/uploads/2018/04/coco-logo-img.png"
              alt=""
              height="70px"
            />
          </a>
          <a href="https://hackernoon.com/tensorflow-js-real-time-object-detection-in-10-lines-of-code-baf15dfb95b2">
            <img
              src="https://matrix.org/_matrix/media/r0/download/matrix.org/JIMUORpTRzFSlfQWeSULZUQg"
              alt=""
              height="70px"
            />
          </a>
        </div>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
