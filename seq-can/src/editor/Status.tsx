/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react'

import { atom, useRecoilState, useRecoilValue } from 'recoil';

const chromeErrorLocation = /<anonymous>:(?<line>\d+):(?<column>\d+)/
const firefoxErrorLocation = /Function:(?<line>\d+):(?<column>\d+)/

export type ErrorState = {
    message: string,
    line: number,
    column: number
}

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
                line = Number.parseInt(match.groups!.line) - 3;
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

const errorCSS = css({color: 'red'})

export function Status() {

    const error = useRecoilValue(errorState);

    console.log("Status", error);

    let errorText = "";
    if (error) {
        if (error.line === 0 || error.column === 0) {
            errorText = error.message;
        } else {
            errorText = `[${error.line}:${error.column}] ${error.message}`;
        }
    }

    return <div css={errorCSS}>{errorText}</div>

}