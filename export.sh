#!/bin/bash

# Define the paths
PAGES_DIR="./src/pages"
LOCALE_DIR="./src/pages/[locale]"
ESCAPED_LOCALE_DIR="./src/pages/\[locale\]"
BACKUP_DIR="./.page_backups"

# Check if the [locale] directory exists, if not, create it
if [ ! -d "$LOCALE_DIR" ]; then
  echo "Creating [locale] directory..."
  mkdir -p "$LOCALE_DIR"
fi

# Check if the /.page_backups directory exists, if not, create it
if [ ! -d "$BACKUP_DIR" ]; then
  echo "Creating /.page_backups directory..."
  mkdir -p "$BACKUP_DIR"
fi

# Move files from /pages to /src/pages/[locale], excluding _app.js, 404.js, _redirect.js, _document.js, api folder, and [locale] folder
for file in $PAGES_DIR/*; do
  filename=$(basename "$file")
  # Check if the file is not _app.js, _document.js, and also not the api directory or [locale] directory
  if [[ "$filename" != "_app.js" && "$filename" != "404.js" && "$filename" != "500.js" && "$filename" != "_document.js" && "$filename" != "_redirect.js" && "$filename" != "api" && "$filename" != "[locale]" ]]; then
    echo "Moving $filename to $LOCALE_DIR"
    mv "$file" "$LOCALE_DIR"
  fi
done

echo "Files moved successfully."

# Copy the files from /src/pages/[locale] to /.page_backups
for file in $ESCAPED_LOCALE_DIR/*; do
  filename=$(basename "$file")

  echo "Copy $filename to $BACKUP_DIR"
  cp -r "$file" "$BACKUP_DIR"
done

# Append the specified line to every js file that does not have [ or ] in its name
# echo "Appending getStaticPaths function to each JS file..."
# find "$LOCALE_DIR" -type f -name "*.js" ! -name "*[\[]*[\]]*" -exec bash -c 'echo -e "\nimport { getStaticPaths } from \"@/lib/get-static\"\nexport { getStaticPaths }" >> "$0"' {} \;
#echo "Append operation completed."

# Check if _redirect.js exists and rename it to index.js
if [ -f "$PAGES_DIR/_redirect.js" ]; then
  echo "Renaming _redirect.js to index.js before build..."
  mv "$PAGES_DIR/_redirect.js" "$PAGES_DIR/index.js"
fi

echo "Renaming files and directories in $LOCALE_DIR by removing '[' and ']'..."

find "$LOCALE_DIR" -depth -type f -name "*[\[\]]*" | while IFS= read -r item; do
  # Construct the new path by removing '[' and ']' from the filename, preserving the rest of the path
  newpath=$(echo "$item" | sed 's/\(\[locale\]\/.*\)\[\(.*\)\]\(\..*\)$/\1\2\3/')
  echo "Renaming $item to $newpath"
  mv "$item" "$newpath"
done

echo "Renaming operation completed."

# TODO run the build
npm run build
# npx cap sync

# Check if index.js exists and rename it back to _redirect.js after build
if [ -f "$PAGES_DIR/index.js" ]; then
  echo "Renaming index.js back to _redirect.js after build..."
  mv "$PAGES_DIR/index.js" "$PAGES_DIR/_redirect.js"
fi

echo "Moving content back to the pages directory..."

for file in $BACKUP_DIR/*; do
  filename=$(basename "$file")

  echo "Moving $filename to $PAGES_DIR"
  mv "$file" "$PAGES_DIR"
done

echo "JS files moved back successfully."

# Delete the [locale] directory after moving the files back
if [ -d "$LOCALE_DIR" ]; then
  echo "Deleting the [locale] directory..."
  rm -r "$LOCALE_DIR"
  echo "[locale] directory deleted."
fi

# Delete the ./tmp_pages directory after moving the files back
if [ -d "$BACKUP_DIR" ]; then
  echo "Deleting the ./page_backups directory..."
  rm -r "$BACKUP_DIR"
  echo "./page_backups  directory deleted."
fi
