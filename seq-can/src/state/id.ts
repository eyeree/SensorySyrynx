// https://zelark.github.io/nano-id-cc/ ==> At 100 IDs per hour ~148 years needed, in order to 
// have a 1% probability of at least one collision. If/when multi-user, will be in the scope of
// an user, so no increased probability.
import { customAlphabet } from 'nanoid'
export const newId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10)
