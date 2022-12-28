/* eslint-disable @typescript-eslint/no-var-requires */
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const gitRevisionPlugin = new GitRevisionPlugin();

module.exports = {
  transpileDependencies: ['vuetify'],
  configureWebpack: {
    target: 'electron-renderer',
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: 'com.infiniti.clips',
        productName: 'Clips',
        publish: ['github'],
        afterSign: 'scripts/notarize.js',
        buildVersion: '0.2.7',
        // win: {
        //   publisherName: ['Gabriele Sato'],
        //   target: ['nsis'],
        // },
        asarUnpack: ['**/node_modules/leveldown/**/*'],
        mac: {
          gatekeeperAssess: false,
          hardenedRuntime: true,
          type: 'distribution',
          category: 'public.app-category.utilities',
          target: ['mas', 'mas-dev', 'pkg', 'dmg', 'zip'],
          entitlements: 'build/entitlements.mac.plist',
          entitlementsInherit: 'build/entitlements.mac.plist',
          provisioningProfile: 'build/embedded.provisionprofile',
        },
        mas: {
          hardenedRuntime: false, //IMPORTANT!!!!
          type: 'distribution',
          category: 'public.app-category.utilities',
          entitlements: 'build/entitlements.mas.plist',
          entitlementsInherit: 'build/entitlements.mas.inherit.plist',
          provisioningProfile: 'build/embedded.provisionprofile',
        },
        masDev: {
          gatekeeperAssess: false,
          hardenedRuntime: false, //IMPORTANT!!!!
          type: 'development',
          category: 'public.app-category.utilities',
          entitlements: 'build/entitlements.mas.plist',
          entitlementsInherit: 'build/entitlements.mas.inherit.plist',
          provisioningProfile: 'build/masdev.provisionprofile',
        },
      },
      chainWebpackRendererProcess: (config) => {
        config.plugin('define').tap((definitions) => {
          definitions[0] = Object.assign(definitions[0], {
            __DATE__: Date.now(),
            __VERSION__: JSON.stringify(gitRevisionPlugin.version()),
            __COMMITHASH__: JSON.stringify(gitRevisionPlugin.commithash()),
            __BRANCH__: JSON.stringify(gitRevisionPlugin.branch()),
          });
          return definitions;
        });
      },
    },
  },
};
