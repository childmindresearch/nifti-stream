import { describe, it, expect } from 'vitest';
import { NiftiVersion, detectNiftiVersion } from '@/nifti';

describe('detectNiftiVersion', () => {
  // Helper to create test data
  function createTestBuffer(magicLocation: number, magicBytes: number[]): ArrayBuffer {
    // Create buffer of minimum size
    const buffer = new ArrayBuffer(348);
    const view = new DataView(buffer);

    // Write magic bytes at specified location
    magicBytes.forEach((byte, index) => {
      view.setUint8(magicLocation + index, byte);
    });

    return buffer;
  }

  it('should detect NIFTI1 single file format', () => {
    const buffer = createTestBuffer(344, [110, 105, 49]); // 'ni1'
    expect(detectNiftiVersion(buffer)).toBe(NiftiVersion.NIFTI1);
  });

  it('should detect NIFTI1 paired format', () => {
    const buffer = createTestBuffer(344, [110, 43, 49]); // 'n+1'
    expect(detectNiftiVersion(buffer)).toBe(NiftiVersion.NIFTI1_PAIR);
  });

  it('should detect NIFTI2 single file format', () => {
    const buffer = createTestBuffer(4, [110, 105, 50]); // 'ni2'
    expect(detectNiftiVersion(buffer)).toBe(NiftiVersion.NIFTI2);
  });

  it('should detect NIFTI2 paired format', () => {
    const buffer = createTestBuffer(4, [110, 43, 50]); // 'n+2'
    expect(detectNiftiVersion(buffer)).toBe(NiftiVersion.NIFTI2_PAIR);
  });

  it('should return NONE for buffer smaller than minimum size', () => {
    const buffer = new ArrayBuffer(347); // Minimum size is 348
    expect(detectNiftiVersion(buffer)).toBe(NiftiVersion.NONE);
  });

  it('should return NONE for invalid magic numbers', () => {
    const buffer = createTestBuffer(344, [0, 0, 0]);
    expect(detectNiftiVersion(buffer)).toBe(NiftiVersion.NONE);
  });

  it('should return NONE for empty buffer', () => {
    const buffer = new ArrayBuffer(0);
    expect(detectNiftiVersion(buffer)).toBe(NiftiVersion.NONE);
  });

  it('should handle buffer with wrong magic number location', () => {
    // Put NIFTI1 magic numbers in NIFTI2 location
    const buffer = createTestBuffer(4, [110, 105, 49]);
    expect(detectNiftiVersion(buffer)).toBe(NiftiVersion.NONE);
  });

  it('should handle buffer with mixed magic bytes', () => {
    // Put invalid combination of magic bytes
    const buffer = createTestBuffer(344, [110, 105, 50]); // mixing ni2 at nifti1 location
    expect(detectNiftiVersion(buffer)).toBe(NiftiVersion.NONE);
  });

  it('should handle large buffers', () => {
    const buffer = new ArrayBuffer(1000); // Much larger than minimum
    const view = new DataView(buffer);
    [110, 105, 49].forEach((byte, index) => {
      view.setUint8(344 + index, byte);
    });
    expect(detectNiftiVersion(buffer)).toBe(NiftiVersion.NIFTI1);
  });
});
