#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function getPlatform() {
    const { platform } = process;
    const { arch } = process;

    const platformMap = {
        darwin: { x64: 'darwin-amd64', arm64: 'darwin-arm64' },
        linux: { x64: 'linux-amd64', arm64: 'linux-arm64' },
        win32: { x64: 'windows-amd64' },
    };

    if (!platformMap[platform] || !platformMap[platform][arch]) {
        throw new Error(`Unsupported platform: ${platform}-${arch}`);
    }

    return platformMap[platform][arch];
}

function install() {
    try {
        const platformBinary = getPlatform();
        const isWindows = platformBinary.includes('windows');
        const binaryName = isWindows ? 'aifr.exe' : 'aifr';

        const sourcePath = path.join(__dirname, '..', 'binaries', `aifr-${platformBinary}${isWindows ? '.exe' : ''}`);
        const targetPath = path.join(__dirname, '..', 'bin', binaryName);

        if (!fs.existsSync(sourcePath)) {
            console.error(`❌ Binary not found: ${sourcePath}`);
            console.error('Please run: npm run build');
            process.exit(1);
        }

        const binDir = path.dirname(targetPath);
        if (!fs.existsSync(binDir)) {
            fs.mkdirSync(binDir, { recursive: true });
        }

        try {
            fs.linkSync(sourcePath, targetPath);
        } catch {
            fs.copyFileSync(sourcePath, targetPath);
        }

        if (!isWindows) {
            fs.chmodSync(targetPath, '755');
        }
        console.log(`✅ Installed aifr for ${process.platform}-${process.arch}`);
    } catch (error) {
        console.error(`❌ Installation failed: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    install();
}

module.exports = { install, getPlatform };
