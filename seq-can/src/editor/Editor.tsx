import React from 'react';
import './Editor.css';

import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

export function Editor() {
  return (
    <CodeMirror
      value="console.log('hello world!');"
      extensions={[javascript({ jsx: true })]}
      onChange={(value, viewUpdate) => {
        console.log('value:', value);
      }}
    />
  );
}
