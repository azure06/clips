<p align="center">
  <img alt="Clips" src="public/icon.png" width="446">
</p>

[![Github All Releases](https://img.shields.io/github/downloads/azure06/clips/total.svg)](https://github.com/azure06/clips/releases)
[![infiniti-clips](https://snapcraft.io/infiniti-clips/badge.svg)](https://snapcraft.io/infiniti-clips)
[![infiniti-clips](https://snapcraft.io/infiniti-clips/trending.svg?name=0)](https://snapcraft.io/infiniti-clips)

**Clips** is a free, open source hybrid clipboard application available for Windows and macOS.

**Clips** powered by Google Drive synchronize your clipboard with multiple devices, and allows you to quickly search throw your clipboard history.

**Clips** is [MIT licensed](LICENSE).

## History

**Clips** is a revision of [Infiniti Clips](https://infiniticlips.com).

## Codebase

**Clips** is written completely in TypeScript, and built with **Vue CLI Plugin Electron Builder**.

**Clips** makes extensive use of functional and reactive programming.

## Status

You can find the current area of focus in Github [Issues](https://github.com/azure06/clips/issues/).

## Getting Started

To setup Clips, all you need is

```bash
$ git clone https://github.com/azure06/clips.git
$ cd clips
$ touch .env
```

and finally

```bash
$ npm install
$ npm run electron:serve
```

Note:

Clips has been tested with Node v16.13.0 and npm 8.1.0
Recently due to an issue with [Electron Updater](https://giters.com/electron-userland/electron-builder/issues/6456) you may need to make some modifications to `node_modules/electron-updater/out/AppUpdater.js` file by changing `const promises_1 = require("fs/promises");` to `const promises_1 = require("fs").promises;`


## Philosophy

Work in progress.

### Project Management

Work in progress.

### Technical

Work in progress.

## Community

Work in progress.
