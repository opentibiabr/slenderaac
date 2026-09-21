"""Offline package and publication contracts; no real releases or databases."""
import argparse
import io
import json
from pathlib import Path
import stat
import tempfile
import unittest
from unittest.mock import patch
import zipfile

import theme_assets as assets


def classic_package(version="test", changes=None):
    image = b"GIF89a-test-" + version.encode()
    files = {"classic/content/classic-border-1.gif": image, "tools/README.md": b"readme"}
    manifest = {
        "schemaVersion": 1,
        "name": "classic",
        "version": version,
        "assets": {"border": "content/classic-border-1.gif"},
        "hashes": {"content/classic-border-1.gif": assets.digest(image)},
    }
    files["classic/manifest.json"] = json.dumps(manifest).encode()
    files.update(changes or {})
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, "w", zipfile.ZIP_DEFLATED) as archive:
        for path, value in files.items():
            if isinstance(path, str):
                entry = zipfile.ZipInfo("placeholder")
                entry.filename = path
            else:
                entry = path
            archive.writestr(entry, value)
    return stream.getvalue()


def sprite_package(name, changes=None):
    png = b"\x89PNG\r\n\x1a\n" + b"image" + b"IEND\xaeB`\x82"
    image_path = {
        "outfits": "128/1_1_1_3.png",
        "items": "3031.gif",
        "store": "13/Category_Coins.png",
    }[name]
    image = b"GIF89a-test;" if name == "items" else png
    files = {image_path: image, "README.md": b"readme"}
    manifest = {
        "schemaVersion": 1,
        "name": name,
        "version": "test",
        "hashes": {path: assets.digest(data) for path, data in files.items()},
    }
    files["manifest.json"] = json.dumps(manifest).encode()
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, "w", zipfile.ZIP_DEFLATED) as archive:
        for path, data in files.items():
            archive.writestr(f"{name}/{path}", data)
        for path, data in (changes or {}).items():
            archive.writestr(path, data)
    return stream.getvalue()


class ReleaseToolTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="asset-release-test-")
        self.root = Path(self.temp.name).resolve()
        self.output = patch("sys.stdout", new_callable=io.StringIO)
        self.output.start()

    def tearDown(self):
        self.output.stop()
        self.temp.cleanup()

    def unpack(self, payload, pack="classic"):
        archive = self.root / f"{pack}-{len(list(self.root.iterdir()))}.zip"
        archive.write_bytes(payload)
        return assets.unpack(archive, self.root / f"stage-{archive.stem}", pack)

    def test_classic_archives_reject_unsafe_links_duplicates_and_excessive_expansion(self):
        for path in (
            "../outside",
            "/outside",
            "classic/../../outside",
            "classic\\outside",
            "classic/name:stream",
            "classic/CON",
            "classic/x.",
        ):
            with self.subTest(path=path), self.assertRaises(ValueError):
                self.unpack(classic_package(changes={path: b"bad"}))
        link = zipfile.ZipInfo("classic/link")
        link.create_system = 3
        link.external_attr = (stat.S_IFLNK | 0o777) << 16
        with self.assertRaises(ValueError):
            self.unpack(classic_package(changes={link: b"../../outside"}))
        with self.assertRaisesRegex(ValueError, "duplicate"):
            self.unpack(classic_package(changes={"tools/readme.md": b"collision"}))
        with patch.object(assets, "MAX_EXPANDED", 1), self.assertRaisesRegex(ValueError, "too large"):
            self.unpack(classic_package())
        self.assertFalse((self.root / "outside").exists())

    def test_classic_archive_rejects_checksum_mismatch(self):
        with self.assertRaisesRegex(ValueError, "checksum mismatch"):
            self.unpack(classic_package(changes={"classic/content/classic-border-1.gif": b"corrupt"}))

    def test_sprite_archives_reject_traversal_foreign_roots_and_unlisted_files(self):
        for pack in ("outfits", "items", "store"):
            for name in ("../escape", "classic/foreign.png", f"{pack}/unlisted.png"):
                with self.subTest(pack=pack, name=name), self.assertRaises(ValueError):
                    self.unpack(sprite_package(pack, {name: b"bad"}), pack)

    def test_archive_size_bounds_are_checked_before_extraction(self):
        for pack in ("outfits", "items", "store"):
            payload = sprite_package(pack)
            with self.subTest(pack=pack), patch.dict(assets.MAX_ZIP, {pack: len(payload)}):
                self.assertEqual(self.unpack(payload, pack)["name"], pack)
            with self.subTest(pack=pack), patch.dict(assets.MAX_ZIP, {pack: len(payload) - 1}):
                with self.assertRaisesRegex(ValueError, "Invalid archive size"):
                    self.unpack(payload, pack)

    def test_release_urls_accept_only_immutable_repository_archives(self):
        valid = assets.RELEASE_BASE + "classic-assets-test/test.zip"
        self.assertEqual(assets.release_url(valid), valid)
        for url in (
            "https://example.com/archive.zip",
            assets.RELEASE_BASE + "classic-assets-latest/classic.zip",
            assets.RELEASE_BASE + "../test.zip",
        ):
            with self.subTest(url=url), self.assertRaises(ValueError):
                assets.release_url(url)

    def test_packager_rejects_invalid_images_without_overwriting_previous_zip(self):
        source = self.root / "prepared"
        source.mkdir()
        archive = self.root / "output.zip"
        archive.write_bytes(b"existing archive")
        (source / "bad.png").write_bytes(b"html error page")
        args = argparse.Namespace(source=source, zip=archive, pack="store", version="test")
        with self.assertRaisesRegex(ValueError, "Unsupported store image"):
            assets.package_sprites(args)
        self.assertEqual(archive.read_bytes(), b"existing archive")
        (source / "bad.png").write_bytes(b"\x89PNG\r\n\x1a\n" + b"image" + b"IEND\xaeB`\x82")
        assets.package_sprites(args)
        self.assertTrue(zipfile.is_zipfile(archive))

    def test_publication_updates_pointer_after_archives_and_removes_legacy_installer(self):
        payload = classic_package()
        archive = self.root / "classic-test.zip"
        archive.write_bytes(payload)
        versioned = {
            "draft": False,
            "assets": [{
                "name": archive.name,
                "browser_download_url": assets.RELEASE_BASE + "classic-assets-test/" + archive.name,
            }],
        }
        current = {"draft": False, "assets": [{"name": "install-classic-assets.py"}]}
        with (
            patch.object(assets, "get_release", side_effect=[versioned, versioned, current]),
            patch.object(assets, "download", return_value=payload),
            patch.object(assets, "gh") as gh,
        ):
            assets.publish(argparse.Namespace(zip=archive, release="classic-assets-test", target="a" * 40))
        calls = [call.args for call in gh.call_args_list]
        uploads = [call for call in calls if call[:2] == ("release", "upload")]
        self.assertIn("classic.zip", " ".join(uploads[0]))
        self.assertIn("classic-assets.json", " ".join(uploads[1]))
        self.assertFalse(any("--notes-file" in call for call in calls))
        self.assertFalse(any("install-classic-assets.py" in " ".join(call) for call in uploads))
        self.assertIn(
            ("release", "delete-asset", assets.CHANNEL_TAG, "install-classic-assets.py", "--yes", "--repo", assets.REPOSITORY),
            calls,
        )

    def test_sprite_publication_does_not_replace_other_channel_files(self):
        payload = sprite_package("store")
        archive = self.root / "store-test.zip"
        archive.write_bytes(payload)
        versioned = {
            "draft": False,
            "assets": [{
                "name": archive.name,
                "browser_download_url": assets.RELEASE_BASE + "classic-assets-store-test/" + archive.name,
            }],
        }
        with (
            patch.object(assets, "get_release", side_effect=[versioned, versioned, {"draft": False, "assets": []}]),
            patch.object(assets, "download", return_value=payload),
            patch.object(assets, "gh") as gh,
        ):
            assets.publish(argparse.Namespace(
                pack="store",
                zip=archive,
                release="classic-assets-store-test",
                target="a" * 40,
            ))
        uploads = [call.args for call in gh.call_args_list if call.args[:2] == ("release", "upload")]
        self.assertIn("store.zip", " ".join(uploads[0]))
        self.assertNotIn("classic.zip", " ".join(uploads[0]))
        self.assertIn("store-assets.json", " ".join(uploads[-1]))


if __name__ == "__main__":
    unittest.main()
