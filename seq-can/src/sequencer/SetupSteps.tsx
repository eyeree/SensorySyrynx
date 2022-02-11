/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { useEffect } from 'react';
import { arrayOf } from '../common/array';

import { flexRow, flexColumn } from '../common/css';
import { usePrevious } from '../common/previous';
import { ProgramId, useProgramActions, ProgramActionName, useProgramActionFunction } from '../state/program';
import { SetupStepCount, SetupStepIndex, useSetupStepStatusState, SetupId, useIsSetupStepActive, useCurrentSetupId, useSetupProgramIdList, useSetupStepCount } from '../state/setup';
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

type ProgramStepProps = {setupId: SetupId, programId:ProgramId, actionName:ProgramActionName, stepIndex:SetupStepIndex}

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

function ActionStep(props:ProgramStepProps) {

    const [enabled, setEnabled] = useSetupStepStatusState(props);
    const active = useIsSetupStepActive(props.stepIndex);
    const wasActive = usePrevious(active);
    const action = useProgramActionFunction(props);

    const css = getProgramStepCSS(active, enabled);

    const onClick = () => setEnabled(!enabled);

    useEffect(() => {
        if(enabled && active && !wasActive && action) {
            action(props.stepIndex);
        }
    })

    return <div css={css} onClick={onClick}/>

}

const programActionCSS = css(
    flexRow,
    {
    }
)

type ProgramActionProps = {setupId:SetupId, programId:ProgramId, actionName:ProgramActionName, stepCount:SetupStepCount}
function ProgramAction({setupId, programId, stepCount: steps, actionName}:ProgramActionProps) {
    return <div css={programActionCSS}>
        {arrayOf(steps, index => 
            <ActionStep key={index} setupId={setupId} programId={programId} actionName={actionName} stepIndex={index}/>
        )}
    </div>
}

const programActionsCSS = css(
    flexColumn,
    {
    }
)

type ProgramActionsProps = {setupId:SetupId, programId:ProgramId, stepCount:SetupStepCount}
function ProgramActions({setupId, programId, stepCount}:ProgramActionsProps) {
    const actions = useProgramActions(programId)
    return <div css={programActionsCSS}>
        {actions.map(actionName => 
            <ProgramAction key={actionName} setupId={setupId} programId={programId} actionName={actionName} stepCount={stepCount}/>
        )}
    </div>
}

const setupStepsCSS = css(
    flexColumn,
    {
    }
)

export function SetupSteps() {
    const setupId = useCurrentSetupId();
    const programIds = useSetupProgramIdList(setupId);
    const stepCount = useSetupStepCount(setupId);
    return <div css={setupStepsCSS}>
        {programIds.map(programId => 
            <ProgramActions key={programId} setupId={setupId} programId={programId} stepCount={stepCount}/>
        )}
    </div>
}

