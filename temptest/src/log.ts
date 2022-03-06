import { AtomEffect } from 'recoil';

export const logAtom:AtomEffect<any> = ({onSet, node}) => {
    onSet((newValue, oldValue, isReset) => {
        console.log(`ATOM ${node.key} -- isReset: ${isReset} -- old: ${JSON.stringify(oldValue)} -- new: ${JSON.stringify(newValue)}`);
    })
}
