/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

import { atomFamily, useRecoilState, useRecoilValue } from 'recoil';

import { sequencerSpeed, sequencerSteps, sequencerPaused } from './Controls';

import { flexRow, flexColumn } from '../common/css';
import { useState } from 'react';
import { useInterval } from '../common/interval';
import { Program } from '../program';
import { usePrevious } from '../common/previous';
import { errorState, getErrorState } from '../editor/Editor';

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

const programStepState = atomFamily({
    key: 'Sequencer-ProgramStepState',
    default: (i:number) => ({ active: false, enabled: false })
})

type StepProps = {
    index:number,
    active:boolean
}

function MasterStep({index, active}:StepProps) {
    return <div css={active ? masterStepActiveCSS : masterStepInactiveCSS}/>
}

type ProgramStepProps = StepProps & {
    program:Program
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

function ProgramStep({index, active, program}:ProgramStepProps) {
    const [state, setState] = useRecoilState(programStepState(index));
    const css = getProgramStepCSS(active, state.enabled);
    const onClick = () => setState({...state, enabled: !state.enabled});
    const wasActive = usePrevious(state.active);
    const [ , setErrorState ] = useRecoilState(errorState);
    if(!wasActive && active && state.enabled) {
        try {
            program.step(index);
        } catch(e:any) {
            const error = getErrorState(e);
            setErrorState(error);
        }
    }
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

    const program = Program.getProgram();

    return (
        <div css={sequenceCSS}>
            <div css={stepsCSS}>
                {Array.from({length: steps}, (_, index) => 
                    <MasterStep 
                        key={index} 
                        index={index} 
                        active={step === index}
                    />
                )}
            </div>
            <div css={programCSS}>
                {Array.from({length: steps}, (_, index) => 
                    <ProgramStep 
                        key={index} 
                        index={index} 
                        active={step === index}
                        program={program}
                    />
                )}
            </div>
        </div>
    )
}