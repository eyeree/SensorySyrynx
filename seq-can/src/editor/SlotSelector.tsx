/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react'
import { TextField } from '@mui/material';
import { useEffect, useRef } from 'react';
import { atom, useRecoilState } from 'recoil';

export function SlotSelector() {
    return <div><TextField variant="outlined" /></div>
}