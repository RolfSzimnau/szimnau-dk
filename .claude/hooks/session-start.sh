#!/bin/bash
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-/home/user/szimnau-dk}"

# Astro 7 needs Node >=22.23.4 and the container ships an older Node 22.
# Install the major version from .node-version once (the container caches it)
# and put it first on PATH for the whole session.
MAJOR="$(tr -d '[:space:]v' < .node-version)"
NODE_DIR="$HOME/.cache/node-$MAJOR"

if [ ! -x "$NODE_DIR/bin/node" ]; then
  VERSION="$(curl -fsS https://nodejs.org/dist/index.json \
    | python3 -c "import json,sys; print(next(r['version'] for r in json.load(sys.stdin) if r['version'].startswith('v$MAJOR.')))")"
  TARBALL="node-$VERSION-linux-x64.tar.xz"
  TMP="$(mktemp -d)"
  curl -fsS -o "$TMP/$TARBALL" "https://nodejs.org/dist/$VERSION/$TARBALL"
  (cd "$TMP" && curl -fsS "https://nodejs.org/dist/$VERSION/SHASUMS256.txt" | grep " $TARBALL\$" | sha256sum -c -)
  mkdir -p "$NODE_DIR"
  tar -xJf "$TMP/$TARBALL" -C "$NODE_DIR" --strip-components=1
  rm -rf "$TMP"
fi

export PATH="$NODE_DIR/bin:$PATH"
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo "export PATH=\"$NODE_DIR/bin:\$PATH\"" >> "$CLAUDE_ENV_FILE"
fi

# npm from the pinned Node leaves package-lock.json as committed.
npm install
