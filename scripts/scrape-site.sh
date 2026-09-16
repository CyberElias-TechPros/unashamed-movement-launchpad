#!/usr/bin/env bash
#
# Mirror ttin.techpros.com.ng (static SPA + assets) for backup/recovery.
# Runs on a GitHub Actions runner (full internet access) — the sandbox
# cannot reach the site directly.
#
# Usage: scrape-site.sh [base_url] [output_dir]
# Always exits 0 unless the site is unreachable at all (exit 1) — individual
# misses are logged with HTTP status codes and reported at the end.

BASE="${1:-https://ttin.techpros.com.ng}"
OUT="${2:-site-recovery/live}"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"

mkdir -p "$OUT" || exit 1
cd "$OUT" || exit 1

MISSES=0

fetch() { # fetch <url> <dest-relative-to-OUT>
  local url="$1" dest="$2" code
  [ -s "$dest" ] && return 0
  mkdir -p "$(dirname "$dest")"
  code=$(curl -sL --retry 2 --retry-delay 1 --max-time 300 -A "$UA" -o "$dest" -w '%{http_code}' "$url" 2>/dev/null)
  if [ "$code" = "200" ] && [ -s "$dest" ]; then
    echo "ok:   $code $url ($(du -h "$dest" | cut -f1))"
  else
    echo "MISS: $code $url"
    rm -f "$dest"
    MISSES=$((MISSES+1))
    return 1
  fi
}

echo "=== [1/7] root files ==="
for f in index.html manifest.json robots.txt sitemap.xml sw.js offline.html favicon.ico; do
  fetch "$BASE/$f" "$f"
done

if [ ! -s index.html ]; then
  echo "FATAL: index.html could not be fetched (site down or blocking the runner)"
  exit 1
fi
if ! grep -qi "<script" index.html; then
  echo "FATAL: index.html is not a real page — first 500 bytes:"
  head -c 500 index.html || true
  echo ""
  exit 1
fi

echo "=== [2/7] bundles referenced by index.html ==="
# Extract all slash-paths, then filter by exact extension (avoids
# 'manifest.json' matching '.js' etc.)
grep -oE '/[A-Za-z0-9_./-]+' index.html | grep -E '\.(js|mjs|css)$' | sort -u > _urls-index.txt
cat _urls-index.txt
while IFS= read -r p; do fetch "$BASE$p" ".$p"; done < _urls-index.txt

echo "=== [3/7] source maps for those bundles (original source if deployed) ==="
while IFS= read -r p; do fetch "$BASE$p.map" ".$p.map"; done < _urls-index.txt

echo "=== [4/7] harvest every asset path from all JS/CSS/HTML ==="
find . -path ./external -prune -o -type f \( -name '*.js' -o -name '*.mjs' -o -name '*.css' -o -name '*.html' \) -print0 \
  | xargs -0 cat 2>/dev/null > _bundle-concat.txt || true
echo "bundle bytes: $(wc -c < _bundle-concat.txt)"

# Remove full and protocol-relative URLs first so '//' paths aren't mistaken
# for site-absolute paths.
sed -E 's#(https?:)?//[A-Za-z0-9_./%?&=,:+~_-]+##g' _bundle-concat.txt > _bundle-local.txt || true

# Site-absolute paths (allow spaces/apostrophes/percent-encoding in names)
grep -oE "/[A-Za-z0-9_./()%,' -]+" _bundle-local.txt \
  | sed 's/[[:space:]]*$//' \
  | grep -E '\.(png|jpe?g|svg|webp|gif|avif|mp4|webm|mov|m4v|mp3|wav|pdf|woff2?|ttf|eot|otf|ico|json|txt|xml|js|mjs|css|map)$' \
  | sort -u > _urls-static.txt || true
# Relative paths without leading slash (images/..., videos/..., resources/...)
grep -oE "(images|videos|resources|assets|fonts)/[A-Za-z0-9_./()%,' -]+" _bundle-local.txt \
  | sed 's/[[:space:]]*$//' \
  | grep -E '\.(png|jpe?g|svg|webp|gif|mp4|pdf|json|txt|js|css|woff2?)$' \
  | sort -u | sed 's#^#/#' >> _urls-static.txt || true
sort -u _urls-static.txt -o _urls-static.txt
echo "discovered static paths: $(wc -l < _urls-static.txt)"
while IFS= read -r p; do
  # Try the raw path first, then the URL-encoded variant (spaces/apostrophes)
  if ! fetch "$BASE$p" ".$p"; then
    enc=$(python3 -c 'import sys,urllib.parse; print(urllib.parse.quote(sys.argv[1]))' "$p" 2>/dev/null || true)
    [ -n "$enc" ] && [ "$enc" != "$p" ] && fetch "$BASE$enc" ".$p"
  fi
done < _urls-static.txt

echo "=== [5/7] source maps for every discovered JS chunk ==="
grep -E '\.js$' _urls-static.txt | while IFS= read -r p; do
  fetch "$BASE$p.map" ".$p.map"
done

echo "=== [6/7] external assets (Google Drive thumbnails etc.) ==="
mkdir -p external _urls
grep -oE 'https://[A-Za-z0-9_./%?&=,:+~_-]+' _bundle-concat.txt | sort -u > _urls-external.txt || true
echo "external urls: $(wc -l < _urls-external.txt)"
while IFS= read -r u; do
  case "$u" in
    *youtube.com/*|*ytimg.com/*) echo "skip (YouTube CDN, stable): $u"; continue ;;
    *instagram.com/*|*cdninstagram.com/*) echo "skip (expiring Instagram CDN): $u"; continue ;;
    *gumroad.com/*) echo "skip (Gumroad page, not an asset): $u"; continue ;;
    *.css|*.js) echo "skip (external script/style): $u"; continue ;;
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
  code=$(curl -sL -A "$UA" -o "routes/$r.html" -w '%{http_code}' "$BASE/$r" 2>/dev/null || true)
  echo "route /$r -> $code"
  [ "$code" != "200" ] && rm -f "routes/$r.html"
done

# Tidy: keep the URL manifests, drop the giant concat temp files
rm -f _bundle-concat.txt _bundle-local.txt
mkdir -p _urls
for f in _urls-index.txt _urls-static.txt _urls-external.txt; do
  [ -f "$f" ] && mv "$f" "_urls/$f"
done

echo "=== RECOVERY SUMMARY ==="
echo "files: $(find . -type f | wc -l)"
echo "misses: $MISSES"
du -sh .
echo "--- largest files ---"
find . -type f -exec du -h {} + 2>/dev/null | sort -rh | head -25
exit 0
