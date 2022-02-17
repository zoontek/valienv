export type Validator<T> = (value: string) => T | undefined;

export const bool: Validator<boolean> = (value) => {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
};

export const nbr: Validator<number> = (value) => {
  const parsed = parseFloat(value);

  if (!Number.isNaN(parsed)) {
    return parsed;
  }
};

export const str: Validator<string> = (value) => value;
