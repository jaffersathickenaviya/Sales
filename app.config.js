import 'dotenv/config';

export default {
  expo: {
    name: "salesTrack-app",
    slug: "salesTrack-app",
    scheme: "salesTrack-app",
    version: "1.0.0",
    android: {
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },
    ios: {
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
  },
};
