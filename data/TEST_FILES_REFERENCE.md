# NIfTI Test Files Reference Data

This document contains reference information about the test files, analyzed using nibabel. 
This information can be used to verify the behavior of our own NIfTI implementation.

Generated using nibabel version: 5.3.2

Note: This data is provided as a reference only. Our implementation may have valid reasons 
to interpret certain fields differently from nibabel.

---

## 5D_small.nii

Reference information from nibabel analysis:

### File Structure
- File size: 370 bytes
- Format detected by nibabel: Nifti1Header

### Header Information
- Data shape: (1, 2, 3, 1, 3)
- Data type: uint8
- Voxel dimensions: (np.float32(1.0), np.float32(1.0), np.float32(1.0), np.float32(0.0), np.float32(0.0))
- Header size: 348
- Voxel offset: 0.0
- Byte order: Little Endian

### Reference Affine (from nibabel)
```
      -0.000   -0.002    1.000  -87.893
      -0.992    0.128    0.000  147.398
       0.128    0.992    0.002 -120.617
       0.000    0.000    0.000    1.000
```

### Additional NIfTI Metadata
- dim_info: 0
- dims: [5, 1, 2, 3, 1, 3, 1, 1]
- datatype: 2 (uint8)
- bitpix: 8
- pixdim: [-1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0]
- qform_code: 2 (ALIGNED_ANAT)
- sform_code: 1 (SCANNER_ANAT)
- xyzt_units: 2
- quatern_b,c,d: 0.467287, -0.531470, -0.466412
- qoffset_x,y,z: -87.893463, 147.398468, -120.617279
- srow_x: [-6.920585349234898e-08, -0.0016480153426527977, 0.9999986290931702, -87.89346313476562]
- srow_y: [-0.9917474985122681, 0.12820644676685333, 0.0002112178481183946, 147.39846801757812]
- srow_z: [0.12820661067962646, 0.9917461276054382, 0.0016344239702448249, -120.61727905273438]

### Raw Binary Start
First 16 bytes in hex:
`5c 01 00 00 00 00 00 00 00 00 00 00 00 00 00 00`

## 5D_zeros.nii.gz

Reference information from nibabel analysis:

### File Structure
- File size: 146049 bytes
- Format detected by nibabel: Nifti1Header

### Header Information
- Data shape: (256, 256, 170, 1, 3)
- Data type: uint8
- Voxel dimensions: (np.float32(1.0), np.float32(1.0), np.float32(1.0), np.float32(0.0), np.float32(0.0))
- Header size: 348
- Voxel offset: 0.0
- Byte order: Little Endian

### Reference Affine (from nibabel)
```
      -0.000   -0.002    1.000  -87.893
      -0.992    0.128    0.000  147.398
       0.128    0.992    0.002 -120.617
       0.000    0.000    0.000    1.000
```

### Additional NIfTI Metadata
- dim_info: 0
- dims: [5, 256, 256, 170, 1, 3, 1, 1]
- datatype: 2 (uint8)
- bitpix: 8
- pixdim: [-1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0]
- qform_code: 2 (ALIGNED_ANAT)
- sform_code: 1 (SCANNER_ANAT)
- xyzt_units: 2
- quatern_b,c,d: 0.467287, -0.531470, -0.466412
- qoffset_x,y,z: -87.893463, 147.398468, -120.617279
- srow_x: [-6.920585349234898e-08, -0.0016480153426527977, 0.9999986290931702, -87.89346313476562]
- srow_y: [-0.9917474985122681, 0.12820644676685333, 0.0002112178481183946, 147.39846801757812]
- srow_z: [0.12820661067962646, 0.9917461276054382, 0.0016344239702448249, -120.61727905273438]

### Raw Binary Start
First 16 bytes in hex:
`1f 8b 08 08 8b ca 85 61 04 ff 35 44 5f 7a 65 72`

## air.hdr.gz

Reference information from nibabel analysis:

### File Structure
- File size: 129 bytes
- Format detected by nibabel: Nifti1PairHeader

### Header Information
- Data shape: (79, 67, 64)
- Data type: float32
- Voxel dimensions: (np.float32(2.3897538), np.float32(2.3664863), np.float32(2.3852322))
- Header size: 348
- Voxel offset: 0.0
- Byte order: Little Endian

### Reference Affine (from nibabel)
```
       0.000   -0.000    2.385  -75.763
       2.390   -0.000    0.000 -110.763
       0.000   -2.366    0.000   84.426
       0.000    0.000    0.000    1.000
```

### Additional NIfTI Metadata
- dim_info: 0
- dims: [3, 79, 67, 64, 1, 1, 1, 1]
- datatype: 16 (float32)
- bitpix: 32
- pixdim: [1.0, 2.389753818511963, 2.3664863109588623, 2.3852322101593018, 1.0, 1.0, 1.0, 1.0]
- qform_code: 0 (UNKNOWN)
- sform_code: 1 (SCANNER_ANAT)
- xyzt_units: 10
- quatern_b,c,d: 0.000000, 0.000000, 0.000000
- qoffset_x,y,z: 0.000000, 0.000000, 0.000000
- srow_x: [0.0, -0.0, 2.3852322101593018, -75.76253509521484]
- srow_y: [2.389753818511963, -0.0, 0.0, -110.76253509521484]
- srow_z: [0.0, -2.3664863109588623, 0.0, 84.4255599975586]

### Raw Binary Start
First 16 bytes in hex:
`1f 8b 08 00 00 00 00 00 00 03 8b 61 64 c0 0f 1c`

## air.img.gz

Reference information from nibabel analysis:

### File Structure
- File size: 219971 bytes
- Format detected by nibabel: Nifti1PairHeader

### Header Information
- Data shape: (79, 67, 64)
- Data type: float32
- Voxel dimensions: (np.float32(2.3897538), np.float32(2.3664863), np.float32(2.3852322))
- Header size: 348
- Voxel offset: 0.0
- Byte order: Little Endian

### Reference Affine (from nibabel)
```
       0.000   -0.000    2.385  -75.763
       2.390   -0.000    0.000 -110.763
       0.000   -2.366    0.000   84.426
       0.000    0.000    0.000    1.000
```

### Additional NIfTI Metadata
- dim_info: 0
- dims: [3, 79, 67, 64, 1, 1, 1, 1]
- datatype: 16 (float32)
- bitpix: 32
- pixdim: [1.0, 2.389753818511963, 2.3664863109588623, 2.3852322101593018, 1.0, 1.0, 1.0, 1.0]
- qform_code: 0 (UNKNOWN)
- sform_code: 1 (SCANNER_ANAT)
- xyzt_units: 10
- quatern_b,c,d: 0.000000, 0.000000, 0.000000
- qoffset_x,y,z: 0.000000, 0.000000, 0.000000
- srow_x: [0.0, -0.0, 2.3852322101593018, -75.76253509521484]
- srow_y: [2.389753818511963, -0.0, 0.0, -110.76253509521484]
- srow_z: [0.0, -2.3664863109588623, 0.0, 84.4255599975586]

### Raw Binary Start
First 16 bytes in hex:
`1f 8b 08 00 00 00 00 00 00 03 ec bd 0b 8c 5d d5`

## air2.hdr.gz

Reference information from nibabel analysis:

### File Structure
- File size: 139 bytes
- Format detected by nibabel: Nifti2PairHeader

### Header Information
- Data shape: (79, 67, 64)
- Data type: float32
- Voxel dimensions: (np.float64(2.389753818511963), np.float64(2.3664863109588623), np.float64(2.3852322101593018))
- Header size: 540
- Voxel offset: 0
- Byte order: Little Endian

### Reference Affine (from nibabel)
```
       0.000   -0.000    2.385  -75.763
       2.390   -0.000    0.000 -110.763
       0.000   -2.366    0.000   84.426
       0.000    0.000    0.000    1.000
```

### Additional NIfTI Metadata
- dim_info: 0
- dims: [3, 79, 67, 64, 1, 1, 1, 1]
- datatype: 16 (float32)
- bitpix: 32
- pixdim: [1.0, 2.389753818511963, 2.3664863109588623, 2.3852322101593018, 1.0, 1.0, 1.0, 1.0]
- qform_code: 0 (UNKNOWN)
- sform_code: 1 (SCANNER_ANAT)
- xyzt_units: 10
- quatern_b,c,d: 0.000000, 0.000000, 0.000000
- qoffset_x,y,z: 0.000000, 0.000000, 0.000000
- srow_x: [0.0, -0.0, 2.3852322101593018, -75.76253509521484]
- srow_y: [2.389753818511963, -0.0, 0.0, -110.76253509521484]
- srow_z: [0.0, -2.3664863109588623, 0.0, 84.4255599975586]

### Raw Binary Start
First 16 bytes in hex:
`1f 8b 08 00 00 00 00 00 00 03 93 61 62 60 c8 cb`

## air2.img.gz

Reference information from nibabel analysis:

### File Structure
- File size: 219971 bytes
- Format detected by nibabel: Nifti2PairHeader

### Header Information
- Data shape: (79, 67, 64)
- Data type: float32
- Voxel dimensions: (np.float64(2.389753818511963), np.float64(2.3664863109588623), np.float64(2.3852322101593018))
- Header size: 540
- Voxel offset: 0
- Byte order: Little Endian

### Reference Affine (from nibabel)
```
       0.000   -0.000    2.385  -75.763
       2.390   -0.000    0.000 -110.763
       0.000   -2.366    0.000   84.426
       0.000    0.000    0.000    1.000
```

### Additional NIfTI Metadata
- dim_info: 0
- dims: [3, 79, 67, 64, 1, 1, 1, 1]
- datatype: 16 (float32)
- bitpix: 32
- pixdim: [1.0, 2.389753818511963, 2.3664863109588623, 2.3852322101593018, 1.0, 1.0, 1.0, 1.0]
- qform_code: 0 (UNKNOWN)
- sform_code: 1 (SCANNER_ANAT)
- xyzt_units: 10
- quatern_b,c,d: 0.000000, 0.000000, 0.000000
- qoffset_x,y,z: 0.000000, 0.000000, 0.000000
- srow_x: [0.0, -0.0, 2.3852322101593018, -75.76253509521484]
- srow_y: [2.389753818511963, -0.0, 0.0, -110.76253509521484]
- srow_z: [0.0, -2.3664863109588623, 0.0, 84.4255599975586]

### Raw Binary Start
First 16 bytes in hex:
`1f 8b 08 00 00 00 00 00 00 03 ec bd 0b 8c 5d d5`

## avg152T1_LR_nifti.nii

Reference information from nibabel analysis:

### File Structure
- File size: 902981 bytes
- Format detected by nibabel: Nifti1Header

### Header Information
- Data shape: (91, 109, 91)
- Data type: uint8
- Voxel dimensions: (np.float32(2.0), np.float32(2.0), np.float32(2.0))
- Header size: 348
- Voxel offset: 0.0
- Byte order: Big Endian

### Reference Affine (from nibabel)
```
      -2.000    0.000    0.000   90.000
       0.000    2.000    0.000 -126.000
       0.000    0.000    2.000  -72.000
       0.000    0.000    0.000    1.000
```

### Additional NIfTI Metadata
- dim_info: 0
- dims: [3, 91, 109, 91, 1, 1, 1, 1]
- datatype: 2 (uint8)
- bitpix: 8
- pixdim: [1.0, 2.0, 2.0, 2.0, 1.0, 1.0, 1.0, 1.0]
- qform_code: 0 (UNKNOWN)
- sform_code: 4 (MNI_152)
- xyzt_units: 10
- quatern_b,c,d: 0.000000, 0.000000, 0.000000
- qoffset_x,y,z: 0.000000, 0.000000, 0.000000
- srow_x: [-2.0, 0.0, 0.0, 90.0]
- srow_y: [0.0, 2.0, 0.0, -126.0]
- srow_z: [0.0, 0.0, 2.0, -72.0]

### Raw Binary Start
First 16 bytes in hex:
`00 00 01 5c 00 00 00 00 00 00 00 00 00 00 00 00`

## avg152T1_LR_nifti.nii.gz

Reference information from nibabel analysis:

### File Structure
- File size: 531671 bytes
- Format detected by nibabel: Nifti1Header

### Header Information
- Data shape: (91, 109, 91)
- Data type: uint8
- Voxel dimensions: (np.float32(2.0), np.float32(2.0), np.float32(2.0))
- Header size: 348
- Voxel offset: 0.0
- Byte order: Big Endian

### Reference Affine (from nibabel)
```
      -2.000    0.000    0.000   90.000
       0.000    2.000    0.000 -126.000
       0.000    0.000    2.000  -72.000
       0.000    0.000    0.000    1.000
```

### Additional NIfTI Metadata
- dim_info: 0
- dims: [3, 91, 109, 91, 1, 1, 1, 1]
- datatype: 2 (uint8)
- bitpix: 8
- pixdim: [1.0, 2.0, 2.0, 2.0, 1.0, 1.0, 1.0, 1.0]
- qform_code: 0 (UNKNOWN)
- sform_code: 4 (MNI_152)
- xyzt_units: 10
- quatern_b,c,d: 0.000000, 0.000000, 0.000000
- qoffset_x,y,z: 0.000000, 0.000000, 0.000000
- srow_x: [-2.0, 0.0, 0.0, 90.0]
- srow_y: [0.0, 2.0, 0.0, -126.0]
- srow_z: [0.0, 0.0, 2.0, -72.0]

### Raw Binary Start
First 16 bytes in hex:
`1f 8b 08 08 5f 0b 5d 42 00 03 61 76 67 31 35 32`

## avg152T1_LR_nifti2.nii.gz

Reference information from nibabel analysis:

### File Structure
- File size: 763810 bytes
- Format detected by nibabel: Nifti2Header

### Header Information
- Data shape: (91, 109, 91)
- Data type: float32
- Voxel dimensions: (np.float64(2.0), np.float64(2.0), np.float64(2.0))
- Header size: 540
- Voxel offset: 0
- Byte order: Little Endian

### Reference Affine (from nibabel)
```
      -2.000    0.000    0.000   90.000
       0.000    2.000    0.000 -126.000
       0.000    0.000    2.000  -72.000
       0.000    0.000    0.000    1.000
```

### Additional NIfTI Metadata
- dim_info: 0
- dims: [3, 91, 109, 91, 1, 1, 1, 1]
- datatype: 16 (float32)
- bitpix: 32
- pixdim: [1.0, 2.0, 2.0, 2.0, 1.0, 1.0, 1.0, 1.0]
- qform_code: 0 (UNKNOWN)
- sform_code: 4 (MNI_152)
- xyzt_units: 10
- quatern_b,c,d: 0.000000, 0.000000, 0.000000
- qoffset_x,y,z: 0.000000, 0.000000, 0.000000
- srow_x: [-2.0, 0.0, 0.0, 90.0]
- srow_y: [0.0, 2.0, 0.0, -126.0]
- srow_z: [0.0, 0.0, 2.0, -72.0]

### Raw Binary Start
First 16 bytes in hex:
`1f 8b 08 00 00 00 00 00 00 03 c4 bd 7f 68 95 d7`

## big.nii.gz

Reference information from nibabel analysis:

### File Structure
- File size: 72939 bytes
- Format detected by nibabel: Nifti1Header

### Header Information
- Data shape: (64, 64, 21)
- Data type: >f4
- Voxel dimensions: (np.float32(4.0), np.float32(4.0), np.float32(6.0))
- Header size: 348
- Voxel offset: 0.0
- Byte order: Big Endian

### Reference Affine (from nibabel)
```
      -4.000    0.000    0.000    0.000
       0.000    4.000    0.000    0.000
       0.000    0.000    6.000    0.000
       0.000    0.000    0.000    1.000
```

### Additional NIfTI Metadata
- dim_info: 0
- dims: [3, 64, 64, 21, 1, 1, 1, 1]
- datatype: 16 (>f4)
- bitpix: 32
- pixdim: [-1.0, 4.0, 4.0, 6.0, 1.0, 1.0, 1.0, 1.0]
- qform_code: 1 (SCANNER_ANAT)
- sform_code: 0 (UNKNOWN)
- xyzt_units: 10
- quatern_b,c,d: 0.000000, 1.000000, 0.000000
- qoffset_x,y,z: 0.000000, 0.000000, 0.000000
- srow_x: [0.0, 0.0, 0.0, 0.0]
- srow_y: [0.0, 0.0, 0.0, 0.0]
- srow_z: [0.0, 0.0, 0.0, 0.0]

### Raw Binary Start
First 16 bytes in hex:
`1f 8b 08 08 38 09 5d 42 00 03 7a 73 74 61 74 31`

## generate_test_docs.py

Not a NIfTI file, skipping.

## little.nii.gz

Reference information from nibabel analysis:

### File Structure
- File size: 71853 bytes
- Format detected by nibabel: Nifti1Header

### Header Information
- Data shape: (64, 64, 21, 1)
- Data type: float32
- Voxel dimensions: (np.float32(4.0), np.float32(4.0), np.float32(6.0), np.float32(1.0))
- Header size: 348
- Voxel offset: 0.0
- Byte order: Little Endian

### Reference Affine (from nibabel)
```
      -4.000    0.000    0.000    0.000
       0.000    4.000    0.000    0.000
       0.000    0.000    6.000    0.000
       0.000    0.000    0.000    1.000
```

### Additional NIfTI Metadata
- dim_info: 0
- dims: [4, 64, 64, 21, 1, 1, 1, 1]
- datatype: 16 (float32)
- bitpix: 32
- pixdim: [-1.0, 4.0, 4.0, 6.0, 1.0, 1.0, 1.0, 1.0]
- qform_code: 1 (SCANNER_ANAT)
- sform_code: 0 (UNKNOWN)
- xyzt_units: 10
- quatern_b,c,d: 0.000000, 1.000000, 0.000000
- qoffset_x,y,z: 0.000000, 0.000000, 0.000000
- srow_x: [0.0, 0.0, 0.0, 0.0]
- srow_y: [0.0, 0.0, 0.0, 0.0]
- srow_z: [0.0, 0.0, 0.0, 0.0]

### Raw Binary Start
First 16 bytes in hex:
`1f 8b 08 00 00 00 00 00 00 00 ec dd 09 3c 95 dd`

## not-nifti.nii

Error reading file with nibabel: Cannot work out file type of "not-nifti.nii"

## TEST_FILES_REFERENCE.md

Not a NIfTI file, skipping.

## with_extension.nii.gz

Reference information from nibabel analysis:

### File Structure
- File size: 58809 bytes
- Format detected by nibabel: Nifti1Header

### Header Information
- Data shape: (161, 191, 151, 1)
- Data type: uint8
- Voxel dimensions: (np.float32(1.0), np.float32(1.0), np.float32(1.0), np.float32(0.0))
- Header size: 348
- Voxel offset: 0.0
- Byte order: Big Endian

### Reference Affine (from nibabel)
```
      -1.000    0.000   -0.000   80.000
       0.000   -1.000   -0.000   80.000
       0.000    0.000   -1.000   85.000
       0.000    0.000    0.000    1.000
```

### Additional NIfTI Metadata
- dim_info: 0
- dims: [4, 161, 191, 151, 1, 0, 0, 0]
- datatype: 2 (uint8)
- bitpix: 8
- pixdim: [-1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0]
- qform_code: 3 (TALAIRACH)
- sform_code: 3 (TALAIRACH)
- xyzt_units: 2
- quatern_b,c,d: 0.000000, 0.000000, 1.000000
- qoffset_x,y,z: 80.000000, 80.000000, 85.000000
- srow_x: [-1.0, 0.0, -0.0, 80.0]
- srow_y: [0.0, -1.0, -0.0, 80.0]
- srow_z: [0.0, 0.0, -1.0, 85.0]

### Raw Binary Start
First 16 bytes in hex:
`1f 8b 08 00 00 00 00 00 00 00 ec dd cd 8e 25 59`
