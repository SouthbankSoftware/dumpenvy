/**
 * @Author: guiguan
 * @Date:   2017-03-29T11:04:43+11:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-03-29T12:20:22+11:00
 */

import { expect } from 'chai';
import deepFreeze from 'deep-freeze-strict';
import D from 'dumpenvy';
import { merge } from 'utils';

function dateSerializer(key, value) {
  if (value instanceof Date) return { value: value.toJSON(), __meta__: 'date' };

  return value;
}

function dateDeserializer(key, value) {
  if (value != null && value.__meta__ === 'date') return new Date(value.value);
  return value;
}

function squeeze(str) {
  return str.replace(/\s/ig, '');
}

function noop() {}

describe('Object litearals and arrays', () => {
  describe('Empty ojbect', () => {
    it('Serialize', () => {
      const dumpedObj = squeeze(JSON.stringify({ '@0': {} }));

      expect(D.dump({})).to.be.eql(dumpedObj);
    });

    it('Restore mpty object', () => {
      const obj = deepFreeze({});
      const json = D.dump(obj);

      expect(D.restore(json)).to.be.instanceOf(Object);
    });
  });

  describe('Simple ojbect', () => {
    const obj = deepFreeze({ x: 1, y: 'a', z: null, g: false });

    it('Serialize', () => {
      const dumpedObj = JSON.stringify({ '@0': { x: 1, y: 'a', z: null, g: false } });

      expect(D.dump(obj)).to.be.eql(dumpedObj);
    });

    it('Restore', () => {
      expect(D.restore(D.dump(obj))).to.be.eql(obj);
    });
  });

  describe('Composite object (level 2)', () => {
    const obj = deepFreeze({ x: 1, f: { z: 1 }, c: { y: 1 } });

    it('Serialize', () => {
      const dumpedObj = JSON.stringify({
        '@0': { x: 1, f: '@1', c: '@2' },
        '@1': { z: 1 },
        '@2': { y: 1 },
      });

      expect(D.dump(obj)).to.be.eql(dumpedObj);
    });

    it('Restore', () => {
      expect(D.restore(D.dump(obj))).to.be.eql(obj);
    });
  });

  describe('Composite object (level 3)', () => {
    const obj = deepFreeze({ x: 1, f: { z: 1, c: { y: 1 } } });

    it('Serialize', () => {
      const dumpedObj = JSON.stringify({
        '@0': { x: 1, f: '@1' },
        '@1': { z: 1, c: '@2' },
        '@2': { y: 1 },
      });

      expect(D.dump(obj)).to.be.eql(dumpedObj);
    });

    it('Restore', () => {
      expect(D.restore(D.dump(obj))).to.be.eql(obj);
    });
  });

  describe('Composite object (level 5)', () => {
    const obj5 = { d: 1, k: 2 };
    const obj4 = { a: 1, l: obj5 };
    const obj3 = { y: 1, m: obj4 };
    const obj2 = { z: 1, c: obj3 };
    const obj = deepFreeze({ x: 1, f: obj2 });

    it('Serialize', () => {
      const dumpedObj = JSON.stringify({
        '@0': { x: 1, f: '@1' },
        '@1': { z: 1, c: '@2' },
        '@2': { y: 1, m: '@3' },
        '@3': { a: 1, l: '@4' },
        '@4': { d: 1, k: 2 },
      });

      expect(D.dump(obj)).to.be.eql(dumpedObj);
    });

    it('Restore', () => {
      expect(D.restore(D.dump(obj))).to.be.eql(obj);
    });
  });

  describe('Simple composite object', () => {
    const obj = deepFreeze({ x: 1, y: 2, f: { z: 1 } });

    it('Serialize', () => {
      const dumpedObj = JSON.stringify({
        '@0': { x: 1, y: 2, f: '@1' },
        '@1': { z: 1 },
      });
      expect(D.dump(obj)).to.be.eql(dumpedObj);
    });

    it('Restore', () => {
      expect(D.restore(D.dump(obj))).to.be.eql(obj);
    });
  });

  describe('Recursive object', () => {
    const obj2 = { z: 1, c: null };
    const obj = { x: 1, f: obj2 };
    obj2.c = obj;
    obj.a = obj;

    deepFreeze(obj);

    it('Serialize', () => {
      const dumpedObj = JSON.stringify({
        '@0': { x: 1, f: '@1', a: '@0' },
        '@1': { z: 1, c: '@0' },
      });

      expect(D.dump(obj)).to.be.eql(dumpedObj);
    });

    it('Restore', () => {
      expect(D.restore(D.dump(obj))).to.be.eql(obj);
    });
  });

  describe('Empty array', () => {
    const arr = deepFreeze([]);

    it('Serialize', () => {
      const dumpedObj = JSON.stringify({
        '@0': [],
      });

      expect(D.dump(arr)).to.be.eql(dumpedObj);
    });

    it('Restore', () => {
      expect(D.restore(D.dump(arr))).to.be.eql(arr);
    });
  });

  describe('Simple array', () => {
    const arr = deepFreeze([1, 2, 3, 'abc', true, null]);

    it('Serialize primitive array', () => {
      const dumpedObj = JSON.stringify({ '@0': [1, 2, 3, 'abc', true, null] });

      expect(D.dump(arr)).to.be.eql(dumpedObj);
    });

    it('Restore', () => {
      expect(D.restore(D.dump(arr))).to.be.eql(arr);
    });
  });

  describe('Composite array', () => {
    const arr = deepFreeze([1, 2, { x: 1 }, 3]);

    it('Serialize', () => {
      const dumpedObj = JSON.stringify({
        '@0': [1, 2, '@1', 3],
        '@1': { x: 1 },
      });

      expect(D.dump(arr)).to.be.eql(dumpedObj);
    });

    it('Restore', () => {
      expect(D.restore(D.dump(arr))).to.be.eql(arr);
    });
  });

  describe('Composite array with recursive object', () => {
    const obj = { x: 1, y: { z: 'a', f: { d: 1 } } };
    const arr = [1, 2, obj, 3];
    obj.o = obj;
    obj.y.f.a = obj;

    deepFreeze(arr);

    it('Serialize', () => {
      const dumpedObj = JSON.stringify({
        '@0': [1, 2, '@1', 3],
        '@1': { x: 1, y: '@2', o: '@1' },
        '@2': { z: 'a', f: '@3' },
        '@3': { d: 1, a: '@1' },
      });

      expect(D.dump(arr)).to.be.eql(dumpedObj);
    });

    it('Restore', () => {
      expect(D.restore(D.dump(arr))).to.be.eql(arr);
    });
  });

  describe('Composite array (level 2)', () => {
    const arr = deepFreeze([1, 2, [3, 4], 5, [6]]);

    it('Serialize', () => {
      const dumpedObj = JSON.stringify({
        '@0': [1, 2, '@1', 5, '@2'],
        '@1': [3, 4],
        '@2': [6],
      });

      expect(D.dump(arr)).to.be.eql(dumpedObj);
    });

    it('Restore', () => {
      expect(D.restore(D.dump(arr))).to.be.eql(arr);
    });
  });

  describe('Composite array (level 4)', () => {
    const arr = deepFreeze([1, 2, [3, 4, [6, 7, { x: 2 }]], 8, [9]]);

    it('Serialize', () => {
      const dumpedObj = JSON.stringify({
        '@0': [1, 2, '@1', 8, '@2'],
        '@1': [3, 4, '@3'],
        '@2': [9],
        '@3': [6, 7, '@4'],
        '@4': { x: 2 },
      });

      expect(D.dump(arr)).to.be.eql(dumpedObj);
    });

    it('Restore', () => {
      expect(D.restore(D.dump(arr))).to.be.eql(arr);
    });
  });

  describe('Recursive array', () => {
    const arr = [1, 2, [3, 4], 8];
    arr[2].push(arr);
    arr.push(arr);
    deepFreeze(arr);

    it('Serialize', () => {
      const dumpedObj = JSON.stringify({
        '@0': [1, 2, '@1', 8, '@0'],
        '@1': [3, 4, '@0'],
      });

      expect(D.dump(arr)).to.be.eql(dumpedObj);
    });

    it('Restore', () => {
      expect(D.restore(D.dump(arr))).to.be.eql(arr);
    });
  });

  describe('Object with functions', () => {
    const obj = deepFreeze({ x: 1, y: noop, b: noop, c: 3 });

    it('Serialize', () => {
      const dumpedObj = JSON.stringify({
        '@0': { x: 1, c: 3 },
      });

      expect(D.dump(obj)).to.be.eql(dumpedObj);
    });
  });

  describe('Object with date', () => {
    const obj = deepFreeze({ x: 1, y: new Date(), c: 3 });

    it('Serialize date to empty object by default', () => {
      const dumpedObj = JSON.stringify({
        '@0': { x: 1, y: '@1', c: 3 },
        '@1': {},
      });

      expect(D.dump(obj)).to.be.eql(dumpedObj);
    });
  });

  describe('Custom serialization', () => {
    const obj = deepFreeze({ x: 1, y: new Date('2015-04-26T20:39:35.208Z'), c: 3 });

    it('Serialize date to string', () => {
      const dumpedObj = JSON.stringify({
        '@0': { x: 1, y: '@1', c: 3 },
        '@1': { value: '2015-04-26T20:39:35.208Z', __meta__: 'date' },
      });

      expect(D.dump(obj, { serializer: dateSerializer })).to.be.eql(dumpedObj);
    });

    it('Restore with custom deserializer', () => {
      const json = D.dump(obj, { serializer: dateSerializer });
      const restoredObj = D.restore(json, { deserializer: dateDeserializer });

      expect(restoredObj).to.be.eql(obj);
    });

    it('Ignore property if serializer return undefined', () => {
      function serializer(key, value) {
        if (key === 'y') return;

        return value;
      }

      const dumpedObj = JSON.stringify({ '@0': { x: 1, c: 3 } });

      expect(D.dump(obj, { serializer })).to.be.eql(dumpedObj);
    });
  });

  describe('Custom serialization with multi links', () => {
    const date = new Date('2015-04-26T20:39:35.208Z');
    const obj = { x: 1, y: date, c: 3, d: date, f: { g: date } };

    deepFreeze(obj);

    it('Serialieze', () => {
      const dumpedObj = JSON.stringify({
        '@0': { x: 1, y: '@1', c: 3, d: '@1', f: '@2' },
        '@1': { value: '2015-04-26T20:39:35.208Z', __meta__: 'date' },
        '@2': { g: '@1' },
      });

      expect(D.dump(obj, { serializer: dateSerializer })).to.be.eql(dumpedObj);
    });

    it('Restore', () => {
      const json = D.dump(obj, { serializer: dateSerializer });
      const restore = D.restore(json, { deserializer: dateDeserializer });
      expect(restore).to.be.eql(obj);
      expect(restore.y).to.be.equals(restore.d);
    });
  });

  describe('Custom serialization 2', () => {
    function Person(firstName, lastName) {
      this.firstName = firstName;
      this.lastName = lastName;

      Object.defineProperty(this, 'fullName', {
        get() {
          return this.firstName + ' ' + this.lastName;
        },
        enumerable: true,
      });
    }

    Person.prototype.toJSON = function() {
      return {
        data: {
          firstName: this.firstName,
          lastName: this.lastName,
        },
        __meta__: 'person',
      };
    };

    function personSerializer(key, value) {
      if (value instanceof Person) return value.toJSON();

      return value;
    }

    function personDeserializer(key, value) {
      if (value && value.__meta__ === 'person') {
        return Object.freeze(new Person(value.data.firstName, value.data.lastName));
      }

      return value;
    }

    const mikeMouse = new Person('Mike', 'Mouse');
    const johnSnow = new Person('John', 'Snow');
    const obj = deepFreeze({ m: mikeMouse, j: johnSnow, j2: johnSnow });

    it('Serialize custom object', () => {
      const dumpedObj = JSON.stringify({
        '@0': { m: '@1', j: '@2', j2: '@2' },
        '@1': { data: '@3', __meta__: 'person' },
        '@2': { data: '@4', __meta__: 'person' },
        '@3': { firstName: 'Mike', lastName: 'Mouse' },
        '@4': { firstName: 'John', lastName: 'Snow' },
      });

      expect(D.dump(obj, { serializer: personSerializer })).to.be.eql(dumpedObj);
    });

    it('Restore', () => {
      const json = D.dump(obj, { serializer: personSerializer });
      const restore = D.restore(json, { deserializer: personDeserializer });

      expect(restore.j).to.be.equals(restore.j2);
      expect(restore).to.be.eql(obj);
    });

    // TODO add tests for frozen objects and non writable
  });

  describe('Custom serialization 3', () => {
    const Rect = function(origin, size) {
      this.origin = origin;
      this.size = size;
    };

    const Point = function(x, y) {
      this.x = x;
      this.y = y;
    };

    const Size = function(width, height) {
      this.width = width;
      this.height = height;
    };

    const aRect = new Rect(new Point(0, 0), new Size(150, 150));
    const obj = deepFreeze({ rect: aRect });

    function serializer(key, value) {
      if (value instanceof Rect) return { data: merge({}, value), __meta__: 'rect' };

      if (value instanceof Point) return { data: merge({}, value), __meta__: 'point' };

      if (value instanceof Size) return { data: merge({}, value), __meta__: 'size' };

      return value;
    }

    function deserializer(key, value) {
      let d;
      if (value != null && value.data != null) {
        d = value.data;
        if (value.__meta__ === 'rect') return new Rect(d.origin, d.size);
        if (value.__meta__ === 'point') return new Point(d.x, d.y);
        if (value.__meta__ === 'size') return new Size(d.width, d.height);
      }

      return value;
    }

    it('Serialize', () => {
      const dumpedObj = JSON.stringify({
        '@0': { rect: '@1' },
        '@1': { data: '@2', __meta__: 'rect' },
        '@2': { origin: '@3', size: '@4' },
        '@3': { data: '@5', __meta__: 'point' },
        '@4': { data: '@6', __meta__: 'size' },
        '@5': { x: 0, y: 0 },
        '@6': { width: 150, height: 150 },
      });

      expect(D.dump(obj, { serializer })).to.be.eql(dumpedObj);
    });

    it('Restore', () => {
      const json = D.dump(obj, { serializer });
      expect(D.restore(json, { deserializer })).to.be.eql(obj);
    });
  });

  describe('Custom serialization Map', () => {
    const key1 = Object.freeze({ k: 1 });
    const key2 = Object.freeze({ k: 2 });
    const val1 = Object.freeze({ v: 1 });
    const val2 = Object.freeze({ v: 2 });
    const map2 = new Map([['a', 1], ['b', '2']]);
    const map = new Map([[key1, val1], [key2, val2], ['k3', 1], ['k4', val1], ['m', map2]]);
    const obj = deepFreeze({ data: map });

    function mapToJS(map) {
      let entry;
      const data = [];
      const iter = map.entries();

      while (((entry = iter.next()), !entry.done)) {
        data.push(entry.value);
      }

      return { entries: data, __meta__: 'Map' };
    }

    function mapSerializer(key, value) {
      if (value instanceof Map) return mapToJS(value);

      return value;
    }

    function mapDeserealizer(key, value) {
      if (value && value.__meta__ === 'Map') {
        value.entries.forEach((entry) => {
          entry.forEach((prop, index) => {
            if (prop && prop.__meta__ === 'Map') entry[index] = new Map(prop.entries);
          });
        });

        return new Map(value.entries);
      }
      return value;
    }

    it('Serialize', () => {
      const dumpedObj = JSON.stringify({
        '@0': { data: '@1' },
        '@1': { entries: '@2', __meta__: 'Map' },
        '@2': ['@3', '@4', '@5', '@6', '@7'],
        '@3': ['@8', '@9'],
        '@4': ['@10', '@11'],
        '@5': ['k3', 1],
        '@6': ['k4', '@9'],
        '@7': ['m', '@12'],
        '@8': { k: 1 },
        '@9': { v: 1 },
        '@10': { k: 2 },
        '@11': { v: 2 },
        '@12': { entries: '@13', __meta__: 'Map' },
        '@13': ['@14', '@15'],
        '@14': ['a', 1],
        '@15': ['b', '2'],
      });
      expect(D.dump(obj, { serializer: mapSerializer })).to.be.eql(dumpedObj);
    });

    // TODO deep comparision doesn't support maps. Need fix
    it('Restore', () => {
      const json = D.dump(obj, { serializer: mapSerializer });
      const restore = D.restore(json, { deserializer: mapDeserealizer });
      // console.log('json', json);
      // console.log('restore', restore);
      // console.log(obj);
      // expect(restore.j).to.be.equals(restore.j2);
      expect(restore).to.be.eql(obj);
    });
  });
});
