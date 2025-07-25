module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Temporarily disabled dotenv plugin
      // [
      //   'module:react-native-dotenv',
      //   {
      //     moduleName: '@env',
      //     path: '.env',
      //     blacklist: null,
      //     whitelist: null,
      //     safe: false,
      //     allowUndefined: true,
      //   },
      // ],
    ],
  };
};
// somehow this SIMPLE plugin would cause an error where expo couldnt find any of the 
//other files