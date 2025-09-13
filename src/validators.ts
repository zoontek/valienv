export type Validator<T> = (value: string | undefined) => T | undefined;

export type OptionalEnvValue<T> =
  | { defined: true; value: T }
  | { defined: false };

export const boolean: Validator<boolean> = (value = "") => {
  if (value === "true" || value === "1") {
    return true;
  }
  if (value === "false" || value === "0") {
    return false;
  }
};

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const email: Validator<string> = (value = "") => {
  if (EMAIL_REGEX.test(value)) {
    return value;
  }
};

export const number: Validator<number> = (value = "") => {
  const number = Number.parseFloat(value);

  if (!Number.isNaN(number)) {
    return number;
  }
};

export const port: Validator<number> = (value = "") => {
  const number = Number.parseFloat(value);

  if (
    !Number.isNaN(number) &&
    number % 1 === 0 &&
    number > 0 &&
    number < 65536
  ) {
    return number;
  }
};

export const string: Validator<string> = (value = "") => {
  if (value !== "") {
    return value;
  }
};

export const url: Validator<string> = (value = "") => {
  if (URL.canParse(value)) {
    return value;
  }
};

export const oneOf =
  <T extends string>(...values: Readonly<T[]>): Validator<T> =>
  (value = "") => {
    const result = values.find((item) => item === value);

    if (typeof result !== "undefined") {
      return result;
    }
  };

export const optional =
  <T>(validator: Validator<T>): Validator<OptionalEnvValue<T>> =>
  (value) => {
    const result = validator(value);

    return typeof result !== "undefined"
      ? { defined: true, value: result }
      : { defined: false };
  };
