import { describe, it, expect, beforeEach } from 'vitest';
import { gzip } from 'zlib';
import { promisify } from 'util';
import { uncompressStream } from '@/stream';

const gzipAsync = promisify(gzip);

describe('uncompressStream', () => {
  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder();

  // Helper function to create a ReadableStream from a Uint8Array
  function createReadableStream(data: Uint8Array): ReadableStream<Uint8Array> {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(data);
        controller.close();
      },
    });
  }

  // Helper function to read entire stream into a single Uint8Array
  async function streamToUint8Array(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  }

  it('should handle non-gzipped stream correctly', async () => {
    const inputText = 'Hello, World!';
    const inputData = textEncoder.encode(inputText);
    const stream = createReadableStream(inputData);

    const result = await uncompressStream(stream);
    const outputData = await streamToUint8Array(result);
    const outputText = textDecoder.decode(outputData);

    expect(outputText).toBe(inputText);
  });

  it('should decompress gzipped stream correctly', async () => {
    const inputText = 'Hello, Compressed World!';
    const inputData = textEncoder.encode(inputText);
    const compressedData = await gzipAsync(inputData);
    const stream = createReadableStream(compressedData);

    const result = await uncompressStream(stream);
    const outputData = await streamToUint8Array(result);
    const outputText = textDecoder.decode(outputData);

    expect(outputText).toBe(inputText);
  });

  it('should handle empty stream', async () => {
    const stream = createReadableStream(new Uint8Array(0));
    const result = await uncompressStream(stream);
    const outputData = await streamToUint8Array(result);

    expect(outputData.length).toBe(0);
  });

  it('should handle single-byte stream', async () => {
    const stream = createReadableStream(new Uint8Array([42]));
    const result = await uncompressStream(stream);
    const outputData = await streamToUint8Array(result);

    expect(outputData.length).toBe(1);
    expect(outputData[0]).toBe(42);
  });

  it('should handle multi-chunk streams', async () => {
    const chunks = [
      textEncoder.encode('Hello, '),
      textEncoder.encode('World'),
      textEncoder.encode('!'),
    ];

    const stream = new ReadableStream({
      start(controller) {
        chunks.forEach((chunk) => controller.enqueue(chunk));
        controller.close();
      },
    });

    const result = await uncompressStream(stream);
    const outputData = await streamToUint8Array(result);
    const outputText = textDecoder.decode(outputData);

    expect(outputText).toBe('Hello, World!');
  });

  it('should handle streams with errors', async () => {
    const errorStream = new ReadableStream({
      start(controller) {
        controller.error(new Error('Stream error'));
      },
    });

    await expect(uncompressStream(errorStream)).rejects.toThrow('Stream error');
  });
});
