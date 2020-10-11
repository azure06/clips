const GitRevisionPlugin = require('git-revision-webpack-plugin');
const gitRevisionPlugin = new GitRevisionPlugin();
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
  transpileDependencies: ['vuetify'],
  configureWebpack: {
    target: 'electron-renderer',
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        productName: 'Clips',
        publish: ['github'],
      },
      chainWebpackMainProcess: (config) => {
        const dest =
          process.env.NODE_ENV === 'development' ? 'dist_electron' : 'public';
        config.plugin('copy').use(CopyPlugin, [
          {
            patterns: [
              {
                from: 'node_modules/push-receiver/src/gcm/checkin.proto',
                to: path.resolve(__dirname, dest, 'checkin.proto'),
                toType: 'file',
              },
              {
                from:
                  'node_modules/push-receiver/src/gcm/android_checkin.proto',
                to: path.resolve(__dirname, dest, 'android_checkin.proto'),
                toType: 'file',
              },
              {
                from: 'node_modules/push-receiver/src/mcs.proto',
                to: path.resolve(__dirname, dest, 'mcs.proto'),
                toType: 'file',
              },
            ],
          },
        ]);
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
