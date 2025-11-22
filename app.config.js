/** Hard-override plugins để chắc chắn không bao giờ load 'expo-sharing' */
module.exports = ({ config }) => ({
  ...config,
  plugins: [
    "expo-location",
    "expo-image-picker"
  ],
});
