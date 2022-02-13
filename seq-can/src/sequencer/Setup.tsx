/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { useEffect, useState } from 'react';
import { arrayOf } from '../common/array';

import { flexRow } from '../common/css';
import { usePrevious } from '../common/previous';
import { ActionList, ActionListEntry, Runtime } from '../runtime/runtime';
import { ProgramId, useProgramName, useProgramCode, useSetSelectedProgramId, useSetSelectedProgramError, ProgramErrorNullable } from '../state/program';
import { StepIndex, useSetupStepStatusState, SetupId, useIsSetupStepActive, useCurrentSetupId, useSetupProgramIdList, useSetupStepCount, ProgramIndex, useSelectedProgramIndexState } from '../state/setup';
import { stepCSS } from './css';

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

type ActionStepProps = {setupId: SetupId, programId:ProgramId, action:ActionListEntry, stepIndex:StepIndex}
function ActionStep({setupId, programId, action, stepIndex}:ActionStepProps) {

    const [enabled, setEnabled] = useSetupStepStatusState({setupId, programId, actionName:action.name, stepIndex});
    const active = useIsSetupStepActive(stepIndex);
    const wasActive = usePrevious(active);

    const css = getProgramStepCSS(active, enabled);

    const onClick = () => setEnabled(!enabled);

    useEffect(() => {
        if(enabled && active && !wasActive && action.fn) {
            action.fn({stepIndex});
        }
    })

    return <div css={css} onClick={onClick}/>

}

const statusDotSize = 10;
const statusDotMargin = 2;
const statusDotWidth = statusDotSize + statusDotMargin;
const actionIndent = statusDotWidth * 1.5


type ActionProps = {setupId:SetupId, programId:ProgramId, action:ActionListEntry}
function Action({setupId, programId, action}:ActionProps) {
    const stepCount = useSetupStepCount(setupId);
    return <>
        <div css={css({marginLeft: actionIndent, marginRight: 2})}>{action.name}</div>
        <div css={flexRow}>
            {arrayOf(stepCount, stepIndex => 
                <ActionStep key={stepIndex} setupId={setupId} programId={programId} action={action} stepIndex={stepIndex}/>
            )}
        </div>
    </>
}

type ProgramNameProps = {programId:ProgramId}
function ProgramName({programId}:ProgramNameProps) {
    const programName = useProgramName(programId);
    return <div>{programName}</div>
}

type ProgramStatusProps = {programId:ProgramId, programIndex:ProgramIndex, programError:ProgramErrorNullable}
function ProgramStatus({programId, programIndex, programError}:ProgramStatusProps) {
    const [selectedProgramIndex, setSelectedProgramIndex] = useSelectedProgramIndexState();
    const setSelectedProgramId = useSetSelectedProgramId();
    const setSelectedProgramError = useSetSelectedProgramError();
    const isSelected = selectedProgramIndex === programIndex;

    useEffect(() => {
        if(isSelected) {
            setSelectedProgramError(programError);
            setSelectedProgramId(programId);
        }    
    }, [isSelected, programError, programId, setSelectedProgramError, setSelectedProgramId])

    let color;
    if(programError) {
        if(isSelected) {
            color = 'red'
        } else {
            color = 'darkred'
        }
    } else {
        if(isSelected) {
            color = 'green'
        } else {
            color = 'darkgreen'
        }
    }

    const onClick = () => setSelectedProgramIndex(programIndex)

    return <div onClick={onClick} css={css({
        height: statusDotSize,
        width: statusDotSize,
        backgroundColor: color,
        borderRadius: "50%",
        display: "inline-block",
        marginRight: statusDotMargin,
        alignSelf: 'center'
    })}></div>

}

type ProgramInfoProps = {programId:ProgramId, programIndex:ProgramIndex, programError:ProgramErrorNullable}
function ProgramInfo({programId, programError, programIndex}:ProgramInfoProps) {
    return <div css={css(flexRow, {
        gridColumn: "1 / 3",
    })}>
        <ProgramStatus programId={programId} programIndex={programIndex} programError={programError}/>
        <ProgramName programId={programId}/>
    </div>
}

type ProgramProps = {setupId:SetupId, programId:ProgramId, programIndex:ProgramIndex}
function Program({setupId, programId, programIndex}:ProgramProps) {

    const code = useProgramCode(programId);
    const [programError, setProgramError] = useState<ProgramErrorNullable>(null);
    const [runtime, setRuntime] = useState<Runtime>()
    const [actions, setActions] = useState<ActionList>([])

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
            if(runtime) {
                runtime.setCode(code)
                setActions(runtime.actions);
            }
        }, 
        [code] // eslint-disable-line react-hooks/exhaustive-deps
        // we know that runtime will never change, only need to track code changes
    )

    return <>
        <ProgramInfo programId={programId} programError={programError} programIndex={programIndex}/>
        {actions.map(action => 
            <Action key={action.name} setupId={setupId} programId={programId} action={action}/>
        )}
    </>
    
}

const setupCSS = css(
    {
        gridTemplateColumns: ["min-content"],
        display: "grid",
        overflow: "auto",
        width: "100%"
    }
)

export function Setup() {
    const setupId = useCurrentSetupId();
    const programIds = useSetupProgramIdList(setupId);
    return <div css={setupCSS}>
        {programIds.map((programId, programIndex) => 
            <Program key={programIndex} setupId={setupId} programId={programId} programIndex={programIndex}/>
        )}
    </div>
}

