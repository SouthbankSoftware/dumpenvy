/**
 * @Author: guiguan
 * @Date:   2017-03-29T11:04:43+11:00
 * @Last modified by:   guiguan
 * @Last modified time: 2018-07-16T13:23:52+10:00
 */

import {
  isArray,
  getId,
  isPrimitiveProperty,
  isPrimitive,
  isFunction,
  createObjectHandler,
  shallowClone,
  keys,
  isObjectRef,
} from './utils';

const NODUMP = '__nodump__';

function nodump(target, key, descriptor) {
  if (!target[NODUMP]) {
    target[NODUMP] = [];
  }

  target[NODUMP].push(key);

  return descriptor;
}

function dump(root, options = {}) {
  const serialized = {};
  const unprocessed = [];
  const identities = new Map();
  let id = 0;
  const key = getId(id);
  const handler = createObjectHandler(options.serializer);
  const debug = Boolean(options.debug);

  const serializer = function(key, value) {
    const result = handler(key, value);

    if (result instanceof Map) return { entries: [...result], __dump__: 'ES6Map' };

    if (result instanceof Set) return { values: [...result], __dump__: 'ES6Set' };

    return result;
  };

  if (root == null) return;

  serialized[key] = _dump(root, key, debug ? '' : undefined);

  for (const [obj, identifier, path] of unprocessed) {
    serialized[identifier] = _dump(obj, identifier, path);
  }

  return JSON.stringify(serialized);

  function _dump(obj, identifier, path) {
    if (!identities.has(obj)) identities.set(obj, identifier);

    const data = isArray(obj) ? obj : Object.keys(obj);
    return data.reduce(destruct(obj, path), isArray(obj) ? [] : {});
  }

  function destruct(obj, path) {
    const noDump = isArray(obj[NODUMP]) ? new Set(obj[NODUMP]) : null;

    return function(result, item, index) {
      const prop = isArray(result) ? index : item;

      if (noDump && noDump.has(prop)) return result;

      obj = shallowClone(obj);
      obj[prop] = serializer(prop, obj[prop]);

      if (isFunction(obj[prop])) return result;
      if (obj[prop] === undefined) return result;

      if (isPrimitiveProperty(obj, prop)) {
        if (debug) {
          console.log(`${path ? `${path}.` : ''}${prop}`);
        }
        result[prop] = obj[prop];
      } else {
        result[prop] = generateObjId(obj, prop, path);
      }

      return result;
    };
  }

  function generateObjId(obj, prop, path) {
    const value = obj[prop];
    let objId;

    if (!identities.has(value)) {
      id += 1;
      objId = getId(id);
      identities.set(value, objId);

      if (debug) {
        unprocessed.push([value, objId, `${path ? `${path}.` : ''}${prop}`]);
      } else {
        unprocessed.push([value, objId]);
      }
    } else {
      objId = identities.get(value);
    }

    return objId;
  }
}

function restore(data, options = {}) {
  const visited = new Set();
  const handler = createObjectHandler(options.deserializer);
  const postDeserializer = options.postDeserializer || (() => false);
  const source = JSON.parse(data);
  const keysList = keys(source);

  if (keysList.length === 0) return source;

  keysList.forEach((key) => {
    const obj = source[key];
    keys(obj)
      .filter(key => isObjectRef(obj[key]))
      .forEach((key) => {
        obj[key] = source[obj[key]]; // deserializer(key, source[obj[key]]);
      });
  });

  keys(source['@0']).forEach(createPropHandler(source['@0'], visited, deserializer));

  for (const item of visited) {
    if (item == null || isPrimitive(item) || Object.isFrozen(item)) continue;

    if (postDeserializer(item, visited, deserializer) !== false) continue;

    if (item instanceof Map) {
      const mapEntries = [...item.entries()];
      item.clear();

      for (const [key, value] of mapEntries) {
        const transformedKey = deserializer(0, key);
        const transformedValue = deserializer(1, value);

        item.set(transformedKey, transformedValue);
        if (!visited.has(transformedKey)) visited.add(transformedKey);
        if (!visited.has(transformedValue)) visited.add(transformedValue);
      }
    } else if (item instanceof Set) {
      const setEntries = [...item.entries()];
      item.clear();

      for (const [key, value] of setEntries) {
        const transformed = deserializer(key, value);
        item.add(transformed);
        if (!visited.has(transformed)) visited.add(transformed);
      }
    } else {
      keys(item).forEach(createPropHandler(item, visited, deserializer));
    }
  }

  function deserializer(key, value) {
    const result = handler(key, value);

    if (result != null && result.__dump__ === 'ES6Map') {
      return new Map(result.entries);
    }

    if (result != null && result.__dump__ === 'ES6Set') {
      return new Set(result.values);
    }

    return result;
  }

  return source['@0'];
}

function createPropHandler(item, visited, deserializer) {
  return function propertyHandler(prop) {
    const propDescriptor = Object.getOwnPropertyDescriptor(item, prop);

    if ('set' in propDescriptor && propDescriptor.set == null) return;
    if (propDescriptor.writable === false) return;

    // TODO if returned value didn't changed, don't assign it
    item[prop] = deserializer(prop, item[prop]);

    if (!visited.has(item[prop])) visited.add(item[prop]);
  };
}

module.exports = {
  dump,
  restore,
  nodump,
};
