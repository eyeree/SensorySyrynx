import { atom, atomFamily, DefaultValue, selector, selectorFamily, useRecoilCallback, useRecoilState } from 'recoil';
import { persistAtom, newId } from './util';

import { ProgramId, ProgramIdList, selectedProgramId } from './program'

export type SetupId = string;
export type SetupSpeed = number;
export type SetupSteps = number;
export type SetupName = string;
export type SetupProgramStepStatus = boolean;
export type SetupProgramStepIndex = number;
export type SetupProgramStepStatusList = Array<SetupProgramStepStatus>
export type SetupProgramStepStatusListKey = { setupId: SetupId, programId: ProgramId };
export type SetupProgramStepStatusKey = { setupId: SetupId, programId: ProgramId, stepIndex: SetupProgramStepIndex };
export type SetupIdList = Array<SetupId>;
export type SetupProgramIndex = number;

export const allSetupIds = atom<SetupIdList>({
    key: "allSetupIds",
    default: [],
    effects: [persistAtom("allSetupIds")]
});

export const setupProgramIds = atomFamily<ProgramIdList, SetupId>({
    key: "setupProgramIds",
    default: setupId => [],
    effects: setupId => [persistAtom(`setupProgramIds-${setupId}`)]
});

export const setupName = atomFamily<SetupName, SetupId>({
    key: "setupName",
    default: setupId => "New Setup",
    effects: setupId => [persistAtom(`setupName-${setupId}`)]
});

export const setupSpeed = atomFamily<SetupSpeed, SetupId>({
    key: "setupSpeed",
    default: setupId => 120,
    effects: setupId => [persistAtom(`setupSpeed-${setupId}`)]
});

export const setupSteps = atomFamily<SetupSpeed, SetupId>({
    key: "setupSteps",
    default: setupId => 16,
    effects: setupId => [persistAtom(`setupSteps-${setupId}`)]
});

export const setupProgramStepStatusList = atomFamily<SetupProgramStepStatusList, SetupProgramStepStatusListKey>({
    key: "setupProgramStepStatusList",
    default: key => [],
    effects: ({setupId, programId}) => [persistAtom(`setupProgramStepStatusList-${setupId}-${programId}`)]
});

export const setupStepStatus = selectorFamily<SetupProgramStepStatus, SetupProgramStepStatusKey>({
    key: "setupStepStatus",
    get: key => ({get}) => {
        if(key.stepIndex < 0) throw Error(`Invalid stepIndex ${key.stepIndex} for setupId ${key.setupId} and programId ${key.programId}`);
        const list = get(setupProgramStepStatusList({setupId: key.setupId, programId: key.programId}));
        return key.stepIndex < list.length ? false : list[key.stepIndex] ?? false // may have undefined values from extending array below
    },
    set: key => ({get, set}, enabled) => {
        if(key.stepIndex < 0) throw Error(`Invalid stepIndex ${key.stepIndex} for setupId ${key.setupId} and programId ${key.programId}`);
        const listKey = {setupId: key.setupId, programId: key.programId};
        const listState = setupProgramStepStatusList(listKey);
        const oldList = get(listState);
        const newList = Array.from(oldList);
        newList[key.stepIndex] = (enabled instanceof DefaultValue) ? false : enabled; // may extend array with "empty" (undefined) values
        set(listState, newList);
    }
});

export const currentSetupId = atom<SetupId>({
    key: "currentSetupId",
    default: "TODO",
    effects: [persistAtom("currentSetupId")]
});

export const currentSetupSpeed = selector<SetupSpeed>({
    key: "currentSetupSpeed",
    get: ({get}) => {
        const id = get(currentSetupId)
        const speed = get(setupSpeed(id))
        return speed;
    }
});

export const currentSetupSteps = selector<SetupSpeed>({
    key: "currentSetupSteps",
    get: ({get}) => {
        const id = get(currentSetupId)
        const steps = get(setupSteps(id))
        return steps;
    }
});

export const currentSetupProgramIds = selector<ProgramIdList>({
    key: "currentSetupProgramIds",
    get: ({get}) => {
        const id = get(currentSetupId);
        const programs = get(setupProgramIds(id))
        return programs;
    }
});

export const currentSetupProgramIdByIndex = selectorFamily<ProgramId, SetupProgramIndex>({
    key: "currentSetupProgramIdByIndex",
    get: programIndex => ({get}) => {
        const ids = get(currentSetupProgramIds);
        if(programIndex < 0 || programIndex >= ids.length) {
            throw Error(`Invalid program index ${programIndex} for setup id ${get(currentSetupId)}.`)
        }
        return ids[programIndex]
    }
});

export const selectedProgramIndex = selector<SetupProgramIndex|null>({
    key: "selectedProgramIndex",
    get: ({get}) => {
        const id = get(selectedProgramId);
        const ids = get(currentSetupProgramIds);
        const index = ids.indexOf(id);
        return index == -1 ? null : index;
    },
    set: ({get, set}, index) => {
        if(index instanceof DefaultValue) return; // default is what it is
        if(index === null) throw Error("A program index must be specified.")
        const id = get(currentSetupProgramIdByIndex(index))
        set(selectedProgramId, id);
    }
})


/*

createProgram
deleteProgram
setProgramName
setProgramCode
setProgramError
clearProgramError

createSetup
deleteSetup
setSetupName
addSetupProgram
removeSetupProgram
setSetupProgramOrder

setSelectedSetupProgram

toggleSetupStepStatus
setSetupStepStatus

*/

