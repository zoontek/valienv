export class EnvValidationError extends Error {
  variables: string[];

  constructor(variables: string[]) {
    super(
      "Some environment variables cannot be validated: " + variables.join(", "),
    );

    Object.setPrototypeOf(this, EnvValidationError.prototype);
    this.name = this.constructor.name;
    this.variables = variables;
  }
}
