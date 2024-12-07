import { Nifti1Header } from './nifti1';
import { Nifti2Header } from './nifti2';

export enum NiftiVersion {
  NIFTI1 = 'nifti1',
  NIFTI1_PAIR = 'nifti1_pair',
  NIFTI2 = 'nifti2',
  NIFTI2_PAIR = 'nifti2_pair',
  NONE = 'none',
}

const NIFTI1_MAGIC_LOCATION = 344;
const NIFTI2_MAGIC_LOCATION = 4;

const NIFTI1_MAGIC = {
  SINGLE: [110, 105, 49], // 'ni1'
  PAIR: [110, 43, 49], // 'n+1'
} as const;

const NIFTI2_MAGIC = {
  SINGLE: [110, 105, 50], // 'ni2'
  PAIR: [110, 43, 50], // 'n+2'
} as const;

const MIN_HEADER_SIZE = 348; // Minimum NIFTI-1 header size

export function detectNiftiVersion(data: ArrayBuffer): NiftiVersion {
  if (data.byteLength < MIN_HEADER_SIZE) {
    return NiftiVersion.NONE;
  }

  const view = new DataView(data);

  // Check NIFTI-1 magic numbers
  const n1mag1 = view.getUint8(NIFTI1_MAGIC_LOCATION);
  const n1mag2 = view.getUint8(NIFTI1_MAGIC_LOCATION + 1);
  const n1mag3 = view.getUint8(NIFTI1_MAGIC_LOCATION + 2);

  if (
    n1mag1 === NIFTI1_MAGIC.SINGLE[0] &&
    n1mag2 === NIFTI1_MAGIC.SINGLE[1] &&
    n1mag3 === NIFTI1_MAGIC.SINGLE[2]
  ) {
    return NiftiVersion.NIFTI1;
  }

  if (
    n1mag1 === NIFTI1_MAGIC.PAIR[0] &&
    n1mag2 === NIFTI1_MAGIC.PAIR[1] &&
    n1mag3 === NIFTI1_MAGIC.PAIR[2]
  ) {
    return NiftiVersion.NIFTI1_PAIR;
  }

  // Check NIFTI-2 magic numbers
  const n2mag1 = view.getUint8(NIFTI2_MAGIC_LOCATION);
  const n2mag2 = view.getUint8(NIFTI2_MAGIC_LOCATION + 1);
  const n2mag3 = view.getUint8(NIFTI2_MAGIC_LOCATION + 2);

  if (
    n2mag1 === NIFTI2_MAGIC.SINGLE[0] &&
    n2mag2 === NIFTI2_MAGIC.SINGLE[1] &&
    n2mag3 === NIFTI2_MAGIC.SINGLE[2]
  ) {
    return NiftiVersion.NIFTI2;
  }

  if (
    n2mag1 === NIFTI2_MAGIC.PAIR[0] &&
    n2mag2 === NIFTI2_MAGIC.PAIR[1] &&
    n2mag3 === NIFTI2_MAGIC.PAIR[2]
  ) {
    return NiftiVersion.NIFTI2_PAIR;
  }

  return NiftiVersion.NONE;
}

export type NiftiHeader = Nifti1Header | Nifti2Header;
