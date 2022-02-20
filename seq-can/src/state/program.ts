import { atom, atomFamily, selector, useRecoilCallback, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { persistAtom } from './persistance';
import { newId } from './id';

// import { logAtom } from './log';

export type ProgramId = string;
export type ProgramCode = string;
export type ProgramName = string;
export type ProgramIdList = Array<ProgramId>;
export type ProgramListEntry = { programId: string, programName: string }
export type ProgramList = Array<ProgramListEntry>

export type ActionName = string;
export type ActionNameList = Array<ActionName>;

export type ProgramError = { message: string, line: number, column: number };
export type ProgramErrorNullable = ProgramError | null;

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
    effects: [persistAtom]
});

const programList = selector<ProgramList>({
    key: 'programList',
    get: ({ get }) => {
        const programIds = get(programIdList)
        return programIds.map(programId => ({ programId, programName: get(programName(programId)) }))
    }
})

const programCode = atomFamily<ProgramCode, ProgramId>({
    key: "programCode",
    default: programId => newProgramCode,
    effects: [persistAtom]
});

const programName = atomFamily<ProgramName, ProgramId>({
    key: "programName",
    default: programId => "New Program",
    effects: [persistAtom]
});

const selectedProgramError = atom<ProgramErrorNullable>({
    key: "selectedProgramError",
    default: null,
    effects: []
});


const selectedProgramId = atom<ProgramId>({
    key: "selectedProgramId",
    default: "INVALID",
    effects: [persistAtom]
});

export const useProgramList = () => useRecoilValue(programList)

export const useProgramCode = (programId: ProgramId) => useRecoilValue(programCode(programId))
export const useProgramCodeState = (programId: ProgramId) => useRecoilState(programCode(programId))

export const useProgramName = (programId: ProgramId) => useRecoilValue(programName(programId));

export const useSelectedProgramError = () => useRecoilValue(selectedProgramError)
export const useSetSelectedProgramError = () => useSetRecoilState(selectedProgramError)

export const useSetSelectedProgramId = () => useSetRecoilState(selectedProgramId)
export const useSelectedProgramId = () => useRecoilValue(selectedProgramId)

export function useCreateProgram() {

    return useRecoilCallback(({ set, snapshot }) => () => {
  
        const programs = snapshot.getLoadable(programList).contents;
        const newName = makeUniqueProgramName(programs, n => `program ${n}`)
        const programId = newId();
        
        set(programIdList, programIds => [...programIds, programId])
        set(programName(programId), newName)

        return programId;

    })

}

function cleanProgramName(programName:ProgramName) {
    return programName.replace(/ ?\(copy \d+\)/, "")
}

export function useCopyProgram() {

    return useRecoilCallback(({ set, snapshot }) => (sourceProgramId:ProgramId) => {

        const programs = snapshot.getLoadable(programList).contents;
        const sourceProgramName = cleanProgramName(snapshot.getLoadable(programName(sourceProgramId)).contents);
        const sourceProgramCode = snapshot.getLoadable(programCode(sourceProgramId)).contents;
        const newName = makeUniqueProgramName(programs, n => `${sourceProgramName} (copy ${n})`)
        const programId = newId();

        set(programIdList, programIds => [...programIds, programId])
        set(programName(programId), newName)
        set(programCode(programId), sourceProgramCode);

        return programId;

    })

}

function makeUniqueProgramName(list:ProgramList, format:((n:number)=>string)) {

    let n = 1
    let newName: string
    const isNotUnique = () => list.some(({programName}) => newName === programName)
    do {
        newName = format(n++);
    } while (isNotUnique())

    return newName

}