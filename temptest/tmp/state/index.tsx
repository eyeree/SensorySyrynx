import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { atomFamily, useRecoilCallback, useRecoilState, useRecoilValue } from "recoil"

// https://zelark.github.io/nano-id-cc/ ==> At 100 IDs per hour ~148 years needed, in order to 
// have a 1% probability of at least one collision. If/when multi-user, will be in the scope of
// an user, so no increased probability.
import { customAlphabet } from 'nanoid'
export const newId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10)

export type PropChildren = {children?: ReactNode}

export type DataComponentFunction = (...args:any[]) => JSX.Element
export type DataComponentAttributes = { isDataComponent: true }
export type DataComponent = DataComponentAttributes & DataComponentFunction 


export type StringComponentProps = {}

export type StringComponentOptions = { 
    maxLength?: number, 
    default?: number 
}

export type StringComponentFunction = (props:StringComponentProps) => JSX.Element
export type StringComponentAttributes = DataComponentAttributes & {
}
export type StringComponent = StringComponentFunction & StringComponentAttributes

export const String = (options?: StringComponentOptions):StringComponent => {
    const ComponentFunction = (props:StringComponentProps) => <div>string - {JSON.stringify(options)}</div>
    const componentProperties = {isDataComponent:true} as const
    const component = Object.assign(ComponentFunction, componentProperties)
    return component
}

export type NumberComponentProps = {}

export type NumberComponentOptions = { 
    minValue?: number, 
    maxValue?: number, 
    default?: number 
}

export type NumberComponentFunction = (props:NumberComponentProps) => JSX.Element
export type NumberComponent = NumberComponentFunction & DataComponentAttributes & {

}

export const Number = (options?: NumberComponentOptions):NumberComponent => {
    const ComponentFunction = (props?:NumberComponentProps) => <div>number - {JSON.stringify(options)}</div>
    const componentProperties = {isDataComponent:true} as const
    const component = Object.assign(ComponentFunction, componentProperties)
    return component
}

export type BooleanComponentProps = {}

export type BooleanComponentOptions = { 
    minValue?: number, 
    maxValue?: number, 
    default?: number 
}

export type BooleanComponentFunction = (props:NumberComponentProps) => JSX.Element
export type BooleanComponent = BooleanComponentFunction & DataComponentAttributes & {

}

export const Boolean = (options?: BooleanComponentOptions):BooleanComponent => {
    const ComponentFunction = (props?:BooleanComponentProps) => <div>number - {JSON.stringify(options)}</div>
    const componentProperties = {isDataComponent:true} as const
    const component = Object.assign(ComponentFunction, componentProperties)
    return component
}

export type ListComponentProps = PropChildren & {
}

export type ListComponentOptions = {}

export type ListComponentFunction = (props:ListComponentProps) => JSX.Element
export type ListComponent<TItem extends DataComponent> = ListComponentFunction & DataComponentAttributes & {
    Item:TItem
    idProvider: ()=>string
    indexProvider: ()=>number
}

export const List = <TItem extends DataComponent>(item: TItem, options?: ListComponentOptions):ListComponent<TItem> => {
    const ComponentFunction = (props:ListComponentProps) => {
        console.log("List - ComponentFunction", props);
        return <div>list - {JSON.stringify(options)} - {props.children}</div>
    }
    const componentProperties = {
        isDataComponent:true, 
        Item:item,
        idProvider: () => "FOO",
        indexProvider: () => 0
    } as const
    const component = Object.assign(ComponentFunction, componentProperties)
    return component
}

export type EntityComponentProps = PropChildren & {
    id?: string
}

export type EntityComponentOptions = {
    persistant?: boolean
}

export type EntityPropertyMap = {[propertyName:string]:DataComponent}

export type EntityComponentFunction = (props:EntityComponentProps) => JSX.Element
export type EntityComponent<TProperties extends EntityPropertyMap> = EntityComponentFunction & DataComponentAttributes & {
    +readonly [Property in keyof TProperties]: TProperties[Property]
}


export const Struct = <TProperties extends EntityPropertyMap>(properties: TProperties, options?: EntityComponentOptions) => {
    
    type AtomId = string
    type AtomState = {entityId:string|null}
    const atomId = newId() // TODO: I WANT NAMES!
    console.log("Entity", atomId);
    const stateAtom = atomFamily<AtomState, AtomId>({key: atomId, default: {entityId:null}})

    type ContextId = string
    type ContextState = ContextId
    const Context = createContext<ContextState>("")

    const ComponentFunction = (props:EntityComponentProps) => {
        const [contextId,] = useState(() => newId()) // Why am I seeing two different contextIds?
        const [state, setState] = useRecoilState(stateAtom(contextId))
        console.log("Entity", atomId, contextId, "ComponentFunction", state, props.id);
        // TODO: initialization of id is delayed... fix that somehow? use Suspend or something?
        useEffect(() => {
            console.log("Entity", atomId, contextId, "ComponentFunction", "useEffect", state, props.id);
            setState({...state, entityId:props.id ?? null})
        }, [props.id]) // eslint-disable-line react-hooks/exhaustive-deps
        return true // state.entityId 
            ? <Context.Provider value={contextId}>entity - {state.entityId} - {props.children}</Context.Provider> 
            : <></> 
    }

    const useStateAtom = () => stateAtom(useContext(Context))

    const useId = () => useRecoilValue(useStateAtom()).entityId
    const useSetId = () => {
        const contextId = useContext(Context)
        // console.log("Entity", atomId, contextId, "useSetId")
        return useRecoilCallback(
            ({set}) => {
                console.log("Entity", atomId, contextId, "useSetId", "useRecoilCallback")
                return (entityId:string) => {
                    console.log("Entity", atomId, contextId, "useSetId", "useRecoilCallback", "setId", entityId)
                    set(stateAtom(contextId), state => {
                        console.log("Entity", atomId, contextId, "useSetId", "useRecoilCallback", "setId", entityId, state)
                        return {...state, entityId}
                    })
                }
            }
        )
    }

    const componentProperties = {
        isDataComponent:true, 
        useId,
        useSetId,
        Context,
        ...properties   // TODO: wrap to bind to this context 
    } as const
    const component = Object.assign(ComponentFunction, componentProperties)
    return component
}

export type EnumOptions<T extends string> = {default:T}

export const Enum = <T extends string>(values:Array<T>, options?:EnumOptions<T>) => {

    const Values:{[K in T]:K} = values.reduce((res, key) => {
        res[key] = key
        return res
    }, Object.create(null))

    const useValue = ():T => "" as any  // TODO
    const useSetValue = () => (value:T) => {}   // TODO

    type ForEachEnumValueArgs = {value:T, isCurrentValue:boolean, selectValue:()=>void}
    type ForEachChildFunction = (args:ForEachEnumValueArgs) => React.ReactElement<any>
    const ForEachEnumValue = (props:{children:ForEachChildFunction}) => {
        return <></>   // TODO
    }

    const ComponentFunction = () => <></>   // TODO

    return Object.assign(
        ComponentFunction,
        {isDataComponent: true, Values, useValue, useSetValue, ForEachEnumValue } as const
    )

}