/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

import { Controls } from './Controls';
import { Sequence } from './Sequence';

import { flexRow } from "../common/css";

const container = css(
    flexRow,
    {
        height: "100%"
    }
)

export function Sequencer() {
    return <div css={container}>
        <Controls/>
        <Sequence/>
    </div>
}