export class BaseError extends Error {
  status: number;
  constructor(value: string, status?: number) {
    super();
    super.message = value;
    
    this.status = status;
  }
}
