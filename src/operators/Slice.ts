/**
 * Created by tushar.mathur on 27/09/16.
 */

import {IObservable} from '../types/core/IObservable'
import {IObserver} from '../types/core/IObserver'
import {ISubscription} from '../types/core/ISubscription'
import {IScheduler} from '../types/IScheduler'

class SliceObserver<T> implements IObserver<T> {
  closed: boolean
  private index: number
  private subscription: ISubscription

  constructor (private from: number,
               private total: number,
               private sink: IObserver<T>) {
    this.closed = false
    this.index = 0
  }

  start (subscription: ISubscription) {
    this.subscription = subscription
  }

  next (value: T): void {
    const diff = this.index++ - this.from
    if (diff >= 0 && diff < this.total) {
      this.sink.next(value)
    }
    if (diff + 1 === this.total) this.end()
  }

  private end () {
    this.subscription.unsubscribe()
    this.complete()
  }

  complete (): void {
    if (this.closed) return
    this.sink.complete()
    this.closed = true
  }

  error (error: Error): void {
    if (this.closed) return
    this.sink.error(error)
  }
}

export class SliceObservable<T> implements IObservable<T> {
  constructor (private start: number, private total: number, private source: IObservable<T>) {
  }

  subscribe (observer: IObserver<T>, scheduler: IScheduler): ISubscription {
    const sliceObserver = new SliceObserver(this.start, this.total, observer)
    const subscription = this.source.subscribe(sliceObserver, scheduler)
    sliceObserver.start(subscription)
    return subscription
  }

}

export function slice<T> (start: number, count: number, source: IObservable<T>): IObservable<T> {
  return new SliceObservable(start, count, source)
}
