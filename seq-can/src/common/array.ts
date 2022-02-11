
export function arrayOf<T>(length:number, factory:(index:number) => T):Array<T> {
    return Array.from({length}, (_, index) => factory(index))
}
