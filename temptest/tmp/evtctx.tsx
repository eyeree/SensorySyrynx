
import { Box, Button, Grid, TextField } from "@mui/material"
import { ChangeEvent, createContext, ReactElement, ReactNode, useContext, useEffect, useState } from "react"
import { atom, atomFamily, RecoilState, SerializableParam, SetterOrUpdater, useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from "recoil";
import { newId } from "./id";
import reactElementToJSXString from 'react-element-to-jsx-string';
import * as React from 'react'


// const contextGreet = createContext("")
// const stateGreetProps = atomFamily({key: "Greet", default: {target: "partner", greeting: "howdy"}})
// const stateGreetResult = atomFamily({key: "GreetResult", default: ""})

// const componentGreet = (props:{target?:string, greeting?:string} & Children) => {
//     const [id, ] = useState(newId());
//     const setProps = useSetRecoilState(stateGreetProps(id));
//     console.log("componentGreet", id, props.target, props.greeting);
//     useEffect(() => setProps(props), [])
//     return <contextGreet.Provider value={id}>{props.children}</contextGreet.Provider>
// }

// const Greet = Object.assign(componentGreet, {
//     useTrigger: () => {
//         const id = useContext(contextGreet);
//         const {target, greeting} = useRecoilValue(stateGreetProps(id));
//         const setResult = useSetRecoilState(stateGreetResult(id));
//         console.log("Greet.useTrigger wrapper", id, target, greeting)
//         return () => {
//             console.log("Greet.useTrigger", id, target, greeting);
//             setResult(`${greeting} ${target}!`)
//         }
//     },
//     useResult: () => {
//         const id = useContext(contextGreet);
//         const result = useRecoilValue(stateGreetResult(id))
//         console.log("Greet.useResult", id, result);
//         return result;
//     }
// })

// function noChildren<T>(props:T & Children):T {
//     const result = Object.assign({}, props)
//     delete result.children
//     return result
// }

// //         return (value: string | ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
// //             if(typeof value !== 'string') {
// //                 value = value.target.value
// //             }
// //             setValue(value);
// //         }

// type Converter<F,T> = (v:F)=>T

// function isObject(v:any):v is Object {
//     return typeof v === 'object'
// }

// const ChangeEventToString = (value:ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => value.target.value

// const NoConversion = <F,T>(value:F) => value as unknown as T

// const converted = <F,T>(converter:Converter<F,T>, setValue:SetterOrUpdater<T>) => 
//     (v:F) => setValue(converter(v))

// const useConvertedSetValue = <F,T>(state:RecoilState<T>, converter?:Converter<F,T>) => converter ? converted(converter, useSetRecoilState(state)) : useSetRecoilState(state)

// function globalState<T>(config:{name:string, default:T}) {

//     const state = atom<T>({key: config.name, default: config.default})

//     const componentFunction = () => {
//         const value = useRecoilValue(state);
//         return <>{value}</>
//     }

//     type Setter<T> = (v:T) => void

//     function useSetValue():Setter<T>
//     function useSetValue<F>(converter:Converter<F,T>):Setter<F>
//     function useSetValue<F>(converter?:Converter<F,T>):Setter<F> {
//         const setValue = useSetRecoilState(state);
//         return converter ? v => setValue(converter(v)) : setValue as unknown as Setter<F>
//     }

//     function useValue():T
//     function useValue<F>(converter:Converter<T,F>):F
//     function useValue<F>(converter?:Converter<T,F>):F {
//         const value = useRecoilValue(state)
//         return converter ? converter(value) : value as unknown as F
//     }

//     function useState():[T, Setter<T>]
//     function useState<F>(converter:Converter<T,F>):F
//     function useState<F>(converter?:Converter<T, F>):F {
//         const [value, setValue] = useRecoilState(state);
//         return converter ? 
//     }
    
//     const componentObject = Object.assign(componentFunction, {
//         useSetValue, useValue,
//         useState: () => useRecoilState(state),
//         useReset: () => useResetRecoilState(state),
//     })

//     return componentObject

// }

// function globalStateFamily<T, K extends SerializableParam>(config:{name:string, default:T|((k:K)=>T)}) {

//     const state = atomFamily<T, K>({key: config.name, default: config.default})

//     const componentFunction = (props:{key:K}) => {
//         const value = useRecoilValue(state(props.key));
//         return <>{value}</>
//     }

//     const componentObject = Object.assign(componentFunction, {
//         useSetValue: (key:K) => useSetRecoilState(state(key)),
//         useValue: (key:K) => useRecoilValue(state(key)),
//         useState: (key:K) => useRecoilState(state(key)),
//         useReset: (key:K) => useResetRecoilState(state(key))
//     })

//     return componentObject

// }

// function contextState<T>(config:{name:string, default:T|(()=>T)}) {

//     const context = createContext("");
//     const state = atomFamily<T, string>({key: config.name, default: config.default})

//     const componentFunction = () => {
//         const value = useRecoilValue(state(useContext(context)));
//         return <>{value}</>
//     }

//     const contextFunction = (props:{value?:T} & Children) => {
//         const setValue = useSetRecoilState(state(useContext(context)));
//         useEffect(() => {
//             if(props.value) {
//                 setValue(props.value);
//             }
//         }, [])
//         return <context.Provider value={newId()}>{props.children}</context.Provider>
//     } 

//     const componentObject = Object.assign(componentFunction, {
//         useSetValue: () => useSetRecoilState(state(useContext(context))),
//         useValue: () => useRecoilValue(state(useContext(context))),
//         useState: () => useRecoilState(state(useContext(context))),
//         useReset: () => useResetRecoilState(state(useContext(context))),
//         Context: contextFunction
//     })
    
//     return componentObject
// }

// type FamilyDefaultFactory<T, K> = (k:K)=>T
// type FamilyDefault<T, K> = T | FamilyDefaultFactory<T, K>

// function isFamilyDefaultFactory<T, K>(v:FamilyDefault<T, K>): v is FamilyDefaultFactory<T, K> {
//     return typeof v === 'function';
// }

// function contextStateFamily<T, K extends SerializableParam>(config:{name:string, default:T|((k:K)=>T)}) {

//     type KeyObject = {id:string, key:K}
//     const context = createContext("");
//     const state = atomFamily<T, KeyObject>(
//         {
//             key: config.name, 
//             default: ({key}) => {
//                 if(isFamilyDefaultFactory(config.default)) {
//                     return config.default(key)
//                 } else {
//                     return config.default;
//                 }
//             }
//         }
//     );
//     const useStateFor = (key:K) => state({key, id:useContext(context)})

//     const componentFunction = (props:{key:K}) => {
//         const value = useRecoilValue(useStateFor(props.key));
//         return <>{value}</>
//     }

//     const contextFunction = (props:{key:K, value?:T} & Children) => {
//         const setValue = useSetRecoilState(useStateFor(props.key));
//         useEffect(() => {
//             if(props.value) {
//                 setValue(props.value);
//             }
//         }, [])
//         return <context.Provider value={newId()}>{props.children}</context.Provider>
//     } 

//     const componentObject = Object.assign(componentFunction, {
//         useSetValue: (key:K) => useSetRecoilState(useStateFor(key)),
//         useValue: (key:K) => useRecoilValue(useStateFor(key)),
//         useState: (key:K) => useRecoilState(useStateFor(key)),
//         useReset: (key:K) => useResetRecoilState(useStateFor(key)),
//         Context: contextFunction
//     })

//     return componentObject

// }

// const Thing = contextState({name:"Thing", default: "world"})
// const Greeting = globalState({name:"Greeting", default: "hello"})

// export function Example() {
//     return <Grid container>        
//         <Grid item container>
//             <span>Greeting:</span>
//             <TextField value={Greeting.useValue()} onChange={Greeting.useSetValue(ChangeEventToString)}/>
//         </Grid>
//         <Grid item>
//             <Thing.Context>
//                 <span>Thing 1:</span>
//                 <TextField value={Thing.useValue()} onChange={Thing.useSetValue(ChangeEventToString)}/>
//                 <Greet target={Thing.useValue()} greeting={Greeting.useValue()}/>
//             </Thing.Context>
//         </Grid>
//     </Grid>

// }

{/* <Greet target={Thing.useValue() greeting={Greeting.useValue()}}>
<TextField value={Thing.useValue()} onChange={Thing.useSetValue()}></TextField>
<TextField value={Greeting.useValue()} onChange={Greeting.useSetValue()}></TextField>
<Button variant="contained" onClick={Greet.useTrigger()}>Greet!</Button>
<Box>{Greet.useResult()}</Box>
</Greet>
</Thing>  */}

const Foo = {
    Bar: "bar"
}

export const {Bar} = Foo

function isConstructor(func:any) {
    return typeof func === 'function' && !!func.prototype && func.prototype.constructor === func;
}

export namespace data {

    export type Children = {children?: ReactNode}
    export type Child = Children   // TODO
    export type DataNode = ReactNode  // TODO

    const Spec = (props:Children) => <Box sx={{paddingLeft:3}}>{props.children}</Box>
    
    export const Entity = (props:Children) => <Spec>entity: {props.children}</Spec>
    export const String = (props:{maxLength?:number}) => <Spec>string - maxLength: {props.maxLength}</Spec>
    export const Number = (props:{min?:number, max?:number}) => <Spec>number - min: {props.min} - max: {props.max}</Spec>
    export const List   = (props:Child) => <Spec>list: {props.children}</Spec>

    export const ComponentFactoryArg = {Entity, String, Number, List}
    export type ComponentFactoryContract = typeof ComponentFactoryArg
    export type ComponentFactory = (contract:ComponentFactoryContract) => DataNode

    export const component = (factory:ComponentFactory) => {
        const spec:ReactNode = factory(ComponentFactoryArg)
        console.log("component", reactElementToJSXString(spec, {showFunctions:true}), spec);
        if(React.isValidElement(spec)) {
            const type:any = spec.type;
            if(typeof type === "function") {
                let nested
                if(isConstructor(type)) {
                    console.log("nested constructor", type.constructor.name)
                    nested = new type(spec.props)
                } else {
                    console.log("nested function", type.name)
                    nested = type(spec.props)
                }
                console.log("nested", nested)
            }

        }
        return () => <Spec>component: {spec}</Spec>;
    }

}



// export const Example = Program