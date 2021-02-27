/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  console.info(path.resolve(__dirname, `../dist_electron/mac/${appName}.app`));
  return await notarize({
    appBundleId: 'com.infiniti.clips',
    appPath: path.resolve(__dirname, `../dist_electron/mac/${appName}.app`),
    appleId: process.env.VUE_APP_APPLE_ID,
    appleIdPassword: process.env.VUE_APP_SPECIFIC_PASSWORD,
  });
};
