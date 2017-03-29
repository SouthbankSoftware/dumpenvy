/**
 * @Author: guiguan
 * @Date:   2017-03-29T11:04:43+11:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-03-29T12:22:20+11:00
 */

import { expect } from 'chai';
import deepFreeze from 'deep-freeze-strict';
import D from 'dumpenvy';
import deepEqual from '@ekazakov/deep-equal';

describe('ES6 Collections', () => {
  describe('ES6 Map', () => {
    const map = new Map([['a', 1], ['b', 2], ['c', 3]]);
    const map1 = new Map([['f', 4], ['e', 5]]);
    const map2 = new Map([['k', 1]]);
    map.set('d', map1);
    map1.set('g', map2);
    const obj = deepFreeze({ m: map });

    it('Serialization', () => {
      const dumpedObj = JSON.stringify({
        '@0': { m: '@1' },
        '@1': { entries: '@2', __dump__: 'ES6Map' },
        '@2': ['@3', '@4', '@5', '@6'],
        '@3': ['a', 1],
        '@4': ['b', 2],
        '@5': ['c', 3],
        '@6': ['d', '@7'],
        '@7': { entries: '@8', __dump__: 'ES6Map' },
        '@8': ['@9', '@10', '@11'],
        '@9': ['f', 4],
        '@10': ['e', 5],
        '@11': ['g', '@12'],
        '@12': { entries: '@13', __dump__: 'ES6Map' },
        '@13': ['@14'],
        '@14': ['k', 1],
      });
      expect(D.dump(obj)).to.be.eql(dumpedObj);
    });

    it('Restore', () => {
      const restored = D.restore(D.dump(obj));
      expect(deepEqual(restored, obj)).to.be.ok;
    });
  });

  describe('ES6 Map with Map as key', () => {
    const map2 = new Map([['k', 1]]);
    const map1 = new Map([['f', 4], [map2, 5]]);
    const map = new Map([['a', 1], [map1, 2], [{ x: { z: 1 } }, 3]]);
    const obj = deepFreeze({ m: map });

    it('Serialization', () => {
      const dumpedObj = JSON.stringify({
        '@0': { m: '@1' },
        '@1': { entries: '@2', __dump__: 'ES6Map' },
        '@2': ['@3', '@4', '@5'],
        '@3': ['a', 1],
        '@4': ['@6', 2],
        '@5': ['@7', 3],
        '@6': { entries: '@8', __dump__: 'ES6Map' },
        '@7': { x: '@9' },
        '@8': ['@10', '@11'],
        '@9': { z: 1 },
        '@10': ['f', 4],
        '@11': ['@12', 5],
        '@12': { entries: '@13', __dump__: 'ES6Map' },
        '@13': ['@14'],
        '@14': ['k', 1],
      });
      expect(D.dump(obj)).to.be.eql(dumpedObj);
    });

    it('Restore', () => {
      const restored = D.restore(D.dump(obj));
      expect(deepEqual(restored, obj)).to.be.ok;
    });
  });

  describe('ES6 Set', () => {
    const set3 = new Set([6, 7]);
    const set2 = new Set([4, 5, set3]);
    const set = new Set([1, 2, 3, set2]);
    const obj = deepFreeze({ s: set });

    it('Serializer', () => {
      const dumpedObj = JSON.stringify({
        '@0': { s: '@1' },
        '@1': { values: '@2', __dump__: 'ES6Set' },
        '@2': [1, 2, 3, '@3'],
        '@3': { values: '@4', __dump__: 'ES6Set' },
        '@4': [4, 5, '@5'],
        '@5': { values: '@6', __dump__: 'ES6Set' },
        '@6': [6, 7],
      });
      expect(D.dump(obj)).to.be.eql(dumpedObj);
    });

    it('Restore', () => {
      const restored = D.restore(D.dump(obj));
      expect(deepEqual(restored, obj)).to.be.ok;
    });
  });
});
