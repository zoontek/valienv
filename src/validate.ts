import { EnvValidationError } from "./errors";
import { Validator } from "./validators";

export const validate = <
  Validators extends Record<string, Validator<unknown>>,
>({
  env,
  validators,
  overrides = {},
}: {
  env: Record<string, string | undefined>;
  validators: Validators;
  overrides?: {
    [Key in keyof Validators]?: ReturnType<Validators[Key]>;
  };
}): Readonly<{
  [Key in keyof Validators]: Exclude<ReturnType<Validators[Key]>, undefined>;
}> => {
  const variables: Record<string, unknown> = {};
  const invalidVariables: string[] = [];

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
    const value = env[key];

    if (typeof validator !== "undefined") {
      const parsed = validator(value);

      if (typeof parsed !== "undefined") {
        variables[key] = parsed;
      } else {
        invalidVariables.push(key);
      }
    }
  });

  if (invalidVariables.length > 0) {
    throw new EnvValidationError(invalidVariables);
  }

  // @ts-expect-error
  return variables;
};
