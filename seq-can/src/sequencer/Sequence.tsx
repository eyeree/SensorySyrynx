/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react'

import { atom, atomFamily, useRecoilState, useRecoilValue } from 'recoil';

import { sequencerSpeed, sequencerSteps, sequencerPaused } from './Controls';

import { flexRow, flexColumn } from '../common/css';
import { useEffect, useState } from 'react';
import { useInterval } from '../common/interval';
import { usePrevious } from '../common/previous';

const sequenceCSS = css(
    flexColumn,
    {
    }
)

const stepsCSS = css(
    flexRow,
    {

    }
)

const programCSS = css(
    flexRow,
    {

    }
)

const stepCSS = css({
    width: 10,
    height: 20,
    margin: 1,
    borderWidth: 1,
    borderColor: 'black',
    borderStyle: 'solid',
})

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

const programStepCommonCSS = css(
    stepCSS,
    {
        cursor: 'pointer'
    }
)

const programStepDisabledInactiveCSS = css(
    programStepCommonCSS,
    {
        backgroundColor: 'dimgray',
    }
)

const programStepDisabledActiveCSS = css(
    programStepCommonCSS,
    {
        backgroundColor: 'grey',
    }
)

const programStepEnabledInactiveCSS = css(
    programStepCommonCSS,
    {
        backgroundColor: 'indigo',
    }
)

const programStepEnabledActiveCSS = css(
    programStepCommonCSS,
    {
        backgroundColor: 'purple',
    }
)

const masterStepState = atomFamily({
    key: 'Sequencer-MasterStepState',
    default: (i:number) => ({ active: false })
})

const programStepState = atomFamily({
    key: 'Sequencer-ProgramStepState',
    default: (i:number) => ({ active: false, enabled: false })
})

type MasterStepProps = {
    index:number,
    active:boolean
}

function MasterStep({index, active}:MasterStepProps) {
    return <div css={active ? masterStepActiveCSS : masterStepInactiveCSS}/>
}

type ProgramStepProps = {
    index:number,
    active:boolean

}

function getProgramStepCSS(active:boolean, enabled:boolean) {
    if(enabled) {
        if(active) {
            return programStepEnabledActiveCSS
        } else {
            return programStepEnabledInactiveCSS
        }
    } else {
        if(active) {
            return programStepDisabledActiveCSS
        } else {
            return programStepDisabledInactiveCSS
        }
    }
}

function ProgramStep({index, active}:ProgramStepProps) {
    const [state, setState] = useRecoilState(programStepState(index));
    const css = getProgramStepCSS(active, state.enabled);
    const onClick = () => setState({...state, enabled: !state.enabled});
    return <div css={css} onClick={onClick}/>
}

export function Sequence() {

    const speed = useRecoilValue(sequencerSpeed);
    const steps = useRecoilValue(sequencerSteps);
    const paused = useRecoilValue(sequencerPaused);

    const [step, setStep] = useState(0);

    const tick = () => {       
        if(paused) return;
        const next = step >= steps-1 ? 0 : step + 1;
        setStep(next);
    }
    
    useInterval(tick, 60000 / speed);

    return (
        <div css={sequenceCSS}>
            <div css={stepsCSS}>
                {Array.from({length: steps}, (_, index) => <MasterStep key={index} index={index} active={step === index}/>)}
            </div>
            <div css={programCSS}>
                {Array.from({length: steps}, (_, index) => <ProgramStep key={index} index={index} active={step === index}/>)}
            </div>
        </div>
    )
}