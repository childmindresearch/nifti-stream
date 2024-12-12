import { NiftiIOError } from './error';
import {
  datatypeCodeToDisplayName,
  transformCodeToDisplayName,
  unitsCodeToDisplayName,
  SPATIAL_UNITS_MASK,
  TEMPORAL_UNITS_MASK,
  NIFTI1_HEADER_SIZE,
  NIFTI2_HEADER_SIZE,
} from './niftiConstants';
import { getStringAt } from './utils';

/**
 * Enumeration of supported NIfTI file format versions.
 *
 * Represents the different versions and variants of the NIfTI (Neuroimaging Informatics Technology Initiative)
 * file format specification.
 *
 * @property NIFTI1 - Single-file NIfTI-1 format
 * @property NIFTI1_PAIR - Two-file (header + data) NIfTI-1 format
 * @property NIFTI2 - Single-file NIfTI-2 format
 * @property NIFTI2_PAIR - Two-file (header + data) NIfTI-2 format
 * @property NONE - Not a valid NIfTI format
 */
export enum NiftiVersion {
  NIFTI1 = 1,
  NIFTI1_PAIR = 2,
  NIFTI2 = 3,
  NIFTI2_PAIR = 4,
  NONE = 5,
}

/**
 * Information obtained from peeking at a NIfTI file header.
 *
 * Contains basic format information that can be determined by examining the initial bytes
 * of a potential NIfTI file.
 *
 * @property {boolean} nifti1 - True if the file appears to be NIfTI-1 format, false if NIfTI-2
 * @property {boolean} littleEndian - True if the file uses little-endian byte ordering, false for big-endian
 */
type NiftiHeaderPeekInfo = {
  nifti1: boolean;
  littleEndian: boolean;
};

/**
 * 4x4 affine transformation matrix used in NIfTI headers.
 *
 * Represents a 4x4 matrix that specifies the affine transformation from voxel indices
 * to real-world coordinates (typically in millimeters). The matrix includes rotation,
 * scaling, shearing, and translation components.
 *
 * The matrix is structured as:
 * - Row 1-3: Linear transformation components (rotation, scaling, shearing)
 * - Row 4: Translation components in the last column, typically [0,0,0,1] in the other positions
 *
 * @example
 * // Identity transformation matrix
 * const identityMatrix: AffineMatrix = [
 *   [1, 0, 0, 0],
 *   [0, 1, 0, 0],
 *   [0, 0, 1, 0],
 *   [0, 0, 0, 1]
 * ];
 */
export type AffineMatrix = [
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number],
];

/**
 * Array representing dimensions or pixel dimensions of a NIfTI volume.
 * @type
 * @description
 * This type is used in two contexts within NIfTI headers:
 *
 * 1. As volume dimensions (dim[]):
 * - Index 0: Number of dimensions (rank) of the dataset (1-7)
 * - Index 1: Size of dimension 1 (usually x dimension)
 * - Index 2: Size of dimension 2 (usually y dimension)
 * - Index 3: Size of dimension 3 (usually z dimension)
 * - Index 4: Size of dimension 4 (usually time points)
 * - Index 5-7: Sizes of optional additional dimensions
 *
 * 2. As pixel dimensions (pixdim[]):
 * - Index 0: (not used for pixdims)
 * - Index 1: Pixel width in dimension 1 (usually x dimension)
 * - Index 2: Pixel width in dimension 2 (usually y dimension)
 * - Index 3: Pixel width in dimension 3 (usually z dimension)
 * - Index 4: Time step duration (TR) for dimension 4
 * - Index 5-7: Step sizes for optional additional dimensions
 *
 * @example
 * // Volume dimensions for a 3D volume of size 256x256x128
 * const dims: DimensionArray = [3, 256, 256, 128, 1, 1, 1, 1];
 *
 * // Pixel dimensions for 2mm isotropic voxels with 2.5s TR
 * const pixdims: DimensionArray = [1.0, 2.0, 2.0, 2.0, 2.5, 1.0, 1.0, 1.0];
 */
export type DimensionArray = [number, number, number, number, number, number, number, number];

export class NiftiHeader {
  /**
   * MRI slice ordering information
   */
  dim_info: number = 0;

  /**
   * Array representing dimensions of a NIfTI volume.
   *
   * Represents the dimensions of a NIfTI volume as an 8-element array where:
   * - Index 0: Number of dimensions (rank) of the dataset (1-7)
   * - Index 1: Size of dimension 1 (usually x dimension)
   * - Index 2: Size of dimension 2 (usually y dimension)
   * - Index 3: Size of dimension 3 (usually z dimension)
   * - Index 4: Size of dimension 4 (usually time points)
   * - Index 5-7: Sizes of optional additional dimensions
   *
   * @example
   * // 3D volume of size 256x256x128
   * const dims: DimensionArray = [3, 256, 256, 128, 1, 1, 1, 1];
   *
   * // 4D volume (fMRI) with 30 time points
   * const timeSeries: DimensionArray = [4, 64, 64, 32, 30, 1, 1, 1];
   */
  dims: DimensionArray = [0, 0, 0, 0, 0, 0, 0, 0];

  /**
   * Intent parameters - Used to store statistical parameters
   * Meaning depends on intent_code
   */
  intent_p1: number = 0;
  intent_p2: number = 0;
  intent_p3: number = 0;
  /** Specifies the intended meaning of the data */
  intent_code: number = 0;

  /**
   * Data type code defining data format
   * @see DataTypeCode enum
   */
  datatypeCode: number = 0;

  /**
   * Number of bits per voxel
   */
  numBitsPerVoxel: number = 0;

  /**
   * First slice index
   */
  slice_start: number = 0;

  /**
   * Pixel dimensions:
   * - Index 0: (not used for pixdims)
   * - Index 1: Pixel width in dimension 1 (usually x dimension)
   * - Index 2: Pixel width in dimension 2 (usually y dimension)
   * - Index 3: Pixel width in dimension 3 (usually z dimension)
   * - Index 4: Time step duration (TR) for dimension 4
   * - Index 5-7: Step sizes for optional additional dimensions
   */
  pixDims: DimensionArray = [0, 0, 0, 0, 0, 0, 0, 0];

  /**
   * Byte offset into the .nii file where pixel data starts
   */
  vox_offset: number = 0;

  /**
   * Data scaling factor: output = input * scl_slope + scl_inter
   */
  scl_slope: number = 1.0;
  /**
   * Data scaling factor: output = input * scl_slope + scl_inter
   */
  scl_inter: number = 0;

  /**
   * Last slice index
   */
  slice_end: number = 0;

  /**
   * Slice timing order code
   */
  slice_code: number = 0;

  /**
   * Units of pixdim[1..4]
   * Bits 0-2: spatial units
   * Bits 3-5: temporal units
   */
  xyzt_units: number = 0;

  /**
   * Calibration display range
   */
  cal_max: number = 0.0;
  /**
   * Calibration display range
   */
  cal_min: number = 0.0;

  /**
   * Time for 1 slice in seconds
   */
  slice_duration: number = 0;

  /**
   * Time axis shift
   */
  toffset: number = 0;

  /**
   * Free-form data description (80 chars max)
   */
  description: string = '';

  /**
   * Auxiliary filename (24 chars max)
   */
  aux_file: string = '';

  /**
   * Transform codes defining spatial orientation
   */
  qform_code: number = 0;
  /**
   * Transform codes defining spatial orientation
   */
  sform_code: number = 0;

  /**
   * S-Form parameters for spatial transform
   */
  srow_x: [number, number, number, number] = [0, 0, 0, 0];
  srow_y: [number, number, number, number] = [0, 0, 0, 0];
  srow_z: [number, number, number, number] = [0, 0, 0, 0];

  /**
   * Quaternion parameters for spatial transform
   */
  quatern_b: number = 0.0;
  quatern_c: number = 0.0;
  quatern_d: number = 0.0;
  qoffset_x: number = 0.0;
  qoffset_y: number = 0.0;
  qoffset_z: number = 0.0;

  /**
   * Name or meaning of the data (16 chars max)
   */
  intent_name: string = '';

  /**
   * NIFTI format identifier.
   * Invalid if anything other than
   * "ni1" | "n+1" | "ni2" | "n+2"
   */
  magic = 'ni1';

  /**
   * File encoding.
   */
  littleEndian: boolean = false;

  /**
   * Check if this is a valid NIFTI file.
   */
  isValid(): boolean {
    return this.getNiftiVersion() !== NiftiVersion.NONE;
  }

  /**
   * Gets NIFTI version from a magic string, returns NONE if invalid
   */
  getNiftiVersion(): NiftiVersion {
    const versions: Record<string, NiftiVersion> = {
      'n+1': NiftiVersion.NIFTI1,
      ni1: NiftiVersion.NIFTI1_PAIR,
      'n+2': NiftiVersion.NIFTI2,
      ni2: NiftiVersion.NIFTI2_PAIR,
    };
    return versions[this.magic] || NiftiVersion.NONE;
  }

  /**
   * Gets human-readable name for NIFTI version
   */
  getNiftiVersionDisplayName(): string {
    const names: Record<NiftiVersion, string> = {
      [NiftiVersion.NONE]: 'Unknown',
      [NiftiVersion.NIFTI1]: 'NIFTI-1 (Single File)',
      [NiftiVersion.NIFTI1_PAIR]: 'NIFTI-1 (Paired Files)',
      [NiftiVersion.NIFTI2]: 'NIFTI-2 (Single File)',
      [NiftiVersion.NIFTI2_PAIR]: 'NIFTI-2 (Paired Files)',
    };
    return names[this.getNiftiVersion()];
  }

  /**
   * Get the data type as a human readable string
   */
  getDatatypeDisplayName(): string {
    return datatypeCodeToDisplayName(this.datatypeCode);
  }

  /**
   * Get the QForm transform code as a human readable string
   */
  getQFormDisplayName(): string {
    return transformCodeToDisplayName(this.qform_code);
  }

  /**
   * Get the SForm transform code as a human readable string
   */
  getSFormDisplayName(): string {
    return transformCodeToDisplayName(this.sform_code);
  }

  /**
   * Gets the spatial units code from the combined units value
   * @returns Spatial units code extracted using SPATIAL_UNITS_MASK
   */
  get spatialUnits(): number {
    return this.xyzt_units & SPATIAL_UNITS_MASK;
  }

  /**
   * Sets the spatial units while preserving temporal units
   * @param value - New spatial units code to set
   */
  set spatialUnits(value: number) {
    // Clear existing spatial units and set new ones
    this.xyzt_units = (this.xyzt_units & ~SPATIAL_UNITS_MASK) | (value & SPATIAL_UNITS_MASK);
  }

  /**
   * Gets the temporal units code from the combined units value
   * @returns Temporal units code extracted using TEMPORAL_UNITS_MASK
   */
  get temporalUnits(): number {
    return this.xyzt_units & TEMPORAL_UNITS_MASK;
  }

  /**
   * Sets the temporal units while preserving spatial units
   * @param value - New temporal units code to set
   */
  set temporalUnits(value: number) {
    // Clear existing temporal units and set new ones
    this.xyzt_units = (this.xyzt_units & ~TEMPORAL_UNITS_MASK) | (value & TEMPORAL_UNITS_MASK);
  }

  /**
   * Gets a human-readable string representation of the spatial units
   * @returns Display name corresponding to the current spatial units code
   */
  getSpatialUnitsDisplayName(): string {
    return unitsCodeToDisplayName(this.spatialUnits);
  }

  /**
   * Gets a human-readable string representation of the temporal units
   * @returns Display name corresponding to the current temporal units code
   */
  getTemporalUnitsDisplayName(): string {
    return unitsCodeToDisplayName(this.temporalUnits);
  }

  computeAffine(): AffineMatrix {
    let affine: AffineMatrix = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];

    /**
     * Computes the affine transformation matrix based on NIFTI header fields.
     * Uses one of three methods depending on qform_code and sform_code values:
     * - Method 0: Simple scaling by pixDims when both codes < 1
     * - Method 2: Quaternion-based transformation when qform_code > sform_code
     * - Method 3: Direct affine transformation when sform_code > 0
     * @returns 4x4 affine transformation matrix mapping voxel indices to coordinates
     * @see https://nifti.nimh.nih.gov/pub/dist/src/niftilib/nifti1.h
     */
    if (this.qform_code < 1 && this.sform_code < 1) {
      affine[0][0] = this.pixDims[1];
      affine[1][1] = this.pixDims[2];
      affine[2][2] = this.pixDims[3];
    } else if (this.qform_code > 0 && this.sform_code < this.qform_code) {
      const a = Math.sqrt(
        1.0 -
          (Math.pow(this.quatern_b, 2) + Math.pow(this.quatern_c, 2) + Math.pow(this.quatern_d, 2))
      );
      const b = this.quatern_b;
      const c = this.quatern_c;
      const d = this.quatern_d;

      const qfac = this.pixDims[0] === 0 ? 1 : this.pixDims[0];

      const quatern_R = [
        [a * a + b * b - c * c - d * d, 2 * b * c - 2 * a * d, 2 * b * d + 2 * a * c],
        [2 * b * c + 2 * a * d, a * a + c * c - b * b - d * d, 2 * c * d - 2 * a * b],
        [2 * b * d - 2 * a * c, 2 * c * d + 2 * a * b, a * a + d * d - c * c - b * b],
      ];

      for (let ctrOut = 0; ctrOut < 3; ctrOut += 1) {
        for (let ctrIn = 0; ctrIn < 3; ctrIn += 1) {
          affine[ctrOut][ctrIn] = quatern_R[ctrOut][ctrIn] * this.pixDims[ctrIn + 1];
          if (ctrIn === 2) {
            affine[ctrOut][ctrIn] *= qfac;
          }
        }
      }
      affine[0][3] = this.qoffset_x;
      affine[1][3] = this.qoffset_y;
      affine[2][3] = this.qoffset_z;
    } else if (this.sform_code > 0) {
      const srows = [this.srow_x, this.srow_y, this.srow_z];
      for (let ctrOut = 0; ctrOut < 3; ctrOut += 1) {
        for (let ctrIn = 0; ctrIn < 4; ctrIn += 1) {
          affine[ctrOut][ctrIn] = srows[ctrOut][ctrIn];
        }
      }
    }

    return affine;
  }

  /**
   * Formats header information in a simple markdown-style format
   */
  formatHeader(): string {
    const formatNumber = (n: number): string => (Number.isInteger(n) ? n.toString() : n.toFixed(4));

    const formatArray = (arr: number[], seperator: string = ' × '): string =>
      arr.map(formatNumber).join(seperator);

    const formatMatrix = (matrix: number[][]): string => {
      // Format each number to 4 decimal places and pad to maintain alignment
      const formattedRows = matrix.map((row) =>
        row.map((n) => n.toFixed(4).padStart(12)).join('  ')
      );
      return formattedRows.map((row) => '    ' + row).join('\n');
    };

    return `# Image Properties
- Version: ${this.getNiftiVersionDisplayName()}
- Datatype: ${this.getDatatypeDisplayName()} [${this.datatypeCode}]
- Bits/Voxel: ${this.numBitsPerVoxel}
- Dimensions: ${formatArray(this.dims)}
- Voxel Size: ${formatArray(this.pixDims)}

# Transform Information
- Q-Form: ${this.getQFormDisplayName()} [${this.qform_code}]
- S-Form: ${this.getSFormDisplayName()} [${this.sform_code}]
- Quaternion B/C/D: ${formatNumber(this.quatern_b)} / ${formatNumber(this.quatern_c)} / ${formatNumber(this.quatern_d)}
- Q-Offset: ${formatArray([this.qoffset_x, this.qoffset_y, this.qoffset_z], ', ')}
- S-Form Rows:
    X: ${formatArray(this.srow_x, ', ')}
    Y: ${formatArray(this.srow_y, ', ')}
    Z: ${formatArray(this.srow_z, ', ')}

# Affine Matrix (computed):
${formatMatrix(this.computeAffine())}

# Units & Scaling
- Spatial Units: ${this.getSpatialUnitsDisplayName()} [${this.spatialUnits}]
- Temporal Units: ${this.getTemporalUnitsDisplayName()} [${this.temporalUnits}]
- Scale Slope: ${formatNumber(this.scl_slope)}
- Scale Intercept: ${formatNumber(this.scl_inter)}
- Display Range: ${formatNumber(this.cal_min)} to ${formatNumber(this.cal_max)}

# Intent & Metadata
- Intent: '${this.intent_name || 'none'}' [${this.intent_code}]
- Intent Params: ${formatNumber(this.intent_p1)} / ${formatNumber(this.intent_p2)} / ${formatNumber(this.intent_p3)}
- Description: '${this.description || 'none'}'
- Auxiliary File: '${this.aux_file || 'none'}'`;
  }

  /**
   * Peek at first 4 bytes of header to determine nifti version and endianness.
   * Returns undefined if not a nifti header.
   */
  public static peekVersion(view: DataView): NiftiHeaderPeekInfo | undefined {
    if (view.byteLength < 4) {
      throw new NiftiIOError('Not enough bytes to identify NIFTI header.');
    }
    switch (view.getInt32(0, false)) {
      case 348:
        return { nifti1: true, littleEndian: false };
      case 1543569408:
        return { nifti1: true, littleEndian: true };
      case 540:
        return { nifti1: false, littleEndian: false };
      case 469893120:
        return { nifti1: false, littleEndian: true };
      default:
        return undefined;
    }
  }

  /**
   * Parses a NIFTI header from a DataView based on header version information.
   * @param view DataView containing the NIFTI header data
   * @param peekInfo Header version and endianness information from peekVersion
   * @returns Parsed NiftiHeader object
   */
  public static parse(view: DataView, peekInfo: NiftiHeaderPeekInfo) {
    if (peekInfo.nifti1) {
      return this.parseNifti1(view, peekInfo.littleEndian);
    } else {
      return this.parseNifti2(view, peekInfo.littleEndian);
    }
  }

  /**
   * Parses a NIFTI-1 format header from a DataView.
   * @param view DataView containing the NIFTI header data
   * @param littleEndian Whether to read values as little-endian (from peekNiftiHeader)
   * @returns A NiftiHeader object containing the parsed header fields
   * @see https://nifti.nimh.nih.gov/nifti-1/ for header specification
   */
  public static parseNifti1(view: DataView, littleEndian?: boolean): NiftiHeader {
    if (view.byteLength < NIFTI1_HEADER_SIZE) {
      throw new NiftiIOError('Not enough bytes to parse NIFTI-1 header.');
    }
    const header = new NiftiHeader();

    if (littleEndian === undefined) {
      let peek = NiftiHeader.peekVersion(view);
      if (peek === undefined || !peek.nifti1) {
        throw new NiftiIOError('This does not appear to be a NIFTI-1 file!');
      }
      header.littleEndian = peek.littleEndian;
    } else {
      header.littleEndian = littleEndian;
    }

    header.dim_info = view.getInt8(39);

    for (let ctr = 0; ctr < 8; ctr += 1) {
      const index = 40 + ctr * 2;
      header.dims[ctr] = view.getInt16(index, header.littleEndian);
    }

    header.intent_p1 = view.getFloat32(56, header.littleEndian);
    header.intent_p2 = view.getFloat32(60, header.littleEndian);
    header.intent_p3 = view.getFloat32(64, header.littleEndian);
    header.intent_code = view.getInt16(68, header.littleEndian);

    header.datatypeCode = view.getInt16(70, header.littleEndian);
    header.numBitsPerVoxel = view.getInt16(72, header.littleEndian);

    header.slice_start = view.getInt16(74, header.littleEndian);

    for (let ctr = 0; ctr < 8; ctr += 1) {
      const index = 76 + ctr * 4;
      header.pixDims[ctr] = view.getFloat32(index, header.littleEndian);
    }

    header.vox_offset = view.getFloat32(108, header.littleEndian);

    header.scl_slope = view.getFloat32(112, header.littleEndian);
    header.scl_inter = view.getFloat32(116, header.littleEndian);

    header.slice_end = view.getInt16(120, header.littleEndian);
    header.slice_code = view.getInt8(122);

    header.xyzt_units = view.getInt8(123);

    header.cal_max = view.getFloat32(124, header.littleEndian);
    header.cal_min = view.getFloat32(128, header.littleEndian);

    header.slice_duration = view.getFloat32(132, header.littleEndian);
    header.toffset = view.getFloat32(136, header.littleEndian);

    header.description = getStringAt(view, 148, 228);
    header.aux_file = getStringAt(view, 228, 252);

    header.qform_code = view.getInt16(252, header.littleEndian);
    header.sform_code = view.getInt16(254, header.littleEndian);

    header.quatern_b = view.getFloat32(256, header.littleEndian);
    header.quatern_c = view.getFloat32(260, header.littleEndian);
    header.quatern_d = view.getFloat32(264, header.littleEndian);

    header.qoffset_x = view.getFloat32(268, header.littleEndian);
    header.qoffset_y = view.getFloat32(272, header.littleEndian);
    header.qoffset_z = view.getFloat32(276, header.littleEndian);

    const srows = [header.srow_x, header.srow_y, header.srow_z];
    for (let ctrOut = 0; ctrOut < 3; ctrOut += 1) {
      for (let ctrIn = 0; ctrIn < 4; ctrIn += 1) {
        const index = 280 + (ctrOut * 4 + ctrIn) * 4;
        srows[ctrOut][ctrIn] = view.getFloat32(index, header.littleEndian);
      }
    }

    header.intent_name = getStringAt(view, 328, 344);
    header.magic = getStringAt(view, 344, 348);

    return header;
  }

  /**
   * Parses a NIFTI-2 format header from a DataView.
   * @param view DataView containing the NIFTI header data
   * @param littleEndian Whether to read values as little-endian (from peekVersion)
   * @returns A NiftiHeader object containing the parsed header fields
   * @see https://nifti.nimh.nih.gov/nifti-2/ for header specification
   */
  public static parseNifti2(view: DataView, littleEndian?: boolean): NiftiHeader {
    if (view.byteLength < NIFTI2_HEADER_SIZE) {
      throw new NiftiIOError('Not enough bytes to parse NIFTI-2 header.');
    }

    const header = new NiftiHeader();

    if (littleEndian === undefined) {
      let peek = NiftiHeader.peekVersion(view);
      if (peek === undefined || peek.nifti1) {
        throw new NiftiIOError('This does not appear to be a NIFTI-2 file!');
      }
      header.littleEndian = peek.littleEndian;
    } else {
      header.littleEndian = littleEndian;
    }

    header.magic = getStringAt(view, 4, 12);
    header.datatypeCode = view.getInt16(12, header.littleEndian);
    header.numBitsPerVoxel = view.getInt16(14, header.littleEndian);

    for (let ctr = 0; ctr < 8; ctr += 1) {
      const index = 16 + ctr * 8;
      header.dims[ctr] = Number(view.getBigInt64(index, header.littleEndian));
    }

    header.intent_p1 = view.getFloat64(80, header.littleEndian);
    header.intent_p2 = view.getFloat64(88, header.littleEndian);
    header.intent_p3 = view.getFloat64(96, header.littleEndian);

    for (let ctr = 0; ctr < 8; ctr += 1) {
      const index = 104 + ctr * 8;
      header.pixDims[ctr] = view.getFloat64(index, header.littleEndian);
    }

    header.vox_offset = Number(view.getBigInt64(168, header.littleEndian));

    header.scl_slope = view.getFloat64(176, header.littleEndian);
    header.scl_inter = view.getFloat64(184, header.littleEndian);

    header.cal_max = view.getFloat64(192, header.littleEndian);
    header.cal_min = view.getFloat64(200, header.littleEndian);

    header.slice_duration = view.getFloat64(208, header.littleEndian);

    header.toffset = view.getFloat64(216, header.littleEndian);

    header.slice_start = Number(view.getBigInt64(224, header.littleEndian));
    header.slice_end = Number(view.getBigInt64(232, header.littleEndian));

    header.description = getStringAt(view, 240, 240 + 80);
    header.aux_file = getStringAt(view, 320, 320 + 24);

    header.qform_code = view.getInt32(344, header.littleEndian);
    header.sform_code = view.getInt32(348, header.littleEndian);

    header.quatern_b = view.getFloat64(352, header.littleEndian);
    header.quatern_c = view.getFloat64(360, header.littleEndian);
    header.quatern_d = view.getFloat64(368, header.littleEndian);
    header.qoffset_x = view.getFloat64(376, header.littleEndian);
    header.qoffset_y = view.getFloat64(384, header.littleEndian);
    header.qoffset_z = view.getFloat64(392, header.littleEndian);

    const srows = [header.srow_x, header.srow_y, header.srow_z];
    for (let ctrOut = 0; ctrOut < 3; ctrOut += 1) {
      for (let ctrIn = 0; ctrIn < 4; ctrIn += 1) {
        const index = 280 + (ctrOut * 4 + ctrIn) * 4;
        srows[ctrOut][ctrIn] = view.getFloat64(index, header.littleEndian);
      }
    }

    header.slice_code = view.getInt32(496, header.littleEndian);
    header.xyzt_units = view.getInt32(500, header.littleEndian);
    header.intent_code = view.getInt32(504, header.littleEndian);
    header.intent_name = getStringAt(view, 508, 508 + 16);

    header.dim_info = view.getInt8(524);

    return header;
  }

  /**
   * Serializes the NIFTI-1 header data into a binary format.
   * Creates a new typed array and copies all header fields according to the NIFTI-1 specification,
   * handling endianness conversion.
   * @returns Uint8Array containing the complete NIFTI-1 header (348 bytes)
   */
  public serializeNifti1(): Uint8Array {
    let byteSize = NIFTI1_HEADER_SIZE; // + 4 for the extension bytes

    const encoder = new TextEncoder();
    let byteArray = new Uint8Array(byteSize);
    let view = new DataView(byteArray.buffer);
    // sizeof_hdr
    view.setInt32(0, NIFTI1_HEADER_SIZE, this.littleEndian);

    // data_type, db_name, extents, session_error, regular are not used

    // dim_info
    view.setUint8(39, this.dim_info);

    // dims
    for (let i = 0; i < 8; i++) {
      view.setUint16(40 + 2 * i, this.dims[i], this.littleEndian);
    }

    // intent_p1, intent_p2, intent_p3
    view.setFloat32(56, this.intent_p1, this.littleEndian);
    view.setFloat32(60, this.intent_p2, this.littleEndian);
    view.setFloat32(64, this.intent_p3, this.littleEndian);

    // intent_code, datatype, bitpix, slice_start
    view.setInt16(68, this.intent_code, this.littleEndian);
    view.setInt16(70, this.datatypeCode, this.littleEndian);
    view.setInt16(72, this.numBitsPerVoxel, this.littleEndian);
    view.setInt16(74, this.slice_start, this.littleEndian);

    // pixdim[8], vox_offset, scl_slope, scl_inter
    for (let i = 0; i < 8; i++) {
      view.setFloat32(76 + 4 * i, this.pixDims[i], this.littleEndian);
    }
    view.setFloat32(108, this.vox_offset, this.littleEndian);
    view.setFloat32(112, this.scl_slope, this.littleEndian);
    view.setFloat32(116, this.scl_inter, this.littleEndian);

    // slice_end
    view.setInt16(120, this.slice_end, this.littleEndian);

    // slice_code, xyzt_units
    view.setUint8(122, this.slice_code);
    view.setUint8(123, this.xyzt_units);

    // cal_max, cal_min, slice_duration, toffset
    view.setFloat32(124, this.cal_max, this.littleEndian);
    view.setFloat32(128, this.cal_min, this.littleEndian);
    view.setFloat32(132, this.slice_duration, this.littleEndian);
    view.setFloat32(136, this.toffset, this.littleEndian);

    // glmax, glmin are unused

    // descrip and aux_file
    byteArray.set(encoder.encode(this.description.slice(0, 80)), 148);
    byteArray.set(encoder.encode(this.aux_file.slice(0, 24)), 228);

    // qform_code, sform_code
    view.setInt16(252, this.qform_code, this.littleEndian);
    view.setInt16(254, this.sform_code, this.littleEndian);

    // quatern_b, quatern_c, quatern_d, qoffset_x, qoffset_y, qoffset_z, srow_x[4], srow_y[4], and srow_z[4]
    view.setFloat32(256, this.quatern_b, this.littleEndian);
    view.setFloat32(260, this.quatern_c, this.littleEndian);
    view.setFloat32(264, this.quatern_d, this.littleEndian);
    view.setFloat32(268, this.qoffset_x, this.littleEndian);
    view.setFloat32(272, this.qoffset_y, this.littleEndian);
    view.setFloat32(276, this.qoffset_z, this.littleEndian);

    const srows = [this.srow_x, this.srow_y, this.srow_z];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        view.setFloat32(280 + (row * 4 + col) * 4, srows[row][col], this.littleEndian);
      }
    }

    // intent_name and magic
    byteArray.set(encoder.encode(this.intent_name.slice(0, 16)), 328);

    let magic: string;
    switch (
      this.magic // Attempt to adjust in case we are converting.
    ) {
      case 'ni2':
        magic = 'ni1';
        break;
      case 'n+2':
        magic = 'n+1';
        break;
      default:
        magic = this.magic;
    }
    byteArray.set(encoder.encode(magic.slice(0, 3)), 344);

    return byteArray;
  }

  /**
   * Serializes the NIFTI-2 header data into a binary format.
   * Creates a new typed array and copies all header fields according to the NIFTI-2 specification,
   * handling endianness conversion.
   * @returns Uint8Array containing the complete NIFTI-1 header (540 bytes)
   */
  serializeNifti2(): ArrayBuffer {
    const encoder = new TextEncoder();

    let byteArray = new Uint8Array(NIFTI2_HEADER_SIZE);
    let view = new DataView(byteArray.buffer);
    // sizeof_hdr
    view.setInt32(0, NIFTI2_HEADER_SIZE, this.littleEndian);

    // magic
    let magic: string;
    switch (
      this.magic // Attempt to adjust in case we are converting.
    ) {
      case 'ni1':
        magic = 'ni2';
        break;
      case 'n+1':
        magic = 'n+2';
        break;
      default:
        magic = this.magic;
    }
    byteArray.set(encoder.encode(magic.slice(0, 3)), 4);

    // datatype
    view.setInt16(12, this.datatypeCode, this.littleEndian);

    // bitpix
    view.setInt16(14, this.numBitsPerVoxel, this.littleEndian);

    // dim[8]
    for (let i = 0; i < 8; i++) {
      view.setBigInt64(16 + 8 * i, BigInt(this.dims[i]), this.littleEndian);
    }

    // intent_p1
    view.setFloat64(80, this.intent_p1, this.littleEndian);

    // intent_p2
    view.setFloat64(88, this.intent_p2, this.littleEndian);

    // intent_p3
    view.setFloat64(96, this.intent_p3, this.littleEndian);

    // pixdim
    for (let i = 0; i < 8; i++) {
      view.setFloat64(104 + 8 * i, this.pixDims[i], this.littleEndian);
    }

    // vox_offset
    view.setBigInt64(168, BigInt(this.vox_offset), this.littleEndian);

    // scl_slope
    view.setFloat64(176, this.scl_slope, this.littleEndian);

    // scl_inter
    view.setFloat64(184, this.scl_inter, this.littleEndian);

    // cal_max
    view.setFloat64(192, this.cal_max, this.littleEndian);

    // cal_min
    view.setFloat64(200, this.cal_min, this.littleEndian);

    // slice_duration
    view.setFloat64(208, this.slice_duration, this.littleEndian);

    // toffset
    view.setFloat64(216, this.toffset, this.littleEndian);

    // slice_start
    view.setBigInt64(224, BigInt(this.slice_start), this.littleEndian);

    // slice end
    view.setBigInt64(232, BigInt(this.slice_end), this.littleEndian);

    // descrip
    byteArray.set(encoder.encode(this.description.slice(0, 80)), 240);

    // aux_file
    byteArray.set(encoder.encode(this.aux_file.slice(0, 24)), 320);

    // qform_code
    view.setInt32(344, this.qform_code, this.littleEndian);

    // sform_code
    view.setInt32(348, this.sform_code, this.littleEndian);

    // quatern_b
    view.setFloat64(352, this.quatern_b, this.littleEndian);

    // quatern_c
    view.setFloat64(360, this.quatern_c, this.littleEndian);

    // quatern_d
    view.setFloat64(368, this.quatern_d, this.littleEndian);

    // qoffset_x
    view.setFloat64(376, this.qoffset_x, this.littleEndian);

    // qoffset_y
    view.setFloat64(384, this.qoffset_y, this.littleEndian);

    // qoffset_z
    view.setFloat64(392, this.qoffset_z, this.littleEndian);

    const srows = [this.srow_x, this.srow_y, this.srow_z];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        view.setFloat64(400 + (row * 4 + col) * 8, srows[row][col], this.littleEndian);
      }
    }

    // slice_code
    view.setInt32(496, this.slice_code, this.littleEndian);
    //  xyzt_units
    view.setInt32(500, this.xyzt_units, this.littleEndian);
    //  intent_code
    view.setInt32(504, this.intent_code, this.littleEndian);
    //  intent_name
    byteArray.set(encoder.encode(this.intent_name.slice(0, 16)), 508);
    // dim_info
    view.setUint8(524, this.dim_info);

    return byteArray.buffer;
  }
}