/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

import { flexColumn } from '../common/css';

import { MasterSteps } from './MasterSteps';
import { SetupSteps } from './SetupSteps';

const sequenceCSS = css(
    flexColumn,
    {
    }
)

export function Sequence() {
    return (
        <div css={sequenceCSS}>
            <MasterSteps/>
            <SetupSteps/>
        </div>
    )
}