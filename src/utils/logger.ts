import { createLogger, format, transports } from "winston"

const { combine, timestamp, errors, json } = format

export const logger = createLogger({
  level: "info",
  format: combine(timestamp(), errors({ stack: true }), json()),
  defaultMeta: { service: "api-core" },
  transports: [new transports.Console()],
})

export const createScopedLogger = (module: string) => {
  const baseLogger = logger.child({ module })

  const scopedLog = (level: "info" | "error" | "warn") => {
    return (method: string, message: string, dto?: Record<string, any>) => {
      baseLogger.log({
        level,
        severity: level.toUpperCase(),
        message,
        method,
        ...(dto || {}),
      })
    }
  }

  return {
    info: scopedLog("info"),
    error: scopedLog("error"),
    warn: scopedLog("warn"),
  }
}
