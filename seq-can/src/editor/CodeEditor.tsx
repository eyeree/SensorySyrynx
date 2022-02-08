/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react'
import { useEffect, useRef } from 'react';
import { atom, selector, useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';

import { basicSetup } from "@codemirror/basic-setup";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, ViewUpdate } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { indentWithTab } from "@codemirror/commands"
import { oneDark } from '@codemirror/theme-one-dark'

import './CodeEditor.css'
import { useErrorState } from '.';
import { Program, ProgramFunction } from '../program/Program';
import { usePrevious } from '../common/previous';
import { errorState, getErrorState } from './Status';

const defaultCode = `const circle = new _.Shape();
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

const editCSS = css({
    height: "100%"
})

export const codeState = atom({
    key: "Editor_CodeState",
    default: defaultCode,
    effects: [
        ({onSet}) => {
            // const [, setErrorState] = useErrorState();
            onSet(code => {
                console.log('code set')
                // try {
                //     const source = getFactorySource(code);
                //     const factory = new Function(source); // eslint-disable-line no-new-func
                //     const fn = factory();
                //     Program.getProgram().setFunction(fn);
                //     setErrorState(null);
                // } catch (e: any) {
                //     setErrorState(e);
                // }
            });
        }
    ]
})

// export const compiledCodeState = selector<ProgramFunction|Error>({
//     key: "Editor_CompiledCode",
//     get: ({get}) => {
//         const code = get(codeState);
//         try {
//             const source = getWrapperSource(code);
//             const factory = new Function(source); // eslint-disable-line no-new-func
//             return factory();
//         } catch (e: any) {
//             return e;
//         }
//     }
// })

// function getWrapperSource(code:string) {
//     return     
// }

function getFactoryFunction(code: string) {
    const source = `return function PROGRAM_ROOT (_) {\n${code}\n}`;
    const wrapper = new Function(source); // eslint-disable-line no-new-func
    return wrapper();
}

// export function useCompiledCode():ProgramFunction|null {

//     const code = useRecoilValue(codeState);
//     const previousCode = usePrevious(code);
//     const [ , setErrorState] = useErrorState();

//     let result:ProgramFunction|null = null;

//     if(code !== previousCode) {
//         try {
//             const source = getWrapperSource(code);
//             const factory = new Function(source); // eslint-disable-line no-new-func
//             result = factory();
//             setErrorState(null);
//         } catch (e: any) {
//             setErrorState(e);
//         }
//     }

//     return result;

// }

export function CodeEditor() {

    const code = useRecoilValue(codeState);

    console.log("CodeEditor");

    const editor = useRef<HTMLDivElement>(null);

    const onCodeChanged = useRecoilCallback(
        ({set}) => {
            let timer:NodeJS.Timeout;
            return (v:ViewUpdate) => {
                if(v.docChanged) {
                    if(timer) clearTimeout(timer);
                    timer = setTimeout(() => {
                        const code = v.state.doc.toString();
                        set(codeState, code)
                        try {
                            const fn = getFactoryFunction(code);
                            Program.getProgram().setFactoryFunction(fn);
                            set(errorState, null);
                        } catch (e: any) {
                            Program.getProgram().setFactoryFunction(null);
                            set(errorState, getErrorState(e))
                        }
                    }, 500);
                  }
                }
            }, 
        []
    );        

    useEffect(() => {

        console.log("useEffect EditorView");
        
        const state = EditorState.create({
            doc: code,
            extensions: [
                basicSetup, 
                javascript(),
                oneDark,
                keymap.of([indentWithTab]),
                EditorView.updateListener.of(onCodeChanged)
            ],
        });

        const view = new EditorView({ state, parent: editor.current!});

        view.focus();

        return () => {
            // if(timer) clearTimeout(timer);
            view.destroy();
        }

    }, []);

    return <div css={editCSS} ref={editor}/>

}
