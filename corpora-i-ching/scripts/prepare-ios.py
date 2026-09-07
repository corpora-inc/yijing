#!/usr/bin/env python3
"""Add Yijing resources to the current Tauri-generated Xcode project."""
from pathlib import Path
import subprocess

app = Path(__file__).resolve().parents[1]
project = app / 'src-tauri/gen/apple/project.yml'
text = project.read_text()
resource = '      - path: ../../ios/PrivacyInfo.xcprivacy\n        buildPhase: resources\n'
anchor = '      - path: Assets.xcassets\n'
if resource not in text:
    if text.count(anchor) != 1:
        raise SystemExit('Unexpected generated project: expected one asset catalog')
    text = text.replace(anchor, resource + anchor)
script = 'script: npx tauri ios xcode-script'
if script in text:
    text = text.replace(script, 'script: cd "${PROJECT_DIR:?}/../.." && npx tauri ios xcode-script')
project.write_text(text)
subprocess.run(['xcodegen', 'generate', '--spec', str(project)], check=True, cwd=app)
