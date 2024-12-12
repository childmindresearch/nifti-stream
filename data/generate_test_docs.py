import os
import nibabel as nib
from pathlib import Path
import numpy as np

QFORM_CODES = {
    0: 'UNKNOWN',
    1: 'SCANNER_ANAT',
    2: 'ALIGNED_ANAT',
    3: 'TALAIRACH',
    4: 'MNI_152'
}

def format_affine(affine):
    """Format affine matrix nicely for markdown"""
    lines = []
    for row in affine:
        lines.append(f"    {' '.join(f'{x:8.3f}' for x in row)}")
    return '\n'.join(lines)

def get_qform_name(code):
    """Get string representation of qform code"""
    return QFORM_CODES.get(code, f'UNKNOWN_{code}')

def get_file_info(filepath):
    """Get reference information about a NIfTI file using nibabel"""
    if not filepath.name.endswith(('.nii', '.nii.gz', '.hdr', '.hdr.gz', '.img', '.img.gz')):
        return f"## {filepath.name}\n\nNot a NIfTI file, skipping.\n"
        
    try:
        img = nib.load(filepath)
        hdr = img.header
        
        info = [
            f"## {filepath.name}",
            "",
            "Reference information from nibabel analysis:",
            "",
            "### File Structure",
            f"- File size: {filepath.stat().st_size} bytes",
            f"- Format detected by nibabel: {type(hdr).__name__}",
            "",
            "### Header Information",
            f"- Data shape: {img.shape}",
            f"- Data type: {hdr.get_data_dtype()}",
            f"- Voxel dimensions: {hdr.get_zooms()}",
            f"- Header size: {hdr.sizeof_hdr}",
        ]

        # Add magic string if present (NIfTI-specific)
        if hasattr(hdr, 'get_magic'):
            info.append(f"- Magic string: {hdr.get_magic()}")
            
        info.extend([
            f"- Voxel offset: {hdr.get('vox_offset')}",
            f"- Byte order: {'Little Endian' if hdr.endianness == '<' else 'Big Endian'}",
            "",
            "### Reference Affine (from nibabel)",
            "```",
            format_affine(img.affine),
            "```",
            ""
        ])
        
        # Add NIfTI-specific metadata
        if isinstance(hdr, (nib.Nifti1Header, nib.Nifti2Header)):
            info.extend([
                "### Additional NIfTI Metadata",
                f"- dim_info: {hdr['dim_info']}",
                f"- dims: {[int(x) for x in hdr['dim']]}",
                f"- datatype: {hdr['datatype']} ({hdr.get_data_dtype()})",
                f"- bitpix: {hdr['bitpix']}",
                f"- pixdim: {[float(x) for x in hdr['pixdim']]}",
                f"- qform_code: {int(hdr['qform_code'])} ({get_qform_name(int(hdr['qform_code']))})",
                f"- sform_code: {int(hdr['sform_code'])} ({get_qform_name(int(hdr['sform_code']))})",
                f"- xyzt_units: {hdr['xyzt_units']}",
                f"- quatern_b,c,d: {float(hdr['quatern_b']):.6f}, {float(hdr['quatern_c']):.6f}, {float(hdr['quatern_d']):.6f}",
                f"- qoffset_x,y,z: {float(hdr['qoffset_x']):.6f}, {float(hdr['qoffset_y']):.6f}, {float(hdr['qoffset_z']):.6f}",
                f"- srow_x: {[float(x) for x in hdr['srow_x']]}",
                f"- srow_y: {[float(x) for x in hdr['srow_y']]}",
                f"- srow_z: {[float(x) for x in hdr['srow_z']]}",
                ""
            ])

        # Add raw binary peek at first few bytes
        with open(filepath, 'rb') as f:
            raw_bytes = f.read(16)  # Read first 16 bytes
            hex_dump = ' '.join(f'{b:02x}' for b in raw_bytes)
            info.extend([
                "### Raw Binary Start",
                "First 16 bytes in hex:",
                f"`{hex_dump}`",
                ""
            ])
        
        return '\n'.join(info)
    except Exception as e:
        return f"## {filepath.name}\n\nError reading file with nibabel: {str(e)}\n"

def main():
    data_dir = Path('.')
    
    docs = [
        "# NIfTI Test Files Reference Data",
        "",
        "This document contains reference information about the test files, analyzed using nibabel. ",
        "This information can be used to verify the behavior of our own NIfTI implementation.",
        "",
        f"Generated using nibabel version: {nib.__version__}",
        "",
        "Note: This data is provided as a reference only. Our implementation may have valid reasons ",
        "to interpret certain fields differently from nibabel.",
        "",
        "---",
        ""
    ]
    
    # Process all files in the data directory
    for filepath in sorted(data_dir.glob('*')):
        if filepath.is_file():
            docs.append(get_file_info(filepath))
    
    # Write to README
    with open('TEST_FILES_REFERENCE.md', 'w') as f:
        f.write('\n'.join(docs))

if __name__ == '__main__':
    main()