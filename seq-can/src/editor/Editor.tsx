/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react'
import { useEffect, useRef } from 'react';
import { atom, useRecoilState, useRecoilValue } from 'recoil';

import { basicSetup } from "@codemirror/basic-setup";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { indentWithTab } from "@codemirror/commands"
import { oneDark } from '@codemirror/theme-one-dark'

import { Program } from '../program';
import { flexColumn, flexRow } from '../common/css';

import { useErrorState } from './error_state'
import { SlotSelector } from './SlotSelector'

import './Editor.css'

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

const containerCSS = css(
    flexColumn,
    {
        height: "100%"
    }
)

const editCSS = css({
    flexGrow: 1
})

const footerCSS = css(
    flexRow,
    {
        height: 50
    }
)

const errorCSS = css({
    color: 'red',
    flexGrow: 1
})

const controlsCSS = css({

})


export const codeState = atom({
    key: "Editor_CodeState",
    default: defaultCode
})

function getFactorySource(code:string) {
    return `
        return function PROGRAM_ROOT (_) {
${code}
        }
    `    
}

export function Editor() {

    const [error, setErrorState] = useErrorState();

    let errorText = "";
    if (error) {
        if (error.line === 0 || error.column === 0) {
            errorText = error.message;
        } else {
            errorText = `[${error.line}:${error.column}] ${error.message}`;
        }
    }

    const editor = useRef<HTMLDivElement>(null);

    useEffect(() => {
        
        let timer:NodeJS.Timeout;

        const compile = (code: string) => {
            try {
                const source = getFactorySource(code);
                const factory = new Function(source); // eslint-disable-line no-new-func
                const fn = factory();
                Program.getProgram().setFunction(fn);
                setErrorState(null);
            } catch (e: any) {
                setErrorState(e);
            }
        }

        compile(defaultCode);
    
        const state = EditorState.create({
            doc: defaultCode,
            extensions: [
                basicSetup, 
                javascript(),
                oneDark,
                keymap.of([indentWithTab]),
                EditorView.updateListener.of((v)=> {
                  if(v.docChanged) {
                    if(timer) clearTimeout(timer);
                    timer = setTimeout(() => {
                      compile(view.state.doc.toString())
                    }, 500 );
                  }
                })
            ],
        });

        const view = new EditorView({ state, parent: editor.current! });

        return () => {
            if(timer) clearTimeout(timer);
            view.destroy();
        }

    }, [setErrorState]);

    return (
        <div css={containerCSS}>
            <div css={editCSS} ref={editor}/>
            <div css={footerCSS}>
                <div css={errorCSS}>{errorText}</div>
                <div css={controlsCSS}><SlotSelector/></div>
            </div>
        </div>
    );
}
