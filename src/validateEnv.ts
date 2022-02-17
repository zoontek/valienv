import { EnvValidationError } from "./error";
import { Validator } from "./validators";

export const validateEnv = <
  Validators extends Record<string, Validator<unknown>>,
>({
  env,
  validators,
  prefix = "",
  overrides = {},
}: {
  env: Record<string, string | number | boolean | undefined>;
  validators: Validators;
  prefix?: string;
  overrides?: {
    [Key in keyof Validators]?: ReturnType<Validators[Key]>;
  };
}): Readonly<{
  [Key in keyof Validators]: Exclude<ReturnType<Validators[Key]>, undefined>;
}> => {
  const variables: Record<string, unknown> = {};

  const invalidVariables: string[] = [];
  const missingVariables: string[] = [];

  const validatorsKeys = Object.keys(validators);
  const overridesKeys = Object.keys(overrides).filter(
    (key) => validatorsKeys.indexOf(key) !== -1, // only keep keys from validators
  );

  overridesKeys.forEach((key) => {
    variables[key] = overrides[key];
  });

  validatorsKeys.forEach((key) => {
    if (overridesKeys.indexOf(key) !== -1) {
      return; // skip overridden keys
    }

    const validator = validators[key];
    const value = env[prefix + key];

    if (typeof value === "undefined") {
      missingVariables.push(key);
      return;
    }

    if (typeof validator !== "undefined") {
      const parsed = validator(String(value));

      if (typeof parsed !== "undefined") {
        variables[key] = parsed;
      } else {
        invalidVariables.push(key);
      }
    }
  });

  if (invalidVariables.length > 0 || missingVariables.length > 0) {
    throw new EnvValidationError({ invalidVariables, missingVariables });
  }

  // @ts-expect-error
  return variables;
};
