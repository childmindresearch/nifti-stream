/*** Types ***/

import { NiftiExtension } from './niftiExtension';

export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array;

/*** Static Pseudo-constants ***/

export const GUNZIP_MAGIC_COOKIE1 = 31;
export const GUNZIP_MAGIC_COOKIE2 = 139;

/*** Static methods ***/

export function getStringAt(data: DataView, start: number, end: number): string {
  const bytes = new Uint8Array(data.buffer, start, end - start);
  // Remove null terminator bytes
  const nullByte = bytes.indexOf(0);
  const slice = nullByte === -1 ? bytes : bytes.slice(0, nullByte);
  return new TextDecoder('ascii').decode(slice);
}

export function getExtensionsAt(
  data: DataView,
  start: number,
  littleEndian: boolean,
  voxOffset: number | bigint
) {
  const extensions = [];
  let extensionByteIndex = start;

  // Multiple extended header sections are allowed
  while (extensionByteIndex < voxOffset) {
    let extensionLittleEndian = littleEndian;
    let esize = data.getInt32(extensionByteIndex, littleEndian);
    if (!esize) {
      break; // no more extensions
    }

    // check if this takes us past vox_offset
    if (esize + extensionByteIndex > voxOffset) {
      // check if reversing byte order gets a proper size
      extensionLittleEndian = !extensionLittleEndian;
      esize = data.getInt32(extensionByteIndex, extensionLittleEndian);
      if (esize + extensionByteIndex > voxOffset) {
        throw new Error('This does not appear to be a valid NIFTI extension');
      }
    }

    // esize must be a positive integral multiple of 16
    if (esize % 16 !== 0) {
      throw new Error('This does not appear to be a NIFTI extension');
    }

    const ecode = data.getInt32(extensionByteIndex + 4, extensionLittleEndian);
    const edata = data.buffer.slice(extensionByteIndex + 8, extensionByteIndex + esize);
    const extension = new NiftiExtension({
      esize,
      ecode,
      edata,
      littleEndian: extensionLittleEndian,
    });
    extensions.push(extension);
    extensionByteIndex += esize;
  }
  return extensions;
}

/**
 * @deprecated The method should not be used
 */
export function toArrayBuffer(buffer: TypedArray): ArrayBuffer {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

export function isString(obj: unknown): boolean {
  return typeof obj === 'string' || obj instanceof String;
}

export function formatNumber(num: number | string, shortFormat = false): number {
  const val = typeof num === 'string' ? Number(num) : num;
  return parseFloat(val.toPrecision(shortFormat ? 5 : 7));
}
