import { atom, atomFamily, DefaultValue, selector, selectorFamily, useRecoilState } from 'recoil';

export type ProgramId = string;
export type ProgramCode = string;
export type ProgramName = string;
export type ProgramIdList = Array<ProgramId>;
export type ProgramIndex = number;
export type ProgramErrorStackEntry = {function:string, line:number, column:number};
export type ProgramErrorStack = Array<ProgramErrorStackEntry>;
export type ProgramError = {message:string, stack: ProgramErrorStack};

export type SetupId = string;
export type SetupSpeed = number;
export type SetupSteps = number;
export type SetupName = string;
export type SetupStepStatus = boolean;
export type SetupStepStatusKey = { programIndex: number, stepIndex: number };
export type SetupIdList = Array<SetupId>;

import { recoilPersist } from 'recoil-persist'
const { persistAtom } = recoilPersist()

export const allProgramIds = atom<ProgramIdList>({
    key: "allPrograms",
    default: [],
    effects: [persistAtom]
});

export const programCode = atomFamily<ProgramCode, ProgramId>({
    key: "programCode",
    default: programId => "",
    effects: [persistAtom]
});

export const programName = atomFamily<ProgramName, ProgramId>({
    key: "programName",
    default: programId => "",
    effects: [persistAtom]
});

export const programError = atomFamily<ProgramError|null, ProgramId>({
    key: "programError",
    default: programId => null
});

export const allSetupIds = atom<SetupIdList>({
    key: "allPrograms",
    default: [],
    effects: [persistAtom]
});

export const setupProgramIds = atomFamily<ProgramIdList, SetupId>({
    key: "setupPrograms",
    default: setupId => [],
    effects: [persistAtom]
});

export const setupName = atomFamily<SetupName, SetupId>({
    key: "setupName",
    default: setupId => "TODO",
    effects: [persistAtom]
});

export const setupSpeed = atomFamily<SetupSpeed, SetupId>({
    key: "setupSpeed",
    default: setupId => 120,
    effects: [persistAtom]
});

export const setupSteps = atomFamily<SetupSpeed, SetupId>({
    key: "setupSteps",
    default: setupId => 16,
    effects: [persistAtom]
});

export const setupStepStatus = atomFamily<SetupStepStatus, SetupStepStatusKey>({
    key: "setupStepStatus",
    default: key => false,
    effects: [persistAtom]
});

export const currentSetupId = atom<SetupId>({
    key: "currentSetupId",
    default: "TODO",
    effects: [persistAtom]
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

export const currentSetupProgramIdByIndex = selectorFamily<ProgramId, ProgramIndex>({
    key: "currentSetupProgramIdByIndex",
    get: programIndex => ({get}) => {
        const ids = get(currentSetupProgramIds);
        if(programIndex < 0 || programIndex >= ids.length) {
            throw Error(`Invalid program index ${programIndex} for setup id ${get(currentSetupId)}.`)
        }
        return ids[programIndex]
    }
});

// export const currentSetupProgramIndexById = selectorFamily<ProgramIndex|null, ProgramId>({
//     key: "currentSetupProgramIndexById",
//     get: programIndex => ({get}) => {
//         const ids = get(currentSetupProgramIds);
//         if(programIndex < 0 || programIndex >= ids.length) {
//             throw Error(`Invalid program index ${programIndex} for setup id ${get(currentSetupId)}.`)
//         }
//         return ids[programIndex]
//     }
// });

export const selectedProgramId = atom<ProgramId>({
    key: "selectedProgramId",
    default: "TODO",
    effects: [persistAtom]
});

export const selectedProgramIndex = selector<ProgramIndex|null>({
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

export const selectedProgramCode = selector<ProgramCode>({
    key: "selectedProgramCode",
    get: ({get}) => {
        const id = get(selectedProgramId);
        const code = get(programCode(id));
        return code;
    },
    set: ({get, set}, code) => {
        const id = get(selectedProgramId);
        set(programCode(id), code);
    }
});

export const selectedProgramError = selector<ProgramError|null>({
    key: "selectedProgramError",
    get: ({get}) => {
        const id = get(selectedProgramId);
        const error = get(programError(id));
        return error;
    },
    set: ({get, set}, error) => {
        const id = get(selectedProgramId);
        set(programError(id), error);
    }
});

export const selectedProgramName = selector<ProgramName>({
    key: "selectedProgramName",
    get: ({get}) => {
        const id = get(selectedProgramId);
        const code = get(programName(id));
        return code;
    },
    set: ({get, set}, name) => {
        const id = get(selectedProgramId);
        set(programName(id), name);
    }
});
