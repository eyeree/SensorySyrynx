import { atom, atomFamily, DefaultValue, selector, useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';
import { persistAtom } from './persistance';

import { ProgramActionName, ProgramId, ProgramIdList, useCreateProgram } from './program'
import { newId } from './id';

// import { logAtom } from './log';

export type SetupId = string;
export type SetupSpeed = number;
export type SetupStepCount = number;
export type SetupName = string;
export type SetupIdList = Array<SetupId>;

export type SetupStepIndex = number;
export type SetupStepStatus = boolean;
export type SetupStepStatusList = Array<SetupStepStatus>
export type SetupProgramIndex = number;
export type SetupListEntry = { setupId: string, setupName: string }
export type SetupList = Array<SetupListEntry>

export type SetupStepStatusKey = { setupId: SetupId, programId: ProgramId, actionName:ProgramActionName, stepIndex: SetupStepIndex };

const setupIdList = atom<SetupIdList>({
    key: "setupIdList",
    default: [],
    effects: [persistAtom]
});

const setupProgramIdList = atomFamily<ProgramIdList, SetupId>({
    key: "setupProgramIdList",
    default: setupId => [],
    effects: [persistAtom]
});

const setupName = atomFamily<SetupName, SetupId>({
    key: "setupName",
    default: setupId => "",
    effects: [persistAtom]
});

const setupList = selector<SetupList>({
  key: 'setupList',
  get: ({get}) => {
    const setupIds = get(setupIdList)
    return setupIds.map(setupId => ({setupId, setupName: get(setupName(setupId))}))      
  }
})

const setupSpeed = atomFamily<SetupSpeed, SetupId>({
    key: "setupSpeed",
    default: setupId => 120,
    effects: [persistAtom]
});

const setupStepCount = atomFamily<SetupSpeed, SetupId>({
    key: "setupStepCount",
    default: setupId => 16,
    effects: [persistAtom]
});

const isSetupStepActive = atomFamily<SetupStepStatus, SetupStepIndex>({
    key: "isSetupStepActive",
    default: false
})

const selectedProgramIndex = atom<SetupProgramIndex>({
    key: "selectedProgramIndex",
    default: 0
})

const currentSetupId = atom<SetupId>({
    key: "currentSetupId",
    default: "",
    effects: [persistAtom]
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

const setupStepStatus = atomFamily<SetupStepStatus, SetupStepStatusKey>({
    key: "setupStepStatus",
    default: false,
    effects: [persistAtom]
});

export const useSetupProgramIdList = (setupId:SetupId) => useRecoilValue(setupProgramIdList(setupId));

export const useSetupList = () => useRecoilValue(setupList)

export const useSetupStepCount = (setupId:SetupId) => useRecoilValue(setupStepCount(setupId))

export const useSetupStepStatusState = (key:SetupStepStatusKey) => useRecoilState(setupStepStatus(key))

export const useIsSetupStepActive = (stepIndex:SetupStepIndex) => useRecoilValue(isSetupStepActive(stepIndex))
export const useSetIsSetupStepActive = () => useRecoilCallback(({set}) => (stepIndex:SetupStepIndex, isActive:boolean) => {
    set(isSetupStepActive(stepIndex), isActive);
})

export const useSelectedProgramIndexState = () => useRecoilState(selectedProgramIndex)

export const useCurrentSetupId = () => useRecoilValue(currentSetupId);
export const useSetCurrentSetupId = () => useRecoilCallback(({set}) => (setupId:SetupId) => {
    set(currentSetupId, setupId);
    set(selectedProgramIndex, 0);
});

export const useCurrentSetupSpeedState = () => useRecoilState(currentSetupSpeed)

export const useCurrentSetupStepCount = () => useRecoilValue(currentSetupStepCount)
export const useCurrentSetupStepCountState = () => useRecoilState(currentSetupStepCount)

export function useCreateSetup() {

    const setups = useSetupList();
    const createProgram = useCreateProgram();
  
    return useRecoilCallback(({set}) => () => {
      
      let n = 1
      let newName:string
      const isNotUnique = () => setups.some(({setupName}) => newName === setupName)
      do {
        newName = `setup ${n++}`
      } while(isNotUnique())
  
      const setupId = newId();    
      set(setupIdList, setupIds => [...setupIds, setupId])
      set(setupName(setupId), newName)
  
      const programId = createProgram();
      set(setupProgramIdList(setupId), [programId])
  
      return setupId;
  
    })
  
  }
  
  