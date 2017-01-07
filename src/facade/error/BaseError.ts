export class BaseError implements Error {
  name: string;
  status: number;
  message: string;
  constructor(name: string, value: string, status?: number) {
    this.name = name;
    this.message = value;
    this.status = status;
  }

}
