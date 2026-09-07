#!/usr/bin/env python3
"""Verify Yijing's release declarations in the final exported IPA."""
import argparse
import plistlib
import zipfile

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('ipa')
args = parser.parse_args()
with zipfile.ZipFile(args.ipa) as ipa:
    manifests = [n for n in ipa.namelist() if n.startswith('Payload/') and
                 n.count('/') == 2 and n.endswith('.app/PrivacyInfo.xcprivacy')]
    if len(manifests) != 1:
        raise SystemExit('Expected one privacy manifest at the root of the app bundle')
    manifest = plistlib.loads(ipa.read(manifests[0]))
    info = plistlib.loads(ipa.read(manifests[0].rsplit('/', 1)[0] + '/Info.plist'))
    if info.get('CFBundleIdentifier') != 'com.corpora-yijing.app':
        raise SystemExit('Unexpected bundle identifier')
    if info.get('ITSAppUsesNonExemptEncryption') is not False:
        raise SystemExit('Missing or changed encryption declaration')
    if manifest.get('NSPrivacyTracking') is not False or manifest.get('NSPrivacyCollectedDataTypes') != []:
        raise SystemExit('Missing or changed privacy declarations')
    if not any(d.get('NSPrivacyAccessedAPIType') == 'NSPrivacyAccessedAPICategoryFileTimestamp'
               and 'C617.1' in d.get('NSPrivacyAccessedAPITypeReasons', [])
               for d in manifest.get('NSPrivacyAccessedAPITypes', [])):
        raise SystemExit('Missing local file-metadata reason')
    print(f"PASS: {info['CFBundleShortVersionString']} ({info['CFBundleVersion']}), privacy manifest and encryption declaration")
