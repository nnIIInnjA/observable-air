/**
 * Created by tushar.mathur on 10/10/16.
 */


import {IObservable} from '../types/core/IObservable'
import {IObserver} from '../types/core/IObserver'
import {IScheduler} from '../types/IScheduler'
import {ISubscription} from '../types/core/ISubscription'
import {CompositeSubscription} from '../lib/CompositeSubscription'


export class JoinValueObserver<T> implements IObserver<T> {
  constructor (private sink: IObserver<T>, private root: JoinObserver<T>) {
  }

  next (val: T): void {
    this.sink.next(val)
  }

  error (err: Error): void {
    this.sink.error(err)
  }

  complete (): void {
    this.root.subscriptionCompleted()
  }

}

export class JoinObserver<T> implements IObserver<IObservable<T>> {
  private count: number
  private sourceCompleted: boolean

  constructor (private sink: IObserver<T>, private scheduler: IScheduler, private subscriptions: CompositeSubscription) {
    this.sourceCompleted = false
    this.count = 0
  }

  subscriptionCompleted () {
    this.count--
    this.completeSink()
  }

  completeSink () {
    if (this.sourceCompleted && this.count === 0) {
      this.sink.complete()
    }
  }


  next (val: IObservable<T>): void {
    const joinValueObserver = new JoinValueObserver(this.sink, this)
    this.count++
    this.subscriptions.add(
      val.subscribe(joinValueObserver, this.scheduler)
    )
  }

  error (err: Error): void {
    this.sink.error(err)
  }

  complete (): void {
    this.sourceCompleted = true
    this.completeSink()
  }
}


export class JoinObservable<T> implements IObservable<T> {
  constructor (private source: IObservable<IObservable<T>>) {
  }

  subscribe (observer: IObserver<T>, scheduler: IScheduler): ISubscription {
    const subscription = new CompositeSubscription()
    subscription.add(
      this.source.subscribe(new JoinObserver(observer, scheduler, subscription), scheduler)
    )
    return subscription
  }
}

export function join <T> (source: IObservable<IObservable<T>>) {
  return new JoinObservable(source)
}
