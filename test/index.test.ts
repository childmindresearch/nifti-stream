import { describe, it, expect } from 'vitest';
import { NiftiStream, NiftiHeader, NiftiExtension, NiftiIOError } from '@';
import { readFile } from 'fs/promises';
import { join } from 'path';

describe('NiftiStream', () => {
  const DATA_DIR = join(__dirname, '../data');

  // Helper to create a ReadableStream from a file
  async function createStreamFromFile(filename: string): Promise<ReadableStream<Uint8Array>> {
    const buffer = await readFile(join(DATA_DIR, filename));
    return new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(buffer));
        controller.close();
      },
    });
  }

  describe('Header Reading', () => {
    it('should read NIFTI-1 header correctly', async () => {
      const stream = await createStreamFromFile('avg152T1_LR_nifti.nii');
      let header: NiftiHeader | null = null;

      const reader = new NiftiStream(stream, {
        onHeader: (h) => {
          header = h;
          return true; // Stop after header
        },
      });

      await reader.start();
      expect(header).not.toBeNull();
      expect(header!.dims.length).toBeGreaterThan(0);
      expect(header!.littleEndian).toBeDefined();
    });

    it('should read NIFTI-2 header correctly', async () => {
      const stream = await createStreamFromFile('avg152T1_LR_nifti2.nii.gz');
      let header: NiftiHeader | null = null;

      const reader = new NiftiStream(stream, {
        onHeader: (h) => {
          header = h;
          return true;
        },
      });

      await reader.start();
      expect(header).not.toBeNull();
      expect(header!.dims.length).toBeGreaterThan(0);
    });

    it('should handle non-NIFTI file', async () => {
      const stream = await createStreamFromFile('not-nifti.nii');
      let error: NiftiIOError | null = null;

      const reader = new NiftiStream(stream, {
        onError: (e) => {
          error = e;
        },
      });

      await reader.start();
      expect(error).not.toBeNull();
      expect(error!.message).toContain('Not a valid NIFTI file');
    });
  });

  describe('Extension Reading', () => {
    it('should read extension when present', async () => {
      const stream = await createStreamFromFile('with_extension.nii.gz');
      let extension: NiftiExtension | null = null;

      const reader = new NiftiStream(stream, {
        onExtension: (e) => {
          extension = e;
          return true;
        },
      });

      await reader.start();
      expect(extension).not.toBeNull();
      expect(extension!.size).toBeGreaterThan(0);
      expect(extension!.code).toBeDefined();
    });
  });

  describe('Slice Reading', () => {
    it('should read 2D slices correctly', async () => {
      const stream = await createStreamFromFile('avg152T1_LR_nifti.nii');
      const slices: { data: ArrayBuffer; indices: number[] }[] = [];

      const reader = new NiftiStream(stream, {
        sliceDimension: 2,
        onSlice: (data, indices) => {
          slices.push({ data, indices });
          return slices.length >= 5; // Stop after 5 slices
        },
      });

      await reader.start();
      expect(slices.length).toBe(5);
      expect(slices[0].indices[3]).toBe(0); // First slice
      expect(slices[4].indices[3]).toBe(4); // Fifth slice
    });

    it('should read 3D volumes correctly', async () => {
      const stream = await createStreamFromFile('avg152T1_LR_nifti.nii');
      const volumes: { data: ArrayBuffer; indices: number[] }[] = [];

      const reader = new NiftiStream(stream, {
        sliceDimension: 3,
        onSlice: (data, indices) => {
          volumes.push({ data, indices });
          return false; // Stop after 1 volume
        },
      });

      await reader.start();
      expect(volumes.length).toBe(1);
      expect(volumes[0].indices[4]).toBe(0);
    });

    it('should handle 5D data correctly', async () => {
      const stream = await createStreamFromFile('5D_small.nii');
      const slices: { data: ArrayBuffer; indices: number[] }[] = [];

      const reader = new NiftiStream(stream, {
        sliceDimension: 4,
        onSlice: (data, indices) => {
          slices.push({ data, indices });
          return false;
        },
      });

      await reader.start();
      expect(slices.length).toBeGreaterThan(0);
      expect(slices[0].indices[4]).toBe(0);
    });

    it('should stream raw chunks when no slice dimension specified', async () => {
      const stream = await createStreamFromFile('little.nii.gz');
      const chunks: ArrayBuffer[] = [];

      const reader = new NiftiStream(stream, {
        onSlice: (data) => {
          chunks.push(data);
          return false;
        },
      });

      await reader.start();
      expect(chunks.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle premature stream end', async () => {
      // Create a stream that ends too early
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array(100));
          controller.close();
        },
      });

      let error: NiftiIOError | null = null;
      const reader = new NiftiStream(stream, {
        onError: (e) => {
          error = e;
        },
      });

      await reader.start();
      expect(error).not.toBeNull();
      expect(error!.message).toContain('Unexpected end of stream');
    });

    it('should handle stop() during processing', async () => {
      const stream = await createStreamFromFile('avg152T1_LR_nifti.nii');
      const slices: ArrayBuffer[] = [];

      const reader = new NiftiStream(stream, {
        sliceDimension: 2,
        onSlice: async (data) => {
          slices.push(data);
          if (slices.length === 3) {
            await reader.stop();
          }
          return false;
        },
      });

      await reader.start();
      expect(slices.length).toBe(3);
    });
  });
});
