/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

import React from 'react'
import createjs from 'eyeree-createjs-module';
import DisplayObject = createjs.DisplayObject;
import { Paper } from '@mui/material';
import { theme } from '../common/css';

let stage: createjs.Stage;

export function addToStage(...children: createjs.DisplayObject[]) {
    stage!.addChild(...children);
}

export function removeFromStage(...children: createjs.DisplayObject[]) {
    stage!.removeChild(...children);
}

export type Bounds = {
    top: number,
    left: number,
    bottom: number,
    right: number,
    wrap(o: DisplayObject): void;
}

export const bounds: Bounds = {
    top: 0, left: 0, bottom: 0, right: 0,
    wrap(o: DisplayObject) {
        if (o.x > bounds.right) o.x = bounds.left;
        if (o.x < bounds.left) o.x = bounds.right;
        if (o.y > bounds.bottom) o.y = bounds.top;
        if (o.y < bounds.top) o.y = bounds.bottom;
    }
}

const canvasCSS = css(
    {
        backgroundColor: "black",
        width: "100%",
        height: "100%",
        display: "block"
    }
);

const wrapperCSS = css(
    {
        backgroundColor: "pink",
        width: "100%",
        height: "100%",
        borderRightColor: "#464646",
        borderBottomColor: "#464646",
        borderTopColor: "#838383",
        borderLeftColor: "#838383",
        borderStyle: "inset",
        borderWidth: 4
    }
)

export type CanvasProps = {}
export function Canvas(props: CanvasProps) {

    const resizeObserver = React.useRef(new ResizeObserver((entries: ResizeObserverEntry[]) => {

        const canvas = entries[0].target as HTMLCanvasElement;

        const { width, height } = canvas.getBoundingClientRect();

        // console.log("resize", width, height, canvas.width, canvas.height)

        if (canvas.width !== width || canvas.height !== height) {
            const { devicePixelRatio: ratio = 1 } = window
            canvas.width = width * ratio
            canvas.height = height * ratio
            const extent = Math.min(width, height);
            stage.scaleX = (ratio * extent) / 2;
            stage.scaleY = (ratio * extent) / 2;
            stage.x = width / 2;
            stage.y = height / 2;
            bounds.left = -stage.x / stage.scaleX
            bounds.top = -stage.y / stage.scaleY
            bounds.right = -bounds.left;
            bounds.bottom = -bounds.top;
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

    return <Paper elevation={3} sx={{ padding: 1, width: 1 }}>
        <div css={wrapperCSS}>
            <canvas css={canvasCSS} ref={canvasRef} />
        </div>
    </Paper>;

}


