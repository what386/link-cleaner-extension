#!/bin/bash

mkdir -p ./build

rm -f ./build/link-cleaner-mv2.xpi

cd ./manifest-v2 && zip -r ../build/link-cleaner-mv2.xpi * && cd ..

echo "Build complete: ./build/link-cleaner-mv2.xpi"
