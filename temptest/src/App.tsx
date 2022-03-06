import './App.css';

import * as recoil from 'recoil'
import * as react from 'react';
import { logAtom } from './log';

/////////////////////////////////////////////// FRAMEWORK /////////////////////////////////////

export function arrayOf<T>(length: number, factory: (index: number) => T): Array<T> {
  return Array.from({ length }, (_, index) => factory(index))
}

type SettableContextOptions<T> = { default?: T | null }
export const createSettableContext = <T,>(options?: SettableContextOptions<T>) => {

  type State = [value: T | null, setValue: (value: T | null) => void]

  const Context = react.createContext<State | null>(null)

  const useContextState = () => {
    const state = react.useContext(Context)
    if (state === null) throw new Error(`context used without a provider`)
    return state
  }

  const useValue = () => {
    const [value,] = useContextState()
    if (value === null) throw new Error(`context value used when not set`)
    return value
  }

  const useSetValue = () => useContextState()[1]
  const useState = () => useContextState()

  const isValue = <T,>(value: T | null | undefined): value is T => value != null && value != undefined

  const defaultValue = options?.default ?? null

  const Provider = (props?: { value?: T | null, children: React.ReactNode, alt?: react.ReactNode }) => {
    const altContent = props?.alt ?? <></>
    const [value, setValue] = react.useState<T | null>(isValue(props?.value) ? props!.value : defaultValue)
    return <Context.Provider value={[value, setValue]}>
      {value === null ? altContent : props?.children}
    </Context.Provider>
  }

  return Object.assign(Provider, { useValue, useSetValue, useState })

}

class CreateSettableContextWrapper<T> {
  wrapped(e: T) {
    return createSettableContext<T>(e)
  }
}


export type FamilyParam = recoil.SerializableParam
export type FamilyParamTuple = FamilyParam[]

export type SettableContext<T,> = ReturnType<CreateSettableContextWrapper<T>["wrapped"]>

export type MappedContextTuple<P extends FamilyParamTuple> = { [K in keyof P]: SettableContext<P[K]> }

export const bindStateToContext = <T, P extends FamilyParamTuple>(state: RecoilStateFamily<T, P>, contexts: MappedContextTuple<P>) => {

  const useKey = () => contexts.map(context => context.useValue()) as P // TODO
  const useBoundRecoilState = () => state(useKey())

  const useValue = () => recoil.useRecoilValue(useBoundRecoilState())
  const useSetValue = () => recoil.useSetRecoilState(useBoundRecoilState())
  const useState = () => recoil.useRecoilState(useBoundRecoilState())

  return { useValue, useSetValue, useState }

}

export const ifDefaultValue = <T,>(value: T | recoil.DefaultValue, alt: T) => value instanceof recoil.DefaultValue ? alt : value

type Head<T extends any[]> = T extends [infer U, ...any[]] ? U : never;
type Tail<T extends any[]> = ((...args: T) => void) extends (head: any, ...tail: infer U) => any ? U : never;

const Indent = (props: { children: react.ReactNode, onClick?: () => void }) => {
  return <div onClick={props.onClick} style={{ paddingLeft: 25 }}>{props.children}</div>
}

export type RecoilStateFamily<T, P extends FamilyParam> = (param: P) => recoil.RecoilState<T>

export type PropertySelectorOptions<T extends {}, K extends keyof T, P extends FamilyParamTuple> = {
  objectState: RecoilStateFamily<T, P>
  key: string
  prop: K
  default: T[K]
}

export const createPropertySelector = <T extends {}, K extends keyof T, P extends FamilyParamTuple>(
  { key, prop, objectState, default: defaultValue }: PropertySelectorOptions<T, K, P>
) =>
  recoil.selectorFamily<T[K], P>({
    key: key,
    get: p => ({ get }) => get(objectState(p))[prop],
    set: p => ({ set }, value) => set(objectState(p), obj => ({ ...obj, [prop]: ifDefaultValue(value, defaultValue) }))
  })

export type IndexedItemSelectorOptions<E, T extends Array<E>, P extends FamilyParamTuple> = {
  arrayState: RecoilStateFamily<T, P>
  key: string
  default: E
}

export const createIndexedItemSelector = <E, T extends Array<E>, P extends FamilyParamTuple>(
  { key, arrayState, default: defaultValue }: IndexedItemSelectorOptions<E, T, P>
) =>
  recoil.selectorFamily<E, [number, ...P]>({
    key: key,
    get: ([index, ...p]) => ({ get }) => get(arrayState(p))[index],
    set: ([index, ...p]) => ({ set }, value) => set(arrayState(p), array => [...array.slice(0, index), ifDefaultValue(value, defaultValue), ...array.slice(index + 1)] as T) // TODO
  })

export type ItemMapKey = string | number
export type ItemMap<E> = { [k:ItemMapKey]: E }
  
export type MappedItemSelectorOptions<E, T extends ItemMap<E>, K extends keyof T, P extends FamilyParamTuple> = {
  objectState: RecoilStateFamily<T, P>
  key: string
  default: E
}

export const createMappedItemSelector = <E, T extends ItemMap<E>, K extends keyof T, P extends FamilyParamTuple>(
  { key, objectState, default: defaultValue }: MappedItemSelectorOptions<E, T, K, P>
) =>
  recoil.selectorFamily<E, [K, ...P]>({
    key: key,
    get: ([k, ...p]) => ({ get }) => get(objectState(p))[k],
    set: ([k, ...p]) => ({ set }, value) => set(objectState(p), obj => ({...obj, [k]:value}))
  })  

/////////////////////////// MODEL ////////////////////////////////

type Id = string
type Index = number

type Thing = {
  foo: string
}

type A = {
  name: string
  type: string
  things: Thing[]
}

////////////////////////// STATE /////////////////////////////////

const AState = recoil.atomFamily<A, [Id]>({
  key: "A",
  default: id => ({ name: `name ${id}`, type: `type ${id}`, things: [{ foo: `foo ${id}-0` }, { foo: `foo ${id}-1` }] }),
  effects: [logAtom]
})

const ANameState = createPropertySelector({
  key: "AName",
  prop: "name",
  objectState: AState,
  default: "default name"
})

const ATypeState = createPropertySelector({
  key: "AType",
  prop: "type",
  objectState: AState,
  default: "default type"
})

const AThingsState = createPropertySelector({
  key: "AThings",
  prop: "things",
  objectState: AState,
  default: []
})

const AThingsCountState = createPropertySelector({
  key: "AThingsCount",
  prop: "length",
  objectState: AThingsState,
  default: 0
})

const AThingsItemState = createIndexedItemSelector({
  key: "AThingsItem",
  arrayState: AThingsState,
  default: { foo: "default thing" }
})

const AThingsItemFooState = createPropertySelector({
  key: "AThingsItemFooState",
  objectState: AThingsItemState,
  prop: "foo",
  default: "default foo"
})


//////////////////////////// CONTEXT //////////////////////////////////

const AStateContext = createSettableContext<Id>()
const AThingsItemContext = createSettableContext<Index>()

//////////////////////////// BINDINGS ////////////////////////////////

const AName = bindStateToContext(ANameState, [AStateContext])
const AType = bindStateToContext(ATypeState, [AStateContext])
const AThings = bindStateToContext(AThingsState, [AStateContext])
const AThingsCount = bindStateToContext(AThingsCountState, [AStateContext])
const AThingsItem = bindStateToContext(AThingsItemState, [AThingsItemContext, AStateContext])
const AThingsItemFoo = bindStateToContext(AThingsItemFooState, [AThingsItemContext, AStateContext])

//////////////////////////// VIEWER ///////////////////////////////////

function ANameViewer() {
  const name = AName.useValue()
  console.log("ANameViewer", name)
  return <Indent>AName: {name}</Indent>
}

function ATypeViewer() {
  const type = AType.useValue()
  console.log("ATypeViewer", type)
  return <Indent>AType: {type}</Indent>
}

function AThingFooViewer() {
  const foo = AThingsItemFoo.useValue()
  console.log("AThingFooViewer", foo)
  return <Indent>foo: {foo}</Indent>
}

function AThingViewer() {
  console.log("AThingViewer")
  return <Indent>Thing: <AThingFooViewer /></Indent>
}

function AThingsViewer() {
  const count = AThingsCount.useValue()
  console.log("AThingsViewer", count)
  const things = arrayOf(count, index => <AThingsItemContext key={index} value={index}><AThingViewer /></AThingsItemContext>)
  return <Indent>{things}</Indent>
}

function Viewer() {

  console.log("Viewer")

  return <Indent>
    <ANameViewer />
    <ATypeViewer />
    <AThingsViewer />
  </Indent>
}

////////////////////////////////// CHANGER ////////////////////////////////////////

let next = 1

function ANameChanger() {

  console.log("ANameChanger")

  const setName = AName.useSetValue()
  const onClick = () => setName(`name ${next++}`)

  return <Indent onClick={onClick}>Change AName</Indent>

}

function ATypeChanger() {

  console.log("ATypeChanger")

  const setType = AType.useSetValue()
  const onClick = () => setType(`name ${next++}`)

  return <Indent onClick={onClick}>Change AType</Indent>

}

function AThingCreator() {

  console.log("AThingCreator");

  const setThings = AThings.useSetValue()
  const onClick = () => setThings(things => [...things, { foo: `foo ${next++}` }])

  return <Indent onClick={onClick}>Create AThing</Indent>

}

function AThingRemover() {

  console.log("AThingRemover");

  const setThings =AThings.useSetValue()
  const onClick = () => setThings(things => things.slice(1))

  return <Indent onClick={onClick}>Remove AThing</Indent>

}

function AThingChanger() {

  console.log("AThingChanger")

  const setThing = AThingsItem.useSetValue()
  const onClick = () => setThing(thing => ({ ...thing, foo: `foo ${next++}` }))

  return <Indent onClick={onClick}>Change Thing</Indent>

}

function AThingsChanger() {

  console.log("AThingsChanger")

  const count = AThingsCount.useValue()
  const thingChangers = arrayOf(count, index => <AThingsItemContext key={index} value={index}><AThingChanger /></AThingsItemContext>)

  return <div>{thingChangers}</div>

}

function Changer() {

  console.log("Changer")

  return <div style={{ cursor: 'pointer' }}>
    <ANameChanger />
    <ATypeChanger />
    <AThingCreator />
    <AThingRemover />
    <AThingsChanger />
  </div>

}

function IdContextChanger() {
  console.log("IdContextChanger")
  const setId = AStateContext.useSetValue()
  const onClick = () => setId(`id-${next++}`)
  return <Indent onClick={onClick}>Change Id</Indent>
}

function Wrapper(props: { children: react.ReactNode }) {
  console.log("Wrapper")
  return <div>{props.children}</div>
}

function App() {
  console.log("App")
  return (
    <recoil.RecoilRoot>
      <AStateContext alt={<IdContextChanger />}>
        <Wrapper>
          <IdContextChanger />
          <Changer />
          <Viewer />
        </Wrapper>
      </AStateContext>
    </recoil.RecoilRoot>
  );
}

export default App;

