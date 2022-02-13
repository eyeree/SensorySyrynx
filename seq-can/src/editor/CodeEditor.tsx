/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react'
import { useEffect, useRef } from 'react';

import { basicSetup } from "@codemirror/basic-setup";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, ViewUpdate } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { indentWithTab } from "@codemirror/commands"
import { oneDark } from '@codemirror/theme-one-dark'

import './CodeEditor.css'
import { ProgramId, useProgramCodeState, useSelectedProgramId } from '../state/program';
import { displayNone } from '../common/css';

const editCSS = css({
    height: "100%"
})

type CodeEditorProps = { programId:ProgramId }
export function CodeEditor({programId}:CodeEditorProps) {

    const selectedProgramId = useSelectedProgramId();
    const isSelected = selectedProgramId === programId;
    const [code, setCode] = useProgramCodeState(programId)
    const editor = useRef<HTMLDivElement>(null);

    useEffect(
        () => {

            let timer:NodeJS.Timeout;       
            const onCodeChanged = (v:ViewUpdate) => {
                if(!v.docChanged) return;        
                if(timer) clearTimeout(timer);
                timer = setTimeout(() => {
                    const code = v.state.doc.toString();
                    setCode(code);
                }, 500);
            }
        
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

            return () => {
                if(timer) clearTimeout(timer);
                view.destroy();
            }

        }, 
        [] // eslint-disable-line react-hooks/exhaustive-deps
        // for now we assume code can only be changed via this editor instance
        // so we just need to initialize the editor and report any changes
    );

    const style = isSelected ? editCSS : displayNone;

    return <div css={style} ref={editor}/>

}
