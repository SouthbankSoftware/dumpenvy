/**
 * @Author: guiguan
 * @Date:   2017-03-29T11:04:43+11:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-03-29T12:17:31+11:00
 */

export const isArray = Array.isArray;

export const merge = Object.assign;

export const keys = Object.keys;

export function isFunction(fn) {
  return typeof fn === 'function';
}

export function shellowClone(obj) {
  return isArray(obj) ? obj.slice() : merge({}, obj);
}

export function identity(key, value) {
  return value;
}

const regex = /^@\d{1,}$/i;

export function isObjectRef(key) {
  return regex.test(key);
}

export function getId(n) {
  return '@' + n;
}

export function isPrimitiveProperty(obj, prop) {
  if (prop != null) {
    return isPrimitive(obj[prop]);
  }
  return function(prop) {
    return isPrimitive(obj[prop]);
  };
}

export function isPrimitive(value) {
  return typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === null;
}

export function createObjectHandler(callback) {
  const memo = new Map();

  return isFunction(callback) ? objectHandler : identity;

  function objectHandler(key, value) {
    if (!memo.has(value)) memo.set(value, callback(key, value));

    return memo.get(value);
  }
}
