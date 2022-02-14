import { atom, atomFamily, DefaultValue, selector, useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';
import { persistAtom } from './persistance';

import { ActionName, ProgramId, ProgramIdList, useCreateProgram } from './program'
import { newId } from './id';

// import { logAtom } from './log';

export type SetupId = string;
export type SetupBPM = number;
export type SetupStepCount = number;
export type SetupName = string;
export type SetupIdList = Array<SetupId>;
export type SetupListEntry = { setupId: string, setupName: string }
export type SetupList = Array<SetupListEntry>

export type StepIndex = number;
export type StepStatus = boolean;
export type StepStatusList = Array<StepStatus>
export type StepStatusKey = { setupId: SetupId, programId: ProgramId, actionName:ActionName, stepIndex: StepIndex };

export type ProgramIndex = number;

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

const setupSpeed = atomFamily<SetupBPM, SetupId>({
    key: "setupSpeed",
    default: setupId => 120,
    effects: [persistAtom]
});

const setupStepCount = atomFamily<SetupStepCount, SetupId>({
    key: "setupStepCount",
    default: setupId => 16,
    effects: [persistAtom]
});

const isSetupStepActive = atomFamily<StepStatus, StepIndex>({
    key: "isSetupStepActive",
    default: false
})

const selectedProgramIndex = atom<ProgramIndex>({
    key: "selectedProgramIndex",
    default: 0
})

const currentSetupId = atom<SetupId>({
    key: "currentSetupId",
    default: "",
    effects: [persistAtom]
});

const currentSetupBPM = selector<SetupBPM>({
    key: "currentSetupBPM",
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

const setupStepStatus = atomFamily<StepStatus, StepStatusKey>({
    key: "setupStepStatus",
    default: false,
    effects: [persistAtom]
});

export const useSetupProgramIdList = (setupId:SetupId) => useRecoilValue(setupProgramIdList(setupId));
export const useAppendSetupProgramIdListEntry = (setupId:SetupId) => useRecoilCallback(({set}) => (programId:ProgramId) => {
    console.log("useAppendSetupProgramIdListEntry")
    let index = -1;
    set(setupProgramIdList(setupId), oldList => {
        console.log("set callback")
        index = oldList.length;
        return [...oldList, programId]
    })
    return index;
})

export const useSetupList = () => useRecoilValue(setupList)

export const useSetupStepCount = (setupId:SetupId) => useRecoilValue(setupStepCount(setupId))

export const useSetupStepStatusState = (key:StepStatusKey) => useRecoilState(setupStepStatus(key))

export const useIsSetupStepActive = (stepIndex:StepIndex) => useRecoilValue(isSetupStepActive(stepIndex))
export const useSetIsSetupStepActive = () => useRecoilCallback(({set}) => (stepIndex:StepIndex, isActive:boolean) => {
    set(isSetupStepActive(stepIndex), isActive);
})

export const useSelectedProgramIndexState = () => useRecoilState(selectedProgramIndex)

export const useCurrentSetupId = () => useRecoilValue(currentSetupId);
export const useSetCurrentSetupId = () => useRecoilCallback(({set}) => (setupId:SetupId) => {
    set(currentSetupId, setupId);
    set(selectedProgramIndex, 0);
});

export const useCurrentSetupBPMState = () => useRecoilState(currentSetupBPM)

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
  
  