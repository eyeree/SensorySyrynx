/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { flexRow } from '../common/css'
import { stepCSS } from './css'
import { useIsSetupStepActive, useCurrentSetupStepCount } from '../state/setup'
import { arrayOf } from '../common/array'

const masterStepInactiveCSS = css(
    stepCSS,
    {
        backgroundColor: 'darkgoldenrod'
    }
)

const masterStepActiveCSS = css(
    stepCSS,
    {
        backgroundColor: 'goldenrod'
    }
)

type MasterStepProps = {
    index:number
}

function MasterStep({index}:MasterStepProps) {
    const active = useIsSetupStepActive(index);
    return <div css={active ? masterStepActiveCSS : masterStepInactiveCSS}/>
}

const stepsCSS = css(
    flexRow,
    {

    }
)

export function MasterSteps() {
    const steps = useCurrentSetupStepCount();
    return <div css={stepsCSS}>
        {arrayOf(steps, index => 
            <MasterStep key={index} index={index}/>
        )}
    </div>
}