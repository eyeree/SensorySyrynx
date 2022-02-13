import { atom, atomFamily, DefaultValue, selector, selectorFamily, useRecoilCallback, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { persistAtom } from './persistance';
import { logAtom } from './log';

import { ProgramActionName, ProgramId, ProgramIdList, useCreateProgram } from './program'
import { newId } from './id';

const DEFAULT_EFFECTS = [logAtom]
const PERSIST_EFFECTS = [...DEFAULT_EFFECTS, persistAtom]

export type SetupId = string;
export type SetupSpeed = number;
export type SetupStepCount = number;
export type SetupName = string;
export type SetupIdList = Array<SetupId>;

export type SetupStepIndex = number;
export type SetupStepStatus = boolean;
export type SetupStepStatusList = Array<SetupStepStatus>
export type SetupProgramIndex = number;

const setupIdList = atom<SetupIdList>({
    key: "setupIdList",
    default: [],
    effects: PERSIST_EFFECTS
});

const setupProgramIdList = atomFamily<ProgramIdList, SetupId>({
    key: "setupProgramIdList",
    default: setupId => [],
    effects: PERSIST_EFFECTS
});

export const useSetupProgramIdList = (setupId:SetupId) => useRecoilValue(setupProgramIdList(setupId));

const setupName = atomFamily<SetupName, SetupId>({
    key: "setupName",
    default: setupId => "",
    effects: PERSIST_EFFECTS
});


type SetupListEntry = { setupId: string, setupName: string }
type SetupList = Array<SetupListEntry>

const setupList = selector<SetupList>({
  key: 'setupList',
  get: ({get}) => {
    const setupIds = get(setupIdList)
    return setupIds.map(setupId => ({setupId, setupName: get(setupName(setupId))}))      
  }
})

export function useSetupList() {
  return useRecoilValue(setupList)
}

export function useCreateSetup() {

  const setups = useSetupList();
  const createProgram = useCreateProgram();

  return useRecoilCallback(({set}) => () => {
    
    let n = 1
    let newName:string
    do {
      newName = `setup ${n++}`
    } while(setups.some(({setupName}) => newName === setupName))

    const setupId = newId();    
    set(setupIdList, setupIds => [...setupIds, setupId])
    set(setupName(setupId), newName)

    const programId = createProgram();
    set(setupProgramIdList(setupId), [programId])

    return setupId;

  })

}

const setupSpeed = atomFamily<SetupSpeed, SetupId>({
    key: "setupSpeed",
    default: setupId => 120,
    effects: PERSIST_EFFECTS
});

const setupStepCount = atomFamily<SetupSpeed, SetupId>({
    key: "setupStepCount",
    default: setupId => 16,
    effects: PERSIST_EFFECTS
});

export const useSetupStepCount = (setupId:SetupId) => useRecoilValue(setupStepCount(setupId))

export type SetupStepStatusKey = { setupId: SetupId, programId: ProgramId, actionName:ProgramActionName, stepIndex: SetupStepIndex };
const setupStepStatus = atomFamily<SetupStepStatus, SetupStepStatusKey>({
    key: "setupStepStatus",
    default: false,
    effects: PERSIST_EFFECTS
});

// can you say "Setup Step Status State" five times fast?
export const useSetupStepStatusState = (key:SetupStepStatusKey) => useRecoilState(setupStepStatus(key))

const isSetupStepActive = atomFamily<SetupStepStatus, SetupStepIndex>({
    key: "isSetupStepActive",
    default: false
})

export const useIsSetupStepActive = (stepIndex:SetupStepIndex) => useRecoilValue(isSetupStepActive(stepIndex))
export const useSetIsSetupStepActive = () => useRecoilCallback(({set}) => (stepIndex:SetupStepIndex, isActive:boolean) => {
    set(isSetupStepActive(stepIndex), isActive);
})

const selectedProgramIndex = atom<SetupProgramIndex>({
    key: "selectedProgramIndex",
    default: 0
})

export const useSelectedProgramIndexState = () => useRecoilState(selectedProgramIndex)

const currentSetupId = atom<SetupId>({
    key: "currentSetupId",
    default: "",
    effects: PERSIST_EFFECTS
});

export const useCurrentSetupId = () => useRecoilValue(currentSetupId);
export const useSetCurrentSetupId = () => useRecoilCallback(({set}) => (setupId:SetupId) => {
    set(currentSetupId, setupId);
    set(selectedProgramIndex, 0);
});

const currentSetupSpeed = selector<SetupSpeed>({
    key: "currentSetupSpeed",
    get: ({get}) => {
        const setupId = get(currentSetupId)
        const speed = get(setupSpeed(setupId))
        return speed;
    },
    set: ({get, set, reset}, speed) => {
        const setupId = get(currentSetupId)
        if(speed instanceof DefaultValue) {
            reset(setupSpeed(setupId))
        } else {
            set(setupSpeed(setupId), speed)
        }
    }
});

export const useCurrentSetupSpeed = () => useRecoilValue(currentSetupSpeed)
export const useSetCurrentSetupSpeed = () => useSetRecoilState(currentSetupSpeed)
export const useCurrentSetupSpeedState = () => useRecoilState(currentSetupSpeed)

const currentSetupStepCount = selector<SetupStepCount>({
    key: "currentSetupStepCount",
    get: ({get}) => {
        const setupId = get(currentSetupId)
        const stepCount = get(setupStepCount(setupId))
        return stepCount;
    },
    set: ({get, set, reset}, stepCount) => {
        const setupId = get(currentSetupId)
        if(stepCount instanceof DefaultValue) {
            reset(setupStepCount(setupId))
        } else {
            set(setupStepCount(setupId), stepCount)
        }
    }
});

export const useCurrentSetupStepCount = () => useRecoilValue(currentSetupStepCount)
export const useSetCurrentSetupStepCount = () => useSetRecoilState(currentSetupStepCount)
export const useCurrentSetupStepCountState = () => useRecoilState(currentSetupStepCount)
