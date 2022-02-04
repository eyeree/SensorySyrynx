import React from 'react';
import logo from './logo.svg';
import './App.css';

import { css } from '@emotion/react'

const titleStyle = css({
  boxSizing: 'border-box',
  width: 300,
  height: 200
})

const subtitleStyle = css`
  box-sizing: border-box;
  width: 100px;
  height: 60px;
`

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div css={titleStyle}>
          Edit <code>src/App.tsx</code> and save to reload.
        </div>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
