
import React from 'react'
import { atomFamily, AtomFamilyOptions, DefaultValue, RecoilState, selectorFamily, SerializableParam, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'

export type RecoilStateFamily<T, P extends SerializableParam> = (param:P) => RecoilState<T>
export type ElementType<T> = T extends Array<infer U> ? U : never;

export const createSettableContext = <T,>(defaultValue:T|null = null) => {

    type State = [ value: T|null, setValue: (value:T|null)=>void ]

    const Context = React.createContext<State|null>(null)

    const useContextState = () => {
        const state = React.useContext(Context)
        if (state === null) throw new Error(`context used without a provider`)
        return state
    }

    const useValue = () => {
        const [ value, ] = useContextState()
        if (value === null) throw new Error(`context value used when not set`)
        return value
    } 

    const useSetValue = () => useContextState()[1]
    const useState = () => useContextState()

    const Provider = (props:{value?:T|null, children:React.ReactNode}) => {
        const [value, setValue] = React.useState<T|null>(props.value || defaultValue)
        return <Context.Provider value={[value, setValue]}>
            {value === null ? <></> : props.children}
        </Context.Provider>
    }

    return Object.assign(Provider, {useValue, useSetValue, useState})

}

class CreateSettableContextWrapper<T> {
    wrapped(e: T) {
      return createSettableContext<T>(e)
    }
}

export type SettableContext<T,> = ReturnType<CreateSettableContextWrapper<T>["wrapped"]>

export const bindStateToContext = <T, P extends SerializableParam>(state:RecoilStateFamily<T, P>, context:SettableContext<P>) => {

    const useBoundRecoilState = () => state(context.useValue())
    const useValue = () => useRecoilValue(useBoundRecoilState())
    const useSetValue = () => useSetRecoilState(useBoundRecoilState())
    const useState = () => useRecoilState(useBoundRecoilState())

    return {useValue, useSetValue, useState, useBoundRecoilState}

}

export const ifDefaultValue = <T,>(value:T|DefaultValue, alt:T) => value instanceof DefaultValue ? alt : value

export type BoundStateOptions<T, P extends SerializableParam> = {state:RecoilStateFamily<T, P>}

export const createBoundState = <T, P extends SerializableParam>({state}:BoundStateOptions<T, P>) => {

    const context = createSettableContext<P>()
    const binding = bindStateToContext(state, context)

    return Object.assign(binding, {Context: context})

}

class CreateBoundStateWrapper<T, P extends SerializableParam> {
    wrapped() {
      return createBoundState<T, P>({} as BoundStateOptions<T, P>)
    }
}

export type BoundState<T, P extends SerializableParam> = ReturnType<CreateBoundStateWrapper<T,P>["wrapped"]>
export type BoundAtomOptions<T, P extends SerializableParam> = AtomFamilyOptions<T, P> & {

}

export const createBoundAtom = <T, P extends SerializableParam>(options:BoundAtomOptions<T, P>) => {
    
    const state = atomFamily<T, P>(options)
    const binding = createBoundState({state})

    return binding

}

export type PropertySelectorOptions<T extends {}, K extends keyof T, P extends SerializableParam> = {
    objectState: RecoilStateFamily<T, P>
    key: string
    prop: K
    default: T[K]
}

export const createPropertySelector = <T extends {}, K extends keyof T, P extends SerializableParam>(
    { key, prop, objectState, default: defaultValue }: PropertySelectorOptions<T, K, P>
) =>
    selectorFamily<T[K], P>({
        key: key,
        get: p => ({get}) => get(objectState(p))[prop],
        set: p => ({set}, value) => set(objectState(p), obj => ({...obj, [prop]: ifDefaultValue(value, defaultValue)}))
    })

export type BoundPropertySelectorOptions<T extends {}, K extends keyof T, P extends SerializableParam> = {
    objectBinding: BoundState<T, P>
    key: string
    prop: K
    default: T[K]
}

export const createBoundPropertySelector = <T extends {}, K extends keyof T, P extends SerializableParam>(
    { key, prop, default: defaultValue, objectBinding }: BoundPropertySelectorOptions<T, K, P>
) => {

    const propertySelector = createPropertySelector({key, prop, objectState: objectBinding.state, default: defaultValue})
    const propertyBinding = bindStateToContext(propertySelector, objectBinding.Context)

    return propertyBinding

}

export type ArrayPropertySelectorOptions<T extends { [key in K]: E[] }, K extends keyof T, P extends SerializableParam, E> = {
    arrayState: RecoilStateFamily<T, P>
    key: string
    prop: K
    default: E
}

export const createArrayPropertySelector = <T extends { [key in K]: E[] }, K extends keyof T, P extends SerializableParam, E>(
    { key, prop, arrayState, default: defaultValue }: ArrayPropertySelectorOptions<T, K, P, E>
) =>
    selectorFamily<T[K], P>({
        key: key,
        get: p => ({get}) => get(objectState(p))[prop],
        set: p => ({set}, value) => set(objectState(p), obj => ({...obj, [prop]: ifDefaultValue(value, defaultValue)}))
    })

export type BoundArrayPropertySelectorOptions<T extends { [key in K]: E[] }, K extends keyof T, P extends SerializableParam, E> = {
    objectBinding: BoundState<T, P>
    key: string
    prop: K
    default: T[K]
}

export const createBoundArrayPropertySelector = <T extends { [key in K]: E[] }, K extends keyof T, P extends SerializableParam, E>(
    { key, prop, default: defaultValue, objectBinding }: BoundArrayPropertySelectorOptions<T, K, P, E>
) => {

    const propertySelector = createPropertySelector({key, prop, objectState: objectBinding.state, default: defaultValue})
    const propertyBinding = bindStateToContext(propertySelector, objectBinding.Context)

    const indexContext = createSettableContext<number>()

    const useItem = (index:number) => propertyBinding.useValue()[index]

    const useAppendItem = () => {
        const setValue = propertyBinding.useSetValue()
        return (item:ElementType<T[K]>) => setValue(value => [...value, item] as T[K])
    }

    const useInsertItem = () => {
        const setValue = propertyBinding.useSetValue()
        return (index:number, item:ElementType<T[K]>) => setValue(value => [...value.slice(0, index), item, ...value.slice(index)] as T[K])
    }

    const useReplaceItem = () => {
        const setValue = propertyBinding.useSetValue()
        return (index:number, item:ElementType<T[K]>) => setValue(value => [...value.slice(0, index), item, ...value.slice(index+1)] as T[K])
    }

    const useSwapItems = () => {
        const setValue = propertyBinding.useSetValue()
        return (index1:number, index2:number) => setValue(value => {
            const newValue = [...value]
            const tmp = newValue[index1]
            newValue[index1] = newValue[index2]
            newValue[index2] = tmp
            return newValue as T[K]     
        })
    }

    const useRemoveItem = () => {
        const setValue = propertyBinding.useSetValue()
        return (item:ElementType<T[K]>) => setValue(value => [...value.filter(_ => _ !== item)] as T[K])
    }

    return Object.assign(propertyBinding, {useItem, useAppendItem, useInsertItem, useReplaceItem, useRemoveItem, useSwapItems})

}

