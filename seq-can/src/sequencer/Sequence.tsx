/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

import { flexColumn } from '../common/css';

import { MasterSteps } from './MasterSteps';
import { Setup } from './Setup';

const sequenceCSS = css(
    flexColumn,
    {
    }
)

export function Sequence() {
    return (
        <div css={sequenceCSS}>
            <MasterSteps/>
            <Setup/>
        </div>
    )
}