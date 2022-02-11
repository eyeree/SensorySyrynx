import { useRef, useEffect } from 'react';
import { atom, atomFamily, selector, useRecoilCallback, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { persistAtom } from './persistance';
import { newId } from './id';
import { logAtom } from './log';
import { SetupStepIndex } from './setup';

const DEFAULT_EFFECTS = [logAtom]
const PERSIST_EFFECTS = [...DEFAULT_EFFECTS, persistAtom]

export type ProgramId = string;
export type ProgramCode = string;
export type ProgramName = string;
export type ProgramIdList = Array<ProgramId>;

export type ProgramActionName = string;
export type ProgramActionNameList = Array<ProgramActionName>;

export type ProgramErrorStackEntry = {function:string, line:number, column:number};
export type ProgramErrorStack = Array<ProgramErrorStackEntry>;
export type ProgramError = {message:string, stack: ProgramErrorStack};

const newProgramCode = `const circle = new _.Shape();
circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 0.1);
circle.x = _.bounds.left;
circle.y = 0;
_.container.addChild(circle);

return {
    step: ({time}) => {
        if(circle.x >= _.bounds.right) {
            circle.x = _.bounds.left;
        }
        _.Tween.get(circle, {override:true})
            .to({x: circle.x+0.1}, time, _.Ease.getPowInOut(4))
    }
}
`

const programIdList = atom<ProgramIdList>({
    key: "programIdList",
    default: [],
    effects: PERSIST_EFFECTS
});

export function useProgramIdList() {
    return useRecoilValue(programIdList);
}

type ProgramListEntry = { programId: string, programName: string }
type ProgramList = Array<ProgramListEntry>

const programList = selector<ProgramList>({
  key: 'programList',
  get: ({get}) => {
    const programIds = get(programIdList)
    return programIds.map(programId => ({programId, programName: get(programName(programId))}))      
  }
})

function useProgramList() {
  return useRecoilValue(programList)
}

export function useCreateProgram() {

  const programs = useProgramList();

  return useRecoilCallback(({set}) => () => {
    
    let n = 1
    let newName:string
    do {
      newName = `new program ${n++}`
    } while(programs.some(({programName: name}) => newName === name))

    const programId = newId();    
    set(programIdList, programIds => [...programIds, programId])
    set(programName(programId), newName)

    return programId;

  })

}

const programCode = atomFamily<ProgramCode, ProgramId>({
    key: "programCode",
    default: programId => newProgramCode,
    effects: PERSIST_EFFECTS
});

export const useProgramCode = (programId:ProgramId) => useRecoilValue(programCode(programId))
export const useSetProgramCode = (programId:ProgramId) => useSetRecoilState(programCode(programId))
export const useProgramCodeState = (programId:ProgramId) => useRecoilState(programCode(programId))


export type ProgramActionFunctionKey = { programId:ProgramId, actionName:ProgramActionName }
export type ProgramActionFunction = (stepIndex:SetupStepIndex) => void

const programActionFunction = atomFamily<ProgramActionFunction|null, ProgramActionFunctionKey>({
    key: "programActionFunction",
    default: null,
    effects: DEFAULT_EFFECTS
})

export const useProgramActionFunction = (key:ProgramActionFunctionKey) => useRecoilValue(programActionFunction(key))
export const useSetProgramActionFunction = (key:ProgramActionFunctionKey) => useSetRecoilState(programActionFunction(key))

const programName = atomFamily<ProgramName, ProgramId>({
    key: "programName",
    default: programId => "New Program",
    effects: PERSIST_EFFECTS
});

const programActionList = atomFamily<ProgramActionNameList, ProgramId>({
    key: "programActionList",
    default: programId => ["step"],
});

export const useProgramActions = (programId:ProgramId) => useRecoilValue(programActionList(programId))

const programError = atomFamily<ProgramError|null, ProgramId>({
    key: "programError",
    default: programId => null
});

export const selectedProgramId = atom<ProgramId>({
    key: "selectedProgramId",
    default: "TODO",
    effects: PERSIST_EFFECTS
});

const selectedProgramCode = selector<ProgramCode>({
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

const selectedProgramError = selector<ProgramError|null>({
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

const selectedProgramName = selector<ProgramName>({
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


/*

createProgram
deleteProgram
setProgramName
setProgramCode
setProgramError
clearProgramError

*/
