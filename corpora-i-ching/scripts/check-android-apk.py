#!/usr/bin/env python3
"""Verify ZIP and 64-bit ELF alignment in an actual Android APK."""
import argparse
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import zipfile


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('apk', type=Path)
    parser.add_argument('--zipalign', type=Path, required=True,
                        help='Android SDK build-tools 35+ zipalign executable')
    args = parser.parse_args()
    ndk = os.environ.get('NDK_HOME')
    if not ndk:
        parser.error('Set NDK_HOME to an installed Android NDK')
    readers = list(Path(ndk).glob('toolchains/llvm/prebuilt/*/bin/llvm-readelf'))
    if len(readers) != 1:
        parser.error('Cannot identify llvm-readelf under NDK_HOME')
    subprocess.run([str(args.zipalign), '-c', '-P', '16', '4', str(args.apk)], check=True)
    checked = 0
    with zipfile.ZipFile(args.apk) as apk, tempfile.TemporaryDirectory() as temporary:
        for entry in apk.infolist():
            if not entry.filename.startswith(('lib/arm64-v8a/', 'lib/x86_64/')) or not entry.filename.endswith('.so'):
                continue
            # Never extract archive-controlled paths into the filesystem.
            library = Path(temporary) / 'library.so'
            with apk.open(entry) as source, library.open('wb') as destination:
                shutil.copyfileobj(source, destination)
            output = subprocess.check_output([str(readers[0]), '-lW', str(library)], text=True)
            segments = [line.split() for line in output.splitlines() if line.lstrip().startswith('LOAD ')]
            if not segments or any(int(segment[-1], 16) < 16384 for segment in segments):
                raise SystemExit(f'FAIL: {entry.filename} has LOAD segments below 16 KB alignment')
            print(f'PASS: {entry.filename}: all {len(segments)} LOAD segments aligned to >= 16 KB')
            checked += 1
    if not checked:
        raise SystemExit('FAIL: no 64-bit native libraries were found in the APK')
    print(f'PASS: ZIP alignment and {checked} packaged native libraries')


if __name__ == '__main__':
    main()
