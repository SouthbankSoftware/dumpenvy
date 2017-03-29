/**
 * @Author: guiguan
 * @Date:   2017-03-29T13:29:29+11:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-03-29T16:28:36+11:00
 */

import { observable, isObservable, isBoxedObservable } from 'mobx';
import { dump, restore } from 'dumpenvy';
import { expect } from 'chai';

describe('DumpEnvy', () => {
  it('serialises and deserialises ObservableMap', () => {
    const testInput = {
      x: observable.map({ a: 1, b: observable.map({ m: 3 }) }),
    };

    const dumpedInput = dump(testInput);
    expect(dump(restore(dumpedInput))).to.eql(dumpedInput);
  });

  it('serialises and deserialises ObservableArray', () => {
    const testInput = {
      x: observable([1, observable([1, 2, 3])]),
    };

    const dumpedInput = dump(testInput);
    expect(dump(restore(dumpedInput))).to.eql(dumpedInput);
  });

  it('serialises and deserialises ObservableObject', () => {
    const testInput = {
      x: observable.shallowObject({ a: 1, b: { m: observable.shallowObject({ j: 888 }) } }),
    };

    const dumpedInput = dump(testInput);
    const restoredDumpedInput = restore(dumpedInput);
    expect(isObservable(restoredDumpedInput.b)).to.be.false;
    expect(dump(restoredDumpedInput)).to.eql(dumpedInput);
  });

  it('serialises and deserialises ObservableValue', () => {
    const testInput = {
      x: observable.shallowBox({ a: 1, b: observable.shallowBox('sss') }),
    };

    const dumpedInput = dump(testInput);
    const restoredDumpedInput = restore(dumpedInput);
    expect(isBoxedObservable(restoredDumpedInput.x)).to.be.true;
    expect(isBoxedObservable(restoredDumpedInput.x.get().a)).to.be.false;
    expect(isBoxedObservable(restoredDumpedInput.x.get().b)).to.be.true;
    expect(dump(restoredDumpedInput)).to.eql(dumpedInput);
  });

  it('serialises and deserialises mixed object', () => {
    const sharedObservable = observable('test');
    const testInput = {
      x: new Map([
        ['a', observable([1, 2, 3])],
        ['b', new Set([3, observable.map({ n: sharedObservable }), sharedObservable])],
      ]),
    };

    const dumpedInput = dump(testInput);
    const restoredDumpedInput = restore(dumpedInput);
    expect(dump(restoredDumpedInput)).to.eql(dumpedInput);
  });
});
