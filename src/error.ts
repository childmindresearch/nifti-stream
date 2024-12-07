export class NiftiIOError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NiftiIOError';
  }
}
