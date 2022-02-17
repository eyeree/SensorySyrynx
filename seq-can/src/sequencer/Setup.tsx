/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { Paper } from '@mui/material';
import { useEffect, useRef, useState, PointerEvent as ReactPointerEvent } from 'react';
import { arrayOf } from '../common/array';
import { theme, flexRow } from '../common/css';
import { usePrevious } from '../common/previous';
import { ActionList, ActionListEntry, Runtime } from '../runtime';
import { ProgramId, useProgramName, useProgramCode, useSetSelectedProgramId, useSetSelectedProgramError, ProgramErrorNullable } from '../state/program';
import { StepIndex, useSetupStepStatusState, SetupId, useIsSetupStepActive, useCurrentSetupId, useSetupProgramIdList, useSetupStepCount, ProgramIndex, useSelectedProgramIndexState, useSelectedProgramIndex, useSetSelectedProgramIndex, SetupStepCount } from '../state/setup';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { AddProgramDialog } from './AddProgramDialog';
import { Box } from '@mui/system';
import { useActionTitleWidthState } from '../state/layout';

const stepCommonCSS = css(
    {
        cursor: 'pointer',
        width: 10,
        height: 20,
        margin: 1,
        borderWidth: 1,
        borderColor: 'black',
        borderStyle: 'solid',
    }
)

const stepDisabledInactiveCSS = css(
    stepCommonCSS,
    {
        backgroundColor: theme.palette.primary.dark,
    }
)

const stepDisabledActiveCSS = css(
    stepCommonCSS,
    {
        backgroundColor: theme.palette.primary.light,
    }
)

const stepEnabledInactiveCSS = css(
    stepCommonCSS,
    {
        backgroundColor: theme.palette.secondary.dark,
    }
)

const stepEnabledActiveCSS = css(
    stepCommonCSS,
    {
        backgroundColor: theme.palette.secondary.light,
    }
)

function getStepCSS(active: boolean, enabled: boolean) {
    if (enabled) {
        if (active) {
            return stepEnabledActiveCSS
        } else {
            return stepEnabledInactiveCSS
        }
    } else {
        if (active) {
            return stepDisabledActiveCSS
        } else {
            return stepDisabledInactiveCSS
        }
    }
}

type ActionStepProps = { setupId: SetupId, programId: ProgramId, action: ActionListEntry, stepIndex: StepIndex }
function ActionStep({ setupId, programId, action, stepIndex }: ActionStepProps) {

    const [enabled, setEnabled] = useSetupStepStatusState({ setupId, programId, actionName: action.name, stepIndex });
    const active = useIsSetupStepActive(stepIndex);
    const wasActive = usePrevious(active);

    const css = getStepCSS(active, enabled);

    const onClick = () => setEnabled(!enabled);

    useEffect(() => {
        if (enabled && active && !wasActive && action.fn) {
            action.fn({ stepIndex });
        }
    })

    return <div css={css} onClick={onClick} />

}

const statusDotSize = theme.spacing(1.5)
const statusDotMargin = theme.spacing(1)
const actionIndent = theme.spacing(4.5)

type MoveDivider = (delta:number) => void;
type ActionProps = { setupId: SetupId, programId: ProgramId, action: ActionListEntry, stepCount:SetupStepCount, moveDivider:MoveDivider }

function Action({ setupId, programId, action, stepCount, moveDivider }: ActionProps) {

    const [dragging, setDragging] = useState(false);

    const onPointerDown = (e:ReactPointerEvent<HTMLDivElement>) => { 
        setDragging(true);
        const div = e.target as HTMLDivElement
        div.setPointerCapture(e.pointerId);
    }
    const onPointerUp = (e:ReactPointerEvent<HTMLDivElement>) => { 
        setDragging(false); 
        const div = e.target as HTMLDivElement
        div.releasePointerCapture(e.pointerId);
    }
    const onPointerMove = (e:ReactPointerEvent<HTMLDivElement>) => {
        if(dragging) {
            moveDivider(e.movementX);
        }
    }

    return <>
        <div css={css({ marginLeft: actionIndent, marginRight: statusDotMargin, overflow: 'hidden'})}>{action.name}</div>
        <Box onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerMove={onPointerMove} sx={{
            borderColor: theme.palette.divider, 
            borderLeftWidth: 1, 
            borderLeftStyle: 'solid', 
            width:theme.spacing(0.5), 
            height:1, 
            cursor: 'ew-resize'
        }}/>
        {arrayOf(stepCount, stepIndex =>
            <ActionStep key={stepIndex} setupId={setupId} programId={programId} action={action} stepIndex={stepIndex} />
        )}
    </>
}

type ProgramNameProps = { programId: ProgramId, programIndex: ProgramIndex }

function ProgramName({ programId, programIndex }: ProgramNameProps) {
    const programName = useProgramName(programId);
    return <div>{programName}</div>
}

type ProgramStatusProps = { programId: ProgramId, programIndex: ProgramIndex, programError: ProgramErrorNullable }

function ProgramStatus({ programId, programIndex, programError }: ProgramStatusProps) {
    const setSelectedProgramId = useSetSelectedProgramId();
    const setSelectedProgramError = useSetSelectedProgramError();
    const selectedProgramIndex = useSelectedProgramIndex();
    const isSelected = selectedProgramIndex === programIndex;

    useEffect(() => {
        if (isSelected) {
            setSelectedProgramError(programError);
            setSelectedProgramId(programId);
        }
    }, [isSelected, programError, programId, setSelectedProgramError, setSelectedProgramId])

    let color;
    if (programError) {
        if (isSelected) {
            color = theme.palette.error.light
        } else {
            color = theme.palette.error.dark
        }
    } else {
        if (isSelected) {
            color = theme.palette.success.light
        } else {
            color = theme.palette.success.dark
        }
    }

    return <div css={css({
        height: statusDotSize,
        width: statusDotSize,
        backgroundColor: color,
        borderRadius: "50%",
        display: "inline-block",
        marginRight: statusDotMargin,
        alignSelf: 'center'
    })}></div>

}

type ProgramInfoProps = { programId: ProgramId, programIndex: ProgramIndex, programError: ProgramErrorNullable }
function ProgramInfo({ programId, programError, programIndex }: ProgramInfoProps) {

    const [selectedProgramIndex, setSelectedProgramIndex] = useSelectedProgramIndexState();

    const onClick = () => setSelectedProgramIndex(programIndex);

    const background = selectedProgramIndex == programIndex ? theme.palette.secondary.dark : theme.palette.primary.dark;

    return <Box sx={{display: 'flex', cursor: 'pointer', backgroundColor: background, paddingLeft: 1, marginBottom: 0.5}} onClick={onClick}>
        <ProgramStatus programId={programId} programIndex={programIndex} programError={programError} />
        <ProgramName programId={programId} programIndex={programIndex} />
    </Box>
}

type ProgramProps = { setupId: SetupId, programId: ProgramId, programIndex: ProgramIndex, titleWidth: number, moveDivider:MoveDivider }

function Program({ setupId, programId, programIndex, titleWidth, moveDivider }: ProgramProps) {

    const code = useProgramCode(programId);
    const [programError, setProgramError] = useState<ProgramErrorNullable>(null);
    const [runtime, setRuntime] = useState<Runtime>()
    const [actions, setActions] = useState<ActionList>([])
    const selectedProgramIndex = useSelectedProgramIndex();
    const isSelected = programIndex == selectedProgramIndex;
    const stepCount = useSetupStepCount(setupId);

    useEffect(
        () => {
            const runtime = new Runtime(code, setProgramError);
            setActions(runtime.actions);
            setRuntime(runtime);
            return () => runtime.unload()
        },
        [] // eslint-disable-line react-hooks/exhaustive-deps
        // code changes are handled by the useEffect below, setProgramError is
        // not expected to change (is that a valid assumption?)
    )

    useEffect(
        () => {
            if (runtime) {
                runtime.setCode(code)
                setActions(runtime.actions);
            }
        },
        [code] // eslint-disable-line react-hooks/exhaustive-deps
        // we know that runtime will never change, only need to track code changes
    )

    return <>
        <Paper elevation={isSelected ? 12 : 9} sx={{padding:1, marginBottom: 1}}>
            <ProgramInfo programId={programId} programError={programError} programIndex={programIndex} />
            <Box sx={{display: 'grid', gridAutoRows: 'min-content', gridTemplateColumns: `${titleWidth}px min-content repeat(${stepCount}, min-content)`}}>
            {actions.map(action =>
                <Action key={action.name} setupId={setupId} programId={programId} action={action} stepCount={stepCount} moveDivider={moveDivider} />
            )}
            </Box>
        </Paper>
    </>

}

type AddProgramProps = { setupId: SetupId }
function AddProgram({ setupId }: AddProgramProps) {

    const [open, setOpen] = useState(false);

    // console.log("AddProgram", open);

    const onClick = () => { setOpen(true) }
    const onClose = () => { 
        console.log("---> setOpen(false)")
        setOpen(false) 
    }

    const ref = useRef<HTMLDivElement>(null);

    return <>
        <div css={css(flexRow, { gridColumn: "1 / 3", color: 'gray', cursor: 'pointer' })} onClick={onClick}>
            <div css={css({
                height: statusDotSize,
                width: statusDotSize,
                display: "inline-block",
                marginRight: statusDotMargin
            })}>
                <AddCircleOutlineIcon sx={{ width: statusDotSize, height: statusDotSize }} />
            </div>
            <div ref={ref}>(add program)</div>
        </div>
        {ref.current ? <AddProgramDialog setupId={setupId} open={open} onClose={onClose} target={ref.current}/> : <div/>}
    </>
}

export function Setup() {
    const [titleWidth, setTitleWidth] = useActionTitleWidthState();
    const moveDivider = (delta:number) => {
        const newTitleWidth = titleWidth + delta;
        if(newTitleWidth > 50 && newTitleWidth < 200) {
            setTitleWidth(newTitleWidth);
        }
    }
    const setupId = useCurrentSetupId();
    const programIds = useSetupProgramIdList(setupId);
    return <Paper elevation={6} sx={{ padding: 1, overflow: "auto", width: 1 }}>
        {programIds.map((programId, programIndex) =>
            <Program key={programIndex} setupId={setupId} programId={programId} programIndex={programIndex} titleWidth={titleWidth} moveDivider={moveDivider} />
        )}
        <AddProgram setupId={setupId} />
    </Paper>
}

