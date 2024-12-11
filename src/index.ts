/**
 * @file nifti-stream - A streaming parser for NIFTI-1 and NIFTI-2 neuroimaging files
 * @module nifti-stream
 */

import { NiftiIOError } from './error';
import { NiftiHeader, NiftiVersion } from './nifti';
import { NiftiExtension } from './niftiExtension';
import { NIFTI1_HEADER_SIZE, NIFTI2_HEADER_SIZE } from './niftiConstants';
import { uncompressStream } from './stream';

export { NiftiVersion, NiftiHeader, NiftiExtension, NiftiIOError };

/**
 * Configuration options for streaming NIFTI data
 */
interface NiftiStreamOptions {
  /**
   * Specifies how to slice the data during streaming:
   * - 2: Stream 2D slices (X-Y planes)
   * - 3: Stream 3D volumes (X-Y-Z volumes)
   * - 4: Stream 4D volumes (X-Y-Z-T volumes)
   * - undefined: Stream raw chunks of data without dimensional organization
   */
  sliceDimension?: 2 | 3 | 4;

  /**
   * Callback executed when the NIFTI header is parsed
   * @param header The parsed NIFTI header containing image metadata
   * @returns Optionally return true to stop streaming
   */
  onHeader?: (header: NiftiHeader) => boolean | void | Promise<boolean | void>;

  /**
   * Callback executed when a NIFTI extension is encountered
   * @param extension The parsed extension, or null if no extension present
   * @returns Optionally return true to stop streaming
   */
  onExtension?: (extension: NiftiExtension | null) => boolean | void | Promise<boolean | void>;

  /**
   * Callback executed for each slice/chunk of image data
   * @param slice Raw image data as ArrayBuffer
   * @param indices Position of this slice in the dataset (empty for raw chunks)
   * @param header The NIFTI header for reference
   * @returns Optionally return true to stop streaming
   */
  onSlice?: (
    slice: ArrayBuffer,
    indices: number[],
    header: NiftiHeader
  ) => boolean | void | Promise<boolean | void>;

  /**
   * Callback executed if an error occurs during streaming
   * @param error The error that occurred
   */
  onError?: (error: unknown) => void;
}

/**
 * Internal interface representing a slice or chunk of NIFTI data
 */
interface SliceResult {
  /** Raw image data */
  data: ArrayBuffer;
  /** Position in dataset (empty for raw chunks) */
  indices: number[];
}

/**
 * Streaming parser for NIFTI-1 and NIFTI-2 neuroimaging files.
 *
 * Designed for:
 * - Interactive medical imaging viewers that need to show data quickly
 * - Web applications processing large neuroimaging datasets
 * - Progressive loading UIs with real-time updates
 * - Efficient client-side NIFTI processing
 */
export class NiftiStream {
  private header: NiftiHeader | null = null;
  private stream: ReadableStream<Uint8Array>;
  private reader?: ReadableStreamDefaultReader<Uint8Array>;
  private stopped = false;

  private async setup(): Promise<void> {
    const decompressedStream = await uncompressStream(this.stream);
    if (decompressedStream) {
      this.stream = decompressedStream;
    }
    this.reader = this.stream.getReader();
  }

  constructor(
    stream: ReadableStream<Uint8Array>,
    private options: NiftiStreamOptions
  ) {
    this.stream = stream;
  }

  async stop() {
    this.stopped = true;
    await this.reader?.cancel();
  }

  private buffer: Uint8Array = new Uint8Array(0);
  private bufferOffset = 0;

  private async readBytes(length: number): Promise<Uint8Array> {
    if (!this.reader) {
      throw new NiftiIOError('Reader not initialized');
    }

    // If we have enough in buffer
    if (this.buffer.length - this.bufferOffset >= length) {
      const result = this.buffer.slice(this.bufferOffset, this.bufferOffset + length);
      this.bufferOffset += length;
      return result;
    }

    // Need more data
    if (this.buffer.length - this.bufferOffset > 0) {
      const remainingBytes = this.buffer.slice(this.bufferOffset);
      const { done, value } = await this.reader.read();

      if (done) {
        if (remainingBytes.length < length) {
          throw new NiftiIOError(
            `Unexpected end of stream: needed ${length} bytes but got ${remainingBytes.length}`
          );
        }
        return remainingBytes;
      }

      // Keep the entire chunk we received
      this.buffer = new Uint8Array(remainingBytes.length + value.length);
      this.buffer.set(remainingBytes);
      this.buffer.set(value, remainingBytes.length);
      this.bufferOffset = 0;

      return this.readBytes(length); // Recursively try again with new buffer
    } else {
      const { done, value } = await this.reader.read();

      if (done) {
        throw new NiftiIOError(`Unexpected end of stream: needed ${length} bytes but got 0`);
      }

      // Keep the entire chunk
      this.buffer = value;
      this.bufferOffset = 0;
      return this.readBytes(length); // Recursively try again with new buffer
    }
  }

  private async readHeader(): Promise<NiftiHeader> {
    // First read enough for NIFTI1 header
    const initialHeaderBytes = await this.readBytes(NIFTI1_HEADER_SIZE);
    const peek = NiftiHeader.peekVersion(new DataView(initialHeaderBytes.buffer));

    if (!peek) {
      throw new NiftiIOError('Not a valid NIFTI file');
    }

    if (!peek.nifti1) {
      // Need to read additional bytes for NIFTI2 header
      const remainingBytes = await this.readBytes(NIFTI2_HEADER_SIZE - NIFTI1_HEADER_SIZE);
      const fullHeaderBytes = new Uint8Array(NIFTI2_HEADER_SIZE);
      fullHeaderBytes.set(initialHeaderBytes);
      fullHeaderBytes.set(remainingBytes, NIFTI1_HEADER_SIZE);
      return NiftiHeader.parseNifti2(new DataView(fullHeaderBytes.buffer), peek.littleEndian);
    }
    return NiftiHeader.parseNifti1(new DataView(initialHeaderBytes.buffer), peek.littleEndian);
  }

  private async readExtension(): Promise<NiftiExtension | null> {
    if (!this.header || !this.reader) {
      throw new NiftiIOError('Cannot read extension before header');
    }

    // Is an extension present?
    const extensionFlagBytes = await this.readBytes(4);
    if (extensionFlagBytes[0] === 0) {
      return null;
    }

    // Read the extension header
    const extensionHeaderBytes = await this.readBytes(8);

    // Parse extension header
    const littleEndian = this.header.littleEndian;
    const view = new DataView(extensionHeaderBytes.buffer);
    const esize = view.getInt32(0, littleEndian);
    const ecode = view.getInt32(4, littleEndian);

    // Read the actual extension data
    const edataSize = esize - 8; // subtract header size
    const edata = await this.readBytes(edataSize);

    return new NiftiExtension({
      esize,
      ecode,
      edata: edata.buffer,
      littleEndian,
    });
  }

  private dataPosition = 0; // Track where we are in the data

  private async readNextSlice(): Promise<SliceResult | null> {
    if (!this.header) {
      throw new NiftiIOError('Cannot read slice before header');
    }

    // For raw streaming (no slice dimension specified)
    if (!this.options.sliceDimension) {
      // If this is our first read, we can use any remaining bytes in our buffer
      if (this.dataPosition === 0 && this.buffer.length > this.bufferOffset) {
        const data = this.buffer.slice(this.bufferOffset);
        this.buffer = new Uint8Array(0);
        this.bufferOffset = 0;
        this.dataPosition++;
        return {
          data: data.buffer,
          indices: [],
        };
      }

      // Otherwise read next chunk directly from stream
      const { done, value } = await this.reader!.read();
      if (done) return null;

      this.dataPosition++;
      return {
        data: value.buffer,
        indices: [],
      };
    }

    // Calculate slice size
    const ndim = this.header.dims[0];
    const dims = this.header.dims;
    const bytesPerVoxel = this.header.numBitsPerVoxel / 8;

    let sliceSize = bytesPerVoxel;
    for (let i = 1; i <= (this.options.sliceDimension || 2); i++) {
      if (dims[i] > 0) {
        sliceSize *= dims[i];
      }
    }

    try {
      const sliceData = await this.readBytes(sliceSize);
      const indices = new Array(ndim).fill(0);
      indices[this.options.sliceDimension + 1] = this.dataPosition++;

      return {
        data: sliceData.buffer,
        indices,
      };
    } catch (e) {
      if (e instanceof NiftiIOError) {
        return null;
      }
      throw e;
    }
  }

  async start() {
    await this.setup();
    if (!this.reader) return;

    try {
      // Read header
      if (this.stopped) return;
      this.header = await this.readHeader();
      if (this.options.onHeader) {
        const shouldStop = await this.options.onHeader(this.header);
        if (shouldStop) {
          await this.stop();
          return;
        }
      } else if (!this.options.onExtension && !this.options.onSlice) {
        await this.stop();
        return;
      }

      // Read extension if present
      if (!this.stopped) {
        const extension = await this.readExtension();
        if (this.options.onExtension) {
          const shouldStop = await this.options.onExtension(extension);
          if (shouldStop) {
            await this.stop();
            return;
          }
        } else if (!this.options.onSlice) {
          await this.stop();
          return;
        }
      }

      // Stream slices until stopped or done
      if (!this.options.onSlice) {
        await this.stop();
        return;
      }

      while (!this.stopped) {
        const slice = await this.readNextSlice();
        if (!slice) break; // end of stream

        const shouldStop = await this.options.onSlice(slice.data, slice.indices, this.header!);
        if (shouldStop) {
          await this.stop();
          break;
        }
      }
    } catch (error) {
      if (this.options.onError) {
        this.options.onError(error);
      }
    } finally {
      this.reader.releaseLock();
    }
  }
}
