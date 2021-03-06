/**
 * Created by tushar.mathur on 03/10/16.
 */


import {ITask} from '../types/ITask'
import {IScheduledTask} from '../types/IScheduledTask'

export class ScheduleTimeout implements IScheduledTask {
  closed: boolean
  private timer: number

  constructor (private task: ITask, private timeout: number) {
    this.closed = false
  }

  run () {
    this.timer = setTimeout(() => this.task(), this.timeout)
    return this
  }

  unsubscribe (): void {
    clearTimeout(this.timer)
    this.closed = true
  }
}
