export class EnvError extends Error {
  constructor(public faultyVariables: string[] = []) {
    super(
      faultyVariables.length > 0
        ? `Some environment variables are missing or are invalid: ${faultyVariables
            .map((variable) => `"${variable}"`)
            .join(", ")}`
        : "Unknown environment error",
    );

    Object.setPrototypeOf(this, EnvError.prototype);
    this.name = this.constructor.name;
  }
}
