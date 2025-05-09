
import { useEffect, useRef } from 'react';

export type Callback = () => void;

export function useInterval(callback:Callback, delay:number) {
  const savedCallback = useRef<Callback>()

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current!();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
