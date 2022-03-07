import './App.css';

import * as recoil from 'recoil'
import * as react from 'react';
import { logAtom } from './log';

/////////////////////////////////////////////// FRAMEWORK /////////////////////////////////////

export function arrayOf<T>(length: number, factory: (index: number) => T): Array<T> {
  return Array.from({ length }, (_, index) => factory(index))
}

export type ElementType<T> = T extends Array<infer U> ? U : never
export type PropertyType<T> = T extends {[k:string]:infer U} ? U : never

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
  wrapped() {
    return createSettableContext<T>()
  }
}

export type SettableContext<T,> = ReturnType<CreateSettableContextWrapper<T>["wrapped"]>

export type FamilyParam = recoil.SerializableParam
export type FamilyParamTuple = FamilyParam[]

export type MappedContextTuple<P extends FamilyParamTuple> = { [K in keyof P]: SettableContext<P[K]> }

export const bindStateToContext = <T, P extends FamilyParamTuple>(state: StateFamily<T, P>, contexts: MappedContextTuple<P>) => {

  const useKey = () => contexts.map(context => context.useValue()) as P // TODO
  const useBoundRecoilState = () => state(useKey())

  const useValue = () => recoil.useRecoilValue(useBoundRecoilState())
  const useSetValue = () => recoil.useSetRecoilState(useBoundRecoilState())
  const useState = () => recoil.useRecoilState(useBoundRecoilState())

  return { useValue, useSetValue, useState }

}

class BindStateToContextWrapper<T, P extends FamilyParamTuple> {
  wrapped() {
    return bindStateToContext<T, P>(undefined as any, undefined as any)
  }
}

export type BoundState<T> = ReturnType<BindStateToContextWrapper<T, any>["wrapped"]>

export const bindReadOnlyStateToContext = <T, P extends FamilyParamTuple>(state: ReadOnlyStateFamily<T, P>, contexts: MappedContextTuple<P>) => {

  const useKey = () => contexts.map(context => context.useValue()) as P // TODO
  const useBoundRecoilState = () => state(useKey())

  const useValue = () => recoil.useRecoilValue(useBoundRecoilState())

  return { useValue }

}

class BindReadOnlyStateToContextWrapper<T, P extends FamilyParamTuple> {
  wrapped() {
    return bindReadOnlyStateToContext<T, P>(undefined as any, undefined as any)
  }
}

export type BoundReadOnlyState<T> = ReturnType<BindReadOnlyStateToContextWrapper<T, any>["wrapped"]>

export const ifDefaultValue = <T,>(value: T | recoil.DefaultValue, alt: T) => value instanceof recoil.DefaultValue ? alt : value

export const assertNotDefaultValue = <T,>(value: T | recoil.DefaultValue): T => {
  if (value instanceof recoil.DefaultValue) {
    throw new Error("reset not supported")
  }
  return value
}

export const assertNotUndefined = <T, K>(key: K, value: T | undefined, defaultValue: T | undefined): T => {
  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`key has no value: "${key}"`)
    }
    value = defaultValue
  }
  return value
}

const Indent = (props: { children: react.ReactNode, onClick?: () => void }) => {
  return <div onClick={props.onClick} style={{ paddingLeft: 25 }}>{props.children}</div>
}

export type StateFamily<T, P extends FamilyParam> = (param: P) => recoil.RecoilState<T>
export type ReadOnlyStateFamily<T, P extends FamilyParam> = (param: P) => recoil.RecoilValueReadOnly<T>

export type PropertySelectorOptions<T extends {}, K extends keyof T, P extends FamilyParamTuple> = {
  objectState: StateFamily<T, P>
  key: string
  prop: K
}

export const createPropertySelector = <T extends {}, K extends keyof T, P extends FamilyParamTuple>(
  { key, prop, objectState }: PropertySelectorOptions<T, K, P>
) =>
  recoil.selectorFamily<T[K], P>({
    key: key,
    get: p => ({ get }) => get(objectState(p))[prop],
    set: p => ({ set }, value) => set(objectState(p), obj => ({ ...obj, [prop]: assertNotDefaultValue(value) }))
  })

export type ListItemCountSelectorOptions<T extends any[], P extends FamilyParamTuple> = {
  arrayState: StateFamily<T, P>
  key: string
}

export const createListItemCountSelector = <T extends any[], P extends FamilyParamTuple>(
  { key, arrayState }: ListItemCountSelectorOptions<T, P>
) =>
  recoil.selectorFamily<number, P>({
    key: key,
    get: p => ({ get }) => get(arrayState(p)).length
  })

export type ListItemSelectorOptions<T extends any[], P extends FamilyParamTuple> = {
  arrayState: StateFamily<T, P>
  key: string,
  default?: ElementType<T>
}

export const createListItemSelector = <T extends any[], P extends FamilyParamTuple>(
  { key, arrayState, default: defaultValue }: ListItemSelectorOptions</*E, */T, P>
) =>
  recoil.selectorFamily<ElementType<T>, [number, ...P]>({
    key: key,
    get:
      ([index, ...p]) =>
        ({ get }) =>
          assertNotUndefined(index, get(arrayState(p))[index], defaultValue),
    set:
      ([index, ...p]) =>
        ({ set }, value) =>
          set(arrayState(p),
            array =>
              [...array.slice(0, index), assertNotDefaultValue(value), ...array.slice(index + 1)] as T  // TODO
          )
  })

export type ItemMap<E> = { [k: string]: E }

export type MapValueSelectorOptions<T extends ItemMap<any>, K extends Extract<keyof T, string>, P extends FamilyParamTuple> = {
  objectState: StateFamily<T, P>
  key: string,
  default?: T[K]
}

export const createMapValueSelector = <T extends ItemMap<any>, K extends Extract<keyof T, string>, P extends FamilyParamTuple>(
  { key, objectState, default: defaultValue }: MapValueSelectorOptions<T, K, P>
) =>
  recoil.selectorFamily<T[K], [K, ...P]>({
    key: key,
    get: ([k, ...p]) => ({ get }) => assertNotUndefined(k, get(objectState(p))[k], defaultValue),
    set: ([k, ...p]) => ({ set }, value) => set(objectState(p), o => ({ ...o, [k]: assertNotDefaultValue(value) }))
  })

export type MapKeysSelectorOptions<T extends ItemMap<any>, K extends Extract<keyof T, string>, P extends FamilyParamTuple> = {
  objectState: StateFamily<T, P>
  key: string
}

export const createMapKeysSelector = <T extends ItemMap<any>, K extends Extract<keyof T, string>, P extends FamilyParamTuple>(
  { key, objectState }: MapKeysSelectorOptions<T, K, P>
) =>
  recoil.selectorFamily<string[], P>({
    key: key,
    get: p => ({ get }) => Object.keys(get(objectState(p)))
  })

const packageRoot = <TProvider extends SettableContext<any>, TBinding extends BoundState<any>>(
  Provider: TProvider,
  binding: TBinding
) => {
  return Object.assign(binding, { Provider })
}

type ObjectPropertyMap = { [k: string]: any }

const packageObject = <TBinding extends BoundState<any>, TProperties extends ObjectPropertyMap>(
  objectBinding: TBinding,
  properties: TProperties
) => {
  return Object.assign(objectBinding, { ...properties })
}

const packageProperty = <TBinding extends BoundState<any>>(
  propertyBinding: TBinding
) => {
  return propertyBinding
}

const packageArrayProperty = <T extends any[], E extends ElementType<T>, TItem extends BoundState<E>>(
  Provider: SettableContext<number>,
  arrayBinding: BoundState<T>,
  countBinding: BoundReadOnlyState<number>,
  itemBinding: TItem,
) => {

  const useCount = countBinding.useValue
  const useItem = (index: number):E => arrayBinding.useValue()[index]

  const useAppendItem = () => {
    const setValue = arrayBinding.useSetValue()
    return (item: E) => setValue(value => [...value, item] as T)
  }

  const useInsertItem = () => {
    const setValue = arrayBinding.useSetValue()
    return (index: number, item: E) => setValue(value => [...value.slice(0, index), item, ...value.slice(index)] as T)
  }

  const useReplaceItem = () => {
    const setValue = arrayBinding.useSetValue()
    return (index: number, item: E) => setValue(value => [...value.slice(0, index), item, ...value.slice(index + 1)] as T)
  }

  const useSwapItems = () => {
    const setValue = arrayBinding.useSetValue()
    return (index1: number, index2: number) => setValue(value => {
      const newValue = [...value]
      const tmp = newValue[index1]
      newValue[index1] = newValue[index2]
      newValue[index2] = tmp
      return newValue as T
    })
  }

  const useRemoveItemAtIndex = () => {
    const setValue = arrayBinding.useSetValue()
    return (index: number) => setValue(value => [...value.slice(0, index), ...value.slice(index + 1)] as T)
  }

  const useRemoveItem = () => {
    const setValue = arrayBinding.useSetValue()
    return (item: E) => setValue(value => [...value.filter(_ => _ !== item)] as T)
  }

  const useRemoveAllItems = () => {
    const setValue = arrayBinding.useSetValue()
    return () => setValue(value => new Array<E>() as T)
  }

  const Item = Object.assign(itemBinding, { Provider })

  return Object.assign(arrayBinding, { 
    Item, useCount, useItem, useAppendItem, useInsertItem, useReplaceItem, useSwapItems, useRemoveItem, 
    useRemoveItemAtIndex, useRemoveAllItems 
  })

}

const packageMapProperty = <T extends ItemMap<any>, E extends PropertyType<T>, TItem extends BoundState<E>>(
  Provider: SettableContext<string>,
  objectBinding: BoundState<T>,
  keysBinding: BoundReadOnlyState<string[]>,
  itemBinding: TItem
) => {

  const useKeys = keysBinding.useValue

  const useItem = (key: string):E => objectBinding.useValue()[key]

  const useSetItem = () => {
    const setValue = objectBinding.useSetValue()
    return (k: string, item: E) => setValue(value => ({ ...value, [k]: item }))
  }

  const useRemoveItem = () => {
    const setValue = objectBinding.useSetValue()
    return (k: string) => setValue(value => {
      const newValue = { ...value }
      delete newValue[k]
      return newValue
    })
  }

  const useRemoveAllItems = () => {
    const setValue = objectBinding.useSetValue()
    return () => setValue(value => ({}) as T)
  }

  const Item = Object.assign(itemBinding, { Provider })

  return Object.assign(objectBinding, { Item, useKeys, useItem, useSetItem, useRemoveItem, useRemoveAllItems })

}
  
/////////////////////////// MODEL ////////////////////////////////

type IdType = string
type IndexType = number

type BarType = { x: number }

type BarMapType = { [k: string]: BarType }

type ThingType = {
  foo: string,
  bar: BarMapType
}

type AType = {
  name: string
  type?: string
  things: ThingType[]
}

////////////////////////// STATE /////////////////////////////////

const AState = recoil.atomFamily<AType, [IdType]>({
  key: "A",
  default: id => ({
    name: `name ${id}`,
    type: `type ${id}`,
    things: [
      {
        foo: `foo ${id}-0`,
        bar: { "x": { x: 10 } } as BarMapType
      },
      {
        foo: `foo ${id}-1`,
        bar: { "y": { x: 20 } } as BarMapType
      }
    ]
  }),
  effects: [logAtom]
})

const ANameState = createPropertySelector({
  key: "AName",
  prop: "name",
  objectState: AState
})

const ATypeState = createPropertySelector({
  key: "AType",
  prop: "type",
  objectState: AState
})

const AThingsState = createPropertySelector({
  key: "AThings",
  prop: "things",
  objectState: AState
})

const AThingsCountState = createListItemCountSelector({
  key: "AThingsCount",
  arrayState: AThingsState
})

const AThingsItemState = createListItemSelector({
  key: "AThingsItem",
  arrayState: AThingsState
})

const AThingsItemFooState = createPropertySelector({
  key: "AThingsItemFoo",
  objectState: AThingsItemState,
  prop: "foo"
})

const AThingsItemBarState = createPropertySelector({
  key: "AThingsItemBar",
  objectState: AThingsItemState,
  prop: "bar"
})

const AThingsItemBarKeysState = createMapKeysSelector({
  key: "AThingsItemBarKeys",
  objectState: AThingsItemBarState
})

const AThingsItemBarValueState = createMapValueSelector({
  key: "AThingsItemBarItem",
  objectState: AThingsItemBarState
})

const AThingsItemBarValueXState = createPropertySelector({
  key: "AThingsItemBarValueX",
  objectState: AThingsItemBarValueState,
  prop: "x"
})


//////////////////////////// CONTEXT //////////////////////////////////

const AStateContext = createSettableContext<IdType>()
const AThingsItemContext = createSettableContext<IndexType>()
const AThingsItemBarItemContext = createSettableContext<IdType>()

//////////////////////////// BINDINGS ////////////////////////////////

const ABinding = bindStateToContext(AState, [AStateContext])
const ANameBinding = bindStateToContext(ANameState, [AStateContext])
const ATypeBinding = bindStateToContext(ATypeState, [AStateContext])
const AThingsBinding = bindStateToContext(AThingsState, [AStateContext])
const AThingsCountBinding = bindReadOnlyStateToContext(AThingsCountState, [AStateContext])
const AThingsItemBinding = bindStateToContext(AThingsItemState, [AThingsItemContext, AStateContext])
const AThingsItemFooBinding = bindStateToContext(AThingsItemFooState, [AThingsItemContext, AStateContext])
const AThingsItemBarBinding = bindStateToContext(AThingsItemBarState, [AThingsItemContext, AStateContext])
const AThingsItemBarKeysBinding = bindReadOnlyStateToContext(AThingsItemBarKeysState, [AThingsItemContext, AStateContext])
const AThingsItemBarValueBinding = bindStateToContext(AThingsItemBarValueState, [AThingsItemBarItemContext, AThingsItemContext, AStateContext])
const AThingsItemBarValueXBinding = bindStateToContext(AThingsItemBarValueXState, [AThingsItemBarItemContext, AThingsItemContext, AStateContext])


//////////////////////////// PACKAGE ///////////////////////////////////

const A = packageRoot(AStateContext,
  packageObject(ABinding, {
    Name: packageProperty(ANameBinding),
    Type: packageProperty(ATypeBinding),
    Things: packageArrayProperty(AThingsItemContext, AThingsBinding, AThingsCountBinding,
      packageObject(AThingsItemBinding, {
        Foo: packageProperty(AThingsItemFooBinding),
        Bar: packageMapProperty(AThingsItemBarItemContext, AThingsItemBarBinding, AThingsItemBarKeysBinding,
          packageObject(AThingsItemBarValueBinding, {
            X: packageProperty(AThingsItemBarValueXBinding)
          })
        )
      })
    )
  })
)

//////////////////////////// VIEWER ///////////////////////////////////

function ANameViewer() {
  const name = A.Name.useValue()
  console.log("ANameViewer", name)
  return <Indent>AName: {name}</Indent>
}

function ATypeViewer() {
  const type = A.Type.useValue()
  console.log("ATypeViewer", type)
  return <Indent>AType: {type}</Indent>
}

function AThingFooViewer() {
  const foo = A.Things.Item.Foo.useValue()
  console.log("AThingFooViewer", foo)
  return <Indent>foo: {foo}</Indent>
}

function AThingBarItemViewer() {

  const item = A.Things.Item.Bar.Item.useValue()

  return <Indent>AThingBarItemViewer - x: {item.x}</Indent>

}

function AThingBarViewer() {
  const keys = A.Things.Item.Bar.useKeys()
  console.log("AThingBarViewer", keys)
  const bars = keys.map(key => <AThingsItemBarItemContext key={key} value={key}><AThingBarItemViewer /></AThingsItemBarItemContext>)
  return <Indent>{bars}</Indent>
}

function AThingViewer() {
  console.log("AThingViewer")
  return <Indent>
    Thing:
    <AThingFooViewer />
    <AThingBarViewer />
  </Indent>
}

function AThingsViewer() {
  const count = A.Things.useCount()
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

  const setName = A.Name.useSetValue()
  const onClick = () => setName(`name ${next++}`)

  return <Indent onClick={onClick}>Change AName</Indent>

}

function ATypeChanger() {

  console.log("ATypeChanger")

  const setType = A.Type.useSetValue()
  const onClick = () => setType(`name ${next++}`)

  return <Indent onClick={onClick}>Change AType</Indent>

}

function AThingCreator() {

  console.log("AThingCreator");

  const appendItem = A.Things.useAppendItem()
  const onClick = () => appendItem({ foo: `foo ${next++}`, bar: {} })

  return <Indent onClick={onClick}>Create AThing</Indent>

}

function AThingRemover() {

  console.log("AThingRemover");

  const removeItemAtIndex = A.Things.useRemoveItemAtIndex()
  const onClick = () => removeItemAtIndex(0)

  return <Indent onClick={onClick}>Remove AThing</Indent>

}

function AThingChanger() {

  console.log("AThingChanger")

  const setThing = A.Things.Item.useSetValue()
  const onClick = () => setThing(thing => ({ ...thing, foo: `foo ${next++}` }))

  return <Indent onClick={onClick}>Change Thing</Indent>

}

function AThingsChanger() {

  console.log("AThingsChanger")

  const count = A.Things.useCount()
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
  const setId = A.Provider.useSetValue()
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

