export type Validator<T> = (value: string) => T | undefined;

export const boolean: Validator<boolean> = (value) => {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
};

export const number: Validator<number> = (value) => {
  const float = Number.parseFloat(value);

  if (!Number.isNaN(float)) {
    return float;
  }
};

export const string: Validator<string> = (value) => {
  if (value !== "") {
    return value;
  }
};

export const oneOf =
  <T extends string>(...values: Readonly<T[]>): Validator<T> =>
  (value) => {
    const result = values.find((item) => item === value);

    if (typeof result !== "undefined") {
      return result;
    }
  };
