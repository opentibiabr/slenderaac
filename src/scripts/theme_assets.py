"""Install or publish external website artwork. Python 3.10+, standard library only."""
from __future__ import annotations

import argparse
from contextlib import contextmanager
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
import uuid
import zipfile

REPOSITORY = "opentibiabr/slenderaac"
CHANNEL_TAG = "classic-assets-latest"
RELEASE_BASE = f"https://github.com/{REPOSITORY}/releases/download/"
CHANNEL_URL = RELEASE_BASE + CHANNEL_TAG + "/classic-assets.json"
MAX_ZIP = 128 * 1024 * 1024
MAX_EXPANDED = 512 * 1024 * 1024
PACKS = {
    "classic": (("classic", "tools"), "THEME_ASSETS_ROOT"),
    "outfits": (("outfits",), "OUTFIT_ASSETS_ROOT"),
    "items": (("items",), "ITEM_ASSETS_ROOT"),
    "store": (("store",), "STORE_ASSETS_ROOT"),
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


def read_channel(pack: str = "classic") -> dict:
    # A cached GitHub redirect can still identify the previous channel attachment.
    url = RELEASE_BASE + CHANNEL_TAG + f"/{pack}-assets.json"
    channel = json.loads(download(url + "?check=" + uuid.uuid4().hex, 64 * 1024))
    if (not isinstance(channel, dict) or channel.get("schemaVersion") != 1
            or channel.get("name") != pack
            or not isinstance(channel.get("sha256"), str)
            or not re.fullmatch(r"[0-9a-f]{64}", channel["sha256"])
            or type(channel.get("size")) is not int
            or not 0 < channel["size"] <= MAX_ZIP):
        raise ValueError("Invalid asset release metadata")
    release_url(channel.get("url"))
    return channel


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
    with zipfile.ZipFile(archive) as source:
        entries = source.infolist()
        if len(entries) > (10000 if pack == "classic" else 100000) or sum(e.file_size for e in entries) > MAX_EXPANDED:
            raise ValueError("Archive is too large")
        seen = set()
        for entry in entries:
            # ZipInfo normalizes separators on Windows; validate the original header too.
            name = safe_path(entry.orig_filename)
            kind = stat.S_IFMT(entry.external_attr >> 16)
            if (name.parts[0] not in PACKS[pack][0]
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


def env_value(text: str, name: str) -> str | None:
    matches = re.findall(rf"(?m)^[ \t]*(?:export[ \t]+)?{re.escape(name)}[ \t]*=[ \t]*(.*)$", text)
    if not matches:
        return None
    value = matches[-1].strip()
    if value.startswith(("'", '"')):
        end = value.find(value[0], 1)
        if end < 0:
            raise ValueError(f"Unclosed quote in {name}")
        return value[1:end]
    return value.split("#", 1)[0].strip()


def configure_env(text: str, root: Path, packs=("classic",)) -> str:
    value = root.as_posix()
    if any(c in value for c in "\r\n\"$`"):
        raise ValueError("Asset root contains unsupported environment characters")
    for pack in packs:
        name = PACKS[pack][1]
        destination = root if pack == "classic" else root / pack
        line = f'{name}="{destination.as_posix()}"'
        pattern = rf"(?m)^[ \t]*(?:export[ \t]+)?{name}[ \t]*=.*$"
        text = re.sub(pattern, lambda _: line, text)
        if not re.search(pattern, text):
            text = text.rstrip("\n") + "\n" + line + "\n"
    if "classic" not in packs:
        return text
    for name, default in (("SLENDER_THEME", "classic"), ("SLENDER_THEME_SWITCHER_ENABLED", "true")):
        if env_value(text, name) is None:
            text = text.rstrip("\n") + f"\n{name}={default}\n"
    return text


def atomic_env(path: Path, content: str) -> None:
    fd, temporary = tempfile.mkstemp(prefix=".env.assets-", dir=path.parent)
    temp = Path(temporary)
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="") as output:
            output.write(content)
        if path.exists():
            shutil.copymode(path, temp)
        os.replace(temp, path)
    finally:
        temp.unlink(missing_ok=True)


def activate(staging: Path, root: Path, env_path: Path, env_text: str, directories=("classic", "tools"), legacy_stores=()) -> Path | None:
    """Keep old directories for rollback, including failures writing configuration."""
    backup = root / ("backup-" + uuid.uuid4().hex)
    moved, installed = [], []
    legacy_moved = []
    for name in directories:
        target = root / name
        if target.is_symlink() or target.resolve() != target.absolute() or (target.exists() and not target.is_dir()):
            raise ValueError(f"Installation target is not a regular directory: {target}")
    if legacy_stores or any((root / name).exists() for name in directories):
        backup.mkdir()
    try:
        for name, legacy in legacy_stores:
            # Static middleware would otherwise serve old files before the external route.
            shutil.move(str(legacy), str(backup / name))
            legacy_moved.append((name, legacy))
        for name in directories:
            target = root / name
            if target.exists():
                target.rename(backup / name)
                moved.append(name)
            (staging / name).rename(target)
            installed.append(name)
        atomic_env(env_path, env_text)
    except Exception:
        for name in reversed(installed):
            (root / name).rename(staging / name)
        for name in reversed(moved):
            (backup / name).rename(root / name)
        for name, legacy in reversed(legacy_moved):
            shutil.move(str(backup / name), str(legacy))
        raise
    return backup if moved or legacy_moved else None


def same_pack(staging: Path, root: Path, directories=("classic", "tools")) -> bool:
    for directory in directories:
        incoming = staging / directory
        installed = root / directory
        if installed.is_symlink() or not installed.is_dir():
            return False
        expected = {p.relative_to(incoming) for p in incoming.rglob("*") if p.is_file()}
        actual = {p.relative_to(installed) for p in installed.rglob("*") if p.is_file()}
        if expected != actual:
            return False
        for path in expected:
            current = installed / path
            if current.is_symlink() or current.read_bytes() != (incoming / path).read_bytes():
                return False
    return True


@contextmanager
def installation_lock(root: Path):
    lock = root / '.classic-install.lock'
    try:
        handle = lock.open('x', encoding='utf-8')
    except FileExistsError:
        raise ValueError(f'Another installation owns {lock}; if it was interrupted, remove the lock only after confirming it has stopped') from None
    try:
        with handle:
            handle.write(str(os.getpid()))
        yield
    finally:
        lock.unlink()


def install(args) -> None:
    app = args.app.resolve()
    package = json.loads((app / "package.json").read_text(encoding="utf-8"))
    if package.get("name") != "slenderaac":
        raise ValueError("--app must identify the SlenderAAC application directory")
    env_path = app / ".env"
    if env_path.is_symlink():
        raise ValueError("Refusing to replace a symlinked .env; configure a regular app .env")
    raw_env = env_path.read_bytes() if env_path.exists() else (app / ".env.dist").read_bytes()
    text = raw_env.decode("utf-8-sig").replace("\r\n", "\n")
    configured = os.environ.get("THEME_ASSETS_ROOT") or env_value(text, "THEME_ASSETS_ROOT")
    root = (args.root or (Path(configured) if configured else app.parent / (app.name + "-theme-assets")))
    if not root.is_absolute():
        root = app / root
    root = root.resolve()
    if root == app or root.is_relative_to(app):
        raise ValueError("Choose an asset root outside the application checkout")
    packs = list(dict.fromkeys(getattr(args, "packs", ["classic"])))
    directories = tuple(directory for pack in packs for directory in PACKS[pack][0])
    for directory in directories:
        target = root / directory
        if target == app or app.is_relative_to(target):
            raise ValueError("Asset directory overlaps the application checkout")
    legacy_stores = []
    if "store" in packs:
        for name, relative in (("legacy-store", "static/images/store"),
                               ("legacy-built-store", "build/client/images/store")):
            legacy = app / relative
            if legacy.is_symlink() or legacy.resolve() != legacy.absolute():
                raise ValueError("Legacy store directory must not be a symlink; relocate it manually first")
            if legacy.exists():
                if not legacy.is_dir():
                    raise ValueError("Legacy store path must be a directory")
                legacy_stores.append((name, legacy))
    new_env = configure_env(text, root, packs)
    if b"\r\n" in raw_env:
        new_env = new_env.replace("\n", "\r\n")
    root.mkdir(parents=True, exist_ok=True)
    with installation_lock(root):
        # Stage every selected package before replacing any installed directory.
        with tempfile.TemporaryDirectory(prefix=".classic-install-", dir=root) as directory:
            stage = Path(directory)
            manifests = []
            for pack in packs:
                print(f"Downloading the published {pack} package...", flush=True)
                channel = read_channel(pack)
                payload = download(channel["url"], MAX_ZIP)
                if len(payload) != channel["size"] or digest(payload) != channel["sha256"]:
                    raise ValueError("Release checksum/size mismatch; installation was not changed")
                archive = stage / f"{pack}.zip"
                archive.write_bytes(payload)
                del payload
                manifests.append(unpack(archive, stage, pack))
                archive.unlink()
            env_backup = None
            if env_path.exists() and env_path.read_bytes() != new_env.encode("utf-8"):
                env_backup = app / (".env.assets-backup-" + uuid.uuid4().hex)
                shutil.copy2(env_path, env_backup)
            if same_pack(stage, root, directories) and not legacy_stores:
                if not env_path.exists() or env_path.read_bytes() != new_env.encode("utf-8"):
                    atomic_env(env_path, new_env)
                backup = None
                print("The installed package already matches this release.")
            else:
                backup = activate(stage, root, env_path, new_env, directories, legacy_stores)
            for manifest in manifests:
                print(f"Installed {manifest['name']} {manifest['version']} ({len(manifest['hashes'])} verified files).")
            print(f"Assets directory: {root.as_posix()}")
            if backup:
                print(f"Previous package retained at {backup}")
            if env_backup:
                print(f"Previous environment retained at {env_backup}")
    print("Restart the website to load the updated asset configuration.")
    if "store" in packs:
        print("Store images: /images/store/ (point the game server coinImagesURL at your website).")


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
        if archive.stat().st_size > MAX_ZIP:
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
    if not payload or len(payload) > MAX_ZIP:
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
        if digest(download(url, MAX_ZIP)) != checksum:
            raise ValueError("Published versioned archive differs; channel was not changed")
        channel = {"schemaVersion": 1, "name": pack, "version": manifest["version"],
                   "release": args.release, "url": url, "sha256": checksum, "size": len(payload)}
        (stage / f"{pack}.zip").write_bytes(payload)
        (stage / f"{pack}.zip.sha256").write_text(checksum + f"  {pack}.zip\n", encoding="utf-8")
        (stage / f"{pack}-assets.json").write_text(json.dumps(channel, indent=2) + "\n", encoding="utf-8")
        shutil.copyfile(Path(__file__), stage / "install-classic-assets.py")
        notes = stage / "notes.md"
        notes.write_text(
            "Fixed download channel for Classic, animated outfits, animated items and game-store images.\n\n"
            "From the application root, with Python 3.10+: `python src/scripts/theme_assets.py install`. "
            "Use `install --packs classic` or `install --packs outfits items store` to select packages. "
            "Or download `install-classic-assets.py` and use `install --app <application-directory>`.\n\n"
            "Each package has a fixed ZIP and SHA-256 attachment, plus a JSON pointer to an immutable versioned archive. "
            "All installation downloads stay in this repository's releases. Existing directories are backed up, "
            "and configuration is activated only after all selected packages pass verification. Restart the website afterwards. "
            "No database import or build is performed.\n\n"
            f"[Installation guide](https://github.com/{REPOSITORY}/blob/{args.target}/docs/classic-assets.md)\n",
            encoding="utf-8")
        current = get_release(CHANNEL_TAG)
        if current is None:
            gh("release", "create", CHANNEL_TAG, "--repo", REPOSITORY, "--target", args.target,
               "--draft", "--prerelease", "--title", "Classic assets: current package",
               "--notes-file", str(notes))
        gh("release", "upload", CHANNEL_TAG, str(stage / f"{pack}.zip"),
           str(stage / f"{pack}.zip.sha256"), str(stage / "install-classic-assets.py"),
           "--clobber", "--repo", REPOSITORY)
        gh("release", "upload", CHANNEL_TAG, str(stage / f"{pack}-assets.json"),
           "--clobber", "--repo", REPOSITORY)
        gh("release", "edit", CHANNEL_TAG, "--draft=false", "--latest=false",
           "--notes-file", str(notes), "--repo", REPOSITORY)
    print(RELEASE_BASE + CHANNEL_TAG + f"/{pack}.zip")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    installer = sub.add_parser("install", help="Install/update all artwork from the fixed release channel")
    installer.add_argument("--app", type=Path, default=Path.cwd(), help="SlenderAAC directory (default: current directory)")
    installer.add_argument("--root", type=Path, help="External assets directory (default: existing config, otherwise a sibling directory)")
    installer.add_argument("--packs", nargs="+", choices=tuple(PACKS), default=list(PACKS), help="Packages to install (default: all four)")
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
        {"install": install, "publish": publish, "package": package_sprites}[args.command](args)
    except (OSError, ValueError, RuntimeError, zipfile.BadZipFile) as error:
        print(f"Website assets: {error}", file=sys.stderr)
        raise SystemExit(1) from None


if __name__ == "__main__":
    main()
