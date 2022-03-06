import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { atom, atomFamily, useRecoilCallback, useRecoilState, useRecoilValue } from "recoil"

// https://zelark.github.io/nano-id-cc/ ==> At 100 IDs per hour ~148 years needed, in order to 
// have a 1% probability of at least one collision. If/when multi-user, will be in the scope of
// an user, so no increased probability.
import { customAlphabet } from 'nanoid'
export const newId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10)

export type PropChildren = {children?: ReactNode}

export type DataComponentFunction = (...args:any[]) => JSX.Element
export type DataComponent = DataComponentFunction 

export type ComponentAttributes = { 
    isDataComponent: true 
}

export type StringComponentProps = {}

export type StringComponentOptions = { 
    maxLength?: number, 
    default?: number 
}

export type StringComponentFunction = (props:StringComponentProps) => JSX.Element
export type StringComponentAttributes = ComponentAttributes & {
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
export type NumberComponent = NumberComponentFunction & ComponentAttributes & {

}

export const Number = (options?: NumberComponentOptions):NumberComponent => {
    const ComponentFunction = (props?:NumberComponentProps) => <div>number - {JSON.stringify(options)}</div>
    const componentProperties = {isDataComponent:true} as const
    const component = Object.assign(ComponentFunction, componentProperties)
    return component
}

export type ListComponentProps = PropChildren & {
}

export type ListComponentOptions = {}

export type ListComponentFunction = (props:ListComponentProps) => JSX.Element
export type ListComponent<TItem extends DataComponent> = ListComponentFunction & ComponentAttributes & {
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
export type EntityComponent<TProperties extends EntityPropertyMap> = EntityComponentFunction & ComponentAttributes & {
    +readonly [Property in keyof TProperties]: TProperties[Property]
}

const resolve = <T,>(v:T|(()=>T)) => v instanceof Function ? v() : v

export const Entity = <TProperties extends EntityPropertyMap>(properties: TProperties, options?: EntityComponentOptions) => {
    
    type AtomId = string
    type AtomState = {entityId:string|null}
    const atomId = newId() // TODO: I WANT NAMES!
    console.log("Entity", atomId);
    const stateAtom = atomFamily<AtomState, AtomId>({key: atomId, default: {entityId:null}})

    type ContextId = string
    type ContextState = ContextId
    const Context = createContext<ContextState>("")

    const ComponentFunction = (props:EntityComponentProps) => {
        const _newId = newId()
        const [contextId,] = useState(_newId)
        const [state, setState] = useRecoilState(stateAtom(contextId))
        console.log("Entity", atomId, contextId, "ComponentFunction", state, props.id, _newId);
        // TODO: initialization of id is delayed... fix that somehow? use Suspend or something?
        useEffect(() => {
            console.log("Entity", atomId, contextId, "ComponentFunction", "useEffect", state, props.id);
            setState({...state, entityId:props.id ?? null})
        }, []) // eslint-disable-line react-hooks/exhaustive-deps
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

const ToDoItem = Entity({
    Title: String()
})

const Nested = () => {
    console.log("Nested");
    const setId = ToDoItem.useSetId()
    const onClick = () => setId("bar")
    return <div onClick={onClick}>Click</div>
}

export const Example = () => {
    console.log("Example");
    
    return <ToDoItem id={"foo-bar"}>
        <Nested/>
    </ToDoItem>

}

