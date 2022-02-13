/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

import {Canvas} from '../canvas';
import {Editor} from '../editor';
import {Sequencer} from '../sequencer';
import {StateRoot} from '../state';
import CssBaseline from '@mui/material/CssBaseline';

import {flexRow, flexColumn, theme} from '../common/css';
import { createTheme, Paper, ThemeOptions, ThemeProvider } from '@mui/material';

const appCSS = css(  
  flexRow,
  {
    height: "100%",
  }
)

const mainCSS = css(
  flexColumn,
  {
  }
)

const editorCSS = css({
  // padding: 4,
  // paddingLeft: 0,
  flexGrow:1,
  minWidth: 500,
})

const canvasCSS = css({
  // border: "gray ridge 12px",
  // margin: 4,
  backgroundColor: "red",
})

const sequencerCSS = css({
  flexGrow:1,
  minHeight: 100,
})

export function App() {

  return (
    <StateRoot>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme={true}/>
        <Paper css={appCSS} sx={{}}>
          <div css={mainCSS}>
            <Paper elevation={6} sx={{margin:1, padding:1}}><Canvas/></Paper>
            <div css={sequencerCSS}><Sequencer/></div>
          </div>
          <div css={editorCSS}><Editor/></div>
        </Paper>
      </ThemeProvider>
    </StateRoot>
  )

}
