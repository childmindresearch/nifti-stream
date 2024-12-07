# nifti-stream

A streaming parser for NIFTI-1 and NIFTI-2 neuroimaging files, designed for efficient client-side processing and progressive loading in web applications.

Based on [NIFTI-Reader-JS](https://github.com/rii-mango/NIFTI-Reader-JS).

## Features

- 🚰 **True Streaming**: Process NIFTI files as they download, no need to wait for complete file
- 🔄 **Progressive Loading**: Load and display slices as they arrive
- 📊 **Flexible Dimension Handling**: Stream 2D slices, 3D volumes, or 4D timeseries
- 🗜️ **Automatic Decompression**: Handles gzipped NIFTI files transparently
- 🎯 **Selective Loading**: Read only the header, or stop after specific slices
- 💻 **Browser-Ready**: Works directly in modern browsers
- 📦 **Lightweight**: Zero dependencies, focused implementation

### Live demo

See our [live demo](https://childmindresearch.github.io/nifti-stream/demo) and check out the [demo source code](https://github.com/childmindresearch/nifti-stream/tree/main/demo).

## Installation

```bash
npm install nifti-stream
```

## Quick Start

```javascript
import { NiftiStream } from 'nifti-stream';

// Get a ReadableStream from fetch
const response = await fetch('brain.nii.gz');
const reader = new NiftiStream(response.body, {
  sliceDimension: 2,  // Stream 2D slices
  onHeader: (header) => {
    console.log('Dimensions:', header.dims);
  },
  onSlice: (data, indices) => {
    // Process each slice as it arrives
    displaySlice(data, indices);
  }
});

await reader.start();
```

## Usage

### Streaming Options

```javascript
const reader = new NiftiStream(stream, {
  // Choose how to slice the data
  sliceDimension: 2,  // 2 for XY slices, 3 for volumes, 4 for timeseries

  // Get header metadata
  onHeader: (header) => {
    console.log(header.dims);        // Image dimensions
    console.log(header.pixDims);     // Voxel sizes
    console.log(header.datatype);    // Data type
    return false;  // Return true to stop after header
  },

  // Handle extensions if present
  onExtension: (extension) => {
    if (extension) {
      console.log(extension.ecode);  // Extension code
      console.log(extension.edata);  // Extension data
    }
  },

  // Process image data
  onSlice: (data, indices, header) => {
    // data: ArrayBuffer containing raw slice data
    // indices: Position of slice in dataset
    // header: Reference to NIFTI header
  },

  // Handle any errors
  onError: (error) => {
    console.error('Error:', error);
  }
});
```

### Control Flow

Stop streaming at any time:
```javascript
await reader.stop();
```

## API Documentation

Full API documentation is available at [username.github.io/nifti-stream](https://childmindresearch.github.io/nifti-stream).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
