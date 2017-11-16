#!/bin/bash
grep -r '@npUpgrade-' ../../app > progress.txt
ts-node index.ts
