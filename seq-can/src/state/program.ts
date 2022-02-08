import { atom, atomFamily, DefaultValue, selector, selectorFamily, useRecoilCallback, useRecoilState } from 'recoil';
import { newId, persistAtom } from './util';

export type ProgramId = string;
export type ProgramCode = string;
export type ProgramName = string;
export type ProgramIdList = Array<ProgramId>;
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

export const allProgramIds = atom<ProgramIdList>({
    key: "allProgramIds",
    default: [],
    effects: [persistAtom("allProgramIds")]
});

export const programCode = atomFamily<ProgramCode, ProgramId>({
    key: "programCode",
    default: programId => newProgramCode,
    effects: programId => [persistAtom(`programCode-${programId}`)]
});

export const programName = atomFamily<ProgramName, ProgramId>({
    key: "programName",
    default: programId => "New Program",
    effects: programId => [persistAtom(`programName-${programId}`)]
});

export const programError = atomFamily<ProgramError|null, ProgramId>({
    key: "programError",
    default: programId => null
});

export const selectedProgramId = atom<ProgramId>({
    key: "selectedProgramId",
    default: "TODO",
    effects: [persistAtom("selectedProgramId")]
});

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


/*

createProgram
deleteProgram
setProgramName
setProgramCode
setProgramError
clearProgramError

*/


export const createDispatcher = () => {

    const createProgram = useRecoilCallback<[], ProgramId>(
        ({ set }) =>
            () => {

                return "TODO";
            }
    )
    
    // const logMessage = useRecoilCallback<[string], void>(
    //   ({ set }) =>
    //     (message: string) => {
    //       console.log(`${message}`);
    //       set(logEntryListState, (logEntries) => [...logEntries, message]);
    //     }
    // );
  
    // const addItem = useRecoilCallback<[string], void>(
    //   ({ set }) =>
    //     (text: string) => {
    //       const newTodoItem = {
    //         id: getId(),
    //         text,
    //         isComplete: false,
    //       };
    //       set(todoListState, (oldTodoList: TodoItem[]) => [
    //         ...oldTodoList,
    //         newTodoItem,
    //       ]);
    //       logMessage(`To Do: ${text} added`);
    //     }
    // );
  
    // const deleteItem = useRecoilCallback(
    //   ({ snapshot, set }) =>
    //     async (index: number) => {
    //       let todoList = await snapshot.getPromise(todoListState);
  
    //       if (index < 0 || index >= todoList.length) {
    //         throw new Error("Could not delete item. Index out of bounds.");
    //       }
  
    //       const foundItem = todoList[index];
  
    //       if (foundItem) {
    //         set(todoListState, (oldTodoList: TodoItem[]) => {
    //           return removeItemAtIndex(oldTodoList, index);
    //         });
  
    //         set(toDoRecycleBinState, (oldRecycleList: TodoItem[]) => {
    //           return [...oldRecycleList, foundItem];
    //         });
    //         logMessage(`Todo: \"${foundItem?.text}\" moved to recycle bin.`);
    //       }
    //     }
    // );
  
    // const restoreItem = useRecoilCallback(
    //   ({ snapshot, set }) =>
    //     async (index: number) => {
    //       let recycleList = await snapshot.getPromise(toDoRecycleBinState);
  
    //       if (index < 0 || index >= recycleList.length) {
    //         throw new Error("Could not restore item. Index out of bounds.");
    //       }
  
    //       const foundItem = recycleList[index];
  
    //       if (foundItem) {
    //         set(toDoRecycleBinState, (oldRecycleList: TodoItem[]) => {
    //           return removeItemAtIndex(oldRecycleList, index);
    //         });
  
    //         set(todoListState, (oldTodoList: TodoItem[]) => [
    //           ...oldTodoList,
    //           foundItem,
    //         ]);
  
    //         logMessage(`Todo: \"${foundItem.text}\" restored from recycle bin.`);
    //       }
    //     }
    // );
  
    // const emptyRecycleBin = useRecoilCallback(({ reset }) => () => {
    //   reset(toDoRecycleBinState);
    //   logMessage(`Recycle bin emptied.`);
    // });
  
    // return {
    //   logMessage,
    //   addItem,
    //   deleteItem,
    //   restoreItem,
    //   emptyRecycleBin,
    // };
  };
  
  export type Dispatcher = ReturnType<typeof createDispatcher>;