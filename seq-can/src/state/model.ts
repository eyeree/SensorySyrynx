
export type ProgramId = string
export type SetupId = string
export type ActionId = string

export type Tag = string
export type TagArray = Array<Tag>
export type TagsProperty = {tags: TagArray}

export type ActionName = string

export type Action = {
  name: ActionName
}

export type ActionIdToActionMap = {
  [actionId:ActionId]: Action
}

export type ProgramName = string
export type ProgramCode = string

export type Program = TagsProperty & {
  name: ProgramName
  code: ProgramCode
  actions: ActionIdToActionMap
}

export type StepEnabled = boolean

export type Step = {
  enabled:StepEnabled
}

export type StepArray = Array<Step>

export type ActionIdToStepArrayMap = {
  [actionId:ActionId]:StepArray
}


export type SetupProgramEnabled = boolean
export type SetupProgramCollapsed = boolean

export type SetupProgram = {
  programId: ProgramId
  enabled: SetupProgramEnabled
  collapsed: SetupProgramCollapsed
  actionSteps: ActionIdToStepArrayMap
}

export type SetupProgramArray = Array<SetupProgram>

export type SetupName = string
export type SetupStepCount = number
export type SetupBPM = number

export type Setup = TagsProperty & {
  name: SetupName
  stepCount: SetupStepCount
  bpm: SetupBPM
  programs: SetupProgramArray
}

export type ProgramIdToProgramMap = {
  [programId:ProgramId]:Program
}

export type SetupIdToSetupMap = {
  [setupId:SetupId]:Setup
}       

