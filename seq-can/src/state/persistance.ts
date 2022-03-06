import { AtomEffect, SerializableParam } from 'recoil'
// import { recoilPersist } from 'recoil-persist'
// const { persistAtom } = recoilPersist({key: 'seq-can'})
// export { persistAtom }

type AtomEffectProps<T> = Parameters<AtomEffect<T>>[0]

export const persistAtom = <T>({onSet, trigger, setSelf, node}:AtomEffectProps<T>) => {

    const prefix = 'seqcan__'

    console.log("persistAtom", prefix, node.key, trigger)

    onSet((newValue, oldValue, isReset) => {
        console.log("persistAtom - onSet", prefix, node.key, newValue, oldValue, isReset)
    })

}

