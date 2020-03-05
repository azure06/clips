const GitRevisionPlugin = require('git-revision-webpack-plugin');
const gitRevisionPlugin = new GitRevisionPlugin();
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');


module.exports = {
  transpileDependencies: ['vuetify'],
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        productName: 'Clips',
      },
      chainWebpackMainProcess: (config) => {
        config.plugin('copy').use(CopyPlugin, [
          [
            {
              // For dev-environment seems working
              from: 'node_modules/push-receiver/src/gcm/checkin.proto',
              to: path.resolve(__dirname, 'dist_electron', 'checkin.proto'),
              toType: 'file',
            },
            {
              from: 'node_modules/push-receiver/src/gcm/android_checkin.proto',
              to: path.resolve(__dirname, 'dist_electron', 'android_checkin.proto'),
              toType: 'file',
            },
            {
              from: 'node_modules/push-receiver/src/mcs.proto',
              to: path.resolve(__dirname, 'dist_electron', 'mcs.proto'),
              toType: 'file',
            }
          ],
        ])
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
