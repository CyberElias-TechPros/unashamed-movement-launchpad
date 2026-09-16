#!/usr/bin/env bash
#
# Mirror ttin.techpros.com.ng (static SPA + assets + API data) for backup.
# v3: fixpoint asset discovery (lazy chunks reference more assets),
#     SPA-fallback junk filtering, API scrape with proper headers,
#     self-hosted PDFs, Google Drive thumbnails.
#
# Runs on a GitHub Actions runner (full internet access).
# Usage: scrape-site.sh [base_url] [output_dir]

BASE="${1:-https://ttin.techpros.com.ng}"
OUT="${2:-site-recovery/live}"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
JAR="$PWD/_cookies.txt"

mkdir -p "$OUT" || exit 1
cd "$OUT" || exit 1

MISSES=0

fetch() { # fetch <url> <dest-relative-to-OUT> [extra-curl-args...]
  local url="$1" dest="$2" code
  shift 2
  [ -s "$dest" ] && return 0
  mkdir -p "$(dirname "$dest")"
  code=$(curl -sL --retry 2 --retry-delay 1 --max-time 600 -A "$UA" -o "$dest" -w '%{http_code}' "$url" "$@" 2>/dev/null)
  if [ "$code" = "200" ] && [ -s "$dest" ]; then
    echo "ok:   $code $url ($(du -h "$dest" | cut -f1))"
  else
    echo "MISS: $code $url"
    rm -f "$dest"
    MISSES=$((MISSES+1))
    return 1
  fi
}

is_junk() { # SPA-fallback HTML saved under a non-HTML name
  local f="$1"
  case "$f" in
    *.html|*.htm) return 1 ;;
  esac
  head -c 15 "$f" 2>/dev/null | grep -qiE '^<!doctype|^<html' && return 0
  return 1
}

clean_junk() {
  echo "--- junk filter (SPA fallbacks saved under wrong extensions) ---"
  find . -type f ! -path './_urls/*' -print0 | while IFS= read -r -d '' f; do
    if is_junk "$f"; then
      echo "junk removed: $f"
      rm -f "$f"
    fi
  done
  # empty files
  find . -type f -empty ! -path './_urls/*' -delete 2>/dev/null || true
}

echo "=== [0/8] clean previously-committed SPA-fallback junk ==="
clean_junk

echo "=== [1/8] root files ==="
for f in index.html manifest.json robots.txt sitemap.xml sw.js offline.html favicon.ico; do
  fetch "$BASE/$f" "$f"
done

if [ ! -s index.html ]; then
  echo "FATAL: index.html could not be fetched"
  exit 1
fi

echo "=== [2/8] bundles referenced by index.html ==="
grep -oE '/[A-Za-z0-9_./-]+' index.html | grep -E '\.(js|mjs|css)$' | sort -u > _urls-index.txt
cat _urls-index.txt
while IFS= read -r p; do fetch "$BASE$p" ".$p"; done < _urls-index.txt

echo "=== [3/8] fixpoint harvest: download every referenced asset until nothing new ==="
for round in 1 2 3 4 5 6 7 8; do
  find . -path ./external -prune -o -type f \( -name '*.js' -o -name '*.mjs' -o -name '*.css' -o -name '*.html' \) -print0 \
    | xargs -0 cat 2>/dev/null > _bc.txt || true
  sed -E 's#(https?:)?//[A-Za-z0-9_./%?&=,:+~_-]+##g' _bc.txt > _bl.txt || true
  {
    grep -oE "/[A-Za-z0-9_./()%,' -]+" _bl.txt | sed 's/[[:space:]]*$//' \
      | grep -E '\.(png|jpe?g|svg|webp|gif|avif|mp4|webm|mov|m4v|mp3|wav|pdf|woff2?|ttf|eot|otf|ico|json|txt|xml|js|mjs|css|map)$' || true
    grep -oE "(images|videos|resources|assets|fonts)/[A-Za-z0-9_./()%,' -]+" _bl.txt | sed 's/[[:space:]]*$//' \
      | grep -E '\.(png|jpe?g|svg|webp|gif|mp4|pdf|json|txt|js|css|woff2?)$' | sed 's#^#/#' || true
  } | sort -u > _urls-round.txt
  new=0
  while IFS= read -r p; do
    [ -f ".$p" ] && continue
    if ! fetch "$BASE$p" ".$p"; then
      enc=$(python3 -c 'import sys,urllib.parse; print(urllib.parse.quote(sys.argv[1]))' "$p" 2>/dev/null || true)
      [ -n "$enc" ] && [ "$enc" != "$p" ] && fetch "$BASE$enc" ".$p" && new=$((new+1))
    else
      new=$((new+1))
    fi
  done < _urls-round.txt
  echo "round $round: +$new files"
  [ "$new" = "0" ] && break
done

echo "=== [4/8] API scrape (JSON; XHR-style headers + session cookie) ==="
mkdir -p api
# establish session (cookie jar) like the SPA does
curl -sL -A "$UA" -c "$JAR" "$BASE/api/auth/csrf-token" -o api/auth-csrf-token.json -w 'csrf: %{http_code}\n' || true
api_get() { # api_get <path> <dest>
  local path="$1" dest="api/$2"
  local code
  code=$(curl -sL --max-time 60 -A "$UA" -b "$JAR" -c "$JAR" \
    -H 'Accept: application/json' -H 'X-Requested-With: XMLHttpRequest' \
    -H "Referer: $BASE/" \
    -o "$dest" -w '%{http_code}' "$BASE$path" 2>/dev/null)
  if [ "$code" = "200" ] && head -c 1 "$dest" 2>/dev/null | grep -qE '[{[]'; then
    echo "api ok:   $code $path ($(du -h "$dest" | cut -f1))"
  else
    echo "api MISS: $code $path"
    rm -f "$dest"
  fi
}
api_get "/api/health" "health.json"
api_get "/api/settings" "settings.json"
api_get "/api/content" "content.json"
api_get "/api/countries" "countries.json"
api_get "/api/products?limit=100" "products.json"
api_get "/api/testimonies?limit=100" "testimonies.json"
api_get "/api/events?limit=100" "events.json"
api_get "/api/resources?limit=100" "resources.json"
api_get "/api/videos?limit=100" "videos.json"
api_get "/api/videos/feed" "videos-feed.json"
api_get "/api/reviews?limit=100" "reviews.json"
api_get "/api/search?q=faith" "search-faith.json"
api_get "/api/analytics/dashboard" "analytics-dashboard.json"

echo "=== [5/8] self-hosted resource PDFs (API downloadUrls + known paths) ==="
mkdir -p resources
{
  python3 - <<'PY' 2>/dev/null || true
import json
try:
    d = json.load(open('api/resources.json'))
    items = d.get('data', d) if isinstance(d, dict) else d
    for it in items:
        u = it.get('downloadUrl') or ''
        if u.startswith('/resources/'):
            print(u[len('/resources/'):])
except Exception:
    pass
PY
  cat <<'PDFS'
Foxe's Book of Martyrs.pdf
God's Generals- The Revivalists.pdf
God's Generals- Why They Succeeded and Why Some Failed.pdf
I Went To Hell.pdf
Kathryn Kuhlman- Her Spiritual Legacy.pdf
Now That You Are Born Again.pdf
Recreating Your World.pdf
Revival in the Hebrides.pdf
The Power of Tongues.pdf
The Seven Spirits of God.pdf
Tortured for Christ.pdf
When God Visits You.pdf
PDFS
} | sort -u | while IFS= read -r pdf; do
  [ -z "$pdf" ] && continue
  enc=$(python3 -c 'import sys,urllib.parse; print(urllib.parse.quote(sys.argv[1]))' "$pdf" 2>/dev/null || true)
  fetch "$BASE/resources/$enc" "resources/$pdf" || fetch "$BASE/resources/$pdf" "resources/$pdf"
done

echo "=== [6/8] Google Drive thumbnails for every referenced Drive ID ==="
mkdir -p external _urls
find . -path ./external -prune -o -type f \( -name '*.js' -o -name '*.json' \) -print0 \
  | xargs -0 cat 2>/dev/null | grep -oE '1[A-Za-z0-9_-]{25,40}' | sort -u > _urls/drive-ids.txt || true
echo "drive ids: $(wc -l < _urls/drive-ids.txt)"
while IFS= read -r id; do
  fetch "https://drive.google.com/thumbnail?id=$id&sz=w1200" "external/drive-$id.jpg" \
    || fetch "https://drive.google.com/thumbnail?id=$id&sz=w400" "external/drive-$id.jpg"
done < _urls/drive-ids.txt

echo "=== [7/8] SPA route shells (for the record) ==="
mkdir -p routes
for r in about testimonies shop unashamed resources events contact donate admin 404; do
  code=$(curl -sL -A "$UA" -o "routes/$r.html" -w '%{http_code}' "$BASE/$r" 2>/dev/null || true)
  echo "route /$r -> $code"
  [ "$code" != "200" ] && rm -f "routes/$r.html"
done

echo "=== [8/8] final junk filter + large-file notes ==="
clean_junk
rm -f _bc.txt _bl.txt _urls-round.txt
mkdir -p _urls
[ -f _urls-index.txt ] && mv _urls-index.txt "_urls/_urls-index.txt"
# files too large for git (>95MB): record their URLs, then remove
find . -type f -size +95M ! -path './_urls/*' | while IFS= read -r f; do
  echo "$BASE${f#.}" | sed 's#/#/#g' >> _urls/large-files.txt
  echo "LARGE (not committed): $f ($(du -h "$f" | cut -f1))"
  rm -f "$f"
done
rm -f "$JAR"

echo "=== RECOVERY SUMMARY ==="
echo "files: $(find . -type f | wc -l)"
echo "misses: $MISSES"
du -sh .
echo "--- largest files ---"
find . -type f -exec du -h {} + 2>/dev/null | sort -rh | head -25
exit 0
