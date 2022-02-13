import { css } from '@emotion/react'
import { createTheme } from '@mui/material';

export const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#6d6d6f',
        },
        secondary: {
            main: '#6a1b9a',
        },
        success: {
            main: '#2e7d32',
        },
        warning: {
            main: '#ff6d00',
        },
        info: {
            main: '#ffb300',
        },
    }
});

export const flexColumn = css({
    display: 'flex',
    flexDirection: 'column'
});

export const flexRow = css({
    display: 'flex',
    flexDirection: 'row'
})

export const displayNone = css({
    display: 'none'
})