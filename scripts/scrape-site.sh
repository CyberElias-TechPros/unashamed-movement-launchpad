#!/usr/bin/env bash
#
# Mirror ttin.techpros.com.ng (static SPA + assets) for backup/recovery.
# Runs on a GitHub Actions runner (full internet access) — the sandbox
# cannot reach the site directly.
#
# Usage: scrape-site.sh [base_url] [output_dir]
set -uo pipefail

BASE="${1:-https://ttin.techpros.com.ng}"
OUT="${2:-site-recovery/live}"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"

mkdir -p "$OUT"
cd "$OUT" || exit 1

fetch() { # fetch <url> <dest-relative-to-OUT>
  local url="$1" dest="$2"
  [ -s "$dest" ] && return 0
  mkdir -p "$(dirname "$dest")"
  if curl -sfL --retry 3 --retry-delay 2 --max-time 300 -A "$UA" "$url" -o "$dest"; then
    echo "ok:   $url ($(du -h "$dest" | cut -f1))"
  else
    echo "MISS: $url"
    rm -f "$dest"
    return 1
  fi
}

echo "=== [1/7] root files ==="
for f in index.html manifest.json robots.txt sitemap.xml sw.js offline.html favicon.ico; do
  fetch "$BASE/$f" "$f"
done

if [ ! -s index.html ] || ! grep -qi "<script" index.html; then
  echo "FATAL: index.html missing or not a real page (challenge?):"
  head -c 500 index.html 2>/dev/null || true
  exit 1
fi

echo "=== [2/7] bundles referenced by index.html ==="
grep -oE '/[A-Za-z0-9_./-]+\.(js|mjs|css)' index.html | sort -u > _urls-index.txt
cat _urls-index.txt
while IFS= read -r p; do fetch "$BASE$p" ".$p"; done < _urls-index.txt

echo "=== [3/7] source maps for those bundles (original source if deployed) ==="
while IFS= read -r p; do fetch "$BASE$p.map" ".$p.map"; done < _urls-index.txt

echo "=== [4/7] harvest every asset path from all JS/CSS/HTML ==="
find . -path ./external -prune -o -type f \( -name '*.js' -o -name '*.mjs' -o -name '*.css' -o -name '*.html' \) -print0 \
  | xargs -0 cat 2>/dev/null > _bundle-concat.txt || true
echo "bundle bytes: $(wc -c < _bundle-concat.txt)"

# Absolute site paths (allow spaces/apostrophes/percent-encoding in filenames)
grep -oE "/[A-Za-z0-9_./()%,' -]+\.(png|jpe?g|svg|webp|gif|avif|mp4|webm|mov|m4v|mp3|wav|pdf|woff2?|ttf|eot|otf|ico|json|txt|xml|js|mjs|css|map)" _bundle-concat.txt \
  | sed -E 's/[?#].*$//' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | sort -u > _urls-static.txt || true
# Relative paths without leading slash (images/..., videos/..., resources/..., assets/...)
grep -oE "(images|videos|resources|assets|fonts)/[A-Za-z0-9_./()%,' -]+\.(png|jpe?g|svg|webp|gif|mp4|pdf|json|txt|js|css|woff2?)" _bundle-concat.txt \
  | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | sort -u | sed 's#^#/#' >> _urls-static.txt || true
sort -u _urls-static.txt -o _urls-static.txt
echo "discovered static paths: $(wc -l < _urls-static.txt)"
while IFS= read -r p; do
  # Skip the ones we already have; also try the URL-encoded variant for paths with spaces/apostrophes
  if ! fetch "$BASE$p" ".$p"; then
    enc=$(python3 - "$p" <<'PY'
import sys, urllib.parse
print(urllib.parse.quote(sys.argv[1]))
PY
)
    [ "$enc" != "$p" ] && fetch "$BASE$enc" ".$p"
  fi
done < _urls-static.txt

echo "=== [5/7] source maps for every discovered JS chunk ==="
grep -oE '/[A-Za-z0-9_./-]+\.js' _urls-static.txt | sort -u | while IFS= read -r p; do
  fetch "$BASE$p.map" ".$p.map"
done

echo "=== [6/7] external assets (Google Drive thumbnails etc.) ==="
mkdir -p external _urls
grep -oE 'https://[A-Za-z0-9_./%?&=,:+-]+\.(png|jpe?g|svg|webp|gif|mp4|pdf|woff2?)' _bundle-concat.txt | sort -u > _urls-external.txt || true
grep -oE 'https://drive\.google\.com/[A-Za-z0-9_./%?&=,:+-]+' _bundle-concat.txt | sort -u >> _urls-external.txt || true
grep -oE 'https://[A-Za-z0-9_./%?&=,:+-]*gumroad[A-Za-z0-9_./%?&=,:+-]*' _bundle-concat.txt | sort -u >> _urls-external.txt || true
sort -u _urls-external.txt -o _urls-external.txt
echo "external urls: $(wc -l < _urls-external.txt)"
while IFS= read -r u; do
  case "$u" in
    *youtube.com/*|*ytimg.com/*) echo "skip (YouTube CDN, stable): $u"; continue ;;
    *instagram.com/*|*cdninstagram.com/*) echo "skip (expiring Instagram CDN): $u"; continue ;;
  esac
  id=$(echo "$u" | grep -oE 'id=[A-Za-z0-9_-]+' | cut -d= -f2)
  if [ -n "$id" ]; then
    name="external/drive-$id"
  else
    name="external/$(echo "$u" | md5sum | cut -c1-12)-$(basename "${u%%\?*}")"
  fi
  fetch "$u" "$name"
done < _urls-external.txt

echo "=== [7/7] SPA route shells (for the record) ==="
mkdir -p routes
for r in about testimonies shop unashamed resources events contact donate admin 404; do
  curl -sfL -A "$UA" "$BASE/$r" -o "routes/$r.html" || echo "MISS route: /$r"
done

# Tidy: keep the URL manifests, drop the giant concat temp file
rm -f _bundle-concat.txt
mkdir -p _urls
for f in _urls-index.txt _urls-static.txt _urls-external.txt; do
  [ -f "$f" ] && mv "$f" "_urls/$f"
done

echo "=== RECOVERY SUMMARY ==="
echo "files: $(find . -type f | wc -l)"
du -sh .
echo "--- largest files ---"
find . -type f -exec du -h {} + | sort -rh | head -25
