#!/bin/bash

find -E dist/ -regex "".*\js\$"" -exec bash -c 'echo Compressing "{}" && gzip -c --best "{}" > "{}.gz"' \;
