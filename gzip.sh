#!/bin/bash
rm -rf dist/manifest.*
find -E dist/ -regex "".*\js\$"" -exec bash -c 'echo Compressing "{}" && gzip -c --best "{}" > "{}.gz"' \;
mv dist/*.map sourcemaps/
cp app/version.txt app/apple-touch-icon.png app/apple-touch-icon-72.png app/apple-touch-icon-114.png app/favicon.ico dist/
