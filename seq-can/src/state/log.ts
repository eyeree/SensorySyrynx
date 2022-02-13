import { AtomEffect } from 'recoil';

export const logAtom:AtomEffect<any> = ({onSet, node}) => {
    onSet((newValue, oldValue, isReset) => {
        newValue = newValue?.toString().replace('\n', '\\n').substring(0, 20);
        oldValue = oldValue?.toString().replace('\n', '\\n').substring(0, 20);
        console.log(`ATOM ${node.key} -- old: ${oldValue} -- new: ${newValue} -- isReset: ${isReset}`);
    })
}
