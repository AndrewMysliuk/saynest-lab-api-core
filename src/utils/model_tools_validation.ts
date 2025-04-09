import Ajv, { ValidateFunction } from "ajv"
import addErrors from "ajv-errors"
import addFormats from "ajv-formats"

const ajv = new Ajv({ allErrors: true, strict: false })
addFormats(ajv)
addErrors(ajv)

export function validateToolResponse<T>(data: unknown, schema: any): T {
  let validate: ValidateFunction<T>
  try {
    validate = ajv.compile<T>(schema)
  } catch (e) {
    console.error("Invalid schema passed to validateToolResponse:", e)
    throw e
  }

  const valid = validate(data)
  if (!valid) {
    console.error("Validation errors:", validate.errors)
    throw new Error("Model response failed JSON Schema validation.")
  }

  return data as T
}
