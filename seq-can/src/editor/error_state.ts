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

const chromeErrorLocation = /<anonymous>:(?<line>\d+):(?<column>\d+)/
const firefoxErrorLocation = /Function:(?<line>\d+):(?<column>\d+)/

export type ErrorState = {
    message: string,
    line: number,
    column: number
}

const errorState = atom<ErrorState|null>({
    key: "Editor_ErrorState",
    default: null
});

function getErrorState(e:any) {
    
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

export function useErrorState():[ErrorState|null, (e:any) => void] {    
    const [oldState, setErrorState] = useRecoilState(errorState);
    return [oldState, (e:any) => {
        const newState = e === null ? null : getErrorState(e);
        setErrorState(newState);    
    }]
}