/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

import React from 'react'
import createjs from 'eyeree-createjs-module';

export type CanvasProps = {}

const canvasCSS = css(
  {
    backgroundColor: "black",   
    width: 1280,
    height: 1024
  }
);

export const Canvas = (props:CanvasProps) => {

  const resizeObserver = React.useRef<ResizeObserver>(new ResizeObserver((entries:ResizeObserverEntry[]) => {
    
    const canvas = entries[0].target as HTMLCanvasElement;

    const { width, height } = canvas.getBoundingClientRect();

    if (canvas.width !== width || canvas.height !== height) {
      const { devicePixelRatio:ratio=1 } = window
      const context = canvas.getContext('2d')!
      canvas.width = width*ratio
      canvas.height = height*ratio
      context.scale(ratio, ratio)
      console.log("resized", width, height, ratio);
      return true
    }
    
  }));

  const canvasRef = React.useCallback((canvas: HTMLCanvasElement) => {    
    if (canvas !== null) {

      resizeObserver.current.observe(canvas);

      var stage = new createjs.Stage(canvas);
      var circle = new createjs.Shape();
      circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 50);
      circle.x = 50;
      circle.y = 50;
      stage.addChild(circle);
    
      
      stage.update();
    
      createjs.Tween.get(circle, { loop: true })
      .to({ x: 400 }, 1000, createjs.Ease.getPowInOut(4))
      .to({ alpha: 0, y: 175 }, 500, createjs.Ease.getPowInOut(2))
      .to({ alpha: 0, y: 225 }, 100)
      .to({ alpha: 1, y: 200 }, 500, createjs.Ease.getPowInOut(2))
      .to({ x: 50 }, 800, createjs.Ease.getPowInOut(2))
      .to({ y: 50 }, 2000, createjs.Ease.bounceIn)
    
      createjs.Ticker.framerate = 60;
      // createjs.Ticker.addEventListener("tick", stage);
  
    } else {
      if (resizeObserver.current)
        resizeObserver.current.disconnect();
        createjs.Ticker.removeAllEventListeners();
      }
  }, []);

  return <canvas css={canvasCSS} ref={canvasRef} {...props}/>;

}


