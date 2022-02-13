/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react'

import { flexColumn, flexRow } from '../common/css';

import { Status } from './Status'
import { CodeEditor } from './CodeEditor'
import { useCurrentSetupId, useSetupProgramIdList } from '../state/setup';

const containerCSS = css(
    flexColumn,
    {
        height: "100%"
    }
)

const editCSS = css({
    flexGrow: 1
})

const footerCSS = css(
    flexRow,
    {
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
        <div css={containerCSS}>
            <div css={editCSS}>
                {Array.from(programIdSet, programId => <CodeEditor key={programId} programId={programId}/>)}
            </div>
            <div css={footerCSS}>
                <div css={statusCSS}><Status/></div>
            </div>
        </div>
    );
    
}
