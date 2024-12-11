export enum DataTypeCode {
  UINT8 = 2,
  INT16 = 4,
  INT32 = 8,
  FLOAT32 = 16,
  FLOAT64 = 64,
  RGB24 = 128,
  INT8 = 256,
  UINT16 = 512,
  UINT32 = 768,
  INT64 = 1024,
  UINT64 = 1280,
}

export enum TransformCode {
  SCANNER_ANAT = 1,
  ALIGNED_ANAT = 2,
  TALAIRACH = 3,
  MNI_152 = 4,
}

export enum UnitsCode {
  METER = 1,
  MM = 2,
  MICRON = 3,
  SEC = 8,
  MSEC = 16,
  USEC = 24,
  HZ = 32,
  PPM = 40,
  RADS = 48,
}

const DATATYPE_DISPLAY_NAMES = new Map<DataTypeCode, string>([
  [DataTypeCode.UINT8, 'Uint8 (1 byte)'],
  [DataTypeCode.INT16, 'Int16 (2 bytes)'],
  [DataTypeCode.INT32, 'Int32 (4 bytes)'],
  [DataTypeCode.FLOAT32, 'Float32 (4 bytes)'],
  [DataTypeCode.FLOAT64, 'Float64 (8 bytes)'],
  [DataTypeCode.RGB24, 'RGB (24-bit)'],
  [DataTypeCode.INT8, 'Int8 (1 byte)'],
  [DataTypeCode.UINT16, 'Uint16 (2 bytes)'],
  [DataTypeCode.UINT32, 'Uint32 (4 bytes)'],
  [DataTypeCode.INT64, 'Int64 (8 bytes)'],
  [DataTypeCode.UINT64, 'Uint64 (8 bytes)'],
]);

const TRANSFORM_DISPLAY_NAMES = new Map<TransformCode, string>([
  [TransformCode.SCANNER_ANAT, 'Scanner Anatomical'],
  [TransformCode.ALIGNED_ANAT, 'Aligned Anatomical'],
  [TransformCode.TALAIRACH, 'Talairach Space'],
  [TransformCode.MNI_152, 'MNI-152 Space'],
]);

const UNITS_DISPLAY_NAMES = new Map<UnitsCode, string>([
  [UnitsCode.METER, 'Meters (m)'],
  [UnitsCode.MM, 'Millimeters (mm)'],
  [UnitsCode.MICRON, 'Micrometers (μm)'],
  [UnitsCode.SEC, 'Seconds (s)'],
  [UnitsCode.MSEC, 'Milliseconds (ms)'],
  [UnitsCode.USEC, 'Microseconds (μs)'],
  [UnitsCode.HZ, 'Hertz (Hz)'],
  [UnitsCode.PPM, 'Parts per Million (ppm)'],
  [UnitsCode.RADS, 'Radians (rad)'],
]);

export const SPATIAL_UNITS_MASK = 0x07;
export const TEMPORAL_UNITS_MASK = 0x38;

export function datatypeCodeToDisplayName(code: number): string {
  return DATATYPE_DISPLAY_NAMES.get(code as DataTypeCode) ?? 'Unknown';
}

export function transformCodeToDisplayName(code: number): string {
  return TRANSFORM_DISPLAY_NAMES.get(code as TransformCode) ?? 'Unknown';
}

export function unitsCodeToDisplayName(code: number): string {
  return UNITS_DISPLAY_NAMES.get(code as UnitsCode) ?? 'Unknown';
}

export const NIFTI1_HEADER_SIZE = 348;
export const NIFTI2_HEADER_SIZE = 540;
