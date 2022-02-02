import React from 'react';
import {Canvas} from '../canvas';
import {Editor} from '../editor';
import {Sequencer} from '../sequencer';
import { Allotment } from 'allotment';

import "allotment/dist/style.css";
import './App.css'

export function App() {
  return <Allotment vertical={true}>
    <Allotment vertical={false} defaultSizes={[2, 1]}>
      <Canvas/>
      <Editor/>
    </Allotment>
    <Allotment.Pane minSize={80} maxSize={80}>
      <Sequencer/>
    </Allotment.Pane>
  </Allotment>;
}
