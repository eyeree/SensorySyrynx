import './App.css';


import { atomFamily, RecoilRoot, useRecoilState } from 'recoil'

import { persistantAtomFamily, persistAtomFamily } from './persistance'
import { newId } from './id';
import { useEffect } from 'react';
import { Example } from './evtctx';


type ProgramId = string
type SetupId = string
type ActionId = string

enum DirectoryEntryType {
  Directory,
  Setup,
  Program
}

type DirectoryEntry = {
  type:DirectoryEntryType
}

type DirectoryDirectoryEntry = DirectoryEntry & {
  type:DirectoryEntryType.Directory
  name: string
  contents:DirectoryEntryArray
}

type SetupDirectoryEntry = DirectoryEntry & {
  type:DirectoryEntryType.Setup
  setupId:SetupId
}

type ProgramDirectoryEntry = DirectoryEntry & {
  type:DirectoryEntryType.Program
  programId:ProgramId
}

type DirectoryEntryArray = Array<DirectoryEntry>

type Action = {
  name: string
}

type ActionIdToActionMap = {
  [actionId:ActionId]: Action
}

type Program = {
  name: string
  code:string
  actions: ActionIdToActionMap
}

type Step = {
  enabled:boolean
}

type StepArray = Array<Step>

type ActionIdToStepArrayMap = {
  [actionId:ActionId]:StepArray
}

type SetupProgram = {
  programId: ProgramId
  enabled: boolean
  collapsed: boolean
  actionSteps: ActionIdToStepArrayMap
}

type SetupProgramArray = Array<SetupProgram>

type Setup = {
  name: string
  stepCount: number
  bpm: number
  programs: SetupProgramArray
}

type ProgramIdToProgramMap = {
  [programId:ProgramId]:Program
}

type SetupIdToSetupMap = {
  [setupId:SetupId]:Setup
}

const programState = persistantAtomFamily<Program, ProgramId>("program", programId => ({
  name: "unique program name",
  code: "console.log('hello world')",
  actions: {}
}))

const setupState = persistantAtomFamily<Setup, SetupId>("setup", setupId => ({
  name: "unique setup name",
  stepCount: 16,
  bpm: 120,
  programs: []
}))

function Viewer() {
  return <div>
    <Example/>
  </div>
}

function Changer() {

  return <div></div>
}


function Initializer() {
  
  const [setup, setSetup] = useRecoilState(setupState("TESTID"))

  console.log("Initializer", setup);

  useEffect(() => {
    console.log("useEffect", setup)
    setSetup({...setup, name:"a new name"})
  }, [])

  return <div>{setup.name}</div>

}

function App() {

  console.log("App");

  return (
    <RecoilRoot>
      <Initializer/>
      <Changer/>
      <Viewer/>
    </RecoilRoot>
  );
}

export default App;
