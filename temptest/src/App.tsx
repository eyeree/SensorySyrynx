import './App.css';


import { atomFamily, RecoilRoot, useRecoilState } from 'recoil'

import { persistantAtomFamily, persistAtomFamily } from './persistance'
import { newId } from './id';
import { useEffect } from 'react';

import * as model from './model'

function Viewer() {
  return <div>Viewer</div>
}

function Changer() {

  return <div>Changer</div>
}


function Initializer() {
  
  console.log("Initializer");

  useEffect(() => {
    console.log("Initializer - useEffect")
  }, [])

  return <div>{"Initializer"}</div>

}

function App() {
  return (
    <RecoilRoot>
      <Initializer/>
      <Changer/>
      <Viewer/>
    </RecoilRoot>
  );
}

export default App;
