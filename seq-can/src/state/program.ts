import { atom, atomFamily, selector, useRecoilCallback, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { persistAtom } from './persistance';
import { newId } from './id';
import { logAtom } from './log';

const LOG_EFFECTS = [logAtom]
const PERSIST_EFFECTS = [...LOG_EFFECTS, persistAtom]

export type ProgramId = string;
export type ProgramCode = string;
export type ProgramName = string;
export type ProgramIdList = Array<ProgramId>;

export type ProgramActionName = string;
export type ProgramActionNameList = Array<ProgramActionName>;

export type ProgramError = {message:string,  line:number, column:number};
export type ProgramErrorNullable = ProgramError|null;

const newProgramCode = `const circle = new _.Shape();
circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 0.1);
circle.x = 0;
circle.y = 0;
_.container.addChild(circle);

function moveCircle(to) {
  _.Tween.get(circle, {onChange: () => _.bounds.wrap(circle)})
      .to(to, _.sequencer.stepMS, _.Ease.getPowInOut(4))
}

return {
    actions: {
        left: () => {
            moveCircle({x: circle.x-0.1})
        },
        right: () => {
            moveCircle({x: circle.x+0.1})
        },
        up: () => {
            moveCircle({y: circle.y-0.1})
        },
        down: () => {
            moveCircle({y: circle.y+0.1})
        }
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
      newName = `program ${n++}`
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

const programName = atomFamily<ProgramName, ProgramId>({
    key: "programName",
    default: programId => "New Program",
    effects: PERSIST_EFFECTS
});

export const useProgramName = (programId:ProgramId) => useRecoilValue(programName(programId));

const programActionList = atomFamily<ProgramActionNameList, ProgramId>({
    key: "programActionList",
    default: programId => ["step"],
});

export const useProgramActions = (programId:ProgramId) => useRecoilValue(programActionList(programId))

const selectedProgramError = atom<ProgramErrorNullable>({
    key: "selectedProgramError",
    default: null,
    effects: LOG_EFFECTS
});

export const useSelectedProgramError = () => useRecoilValue(selectedProgramError)
export const useSetSelectedProgramError = () => useSetRecoilState(selectedProgramError)
export const useSelectedProgramErrorState = () => useRecoilState(selectedProgramError)

const selectedProgramId = atom<ProgramId>({
    key: "selectedProgramId",
    default: "INVALID",
    effects: PERSIST_EFFECTS
});

export const useSetSelectedProgramId = () => useSetRecoilState(selectedProgramId)
export const useSelectedProgramId = () => useRecoilValue(selectedProgramId)

const selectedProgramCode = selector<ProgramCode>({
    key: "selectedProgramCode",
    get: ({get}) => {
        const programId = get(selectedProgramId);
        const code = get(programCode(programId));
        return code;
    },
    set: ({get, set}, code) => {
        const programId = get(selectedProgramId);
        set(programCode(programId), code);
    }
});

export const useSelectedProgramCodeState = () => useRecoilState(selectedProgramCode);

/*

const selectedProgramError = selector<ProgramErrorNullable>({
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

*/
/*

createProgram
deleteProgram
setProgramName
setProgramCode
setProgramError
clearProgramError

*/
