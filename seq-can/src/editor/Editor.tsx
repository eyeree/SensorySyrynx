/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react'

import { flexColumn, flexRow } from '../common/css';

import { Status } from './Status'
import { SlotSelector } from './SlotSelector'
import { CodeEditor } from './CodeEditor'

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

const controlsCSS = css({

})

export function Editor() {
    console.log("Editor");
    return (
        <div css={containerCSS}>
            <div css={editCSS}><CodeEditor/></div>
            <div css={footerCSS}>
                <div css={statusCSS}><Status/></div>
                <div css={controlsCSS}><SlotSelector/></div>
            </div>
        </div>
    );
}
