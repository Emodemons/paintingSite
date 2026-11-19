#!/bin/zsh
# Converts a painting into the two WebP sizes used by the website.
#
# Usage (from the paintingSite-main folder):
#   ./convert-painting.sh "path/to/original.png" short-name
#
# Example:
#   ./convert-painting.sh "Website/pictures/Patapouf.png" patapouf
#
# Creates:
#   Website/pictures/paintings/short-name-800.webp   (normal screens, phones)
#   Website/pictures/paintings/short-name-1600.webp  (sharp/retina screens)
# and prints the line to paste into Website/paintings.js

set -e

if [ $# -ne 2 ]; then
  echo 'Usage: ./convert-painting.sh "path/to/original.png" short-name'
  exit 1
fi

SRC="$1"
NAME="$2"
OUT="$(dirname "$0")/Website/pictures/paintings"
QUALITY=85

mkdir -p "$OUT"

WIDTH=$(sips -g pixelWidth "$SRC" | awk '/pixelWidth/ {print $2}')
HEIGHT=$(sips -g pixelHeight "$SRC" | awk '/pixelHeight/ {print $2}')

for SIZE in 800 1600; do
  if [ "$WIDTH" -gt "$SIZE" ]; then
    cwebp -quiet -q $QUALITY -resize $SIZE 0 "$SRC" -o "$OUT/$NAME-$SIZE.webp"
  else
    # never enlarge a small image, just convert it
    cwebp -quiet -q $QUALITY "$SRC" -o "$OUT/$NAME-$SIZE.webp"
  fi
done

ls -lh "$OUT/$NAME-800.webp" "$OUT/$NAME-1600.webp" | awk '{print $5, $9}'
echo
echo "Paste this into the PAINTINGS list in Website/paintings.js:"
echo "  { file: \"$NAME\", title: \"$NAME\", width: $WIDTH, height: $HEIGHT },"
