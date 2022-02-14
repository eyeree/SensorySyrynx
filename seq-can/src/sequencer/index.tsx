/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

import { Controls } from './Controls';
import { Setup } from './Setup';

import { flexRow } from "../common/css";
import { Paper } from '@mui/material';

const container = css(
    flexRow,
    {
        // height: "100%"
    }
)

export function Sequencer() {
    return <Paper css={container} elevation={6} sx={{margin: 1, marginTop: 0, width: 1, overflow: "hidden"}}>
        <Controls/>
        <Setup/>
    </Paper>
}