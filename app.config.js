// import 'dotenv/config';

// export default {
//   expo: {
//     name: "salesTrack-app",
//     slug: "salesTrack-app",
//     scheme: "salesTrack-app",
//     version: "1.0.0",
//     extra: {
//       eas: {
//         projectId: "f10faf63-6374-4327-9f37-5acc1d11dfa7"
//       }
//     },
//     platforms: ["ios", "android"],
//     android: {
//       package: "com.jafferenav.salestrack",
//     },
//     ios: {
//       config: {
//         googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
//       }
//     }
//   }
// };

export default {
  expo: {
    name: "Sales02",  // Directly copy from app.json
    slug: "Sales02",  // Same value as in app.json
    version: "1.0.0",  // Same version as in app.json
    orientation: "portrait",  // Same orientation as in app.json
    icon: "./assets/images/icon.png",  // Same icon path as in app.json
    scheme: ["sales02", "myapp"],  // Same scheme as in app.json
    userInterfaceStyle: "automatic",  // Same style as in app.json
    newArchEnabled: true,  // Same setting as in app.json
    ios: {
      supportsTablet: true,  // Same as in app.json
    },
    android: {
      package: "com.jafferenav.salestrack",  // Change this to your correct package name if needed
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",  // Same adaptive icon as in app.json
        backgroundColor: "#ffffff",  // Same background color as in app.json
      },
      edgeToEdgeEnabled: true,  // Same as in app.json
    },
    web: {
      bundler: "metro",  // Same as in app.json
      output: "static",  // Same output type as in app.json
      favicon: "./assets/images/favicon.png",  // Same favicon as in app.json
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",  // Same splash icon as in app.json
          imageWidth: 200,  // Same imageWidth as in app.json
          resizeMode: "contain",  // Same resizeMode as in app.json
          backgroundColor: "#ffffff",  // Same backgroundColor as in app.json
        },
      ],
    ],
    experiments: {
      typedRoutes: true,  // Same experiments as in app.json
    },
    extra: {
      eas: {
        projectId: "f10faf63-6374-4327-9f37-5acc1d11dfa7",  // Same eas projectId as in app.json
      },
    },
  },
};

