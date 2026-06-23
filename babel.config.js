module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    // react-native-reanimated 4 → plugin worklets, OBLIGATOIREMENT en dernier.
    plugins: ['react-native-worklets/plugin'],
  }
}
