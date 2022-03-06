import React, { useContext } from 'react'
import { RecoilState, SerializableParam, useRecoilState, useSetRecoilState } from 'recoil'
import { atomFamily, selectorFamily, useRecoilValue } from 'recoil'
import { Children } from '../../tmp/data'
import { createSettableContext } from './context'
import * as model from './model'

/*
Programs -> ProgramIdToProgramMap
  Programs.Selector id -> Program
    Program.Name -> string
    Program.Actions -> ActionIdToProgramMap
      Program.Actions.Selector id -> Action
        Action.Name -> string
Setups -> SetupIdToSetupMap
  Setups.Selector id -> Setup
    Setup.Name -> string
    Setup.Programs -> SetupProgramArray
      Setup.Programs.Selector index -> SetupProgram
        SetupProgram.ProgramId -> string
        SetupProgram.Enabled -> boolean
        SetupProgram.Collapsed -> boolean
        SetupProgram.ActionSteps -> ActionIdToStepArrayMap
          SetupProgram.ActionSteps.Selector id -> StepArray
            StepArray.Selector index -> Step
              Step.Enabled -> boolean
*/

type Primitive = undefined | null | boolean | number | symbol | string;

export type XXParam = string | number
//  | Primitive
//  | {toJSON: () => string}
//  | ReadonlyArray<XXParam>
//  | Readonly<{[key: string]: XXParam}>;

const test = <P extends XXParam, F extends (k:P)=>void >(f:F) => {
    return Object.assign(f, {foo:true})
}

const f = (k:string) => {}

const mm = test<string, typeof f>(f)


type RecoilFamily<T, P extends SerializableParam> = (param:P)=>RecoilState<T>

type FT<P extends SerializableParam, F> = F extends RecoilFamily<infer T, P> ? T : never

const withSelector = <T, P extends SerializableParam, F extends RecoilFamily<T,P>>(family:F) => {

    const Context = createSettableContext<P|null>(null)

    const useId = () => {
        const key = Context.useValue()
        if(key === null) throw new Error(`key is null`)
        return key
    }

    const useFamily = () => family(useId())
    const useState = () => useRecoilState(useFamily())
    const useValue = () => useRecoilValue(useFamily())
    const useSetValue = () => useSetRecoilState(useFamily())
    const useSetId = Context.useSetValue
    const useIdState = Context.useState
    
    const Selector = Object.assign(
        (props:Children & {id?:P}) => <Context value={props.id}>{props.children}</Context>,
        {useState, useValue, useSetValue, useId, useSetId, useIdState}
    )

    return Object.assign(family, {Selector})

}

export const bindFamily = <T, P extends SerializableParam, F extends RecoilFamily<T, P>>(useKey:()=>P|null, family:F) => {

    const useFamily = () => {
        const key = useKey()
        if(key === null) throw new Error(`key is null`)
        return family(key)
    }

    const useState = () => useRecoilState(useFamily())
    const useValue = () => useRecoilValue(useFamily())
    const useSetValue = () => useSetRecoilState(useFamily())

    return Object.assign(family, { useValue, useSetValue, useState } as const)

}

class Builder<T,P extends SerializableParam,  F extends RecoilFamily<T, P>> {

    constructor(private family:F) {}

    withSelector():Builder<T, P, F> {
        this.family = withSelector<T, P, F>(this.family)
        return this
    }

    bind(useKey:()=>P|null) {
        return bindFamily<T, P, F>(useKey, this.family)
    }

}

const build = <T,P extends SerializableParam, F extends RecoilFamily<T, P>>(family:F) => new Builder<T, P, F>(family)

// export const Programs = build(
//     atomFamily<model.Program, model.ProgramId>({
//         key: "Programs",
//         default: programId => ({
//             tags: [],
//             name: `program ${programId}`,
//             code: 'console.log("hello world")',
//             actions: {}
//         })
//     })
// ).withSelector()

export const Programs = withSelector(
    atomFamily<model.Program, model.ProgramId>({
        key: "Programs",
        default: programId => ({
            tags: [],
            name: `program ${programId}`,
            code: 'console.log("hello world")',
            actions: {}
        })
    })
)



export const ProgramName = bindFamily(Programs.Selector.useId, 
    selectorFamily<model.ProgramName, model.ProgramId>({
        key: "ProgramName",
        get: programId => ({get}) => get(Programs(programId)).name,
        set: programId => ({set}) => (name:string) => set(Programs(programId), program => ({...program, name}))
    })
)

export const ProgramActions = bindFamily(Programs.Selector.useId,
    withSelector(
        selectorFamily<model.ActionIdToActionMap, model.ProgramId>({
            key: "ProgramActions",
            get: programId => ({get}) => get(Programs(programId)).actions,
            set: programId => ({set}) => (actions:model.ActionIdToActionMap) => set(Programs(programId), program => ({...program, actions}))
        })
    )
)

export const ActionName = bindFamily(ProgramActions.Selector.useId,
    selectorFamily<model.ActionName, model.ActionId>({
        key: "ActionName",
        get: actionId => ({get}) => get(Programs(actionId)).name,
        set: actionId => ({set}) => (name:string) => set(Programs(actionId), program => ({...program, name}))
    })
)

export const Setups = atomFamily<model.Setup, model.SetupId>({
    key: "Setup",
    default: setupId => ({
        tags: [],
        name: `setup ${setupId}`,
        bpm: 120,
        stepCount: 8,
        programs: []
    })
})