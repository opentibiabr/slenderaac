"""Package and publish external website artwork. Python 3.10+, standard library only."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import stat
import subprocess
import sys
import tempfile
from urllib.parse import unquote, urlsplit
from urllib.request import Request, urlopen
import zipfile

REPOSITORY = "opentibiabr/slenderaac"
CHANNEL_TAG = "classic-assets-latest"
RELEASE_BASE = f"https://github.com/{REPOSITORY}/releases/download/"
# Keep publication and installation bounds aligned with install-theme-assets.js.
MAX_ZIP = {
    "classic": 128 * 1024 * 1024,
    "outfits": 256 * 1024 * 1024,
    "items": 128 * 1024 * 1024,
    "store": 128 * 1024 * 1024,
}
MAX_EXPANDED = 512 * 1024 * 1024
PACKS = {
    "classic": ("classic", "tools"),
    "outfits": ("outfits",),
    "items": ("items",),
    "store": ("store",),
}


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def download(url: str, limit: int) -> bytes:
    request = Request(url, headers={"User-Agent": "SlenderAAC-Assets-Installer"})
    with urlopen(request, timeout=60) as response:
        data = response.read(limit + 1)
    if len(data) > limit:
        raise ValueError("Download exceeds the permitted size")
    return data


def release_url(url: str) -> str:
    if not isinstance(url, str) or not url.startswith(RELEASE_BASE):
        raise ValueError("Package must be a release attachment from the application repository")
    parsed = urlsplit(url)
    suffix = url[len(RELEASE_BASE):]
    if (parsed.query or parsed.fragment
            or not re.fullmatch(r"classic-assets-[a-z0-9-]+/[A-Za-z0-9._-]+\.zip", suffix)):
        raise ValueError("Invalid package release URL")
    if suffix.split("/")[0] == CHANNEL_TAG:
        raise ValueError("Channel metadata must identify a versioned archive")
    if any(part in (".", "..", "") for part in unquote(suffix).split("/")):
        raise ValueError("Invalid package release path")
    return url


def safe_path(name: str) -> PurePosixPath:
    if not isinstance(name, str) or not name or "\\" in name or "\x00" in name:
        raise ValueError("Invalid archive path")
    parts = name.rstrip("/").split("/")
    for part in parts:
        if (not part or part in (".", "..") or part.startswith(".")
                or part.endswith((" ", ".")) or re.search(r'[<>:"|?*\x00-\x1f]', part)
                or re.fullmatch(r"(?i)(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?", part)):
            raise ValueError(f"Unsafe archive path: {name}")
    return PurePosixPath(*parts)


def unpack(archive: Path, staging: Path, pack: str = "classic") -> dict:
    """Validate all paths before extracting; never execute packaged tools."""
    if pack not in PACKS or not 0 < archive.stat().st_size <= MAX_ZIP[pack]:
        raise ValueError("Invalid archive size")
    with zipfile.ZipFile(archive) as source:
        entries = source.infolist()
        maximum_entries = 10000 if pack == "classic" else 200000 if pack == "outfits" else 100000
        if len(entries) > maximum_entries or sum(e.file_size for e in entries) > MAX_EXPANDED:
            raise ValueError("Archive is too large")
        seen = set()
        for entry in entries:
            # ZipInfo normalizes separators on Windows; validate the original header too.
            name = safe_path(entry.orig_filename)
            kind = stat.S_IFMT(entry.external_attr >> 16)
            if (name.parts[0] not in PACKS[pack]
                    or kind not in (0, stat.S_IFREG, stat.S_IFDIR)
                    or entry.flag_bits & 1 or entry.file_size > 32 * 1024 * 1024
                    or str(name).casefold() in seen):
                raise ValueError(f"Unsupported or duplicate archive entry: {entry.filename}")
            seen.add(str(name).casefold())
        for entry in entries:
            target = staging.joinpath(*safe_path(entry.filename).parts)
            if entry.is_dir():
                target.mkdir(parents=True, exist_ok=True)
            else:
                target.parent.mkdir(parents=True, exist_ok=True)
                with source.open(entry) as incoming, target.open("xb") as output:
                    shutil.copyfileobj(incoming, output)

    if pack != "classic":
        return validate_sprite_pack(staging / pack, pack)
    manifest = json.loads((staging / "classic/manifest.json").read_text(encoding="utf-8"))
    if (not isinstance(manifest, dict) or type(manifest.get("schemaVersion")) is not int
            or manifest["schemaVersion"] != 1 or manifest.get("name") != "classic"
            or not isinstance(manifest.get("version"), str) or not manifest["version"]
            or not isinstance(manifest.get("assets"), dict) or not manifest["assets"]
            or not isinstance(manifest.get("hashes"), dict) or not manifest["hashes"]
            or manifest.get("localOnlyAssets")):
        raise ValueError("Invalid or non-public Classic manifest")
    hashes = manifest["hashes"]
    for name, expected in hashes.items():
        path = staging / "classic" / safe_path(name)
        if not isinstance(expected, str) or digest(path.read_bytes()) != expected:
            raise ValueError(f"Asset checksum mismatch: {name}")
    for name in manifest["assets"].values():
        safe_path(name)
        if name not in hashes:
            raise ValueError(f"Mapped asset has no checksum: {name}")
    for required in ("classic/content/classic-border-1.gif", "tools/README.md"):
        if not (staging / required).is_file():
            raise ValueError(f"Incomplete archive: missing {required}")
    return manifest


def validate_sprite_pack(root: Path, pack: str) -> dict:
    manifest = json.loads((root / "manifest.json").read_text(encoding="utf-8"))
    if (not isinstance(manifest, dict) or type(manifest.get("schemaVersion")) is not int or manifest["schemaVersion"] != 1
            or manifest.get("name") != pack or not isinstance(manifest.get("version"), str)
            or not manifest["version"] or not isinstance(manifest.get("hashes"), dict)
            or not manifest["hashes"]):
        raise ValueError(f"Invalid {pack} manifest")
    hashes = manifest["hashes"]
    actual = {p.relative_to(root).as_posix() for p in root.rglob("*") if p.is_file()}
    if actual != set(hashes) | {"manifest.json"}:
        raise ValueError(f"Unlisted or missing files in {pack} archive")
    for name, expected in hashes.items():
        file = root / safe_path(name)
        data = file.read_bytes()
        if not isinstance(expected, str) or digest(data) != expected:
            raise ValueError(f"Asset checksum mismatch: {name}")
        if name == "README.md":
            continue
        png = data.startswith(b"\x89PNG\r\n\x1a\n") and data.endswith(b"IEND\xaeB`\x82")
        gif = data[:6] in (b"GIF87a", b"GIF89a") and data.endswith(b";")
        if pack == "outfits":
            valid = re.fullmatch(r"[1-9][0-9]*/[1-9][0-9]*_[12]_[123]_[1-4](?:_template)?\.png", name) and png
        elif pack == "items":
            valid = re.fullmatch(r"(?:[1-9][0-9]*|empty|no_(?:helmet|necklace|bagpack|armor|handright|handleft|legs|boots|ring|ammo))\.gif", name) and gif
        else:
            # Some catalog PNG URLs contain GIF bytes; keep their URLs and animation.
            valid = re.fullmatch(r"[A-Za-z0-9_/ &'().-]+\.(?:png|gif)", name) and (png or gif)
        if not valid:
            raise ValueError(f"Unsupported {pack} image: {name}")
    if not any(name != "README.md" for name in hashes):
        raise ValueError(f"Empty {pack} artwork")
    return manifest


def package_sprites(args) -> None:
    source, output = args.source.resolve(), args.zip.resolve()
    if not source.is_dir() or output.is_relative_to(source):
        raise ValueError("Choose a source directory and a ZIP outside that directory")
    extensions = {".gif"} if args.pack == "items" else {".png", ".gif"} if args.pack == "store" else {".png"}
    files = sorted(p for p in source.rglob("*") if p.is_file() and p.suffix in extensions)
    if not files:
        raise ValueError("No images found in source directory")
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix=".assets-package-", dir=output.parent) as directory:
        stage = Path(directory)
        archive = stage / "package.zip"
        hashes = {}
        with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as target:
            for file in files:
                if file.is_symlink() or file.resolve() != file.absolute():
                    raise ValueError(f"Symlinked image is not supported: {file.name}")
                name = str(safe_path(file.relative_to(source).as_posix()))
                data = file.read_bytes()
                hashes[name] = digest(data)
                target.writestr(f"{args.pack}/{name}", data)
            readme = (f"# {args.pack.title()} artwork\n\n"
                      "External artwork, distributed separately from the application code license.\n"
                      "Install using the application asset installer; configure the game server to use your website's store URL.\n")
            hashes["README.md"] = digest(readme.encode())
            target.writestr(f"{args.pack}/README.md", readme)
            manifest = {"schemaVersion": 1, "name": args.pack, "version": args.version, "hashes": hashes}
            target.writestr(f"{args.pack}/manifest.json", json.dumps(manifest, indent=2) + "\n")
        if archive.stat().st_size > MAX_ZIP[args.pack]:
            raise ValueError("Archive is too large")
        unpack(archive, stage / "check", args.pack)
        os.replace(archive, output)
    print(f"Packaged {len(files)} verified images: {output}")


def gh(*args) -> str:
    result = subprocess.run(["gh", *args], capture_output=True, text=True, encoding="utf-8")
    if result.returncode:
        raise RuntimeError(result.stderr.strip())
    return result.stdout


def get_release(tag: str) -> dict | None:
    try:
        return json.loads(gh("api", f"repos/{REPOSITORY}/releases/tags/{tag}"))
    except RuntimeError as error:
        if "HTTP 404" in str(error):
            return None
        raise


def publish(args) -> None:
    pack = getattr(args, "pack", "classic")
    if not re.fullmatch(r"classic-assets-[a-z0-9-]+", args.release) or args.release == CHANNEL_TAG:
        raise ValueError("Use a unique versioned Classic release tag")
    if not re.fullmatch(r"[0-9a-f]{40}", args.target):
        raise ValueError("--target must be the full published application commit SHA")
    archive = args.zip.resolve()
    payload = archive.read_bytes()
    if not payload or len(payload) > MAX_ZIP[pack]:
        raise ValueError("Invalid archive size")
    with tempfile.TemporaryDirectory(prefix="classic-publish-") as directory:
        stage = Path(directory)
        manifest = unpack(archive, stage / "check", pack)
        checksum = digest(payload)
        gh("api", f"repos/{REPOSITORY}/commits/{args.target}", "--silent")
        versioned = get_release(args.release)
        if versioned is None:
            gh("release", "create", args.release, "--repo", REPOSITORY, "--target", args.target,
               "--draft", "--prerelease", "--title", f"Website assets: {args.release}",
               "--notes", "External website artwork. Install from the fixed classic-assets-latest channel; see the application asset installation guide.")
        if versioned is None or versioned["draft"]:
            sha = stage / (archive.name + ".sha256")
            sha.write_text(checksum + "  " + archive.name + "\n", encoding="utf-8")
            gh("release", "upload", args.release, str(archive), str(sha), "--clobber", "--repo", REPOSITORY)
            gh("release", "edit", args.release, "--draft=false", "--latest=false", "--repo", REPOSITORY)
        versioned = get_release(args.release)
        attachment = next((a for a in versioned["assets"] if a["name"] == archive.name), None)
        if not attachment or versioned["draft"]:
            raise ValueError("Versioned release archive is missing or still a draft")
        url = release_url(attachment["browser_download_url"])
        if digest(download(url, MAX_ZIP[pack])) != checksum:
            raise ValueError("Published versioned archive differs; channel was not changed")
        channel = {"schemaVersion": 1, "name": pack, "version": manifest["version"],
                   "release": args.release, "url": url, "sha256": checksum, "size": len(payload)}
        (stage / f"{pack}.zip").write_bytes(payload)
        (stage / f"{pack}.zip.sha256").write_text(checksum + f"  {pack}.zip\n", encoding="utf-8")
        (stage / f"{pack}-assets.json").write_text(json.dumps(channel, indent=2) + "\n", encoding="utf-8")
        current = get_release(CHANNEL_TAG)
        remove_legacy_installer = current is not None and any(
            asset.get("name") == "install-classic-assets.py"
            for asset in current.get("assets", [])
        )
        if current is None:
            notes = stage / "notes.md"
            notes.write_text(
                "Rolling download channel for Classic artwork and shared outfit, item and store images.\n\n"
                "## Install or update\n\n"
                "From an updated application checkout with dependencies installed:\n\n"
                "```sh\nnpm run install:assets\n```\n\n"
                "Restart the website after installation. Use `--packs classic` or "
                "`--packs outfits items store` after `--` to select packages.\n\n"
                "## Attachments\n\n"
                "For each pack, the JSON file points the installer to a verified versioned archive; "
                "the fixed ZIP and SHA-256 files provide direct downloads. "
                "The installer stages all selected packs outside the checkout before activation. "
                "It does not run a build or database import.\n\n"
                f"[Installation guide](https://github.com/{REPOSITORY}/blob/{args.target}/docs/classic-assets.md)\n",
                encoding="utf-8")
            gh("release", "create", CHANNEL_TAG, "--repo", REPOSITORY, "--target", args.target,
               "--draft", "--prerelease", "--title", "Classic assets: current package",
               "--notes-file", str(notes))
        gh("release", "upload", CHANNEL_TAG, str(stage / f"{pack}.zip"),
           str(stage / f"{pack}.zip.sha256"),
           "--clobber", "--repo", REPOSITORY)
        gh("release", "upload", CHANNEL_TAG, str(stage / f"{pack}-assets.json"),
           "--clobber", "--repo", REPOSITORY)
        gh("release", "edit", CHANNEL_TAG, "--draft=false", "--latest=false", "--repo", REPOSITORY)
        if remove_legacy_installer:
            gh("release", "delete-asset", CHANNEL_TAG, "install-classic-assets.py", "--yes", "--repo", REPOSITORY)
    print(RELEASE_BASE + CHANNEL_TAG + f"/{pack}.zip")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    publisher = sub.add_parser("publish", help="Maintainers: validate a ZIP and update versioned/fixed release attachments")
    publisher.add_argument("--pack", choices=tuple(PACKS), default="classic")
    publisher.add_argument("--zip", type=Path, required=True)
    publisher.add_argument("--release", required=True)
    publisher.add_argument("--target", required=True, help="Full application commit SHA already published to GitHub")
    packager = sub.add_parser("package", help="Maintainers: package prepared sprite directories for release")
    packager.add_argument("--pack", choices=("outfits", "items", "store"), required=True)
    packager.add_argument("--source", type=Path, required=True, help="Directory with numbered outfits/items or store subdirectories")
    packager.add_argument("--zip", type=Path, required=True)
    packager.add_argument("--version", required=True)
    args = parser.parse_args()
    try:
        {"publish": publish, "package": package_sprites}[args.command](args)
    except (OSError, ValueError, RuntimeError, zipfile.BadZipFile) as error:
        print(f"Website assets: {error}", file=sys.stderr)
        raise SystemExit(1) from None


if __name__ == "__main__":
    main()
