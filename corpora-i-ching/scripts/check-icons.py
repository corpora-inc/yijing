#!/usr/bin/env python3
"""Verify committed and generated app icons are the current render of icon-src/.

Checks the desktop icons in src-tauri/icons, and the iOS asset catalog and Android
launcher resources whenever `tauri ios init` / `tauri android init` generated them.
Those templates start with Tauri's placeholder logo, which shipped in 0.4.0.

Pass exported .ipa, .aab, or .apk files to also check the icons that actually shipped.
"""
import argparse
from pathlib import Path
import zipfile

from app_icons import APP, assert_artifact_icons, rendered, render

parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
parser.add_argument('artifacts', nargs='*', type=Path, help='exported .ipa, .aab, or .apk files')
args = parser.parse_args()

TAURI = APP / 'src-tauri'
# icon.icns is not byte-reproducible between renders; its PNG sources are checked.
DESKTOP = [p.name for p in (TAURI / 'icons').iterdir() if p.suffix in ('.png', '.ico')]
TARGETS = {
    'ios': TAURI / 'gen/apple/Assets.xcassets/AppIcon.appiconset',
    'android': TAURI / 'gen/android/app/src/main/res',
}

with rendered() as temporary:
    expected = render(Path(temporary))
    stale = [name for name in DESKTOP if (TAURI / 'icons' / name).read_bytes() != (expected / name).read_bytes()]
    if stale or not (TAURI / 'icons/icon.icns').is_file():
        raise SystemExit(f'FAIL: desktop icons are stale; run `npm run icons`: {stale or ["icon.icns"]}')
    print(f'PASS: {len(DESKTOP)} desktop icons match icon-src/')
    for platform, target in TARGETS.items():
        if not target.parent.is_dir():
            print(f'SKIP: no generated {platform} project')
            continue
        files = sorted(p.relative_to(expected / platform) for p in (expected / platform).rglob('*') if p.is_file())
        wrong = [str(f) for f in files if not (target / f).is_file() or (target / f).read_bytes() != (expected / platform / f).read_bytes()]
        if wrong:
            raise SystemExit(f'FAIL: generated {platform} project has placeholder or stale icons; '
                             f'run `npm run icons` after init: {wrong[:4]}')
        print(f'PASS: {len(files)} generated {platform} icon files match icon-src/')
    for artifact in args.artifacts:
        with zipfile.ZipFile(artifact) as archive:
            assert_artifact_icons(archive, expected)
