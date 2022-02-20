import { AtomEffect, atomFamily, DefaultValue, selectorFamily, SerializableParam } from 'recoil'

export const persistAtomFamily = (name:string, key:SerializableParam):AtomEffect<any> => ({trigger, setSelf, onSet, node}) => {
    console.log("persistAtomFamily", key, trigger, node)
}

export const persistantAtomFamily = <TValue, TKey extends SerializableParam>(name:string, init:(key:TKey)=>TValue) => {
    return atomFamily<TValue, TKey>({
        key: name,
        default: key => {
            console.log("default value generated"); return init(key);
        },
        effects: key => [persistAtomFamily(name, key)]
    })
}

export const persistantState = <TValue, TKey extends SerializableParam>(name:string, init:(key:TKey)=>TValue) => {
    const _init = (key:TKey) => {
        const result = init(key);
        console.log('init', result);
        return result;
    }
    return selectorFamily<TValue, TKey>({
        key: name,
        get: (key:TKey) => {
            const path = getPath(name, key);
            console.log("get wrapper", path)
            return ({}) => {
                console.log("get", path);
                const existing = read<TValue>(path);
                return existing === null ? _init(key) : existing;
            }
        },
        set: (key:TKey) => {
            const path = getPath(name, key);
            return ({}, value:TValue|DefaultValue) => {
                if(value instanceof DefaultValue) {
                    remove(path);
                } else {
                    write(path, value)
                }
            }
        }
    })
}

function getPath<TKey extends SerializableParam>(name:string, key:TKey) {
    // function template(str, data) {
    //     data = data || {};
      
    //     str.match(/{{(.+?)}}/g).forEach(function(key) {
    //      str = str.replace(key, data[key.replace('{{','').replace('}}', '')]);
    //     });
    //     return str;
    //   }
    return `${name}__${JSON.stringify(key)}`;
}

const storage = window.localStorage;

function read<T>(path:string):T|null {
    const item = storage.getItem(path);
    console.log("READ", path, "->", item);
    return item ? JSON.parse(item) as T : null;
}

function write<T>(path:string, value:T) {
    const item = JSON.stringify(value);
    console.log("WRITE", path, "<-", item);
    storage.setItem(path, item);
}

function remove(path:string) {
    console.log("REMOVE", path);
    storage.removeItem(path);
}
