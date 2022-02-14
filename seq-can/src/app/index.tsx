/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

import { Canvas } from '../canvas';
import { Editor } from '../editor';
import { Sequencer } from '../sequencer';
import { StateRoot } from '../state/StateRoot';
import CssBaseline from '@mui/material/CssBaseline';

import { flexRow, flexColumn, theme } from '../common/css';
import { createTheme, Paper, ThemeOptions, ThemeProvider } from '@mui/material';
import SplitPane from 'react-split-pane';

import './split-pane.css'
import { HandlerProps, ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';
import 'react-reflex/styles.css'
import { atom, useRecoilState } from 'recoil';
import { persistAtom } from '../state/persistance';
import { logAtom } from '../state/log';

const appCSS = css(
    flexRow,
    {
        height: "100%",
    }
)

const mainCSS = css(
    flexColumn,
    {
        flexGrow: 1
    }
)

const editorCSS = css({
    minWidth: 500,
    display: "flex"
    // height: "100%"
})

const canvasCSS = css({
    flexGrow: 1,
    // display: "flex"
    // backgroundColor: "red",
})

const sequencerCSS = css({
    minHeight: 200,
})

const scrollContainer = css({
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: "flex",
    overflow: "hidden"
})

type CanvasSize = { width: number, height: number }
const canvasSizeState = atom<CanvasSize>({
    key: "canvasSize",
    default: { width: 0.8, height: 0.8 },
    effects: [persistAtom]
})

function Layout() {

    const [canvasSize, setCanvasSize] = useRecoilState(canvasSizeState)

    const onResizeHeight = (e: HandlerProps) => {
        setCanvasSize({ ...canvasSize, height: e.component.props.flex ?? 0.8 })
    }

    const onResizeWidth = (e: HandlerProps) => {
        setCanvasSize({ ...canvasSize, width: e.component.props.flex ?? 0.8 })
    }

    return (
        <ReflexContainer orientation="vertical" style={{ padding: theme.spacing(1) }}>
            <ReflexElement minSize={300} flex={canvasSize.width} onResize={onResizeWidth}>
                <ReflexContainer orientation="horizontal">
                    <ReflexElement minSize={300} flex={canvasSize.height} onResize={onResizeHeight}>
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
