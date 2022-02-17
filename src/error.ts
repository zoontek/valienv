export class EnvValidationError extends Error {
  invalidVariables: string[];
  missingVariables: string[];

  constructor({
    invalidVariables = [],
    missingVariables = [],
  }: {
    invalidVariables?: string[];
    missingVariables?: string[];
  }) {
    super("Some environment variables cannot be validated");
    Object.setPrototypeOf(this, EnvValidationError.prototype);

    this.name = this.constructor.name;
    this.invalidVariables = invalidVariables;
    this.missingVariables = missingVariables;
  }
}
