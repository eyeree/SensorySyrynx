/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { Button, IconButton, List, ListItem, Paper } from '@mui/material';
import { useEffect, useRef, useState, PointerEvent as ReactPointerEvent, useLayoutEffect } from 'react';
import { arrayOf } from '../common/array';
import { theme, flexRow } from '../common/css';
import { usePrevious } from '../common/previous';
import { ActionList, ActionListEntry, Runtime } from '../runtime';
import { ProgramId, useProgramName, useProgramCode, useSetSelectedProgramId, useSetSelectedProgramError, ProgramErrorNullable } from '../state/program';
import { StepIndex, useSetupStepStatusState, SetupId, useIsSetupStepActive, useCurrentSetupId, useSetupProgramIdList, useSetupStepCount, ProgramIndex, useSelectedProgramIndexState, useSelectedProgramIndex, useSetSelectedProgramIndex, SetupStepCount, useSetupProgramIndexCollapsed, useSetupProgramIndexCollapsedState, useSetupProgramIndexEnabledState, useRemoveSetupProgramIdListEntry, useSetupProgramIndexEnabled } from '../state/setup';
import { AddProgram, AddProgramResult } from './AddProgram';
import { Box } from '@mui/system';
import { useActionTitleWidthState } from '../state/layout';
import { atom, useSetRecoilState } from 'recoil';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

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

type UpdateTitleWidth = (delta:number) => void;
type ActionProps = { setupId: SetupId, programId: ProgramId, action: ActionListEntry, stepCount:SetupStepCount, updateTitleWidth:UpdateTitleWidth }

function Action({ setupId, programId, action, stepCount, updateTitleWidth: moveDivider }: ActionProps) {

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
        <Box sx={{ marginLeft: 1, marginRight: 1, overflow: 'hidden'}}>{action.name}</Box>
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

type ProgramInfoProps = { 
    setupId:SetupId, 
    programId: ProgramId, 
    programIndex: ProgramIndex, 
    programError: ProgramErrorNullable, 
    beginRename: boolean, 
    runtimeEnabled: (enabled:boolean) => void,
    resetRuntime: () => void
}

function ProgramInfo({ setupId, programId, programError, programIndex, beginRename, runtimeEnabled, resetRuntime }: ProgramInfoProps) {

    const setSelectedProgramId = useSetSelectedProgramId();
    const setSelectedProgramError = useSetSelectedProgramError();
    const [selectedProgramIndex, setSelectedProgramIndex] = useSelectedProgramIndexState();
    const isSelected = selectedProgramIndex === programIndex;
    const [collapsed, setCollapsed] = useSetupProgramIndexCollapsedState(setupId, programIndex);
    const [enabled, setEnabled] = useSetupProgramIndexEnabledState(setupId, programIndex);
    const removeSetupProgramIdListEntry = useRemoveSetupProgramIdListEntry(setupId);

    useEffect(() => {
        if (isSelected) {
            setSelectedProgramError(programError);
            setSelectedProgramId(programId);
        }
    }, [isSelected, programError, programId, setSelectedProgramError, setSelectedProgramId])

    const onClick = () => setSelectedProgramIndex(programIndex);

    let background:string;
    if (programError) {
        if (isSelected) {
            background = theme.palette.error.light
        } else {
            background = theme.palette.error.dark
        }
    } else {
        if (isSelected) {
            background = theme.palette.secondary.dark
        } else {
            background = theme.palette.primary.dark
        }
    }

    const onToggleCollapsed = () => setCollapsed(!collapsed)
    const onRestart = () => resetRuntime();
    const onToggleEnabled = () => {
        setEnabled(!enabled);
        runtimeEnabled(!enabled);
    }
    const onRemove = () => removeSetupProgramIdListEntry(programId);

    return <Box sx={{display: 'flex', cursor: 'pointer', backgroundColor: background, marginBottom: 0.5, alignItems: "center"}} onClick={onClick}>
        <IconButton size="small" onClick={onToggleCollapsed}>{collapsed ? <ExpandMoreIcon/> : <ExpandLessIcon/>}</IconButton>
        <Box sx={{flexGrow:1}}><ProgramName programId={programId} programIndex={programIndex} /></Box>
        <IconButton size="small" onClick={onRestart}><RestartAltIcon/></IconButton>
        <IconButton size="small" onClick={onToggleEnabled}>{enabled ? <VisibilityIcon/> : <VisibilityOffIcon/>}</IconButton>
        <IconButton size="small" onClick={onRemove}><RemoveCircleOutlineIcon/></IconButton>
    </Box>
}

type ProgramProps = { 
    setupId: SetupId, 
    programId: ProgramId, 
    programIndex: ProgramIndex, 
    titleWidth: number, 
    updateTitleWidth:UpdateTitleWidth,
    beginRename: boolean,
    ensureVisible: boolean
}

function Program({ setupId, programId, programIndex, titleWidth, updateTitleWidth, beginRename, ensureVisible}: ProgramProps) {

    const code = useProgramCode(programId);
    const [programError, setProgramError] = useState<ProgramErrorNullable>(null);
    const [runtime, setRuntime] = useState<Runtime>()
    const [actions, setActions] = useState<ActionList>([])
    const selectedProgramIndex = useSelectedProgramIndex();
    const isSelected = programIndex == selectedProgramIndex;
    const stepCount = useSetupStepCount(setupId);
    const collapsed = useSetupProgramIndexCollapsed(setupId, programIndex);
    const enabled = useSetupProgramIndexEnabled(setupId, programIndex);

    // console.log("Program", programIndex, beginRename, ensureVisible);

    useEffect(
        () => {
            const runtime = new Runtime(code, setProgramError);
            runtime.enabled = enabled;
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

    useEffect(
        () => {
            if (runtime) {
                runtime.enabled = enabled;
            }
        },
        [enabled] // eslint-disable-line react-hooks/exhaustive-deps
        // we know that runtime will never change, only need to track enable changes 
    )

    const ref = useRef<HTMLDivElement>(null);

    const runtimeEnabled = (enabled:boolean) => {
        if(runtime) {
            // runtime.enabled = enabled;
        }
    }

    const resetRuntime = () => {
        if(runtime) {
            runtime.reset();
            setActions(runtime.actions);
        }
    }

    return <>
        <Paper elevation={isSelected ? 18 : 9} sx={{padding:1, width: 1}} ref={ref}>
            <ProgramInfo setupId={setupId} programId={programId} programError={programError} programIndex={programIndex} beginRename={beginRename} runtimeEnabled={runtimeEnabled} resetRuntime={resetRuntime} />
            <Box sx={{display: collapsed ? 'none' : 'grid', gridAutoRows: 'min-content', gridTemplateColumns: `${titleWidth}px min-content repeat(${stepCount}, min-content)`}}>
            {actions.map(action =>
                <Action 
                    key={action.name} 
                    setupId={setupId} 
                    programId={programId} 
                    action={action} 
                    stepCount={stepCount} 
                    updateTitleWidth={updateTitleWidth} 
                />
            )}
            </Box>
        </Paper>
    </>

}


export function Setup() {
    
    const [titleWidth, setTitleWidth] = useActionTitleWidthState();
    const updateTitleWidth = (delta:number) => {
        const newTitleWidth = titleWidth + delta;
        if(newTitleWidth > 50 && newTitleWidth < 200) {
            setTitleWidth(newTitleWidth);
        }
    }
    
    const setupId = useCurrentSetupId();
    const programIds = useSetupProgramIdList(setupId);

    const [renameProgramIndex, setRenameProgramIndex] = useState<number|null>(null);
    const [visibleProgramIndex, setVisibleProgramIndex] = useState<number|null>(null);

    const setSelectedProgramIndex = useSetSelectedProgramIndex();

    console.log("Setup", renameProgramIndex, visibleProgramIndex);

    const scrollRef = useRef<HTMLLIElement>(null);

    const onAddProgram = ({isNew}:AddProgramResult) => {
        const newProgramIndex = programIds.length;
        if(isNew) {
            setRenameProgramIndex(newProgramIndex);
        }
        setVisibleProgramIndex(newProgramIndex);
        setSelectedProgramIndex(newProgramIndex);
        console.log("OnAddProgram", newProgramIndex)
    }

    useEffect(() => {
        console.log("reset program indexes", visibleProgramIndex)
        if(visibleProgramIndex != null && scrollRef.current) {
            console.log("scroll into view")
            scrollRef.current.scrollIntoView({behavior:"smooth"})
        }
        // setRenameProgramIndex(null);
        // setVisibleProgramIndex(null);
    }, [renameProgramIndex, visibleProgramIndex])

    return <Paper elevation={6} sx={{ overflow: "hidden", width: 1 }}>
        <List sx={{overflow: "auto", position: 'relative', width: 1, height: 1 }} dense={true}>
            {programIds.map((programId, programIndex) =>
                <ListItem key={programIndex}>
                    <Program 
                        setupId={setupId} 
                        programId={programId} 
                        programIndex={programIndex} 
                        titleWidth={titleWidth} 
                        updateTitleWidth={updateTitleWidth}
                        beginRename={renameProgramIndex === programIndex}
                        ensureVisible={visibleProgramIndex === programIndex} 
                    />
                </ListItem>
            )}
            <ListItem ref={scrollRef}>
                <AddProgram setupId={setupId} onAddProgram={onAddProgram} />
            </ListItem>
        </List>
    </Paper>
}

