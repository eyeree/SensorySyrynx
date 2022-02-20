import { AtomEffect } from 'recoil';

export const logAtom:AtomEffect<any> = ({onSet, node}) => {
    onSet((newValue, oldValue, isReset) => {
        console.log(`ATOM ${node.key} -- old: ${oldValue} -- new: ${newValue} -- isReset: ${isReset}`);
    })
}
