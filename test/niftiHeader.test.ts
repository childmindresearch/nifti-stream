import { describe, it, expect } from 'vitest';
import { NiftiHeader, NiftiVersion } from '../src/niftiHeader';
import { DataTypeCode, TransformCode, UnitsCode } from '../src/niftiConstants';
import { promises as fs } from 'fs';
import { join } from 'path';
import { gunzip } from 'zlib';
import { promisify } from 'util';

const gunzipAsync = promisify(gunzip);

describe('NiftiHeader', () => {
  const TEST_DATA_DIR = 'data';

  async function readTestFile(filename: string): Promise<Buffer> {
    const data = await fs.readFile(join(TEST_DATA_DIR, filename));
    if (filename.endsWith('.gz')) {
      return await gunzipAsync(data);
    }
    return data;
  }

  describe('Format Detection and Basic Properties', () => {
    it('should correctly identify NIfTI-1 single file', async () => {
      const data = await readTestFile('avg152T1_LR_nifti.nii');
      const view = new DataView(data.buffer);
      const peekInfo = NiftiHeader.peekVersion(view);
      const header = NiftiHeader.parse(view, peekInfo!);

      expect(header.getNiftiVersion()).toBe(NiftiVersion.NIFTI1);
      expect(header.magic).toBe('n+1');
      expect(header.littleEndian).toBeFalsy();
      expect(header.voxOffset).toBe(352);
      expect(header.datatypeCode).toBe(DataTypeCode.UINT8);
      expect(header.sFormCode).toBe(TransformCode.MNI_152);
    });

    it('should correctly identify NIfTI-2 format', async () => {
      const data = await readTestFile('avg152T1_LR_nifti2.nii.gz');
      const view = new DataView(data.buffer);
      const peekInfo = NiftiHeader.peekVersion(view);
      const header = NiftiHeader.parse(view, peekInfo!);

      expect(header.getNiftiVersion()).toBe(NiftiVersion.NIFTI2);
      expect(header.littleEndian).toBeTruthy();
      expect(header.datatypeCode).toBe(DataTypeCode.FLOAT32);
      expect(header.sFormCode).toBe(TransformCode.MNI_152);
    });

    it('should correctly handle paired NIfTI-1 files', async () => {
      const data = await readTestFile('air.hdr.gz');
      const view = new DataView(data.buffer);
      const peekInfo = NiftiHeader.peekVersion(view);
      const header = NiftiHeader.parse(view, peekInfo!);

      expect(header.getNiftiVersion()).toBe(NiftiVersion.NIFTI1_PAIR);
      expect(header.magic).toBe('ni1');
      expect(header.datatypeCode).toBe(DataTypeCode.FLOAT32);
      expect(header.sFormCode).toBe(TransformCode.SCANNER_ANAT);
    });

    it('should correctly handle paired NIfTI-2 files', async () => {
      const data = await readTestFile('air2.hdr.gz');
      const view = new DataView(data.buffer);
      const peekInfo = NiftiHeader.peekVersion(view);
      const header = NiftiHeader.parse(view, peekInfo!);

      expect(header.getNiftiVersion()).toBe(NiftiVersion.NIFTI2_PAIR);
      expect(header.datatypeCode).toBe(DataTypeCode.FLOAT32);
      expect(header.sFormCode).toBe(TransformCode.SCANNER_ANAT);
    });
  });

  describe('Dimension and Data Type Handling', () => {
    it('should handle small 5D datasets correctly', async () => {
      const data = await readTestFile('5D_small.nii');
      const view = new DataView(data.buffer);
      const peekInfo = NiftiHeader.peekVersion(view);
      const header = NiftiHeader.parse(view, peekInfo!);

      expect(header.dims[0]).toBe(5);
      expect(Array.from(header.dims)).toEqual([5, 1, 2, 3, 1, 3, 1, 1]);
      expect(header.datatypeCode).toBe(DataTypeCode.UINT8);
      expect(header.numBitsPerVoxel).toBe(8);
      expect(header.qFormCode).toBe(TransformCode.ALIGNED_ANAT);
      expect(header.sFormCode).toBe(TransformCode.SCANNER_ANAT);
    });

    it('should handle large 5D datasets', async () => {
      const data = await readTestFile('5D_zeros.nii.gz');
      const view = new DataView(data.buffer);
      const peekInfo = NiftiHeader.peekVersion(view);
      const header = NiftiHeader.parse(view, peekInfo!);

      expect(header.dims[0]).toBe(5);
      expect(Array.from(header.dims)).toEqual([5, 256, 256, 170, 1, 3, 1, 1]);
      expect(header.datatypeCode).toBe(DataTypeCode.UINT8);
      expect(header.qFormCode).toBe(TransformCode.ALIGNED_ANAT);
      expect(header.sFormCode).toBe(TransformCode.SCANNER_ANAT);
    });
  });

  describe('Transform and Units', () => {
    it('should correctly handle Talairach space', async () => {
      const data = await readTestFile('with_extension.nii.gz');
      const view = new DataView(data.buffer);
      const peekInfo = NiftiHeader.peekVersion(view);
      const header = NiftiHeader.parse(view, peekInfo!);

      expect(header.qFormCode).toBe(TransformCode.TALAIRACH);
      expect(header.sFormCode).toBe(TransformCode.TALAIRACH);
      expect(header.spatialUnits).toBe(UnitsCode.MM);
    });

    it('should handle standard spatial and temporal units', async () => {
      const data = await readTestFile('avg152T1_LR_nifti.nii');
      const view = new DataView(data.buffer);
      const peekInfo = NiftiHeader.peekVersion(view);
      const header = NiftiHeader.parse(view, peekInfo!);

      // xyzt_units is 10, which breaks down to:
      // spatial units (2) = NIFTI_UNITS_MM
      // temporal units (8) = NIFTI_UNITS_SEC
      expect(header.spatialUnits).toBe(UnitsCode.MM);
      expect(header.temporalUnits).toBe(UnitsCode.SEC);
    });
  });

  describe('Endianness Handling', () => {
    it('should handle big-endian float32 files', async () => {
      const data = await readTestFile('big.nii.gz');
      const view = new DataView(data.buffer);
      const peekInfo = NiftiHeader.peekVersion(view);
      const header = NiftiHeader.parse(view, peekInfo!);

      expect(header.littleEndian).toBeFalsy();
      expect(header.datatypeCode).toBe(DataTypeCode.FLOAT32);
      expect(header.dims).toEqual([3, 64, 64, 21, 1, 1, 1, 1]);
      expect(header.qFormCode).toBe(TransformCode.SCANNER_ANAT);
    });

    it('should handle little-endian float32 files', async () => {
      const data = await readTestFile('little.nii.gz');
      const view = new DataView(data.buffer);
      const peekInfo = NiftiHeader.peekVersion(view);
      const header = NiftiHeader.parse(view, peekInfo!);

      expect(header.littleEndian).toBeTruthy();
      expect(header.datatypeCode).toBe(DataTypeCode.FLOAT32);
      expect(header.dims).toEqual([4, 64, 64, 21, 1, 1, 1, 1]);
      expect(header.qFormCode).toBe(TransformCode.SCANNER_ANAT);
    });
  });

  describe('Special Cases', () => {
    it('should handle files with extensions', async () => {
      const data = await readTestFile('with_extension.nii.gz');
      const view = new DataView(data.buffer);
      const peekInfo = NiftiHeader.peekVersion(view);
      const header = NiftiHeader.parse(view, peekInfo!);

      expect(header.dims).toEqual([4, 161, 191, 151, 1, 0, 0, 0]);
      expect(header.datatypeCode).toBe(DataTypeCode.UINT8);
      expect(header.qFormCode).toBe(TransformCode.TALAIRACH);
      expect(header.sFormCode).toBe(TransformCode.TALAIRACH);
      expect(header.quaternB).toBe(0);
      expect(header.quaternC).toBe(0);
      expect(header.quaternD).toBe(1);
    });

    it('should reject invalid NIfTI files', async () => {
      const data = await readTestFile('not-nifti.nii');
      const view = new DataView(data.buffer);
      const peekInfo = NiftiHeader.peekVersion(view);

      expect(peekInfo).toBeUndefined();
    });
  });
});
