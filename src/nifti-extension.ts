/**
 * Represents a NIFTI file extension containing metadata or supplementary data.
 */
export interface NiftiExtensionData {
  /** Number of bytes in the extended header data (must be divisible by 16) */
  esize: number;
  /** Developer group identifier */
  ecode: number;
  /** Raw extension data */
  edata: ArrayBuffer;
  /** Whether the data is in little-endian format */
  littleEndian: boolean;
}

export class NiftiExtension {
  readonly #esize: number;
  readonly #ecode: number;
  readonly #edata: ArrayBuffer;
  readonly #littleEndian: boolean;

  /**
   * Creates a new NIFTI extension.
   * @throws {Error} If the extension size is not divisible by 16
   */
  constructor({ esize, ecode, edata, littleEndian }: NiftiExtensionData) {
    if (esize % 16 !== 0) {
      throw new Error('Invalid NIFTI extension: size must be divisible by 16');
    }

    this.#esize = esize;
    this.#ecode = ecode;
    this.#edata = edata;
    this.#littleEndian = littleEndian;
  }

  /**
   * Returns the extension data size in bytes.
   */
  get size(): number {
    return this.#esize;
  }

  /**
   * Returns the developer group identifier.
   */
  get code(): number {
    return this.#ecode;
  }

  /**
   * Returns the raw extension data.
   */
  get data(): ArrayBuffer {
    return this.#edata;
  }

  /**
   * Returns the raw extension data.
   */
  get littleEndian(): boolean {
    return this.#littleEndian;
  }

  /**
   * Converts the extension to an ArrayBuffer format suitable for file writing.
   * The resulting buffer contains:
   * - Bytes 0-3: Extension size (32-bit integer)
   * - Bytes 4-7: Extension code (32-bit integer)
   * - Bytes 8+: Extension data
   */
  toArrayBuffer(): ArrayBuffer {
    const byteArray = new Uint8Array(this.#esize);
    const data = new Uint8Array(this.#edata);
    const view = new DataView(byteArray.buffer);

    // Write header
    view.setInt32(0, this.#esize, this.#littleEndian);
    view.setInt32(4, this.#ecode, this.#littleEndian);

    // Write data
    byteArray.set(data, 8);

    return byteArray.buffer;
  }
}
