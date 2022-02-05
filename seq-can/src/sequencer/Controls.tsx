/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

import SpeedIcon from '@mui/icons-material/Speed';
import StraightenIcon from '@mui/icons-material/Straighten';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';

import { Slider } from '@mui/material';

import { flexColumn, flexRow } from "../common/css";

import { atom, useRecoilState } from 'recoil';

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

export const sequencerSpeed = atom({
    key: 'Sequencer-Speed', 
    default: 120
});

export const sequencerSteps = atom({
    key: 'Sequencer-Steps', 
    default: 8
});

export const sequencerPaused = atom({
    key: 'Sequencer-Paused',
    default: false
});

const pauseCSS = css({
    cursor: 'pointer'
})

export function Controls() {

    const [speed, setSpeed] = useRecoilState(sequencerSpeed);
    const [steps, setSteps] = useRecoilState(sequencerSteps);
    const [paused, setPaused] = useRecoilState(sequencerPaused);

    const togglePaused = () => {
        setPaused(!paused);
    }
    
    return (
        <div css={container}>
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