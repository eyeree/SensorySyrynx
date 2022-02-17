/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react'

import { flexRow } from '../common/css';

import { Status } from './Status'
import { CodeEditor } from './CodeEditor'
import { useCurrentSetupId, useSetupProgramIdList } from '../state/setup';
import { Paper } from '@mui/material';

const footerCSS = css(
    flexRow,
    {
        flexShrink: 0
    }
)

const statusCSS = css({
    flexGrow: 1
})

export function Editor() {

    const setupId = useCurrentSetupId();
    const programIdList = useSetupProgramIdList(setupId);
    const programIdSet = new Set(programIdList)

    return (
        <Paper elevation={3} sx={{padding:1, display: "flex", width: 1, overflow: "hidden"}}>
            <div css={{display: "flex", flexDirection: "column", width: "100%", overflow: "hidden"}}>
                <div css={{flexGrow: 1, display: "flex", overflow: "hidden"}}>
                    {Array.from(programIdSet, programId => <CodeEditor key={programId} programId={programId}/>)}
                </div>
                <div css={footerCSS}>
                    <div css={statusCSS}><Status/></div>
                </div>
            </div>
        </Paper>
    );
    
}
