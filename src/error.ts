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
    const errorMessageLines = [
      "Some environment variables cannot be validated",
    ];
    if (invalidVariables.length > 0) {
      errorMessageLines.push(
        `Invalid variables: ${invalidVariables.join(", ")}`,
      );
    }
    if (missingVariables.length > 0) {
      errorMessageLines.push(
        `Missing variables: ${missingVariables.join(", ")}`,
      );
    }

    super(errorMessageLines.join("\n"));
    Object.setPrototypeOf(this, EnvValidationError.prototype);

    this.name = this.constructor.name;
    this.invalidVariables = invalidVariables;
    this.missingVariables = missingVariables;
  }
}
