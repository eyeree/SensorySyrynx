/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

import './Editor.css'

import { basicSetup } from "@codemirror/basic-setup";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import {indentWithTab} from "@codemirror/commands"

import { useEffect, useRef } from 'react';
import { Program } from '../program';
import { flexColumn } from '../common/css';

import { oneDark } from '@codemirror/theme-one-dark'
import { atom, useRecoilState } from 'recoil';

const defaultCode = `const circle = new _.Shape();
circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 0.1);
circle.x = -1;
circle.y = 0;
_.container.addChild(circle);

return {
    step: ({time}) => {
        if(circle.x > 1) {
            circle.x = -1;
        }
        _.Tween.get(circle, {override:true})
            .to({x: circle.x+0.1}, time, _.Ease.getPowInOut(4))
    }
}
`

const defaultCode2 = `let circle = new _.Shape();
circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 0.1);
circle.x = -1;
circle.y = 0;
_.container.addChild(circle);

return {
    step: ({time}) => {
        if(circle.x >= 1) {
            circle.x = -1;
        }
        _.Tween.get(circle, {override:true})
            .to({x: circle.x+0.1}, time, _.Ease.getPowInOut(4))
    }
}
`
const errorCSS = css({
    color: 'red',
    height: 50
})

const containerCSS = css(
    flexColumn,
    {
        height: "100%"
    }
)

const editCSS = css({
    flexGrow: 1
})

type ErrorState = {
    message: string,
    line: number,
    column: number
}

const chromeErrorLocation = /<anonymous>:(?<line>\d+):(?<column>\d+)/
const firefoxErrorLocation = /Function:(?<line>\d+):(?<column>\d+)/

export const errorState = atom<ErrorState|null>({
    key: "Editor_ErrorState",
    default: null
});

export function getErrorState(e:any) {
    
    let line = 0;
    let column = 0;

    const stack = e.stack;
    if (typeof stack == 'string') {

        let match = stack.match(chromeErrorLocation);
        if (!match) {
            match = stack.match(firefoxErrorLocation);
        }

        if (match) {
            try {
                line = Number.parseInt(match.groups!.line) - 4;
                column = Number.parseInt(match.groups!.column);
            } catch (e) {
                console.error(`could not parse matched line or column numbers: ${match.groups!.line} ${match.groups!.column}`)
            }
        }

    }

    return { message: e.toString(), line, column }

}

function getFactorySource(code:string) {
    return `
        return function PROGRAM_ROOT (_) {
${code}
        }
    `    
}

export function Editor() {

    const [error, setErrorState] = useRecoilState(errorState);

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
                const error = getErrorState(e);
                setErrorState(error);
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
            <div css={errorCSS}>{errorText}</div>
        </div>
    );
}
