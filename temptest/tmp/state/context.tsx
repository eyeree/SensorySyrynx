import * as model from './model'
import React from 'react'

export const createSettableContext = <T,>(defaultValue:T) => {

    type State = [ value: T, setValue: (value:T)=>void ]

    const Context = React.createContext<State|null>(null)

    const useContextState = () => {
        const state = React.useContext(Context)
        if (state === null) throw new Error(`context used without a provider`)
        return state
    }

    const useValue = () => useContextState()[0]
    const useSetValue = () => useContextState()[1]
    const useState = () => useContextState()

    const Provider = (props:{value?:T, children:React.ReactNode}) => {
        const [value, setValue] = React.useState<T>(props.value || defaultValue)
        return <Context.Provider value={[value, setValue]}>
            {props.children}
        </Context.Provider>
    }

    return Object.assign(Provider, {useValue, useSetValue, useState})

}

