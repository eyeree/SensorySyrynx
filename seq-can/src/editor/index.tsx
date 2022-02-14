/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react'

import { flexColumn, flexRow } from '../common/css';

import { Status } from './Status'
import { CodeEditor } from './CodeEditor'
import { useCurrentSetupId, useSetupProgramIdList } from '../state/setup';
import { Paper } from '@mui/material';

const containerCSS = css(
    flexColumn,
    {
        width: "100%"
        // height: "100%"
    }
)

const editorCSS = css({
    flexGrow: 1,
    // overflow: "scroll"
})

const footerCSS = css(
    flexRow,
    {
        height: 50,
        backgroundColor: "yellow",
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
        <Paper elevation={6} sx={{padding:1, margin: 1, marginLeft: 0, display: "flex", width: 1, overflow: "hidden"}}>
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
