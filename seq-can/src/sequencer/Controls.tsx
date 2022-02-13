/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { useState } from 'react';

import SpeedIcon from '@mui/icons-material/Speed';
import StraightenIcon from '@mui/icons-material/Straighten';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import { Slider } from '@mui/material';

import { flexColumn, flexRow } from "../common/css";
import { useInterval } from '../common/interval';

import { useCurrentSetupSpeedState, useCurrentSetupStepCountState, useSetIsSetupStepActive } from '../state/setup';
import { Runtime } from '../runtime/runtime';

const container = css(
    flexColumn,
    {
        justifyContent: 'space-around',
    }
)

const row = css(
    flexRow,
    {
        margin: 2,
        alignItems: 'center'
    }
);

const slider = css(
    {
        width: 100,
        marginLeft: 6,
        marginRight: 4
    }
)

const sliderValue = (v:number|number[]) => Array.isArray(v) ? v[0] : v;

const pauseCSS = css({
    cursor: 'pointer'
})

type TickerProps = {speed:number, steps:number, paused:boolean}
const Ticker = ({speed, steps, paused}:TickerProps) => {

    const setIsStepActive = useSetIsSetupStepActive();
    const [step, setStep] = useState(0);

    const tick = () => {       
        if(paused) return;
        setIsStepActive(step, false);
        const next = step >= steps-1 ? 0 : step + 1;
        setIsStepActive(next, true);
        setStep(next);
    }
    
    const time = 60000 / speed;
    useInterval(tick, time);

    return <></>

}

export function Controls() {

    const [speed, setSpeed] = useCurrentSetupSpeedState();
    const [steps, setSteps] = useCurrentSetupStepCountState();

    const [paused, setPaused] = useState(false);
    const togglePaused = () => setPaused(!paused)

    Runtime.setSequencerState(speed, steps, paused);
    
    return (
        <div css={container}>
            <Ticker paused={paused} speed={speed} steps={steps}/>
            <div css={row}>
                <SpeedIcon/>
                <Slider css={slider} valueLabelDisplay="auto" aria-label="Speed" value={speed} min={10} max={300} onChange={(e, v) => setSpeed(sliderValue(v))}/>
            </div>
            <div css={row}>
                <StraightenIcon/>
                <Slider css={slider} valueLabelDisplay="auto" aria-label="Steps" value={steps} min={1} max={100} onChange={(e, v) => setSteps(sliderValue(v))}/>
            </div>
            <div css={row}>
                <span onClick={togglePaused} css={pauseCSS}>{paused ? <PlayCircleIcon/> : <PauseCircleIcon/>}</span>
            </div>
        </div>
    )

}