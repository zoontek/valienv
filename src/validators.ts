export type Validator<T> = (input: string) => T | void;

export const bool: Validator<boolean> = (input) => {
  if (input === "true") return true;
  if (input === "false") return false;
};

export const nbr: Validator<number> = (input) => {
  const parsed = parseFloat(input);
  if (!Number.isNaN(parsed)) return parsed;
};

export const str: Validator<string> = (input) => input;
