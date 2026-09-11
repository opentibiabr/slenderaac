"""Offline installation and publication contracts; no real releases or databases."""
import argparse
import io
import json
import os
from pathlib import Path
import stat
import tempfile
import unittest
from unittest.mock import patch
import zipfile

import theme_assets as assets


def package(version="test", changes=None):
    image = b"GIF89a-test-" + version.encode()
    files = {"classic/content/classic-border-1.gif": image, "tools/README.md": b"readme"}
    manifest = {"schemaVersion": 1, "name": "classic", "version": version,
                "assets": {"border": "content/classic-border-1.gif"},
                "hashes": {"content/classic-border-1.gif": assets.digest(image)}}
    files["classic/manifest.json"] = json.dumps(manifest).encode()
    if changes:
        files.update(changes)
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
    image_path = {"outfits": "128/1_1_1_3.png", "items": "3031.gif", "store": "13/Category_Coins.png"}[name]
    image = b"GIF89a-test;" if name == "items" else png
    files = {image_path: image, "README.md": b"readme"}
    manifest = {"schemaVersion": 1, "name": name, "version": "test",
                "hashes": {path: assets.digest(data) for path, data in files.items()}}
    files["manifest.json"] = json.dumps(manifest).encode()
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, "w", zipfile.ZIP_DEFLATED) as archive:
        for path, data in files.items():
            archive.writestr(f"{name}/{path}", data)
        for path, data in (changes or {}).items():
            archive.writestr(path, data)
    return stream.getvalue()


class InstallerTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="classic-installer-test-")
        self.root = Path(self.temp.name).resolve()
        self.app = self.root / "application"
        self.app.mkdir()
        (self.app / "package.json").write_text('{"name":"slenderaac"}')
        self.original = b'DATABASE_URL="private-test-value"\r\nSLENDER_THEME=legbone\r\nSLENDER_THEME_SWITCHER_ENABLED=false\r\nTHEME_ASSETS_ROOT=\r\n'
        (self.app / ".env.dist").write_bytes(self.original)
        self.destination = self.root / "assets with spaces"
        self.environment = patch.dict(os.environ, {"THEME_ASSETS_ROOT": ""})
        self.environment.start()
        self.output = patch("sys.stdout", new_callable=io.StringIO)
        self.output.start()

    def tearDown(self):
        self.environment.stop()
        self.output.stop()
        self.temp.cleanup()

    def install(self, payload, **overrides):
        channel = {"schemaVersion": 1, "name": "classic", "sha256": assets.digest(payload),
                   "size": len(payload), "url": assets.RELEASE_BASE + "classic-assets-test/test.zip"}
        channel.update(overrides)
        with patch.object(assets, "read_channel", return_value=channel), patch.object(assets, "download", return_value=payload):
            assets.install(argparse.Namespace(app=self.app, root=self.destination))

    def install_packs(self, packs, corrupt=None):
        payloads = {name: package() if name == "classic" else sprite_package(name) for name in packs}
        def channel(name):
            data = payloads[name]
            return {"size": len(data), "sha256": "0" * 64 if name == corrupt else assets.digest(data), "url": name}
        with patch.object(assets, "read_channel", side_effect=channel), patch.object(assets, "download", side_effect=lambda name, _: payloads[name]):
            assets.install(argparse.Namespace(app=self.app, root=self.destination, packs=packs))

    def test_all_packages_configure_shared_external_root_and_repeat_without_backups(self):
        self.install_packs(list(assets.PACKS))
        before = (self.app / ".env").read_bytes()
        for pack, (_, variable) in assets.PACKS.items():
            expected = self.destination if pack == "classic" else self.destination / pack
            self.assertEqual(assets.env_value(before.decode(), variable), expected.as_posix())
        self.install_packs(list(assets.PACKS))
        self.assertEqual((self.app / ".env").read_bytes(), before)
        self.assertFalse(list(self.destination.glob("backup-*")))

    def test_last_package_failure_does_not_activate_earlier_packages(self):
        self.install(package("old"))
        before = (self.app / ".env").read_bytes()
        with self.assertRaisesRegex(ValueError, "checksum/size"):
            self.install_packs(list(assets.PACKS), corrupt="store")
        self.assertEqual((self.app / ".env").read_bytes(), before)
        self.assertFalse((self.destination / "outfits").exists())
        self.assertEqual(json.loads((self.destination / "classic/manifest.json").read_text())["version"], "old")

    def test_selected_sprites_preserve_classic_and_move_legacy_store_outside_checkout(self):
        self.install(package("custom"))
        legacy = self.app / "static/images/store"
        legacy.mkdir(parents=True)
        (legacy / "custom.png").write_bytes(b"custom")
        built = self.app / "build/client/images/store"
        built.mkdir(parents=True)
        (built / "stale.png").write_bytes(b"stale")
        self.install_packs(["store"])
        self.assertFalse(legacy.exists())
        self.assertFalse(built.exists())
        self.assertEqual(list(self.destination.glob("backup-*/legacy-built-store/stale.png"))[0].read_bytes(), b"stale")
        self.assertEqual(list(self.destination.glob("backup-*/legacy-store/custom.png"))[0].read_bytes(), b"custom")
        self.assertEqual(json.loads((self.destination / "classic/manifest.json").read_text())["version"], "custom")
        self.assertIsNone(assets.env_value((self.app / ".env").read_text(), "ITEM_ASSETS_ROOT"))

    def test_failed_environment_write_restores_legacy_store_and_all_packages(self):
        legacy = self.app / "static/images/store"
        legacy.mkdir(parents=True)
        (legacy / "custom.png").write_bytes(b"custom")
        with patch.object(assets, "atomic_env", side_effect=OSError("read only")):
            with self.assertRaises(OSError):
                self.install_packs(list(assets.PACKS))
        self.assertEqual((legacy / "custom.png").read_bytes(), b"custom")
        self.assertFalse((self.destination / "store").exists())
        self.assertFalse((self.destination / "classic").exists())
        self.assertFalse((self.app / ".env").exists())

    def test_sprite_archives_reject_traversal_foreign_roots_and_unlisted_files(self):
        for pack in ("outfits", "items", "store"):
            for name in ("../escape", "classic/foreign.png", f"{pack}/unlisted.png"):
                with self.subTest(pack=pack, name=name), tempfile.TemporaryDirectory() as tmp:
                    archive = Path(tmp) / "test.zip"
                    archive.write_bytes(sprite_package(pack, {name: b"bad"}))
                    with self.assertRaises(ValueError):
                        assets.unpack(archive, Path(tmp) / "stage", pack)


    def test_first_install_configures_external_root_without_touching_other_settings(self):
        self.install(package())
        env = (self.app / ".env").read_bytes()
        self.assertIn(b'DATABASE_URL="private-test-value"\r\n', env)
        self.assertIn(b"SLENDER_THEME=legbone\r\nSLENDER_THEME_SWITCHER_ENABLED=false", env)
        self.assertIn(self.destination.as_posix().encode(), env)
        self.assertTrue((self.destination / "classic/content/classic-border-1.gif").is_file())
        self.assertFalse((self.app / "classic").exists())
        self.assertFalse(list(self.destination.glob(".classic-install-*")))

    def test_repeat_install_is_idempotent_and_upgrade_keeps_backup(self):
        self.install(package("one"))
        before = (self.app / ".env").read_bytes()
        self.install(package("one"))
        self.assertEqual((self.app / ".env").read_bytes(), before)
        self.assertFalse(list(self.destination.glob("backup-*")))
        self.assertFalse(list(self.app.glob(".env.assets-backup-*")))
        self.install(package("two"))
        backups = list(self.destination.glob("backup-*"))
        self.assertEqual(len(backups), 1)
        self.assertEqual(json.loads((backups[0] / "classic/manifest.json").read_text())["version"], "one")
        self.assertEqual(json.loads((self.destination / "classic/manifest.json").read_text())["version"], "two")

    def test_bad_checksum_or_missing_asset_keeps_installation_and_environment(self):
        self.install(package("one"))
        before = (self.app / ".env").read_bytes()
        with self.assertRaisesRegex(ValueError, "checksum/size"):
            self.install(package("two"), sha256="0" * 64)
        with self.assertRaisesRegex(ValueError, "checksum mismatch"):
            self.install(package("two", {"classic/content/classic-border-1.gif": b"corrupt"}))
        self.assertEqual((self.app / ".env").read_bytes(), before)
        self.assertEqual(json.loads((self.destination / "classic/manifest.json").read_text())["version"], "one")

    def test_failed_environment_write_rolls_back_both_package_directories(self):
        self.install(package("one"))
        before = (self.app / ".env").read_bytes()
        with patch.object(assets, "atomic_env", side_effect=OSError("read only")):
            with self.assertRaisesRegex(OSError, "read only"):
                self.install(package("two", {"tools/README.md": b"new tools"}))
        self.assertEqual((self.app / ".env").read_bytes(), before)
        self.assertEqual((self.destination / "tools/README.md").read_bytes(), b"readme")
        self.assertEqual(json.loads((self.destination / "classic/manifest.json").read_text())["version"], "one")

    def test_wrong_destination_is_rejected_before_download(self):
        with patch.object(assets, "read_channel") as read:
            with self.assertRaisesRegex(ValueError, "outside"):
                assets.install(argparse.Namespace(app=self.app, root=self.app / "assets"))
            read.assert_not_called()

    def test_archive_paths_and_links_cannot_escape_staging(self):
        for path in ("../outside", "/outside", "classic/../../outside", "classic\\outside", "classic/name:stream", "classic/CON", "classic/x."):
            with self.subTest(path=path), self.assertRaises(ValueError):
                self.install(package(changes={path: b"bad"}))
        link = zipfile.ZipInfo("classic/link")
        link.create_system = 3
        link.external_attr = (stat.S_IFLNK | 0o777) << 16
        with self.assertRaises(ValueError):
            self.install(package(changes={link: b"../../outside"}))
        self.assertFalse((self.root / "outside").exists())

    def test_duplicate_case_paths_and_excessive_expansion_are_rejected(self):
        with self.assertRaisesRegex(ValueError, "duplicate"):
            self.install(package(changes={"tools/readme.md": b"collision"}))
        with patch.object(assets, "MAX_EXPANDED", 1):
            with self.assertRaisesRegex(ValueError, "too large"):
                self.install(package())

    def test_channel_only_accepts_versioned_application_release_downloads(self):
        payload = package()
        valid = {"schemaVersion": 1, "name": "classic", "sha256": assets.digest(payload),
                 "size": len(payload), "url": assets.RELEASE_BASE + "classic-assets-test/test.zip"}
        for url in ("https://example.com/archive.zip", assets.RELEASE_BASE + "classic-assets-latest/classic.zip", assets.RELEASE_BASE + "../test.zip"):
            with patch.object(assets, "download", return_value=json.dumps({**valid, "url": url}).encode()):
                with self.assertRaises(ValueError):
                    assets.read_channel()
        with patch.object(assets, "download", return_value=json.dumps(valid).encode()) as download:
            self.assertEqual(assets.read_channel(), valid)
            self.assertEqual(assets.read_channel(), valid)
            urls = [call.args[0] for call in download.call_args_list]
            self.assertTrue(all(url.startswith(assets.CHANNEL_URL + "?check=") for url in urls))
            self.assertNotEqual(urls[0], urls[1])

    def test_installs_do_not_run_concurrently_on_one_root(self):
        self.destination.mkdir()
        with assets.installation_lock(self.destination):
            with self.assertRaisesRegex(ValueError, 'Another installation'):
                self.install(package())
        self.assertFalse((self.destination / '.classic-install.lock').exists())
        self.assertFalse((self.app / '.env').exists())

    def test_environment_defaults_duplicates_and_quoted_paths(self):
        blank = 'THEME_ASSETS_ROOT=\nOUTFIT_ASSETS_ROOT=\nITEM_ASSETS_ROOT=\n'
        self.assertEqual(assets.env_value(blank, "THEME_ASSETS_ROOT"), "")
        self.assertEqual(assets.env_value(blank, "OUTFIT_ASSETS_ROOT"), "")
        text = 'SECRET="do not change"\nexport THEME_ASSETS_ROOT="old path" # comment\nTHEME_ASSETS_ROOT=other\n'
        updated = assets.configure_env(text, self.destination)
        self.assertIn('SECRET="do not change"', updated)
        self.assertEqual(assets.env_value(updated, "THEME_ASSETS_ROOT"), self.destination.as_posix())
        self.assertEqual(assets.env_value(updated, "SLENDER_THEME"), "classic")
        self.assertEqual(assets.configure_env(updated, self.destination), updated)

    def test_sprite_publication_does_not_replace_classic_channel_files(self):
        payload = sprite_package("store")
        archive = self.root / "store-test.zip"
        archive.write_bytes(payload)
        versioned = {"draft": False, "assets": [{"name": archive.name,
                     "browser_download_url": assets.RELEASE_BASE + "classic-assets-store-test/" + archive.name}]}
        with patch.object(assets, "get_release", side_effect=[versioned, versioned, {"draft": False}]), patch.object(assets, "download", return_value=payload), patch.object(assets, "gh") as gh:
            assets.publish(argparse.Namespace(pack="store", zip=archive, release="classic-assets-store-test", target="a" * 40))
        uploads = [call.args for call in gh.call_args_list if call.args[:2] == ("release", "upload")]
        self.assertIn("store.zip", " ".join(uploads[0]))
        self.assertNotIn("classic.zip", " ".join(uploads[0]))
        self.assertIn("store-assets.json", " ".join(uploads[-1]))

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

    def test_publication_updates_pointer_after_downloadable_attachments(self):
        payload = package()
        archive = self.root / "classic-test.zip"
        archive.write_bytes(payload)
        versioned = {"draft": False, "assets": [{"name": archive.name,
                     "browser_download_url": assets.RELEASE_BASE + "classic-assets-test/" + archive.name}]}
        with patch.object(assets, "get_release", side_effect=[versioned, versioned, {"draft": False}]), patch.object(assets, "download", return_value=payload), patch.object(assets, "gh") as gh:
            assets.publish(argparse.Namespace(zip=archive, release="classic-assets-test", target="a" * 40))
        uploads = [call.args for call in gh.call_args_list if call.args[:2] == ("release", "upload")]
        self.assertIn("classic.zip", " ".join(uploads[0]))
        self.assertIn("classic-assets.json", " ".join(uploads[1]))


if __name__ == "__main__":
    unittest.main()
