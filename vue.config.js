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
        // afterSign: 'scripts/notarize.js',
        buildVersion: '0.1.10',
        mac: {
          category: 'public.app-category.utilities',
          target: ['mas', 'pkg', 'dmg'],
          hardenedRuntime: true,
          gatekeeperAssess: false,
          entitlements: 'build/entitlements.mac.plist',
          entitlementsInherit: 'build/entitlements.mac.plist',
          type: 'distribution',
          provisioningProfile: 'build/Clips_Dist.provisionprofile',
        },
        mas: {
          category: 'public.app-category.utilities',
          hardenedRuntime: false, //IMPORTANT!!!!
          type: 'distribution',
          entitlements: 'build/entitlements.mas.plist',
          entitlementsInherit: 'build/entitlements.mas.inherit.plist',
          provisioningProfile: 'build/Clips_Dist.provisionprofile',
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
