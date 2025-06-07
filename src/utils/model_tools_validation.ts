import Ajv, { ValidateFunction } from "ajv"
import addErrors from "ajv-errors"
import addFormats from "ajv-formats"

import { createScopedLogger } from "../utils"

const log = createScopedLogger("JsonValidatio")

const ajv = new Ajv({ allErrors: true, strict: false })
addFormats(ajv)
addErrors(ajv)

export function validateToolResponse<T>(data: unknown, schema: any): T {
  let validate: ValidateFunction<T>
  try {
    validate = ajv.compile<T>(schema)
  } catch (error: unknown) {
    log.error(`${validateToolResponse<T>}`, "Invalid schema passed to validateToolResponse", {
      error,
    })
    throw error
  }

  const valid = validate(data)
  if (!valid) {
    log.error(`${validateToolResponse<T>}`, "Validation errors", {
      error: validate.errors,
    })
    throw new Error("Model response failed JSON Schema validation")
  }

  return data as T
}
