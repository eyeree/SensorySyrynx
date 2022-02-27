
const resolve = <T,>(v:T|(()=>T)) => v instanceof Function ? v() : v