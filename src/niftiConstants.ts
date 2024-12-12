/**
 * Data type codes for NIfTI image data.
 * These codes define the format of voxel data stored in the NIfTI file.
 *
 * The values correspond to the standard NIfTI-1 and NIfTI-2 data type codes
 * as defined in the NIfTI specification.
 */
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

/**
 * Coordinate system transform codes.
 * These codes specify how the image coordinates map to real-world space.
 * Used in both qform_code and sform_code fields of NIfTI headers.
 */
export enum TransformCode {
  SCANNER_ANAT = 1,
  ALIGNED_ANAT = 2,
  TALAIRACH = 3,
  MNI_152 = 4,
}

/**
 * Units codes for spatial and temporal dimensions.
 * These codes specify the units of measurement for voxel dimensions
 * and time series data.
 */
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

/**
 * Maps data type codes to their human-readable descriptions.
 * Includes both the type name and the size in bytes.
 */
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

/**
 * Maps transform codes to their human-readable descriptions.
 * Provides detailed names for each coordinate system.
 */
const TRANSFORM_DISPLAY_NAMES = new Map<TransformCode, string>([
  [TransformCode.SCANNER_ANAT, 'Scanner Anatomical'],
  [TransformCode.ALIGNED_ANAT, 'Aligned Anatomical'],
  [TransformCode.TALAIRACH, 'Talairach Space'],
  [TransformCode.MNI_152, 'MNI-152 Space'],
]);

/**
 * Maps units codes to their human-readable descriptions.
 * Includes common abbreviations in parentheses.
 */
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

/** Bit mask for extracting spatial units from xyzt_units field (bits 0-2) */
export const SPATIAL_UNITS_MASK = 0x07;

/** Bit mask for extracting temporal units from xyzt_units field (bits 3-5) */
export const TEMPORAL_UNITS_MASK = 0x38;

/**
 * Converts a NIfTI data type code to its human-readable display name.
 *
 * @param code - The data type code from the NIfTI header
 * @returns Human-readable description of the data type, or "Unknown" if code is not recognized
 * @example
 * datatypeCodeToDisplayName(16) // Returns "Float32 (4 bytes)"
 */
export function datatypeCodeToDisplayName(code: number): string {
  return DATATYPE_DISPLAY_NAMES.get(code as DataTypeCode) ?? 'Unknown';
}

/**
 * Converts a NIfTI transform code to its human-readable display name.
 *
 * @param code - The transform code from the NIfTI header (qform_code or sform_code)
 * @returns Human-readable description of the transform space, or "Unknown" if code is not recognized
 * @example
 * transformCodeToDisplayName(4) // Returns "MNI-152 Space"
 */
export function transformCodeToDisplayName(code: number): string {
  return TRANSFORM_DISPLAY_NAMES.get(code as TransformCode) ?? 'Unknown';
}

/**
 * Converts a NIfTI units code to its human-readable display name.
 *
 * @param code - The units code from the NIfTI header
 * @returns Human-readable description of the units, or "Unknown" if code is not recognized
 * @example
 * unitsCodeToDisplayName(2) // Returns "Millimeters (mm)"
 */
export function unitsCodeToDisplayName(code: number): string {
  return UNITS_DISPLAY_NAMES.get(code as UnitsCode) ?? 'Unknown';
}

/** Standard size of a NIfTI-1 header in bytes */
export const NIFTI1_HEADER_SIZE = 348;

/** Standard size of a NIfTI-2 header in bytes */
export const NIFTI2_HEADER_SIZE = 540;
