import { Dispatch, SetStateAction, useCallback, useState, useRef, useLayoutEffect } from 'react';

type Parser<T> = (val: string) => T;
type Setter<T> = (val: T) => string;

const isFunction = <T>(value: any): value is (prevState: T) => T =>
  typeof value === 'function';

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  parser: Parser<T> = JSON.parse,
  setter: Setter<T> = JSON.stringify
): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? parser(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: SetStateAction<T>) => {
    try {
      const valueToStore = isFunction(value) ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, setter(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}
