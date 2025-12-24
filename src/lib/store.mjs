import {writable} from "svelte/store";
import {name as projectName} from "../../package.json" with {type: "json"};

const cache = new Map;

export function getStore(name, default_) {
  if (cache.has(name)) return cache.get(name);
  
  const store = writable(
    parseJSON(localStorage.getItem(`${projectName}/${name}`)) ?? default_
  );
  store.subscribe(value => 
    localStorage.setItem(`${projectName}/${name}`, JSON.stringify(value))
  );
  
  cache.set(name, store);
  return store;
}

function parseJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    // pass
  }
}
