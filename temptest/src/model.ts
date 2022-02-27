import * as state from './state'

type ProgramId = string
type SetupId = string
type ActionId = string

type Tag = string
type TagSet = Set<Tag>

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
