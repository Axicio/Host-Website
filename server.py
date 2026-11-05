"""Small dependency-free live-reload server for this static site."""

from __future__ import annotations

import argparse
import hashlib
import os
import threading
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent
WATCHED_SUFFIXES = {
    ".html", ".htm", ".css", ".js", ".json", ".svg", ".png", ".jpg",
    ".jpeg", ".gif", ".webp", ".avif", ".ico", ".woff", ".woff2",
}
RELOAD_SCRIPT = b"""
<script>
(() => {
  let version;
  async function check() {
    try {
      const response = await fetch('/__live_reload__', { cache: 'no-store' });
      const next = await response.text();
      if (version && version !== next) location.reload();
      version = next;
    } catch (_) {}
    setTimeout(check, 700);
  }
  check();
})();
</script>
"""


def site_version() -> str:
    """Return a stable fingerprint of the files that affect the page."""
    digest = hashlib.sha1()
    for path in sorted(ROOT.rglob("*")):
        if path.is_file() and path.suffix.lower() in WATCHED_SUFFIXES:
            try:
                stat = path.stat()
            except OSError:
                continue
            digest.update(str(path.relative_to(ROOT)).encode())
            digest.update(str(stat.st_mtime_ns).encode())
            digest.update(str(stat.st_size).encode())
    return digest.hexdigest()


class LiveReloadHandler(SimpleHTTPRequestHandler):
    def do_GET(self) -> None:
        request_path = urlparse(self.path).path
        if request_path == "/__live_reload__":
            body = site_version().encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        file_path = Path(self.translate_path(self.path))
        if file_path.is_dir():
            file_path = file_path / "index.html"
        if file_path.is_file() and file_path.suffix.lower() in {".html", ".htm"}:
            try:
                page = file_path.read_bytes()
            except OSError:
                self.send_error(404, "File not found")
                return
            marker = page.lower().rfind(b"</body>")
            page = page[:marker] + RELOAD_SCRIPT + page[marker:] if marker >= 0 else page + RELOAD_SCRIPT
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(page)))
            self.end_headers()
            self.wfile.write(page)
            return
        super().do_GET()


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve this website with live reload.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()

    os.chdir(ROOT)
    server = ThreadingHTTPServer((args.host, args.port), LiveReloadHandler)
    url = f"http://{args.host}:{args.port}"
    print(f"Serving {ROOT} at {url} (Ctrl+C to stop)")
    if not args.no_browser:
        threading.Timer(0.3, webbrowser.open, args=(url,)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
