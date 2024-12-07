export async function uncompressStream(
  stream: ReadableStream<Uint8Array>
): Promise<ReadableStream<Uint8Array>> {
  const reader = stream.getReader();
  const { done, value } = await reader.read();

  // If the first read is done, return an empty stream
  if (done) {
    reader.releaseLock();
    return new ReadableStream({
      start(controller) {
        controller.close();
      },
    });
  }

  // Too short to be compressed
  if (!value || value.length < 2) {
    reader.releaseLock();
    return new ReadableStream({
      start(controller) {
        if (value) {
          controller.enqueue(value);
        }
        controller.close();
      },
    });
  }

  const isGzip = value[0] === 31 && value[1] === 139;

  // Create new stream starting with the first chunk
  const uncompressedStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        // Enqueue the first chunk we already read
        controller.enqueue(value);

        // Process remaining chunks
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            reader.releaseLock();
            break;
          }
          controller.enqueue(value);
        }
      } catch (error) {
        controller.error(error);
        reader.releaseLock();
      }
    },
  });

  if (isGzip) {
    return uncompressedStream.pipeThrough(new DecompressionStream('gzip'));
  }
  return uncompressedStream;
}
