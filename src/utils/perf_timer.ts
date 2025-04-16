import { performance } from "perf_hooks"

import logger from "./logger"

type TimerMap = Record<string, number>

export class PerfTimer {
  private timers: TimerMap = {}

  mark(label: string): void {
    this.timers[label] = performance.now()
  }

  duration(label: string): number {
    const now = performance.now()
    const start = this.timers[label]

    if (start === undefined) {
      logger.warn(`[PERF] No start mark found for "${label}"`)
      return 0
    }

    const time = now - start
    logger.info(`[PERF] ${label} took ${time.toFixed(2)}ms`)
    return time
  }

  reset(label?: string): void {
    if (label) {
      delete this.timers[label]
    } else {
      this.timers = {}
    }
  }
}
