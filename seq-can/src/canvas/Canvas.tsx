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

export let stage:createjs.Stage;

export function addToStage(...children:createjs.DisplayObject[]) {
  stage!.addChild(...children);
}

export function removeFromStage(...children:createjs.DisplayObject[]) {
  stage!.removeChild(...children);
}


export function Canvas(props:CanvasProps) {

  const resizeObserver = React.useRef(new ResizeObserver((entries:ResizeObserverEntry[]) => {
    
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

      stage = new createjs.Stage(canvas);

      createjs.Ticker.framerate = 60;
      createjs.Ticker.addEventListener("tick", stage);
  
    } else {
      if (resizeObserver.current)
        resizeObserver.current.disconnect();
        createjs.Ticker.removeAllEventListeners();
      }
  }, []);

  return <canvas css={canvasCSS} ref={canvasRef} {...props}/>;

}


