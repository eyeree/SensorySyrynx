/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react'
import { useSelectedProgramError } from '../state/program';

const errorCSS = css({color: 'red'})

export function Status() {

    const error = useSelectedProgramError();

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