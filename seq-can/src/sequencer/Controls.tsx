import React from 'react';
import { css } from '@emotion/react'

import SpeedIcon from '@mui/icons-material/Speed';
import StraightenIcon from '@mui/icons-material/Straighten';
import { Slider } from '@mui/material';

const controls = css({
    display:'flex', 
    flex_direction:'column'
});

export function Controls() {
    return <div css={controls}>
        <div><SpeedIcon/><Slider aria-label="Beats" value={120} min={1} max={300}/></div>
        <div><StraightenIcon/><Slider aria-label="Steps" value={8} min={1} max={100}/></div>
    </div>
}