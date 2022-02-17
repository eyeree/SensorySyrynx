/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

import { Canvas } from '../canvas';
import { Editor } from '../editor';
import { Sequencer } from '../sequencer';
import { StateRoot } from '../state/StateRoot';
import CssBaseline from '@mui/material/CssBaseline';

import { theme } from '../common/css';
import { ThemeProvider } from '@mui/material';

import { HandlerProps, ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';
import 'react-reflex/styles.css'
import { useCanvasSizeState } from '../state/layout';


const scrollContainer = css({
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: "flex",
    overflow: "hidden"
})



function Layout() {

    const [canvasSize, setCanvasSize] = useCanvasSizeState();

    const onResizedHeight = (e: HandlerProps) => {
        setCanvasSize({ ...canvasSize, height: e.component.props.flex ?? 0.8 })
    }

    const onResizedWidth = (e: HandlerProps) => {
        setCanvasSize({ ...canvasSize, width: e.component.props.flex ?? 0.8 })
    }

    return (
        <ReflexContainer orientation="vertical" style={{ padding: theme.spacing(1) }}>
            <ReflexElement minSize={300} flex={canvasSize.width} onStopResize={onResizedWidth}>
                <ReflexContainer orientation="horizontal">
                    <ReflexElement minSize={300} flex={canvasSize.height} onStopResize={onResizedHeight}>
                        <div css={scrollContainer}>
                            <Canvas />
                        </div>
                    </ReflexElement>
                    <ReflexSplitter style={{ height: theme.spacing(1), border: "none", background: "none" }} />
                    <ReflexElement minSize={50}>
                        <div css={scrollContainer}>
                            <Sequencer />
                        </div>
                    </ReflexElement>
                </ReflexContainer>
            </ReflexElement>
            <ReflexSplitter style={{ width: theme.spacing(1), border: "none", background: "none" }} />
            <ReflexElement minSize={50}>
                <div css={scrollContainer}>
                    <Editor />
                </div>
            </ReflexElement>
        </ReflexContainer>
    )

}

export function App() {

    return (
        <StateRoot>
            <ThemeProvider theme={theme}>
                <CssBaseline enableColorScheme={true} />
                <Layout />
            </ThemeProvider>
        </StateRoot>
    )

}
