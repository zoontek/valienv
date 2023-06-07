export type Validator<T> = (value: string | undefined) => T | undefined;

export const boolean: Validator<boolean> = (value) => {
  if (typeof value !== "undefined") {
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
  }
};

export const number: Validator<number> = (value) => {
  if (typeof value !== "undefined") {
    const number = Number.parseFloat(value);

    if (!Number.isNaN(number)) {
      return number;
    }
  }
};

export const string: Validator<string> = (value) => {
  if (typeof value !== "undefined" && value !== "") {
    return value;
  }
};

export const oneOf =
  <T extends string>(...values: Readonly<T[]>): Validator<T> =>
  (value) => {
    if (typeof value !== "undefined") {
      const result = values.find((item) => item === value);

      if (typeof result !== "undefined") {
        return result;
      }
    }
  };
