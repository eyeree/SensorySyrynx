/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

import {Canvas} from '../canvas';
import {Editor} from '../editor';
import {Sequencer} from '../sequencer';
import CssBaseline from '@mui/material/CssBaseline';

import {flexRow, flexColumn} from '../common/css';
import { createTheme, ThemeProvider } from '@mui/material';
import { RecoilRoot } from 'recoil';

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
  padding: 4,
  paddingLeft: 0,
  flexGrow:1,
  minWidth: 500,
})

const canvasCSS = css({
  border: "gray ridge 12px",
  margin: 4,
})

const sequencerCSS = css({
  flexGrow:1,
  minHeight: 100,
})

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export function App() {

  return (
    <RecoilRoot>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme={true}/>
        <div css={appCSS}>
          <div css={mainCSS}>
            <div css={canvasCSS}><Canvas/></div>
            <div css={sequencerCSS}><Sequencer/></div>
          </div>
          <div css={editorCSS}><Editor/></div>
        </div>
      </ThemeProvider>
    </RecoilRoot>
  )

}
