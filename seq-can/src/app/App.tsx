/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

import {Canvas} from '../canvas';
import {Editor} from '../editor';
import {Sequencer} from '../sequencer';
import CssBaseline from '@mui/material/CssBaseline';

import {flexRow, flexColumn} from '../common/css';
import { createTheme, ThemeProvider } from '@mui/material';
import { RecoilRoot } from 'recoil';

const container = css(  
  flexColumn,
  {
    height: "100%"
  }
)

const main = css(
  flexRow,
  {

  }
)

const editor = css({
  flexGrow: 1,
  padding: 4,
  paddingLeft: 0
})

const canvas = css({
  border: "gray ridge 12px",
  margin: 4,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
})

const sequencer = css({
  flexGrow:1
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
        <div css={container}>
          <div css={main}>
            <div css={canvas}><Canvas/></div>
            <div css={editor}><Editor/></div>
          </div>
          <div css={sequencer}>
            <Sequencer/>
          </div>
        </div>
      </ThemeProvider>
    </RecoilRoot>
  )

}
