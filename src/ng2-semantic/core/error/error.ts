export class UIError extends Error {
  constructor(value: string) {
    super();
    super.message = value;
  }
}
