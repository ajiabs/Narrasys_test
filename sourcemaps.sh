#!/bin/bash
rm -rf dist/manifest.*
mv dist/*.map sourcemaps/
cp app/apple-touch-icon.png app/apple-touch-icon-72.png app/apple-touch-icon-114.png dist/
