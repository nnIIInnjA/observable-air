/**
 * Created by tushar.mathur on 28/09/16.
 */

import {IObservable} from '../types/IObservable';
import {ISubscription} from '../types/ISubscription';
import {IObserver} from '../types/IObserver';
import {IScheduler} from '../types/IScheduler';
import {DefaultScheduler} from '../schedulers/DefaultScheduler';
import {IDisposable} from '../types/IDisposable';
import {IDisposableRunner} from '../types/IDisposableRunner';

const unsubscribe = function () {
}
const subscription = {unsubscribe, closed: true};

class FromRunner <T> implements IDisposableRunner {
  disposed: boolean;
  private schedule: IDisposable;

  constructor (private array: Array<T>, private sink: IObserver<T>, private scheduler: IScheduler) {
    this.disposed = false
  }

  run () {
    this.schedule = this.scheduler.scheduleASAP(() => this.execute())
    return this
  }

  execute () {
    if (this.disposed) return
    for (var i = 0; i < this.array.length; ++i) {
      this.sink.next(this.array[i])
    }
    this.sink.complete()
  }

  dispose (): void {
    this.schedule.dispose()
    this.disposed = true
  }
}

export class FromObservable<T> implements IObservable<T> {
  constructor (private array: Array<T>, private scheduler: IScheduler) {
  }

  subscribe (observer: IObserver<T>): ISubscription {
    const runner = new FromRunner<T>(this.array, observer, this.scheduler)
    runner.run()
    return subscription
  }
}

export function fromArray<T> (list: Array<T>, scheduler: IScheduler = new DefaultScheduler()): IObservable<T> {
  return new FromObservable(list, scheduler)
}