/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

import {Canvas} from '../canvas';
import {Editor} from '../editor';
import {Sequencer} from '../sequencer';
import {StateRoot} from '../state/StateRoot';
import CssBaseline from '@mui/material/CssBaseline';

import {flexRow, flexColumn, theme} from '../common/css';
import { createTheme, Paper, ThemeOptions, ThemeProvider } from '@mui/material';
import SplitPane from 'react-split-pane';

import './split-pane.css'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';
import 'react-reflex/styles.css'

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
  flexGrow:1,
  // display: "flex"
  // backgroundColor: "red",
})

const sequencerCSS = css({
  minHeight: 200,
})

const scrollContainer = css({
  position: 'absolute', 
  top: 0,  
  left:0,
  bottom:0, 
  right:0, 
  display: "flex",
  overflow: "hidden"
})

export function App() {

  return (
    <StateRoot>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme={true}/>
        <ReflexContainer orientation="vertical" style={{padding: theme.spacing(1)}}>
          <ReflexElement minSize={300}>
            <ReflexContainer orientation="horizontal">
              <ReflexElement minSize={300}>
                <div css={scrollContainer}>
                  <Canvas/>
                </div>
              </ReflexElement>
              <ReflexSplitter style={{height: theme.spacing(1), border: "none", background: "none"}}/>
              <ReflexElement minSize={50}>
                <div css={scrollContainer}>
                  <Sequencer/>
                </div>
              </ReflexElement>
            </ReflexContainer>
          </ReflexElement>
          <ReflexSplitter style={{width: theme.spacing(1), border: "none", background: "none"}}/>
          <ReflexElement minSize={50}>
            <div css={scrollContainer}>
              <Editor/>
            </div>
          </ReflexElement>
        </ReflexContainer>
      </ThemeProvider>
    </StateRoot>
  )

}

/*
<SplitPane split="vertical" minSize={500} defaultSize={1280} css={{position: 'relative'}}>
<SplitPane split="horizontal" minSize={500} defaultSize={1024} css={{height: 1}}>
  <Canvas/>
  <div css={scrollContainer}>
    <Sequencer/>
  </div>
</SplitPane>
<div css={scrollContainer}>
  <Editor/>
</div>
</SplitPane>
*/
/*
<div css={appCSS}>
<div css={mainCSS}>
  <div css={canvasCSS}><Canvas/></div>
  <div css={sequencerCSS}><Sequencer/></div>
</div>
<div css={editorCSS}><Editor/></div>
</div>
*/