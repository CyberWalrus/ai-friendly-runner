#!/bin/bash
set -e

VERSION=${1:-dev}
OUTPUT_DIR="binaries"

echo "Building ai-friendly-runner version: $VERSION"

# Очистка
rm -rf $OUTPUT_DIR
mkdir -p $OUTPUT_DIR

# Платформы для сборки
platforms=(
    "darwin/amd64"    # macOS Intel
    "darwin/arm64"    # macOS Apple Silicon
    "linux/amd64"     # Linux x64
    "linux/arm64"     # Linux ARM
    "windows/amd64"   # Windows x64
)

for platform in "${platforms[@]}"; do
    GOOS=${platform%/*}
    GOARCH=${platform#*/}
    
    output_name="aifr-$GOOS-$GOARCH"
    if [ "$GOOS" = "windows" ]; then
        output_name+=".exe"
    fi
    
    echo "Building for $GOOS/$GOARCH..."
    CGO_ENABLED=0 GOOS=$GOOS GOARCH=$GOARCH go build \
        -ldflags="-s -w -X 'github.com/CyberWalrus/ai-friendly-runner/pkg/cli.version=$VERSION'" \
        -o "$OUTPUT_DIR/$output_name" \
        ./cmd/aifr
    
    # Показать размер файла
    size=$(du -h "$OUTPUT_DIR/$output_name" | cut -f1)
    echo "  ✓ Built: $output_name ($size)"
done

echo ""
echo "✅ Build complete! Binaries in $OUTPUT_DIR/"
ls -lh $OUTPUT_DIR/

