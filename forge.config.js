module.exports = {
  packagerConfig: {
    icon: "lib/icons/icon"
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "heaventyflashorama",
        authors: "LightShoro",
        loadingGif: "./lib/default-splash.gif",
        iconUrl: "https://flashorama.heaventy-projects.fr/assets/app.ico",
        setupIcon: "./lib/icons/icon.ico"
      }
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: [
        "darwin"
      ]
    },
    {
      name: "@electron-forge/maker-dmg",
      config: {
        format: "UDZO",
        background: "./lib/icons/macos_bg.png",
        icon: "./lib/icons/icon.icns",
        overwrite: true,
        iconSize: 128,
        window: {
          size: {
            width: 1000,
            height: 600
          }
        },
        contents: [
          {
            x: 254,
            y: 285,
            type: "file",
            path: `${process.cwd()}/out/Flashorama-darwin-${os.arch()}/Flashorama.app` 
          },
          {
            x: 598,
            y: 285,
            type: "link",
            path: "/Applications"
          }
        ]
      }
    },
    {
      name: "@electron-forge/maker-deb",
      config: {}
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {}
    }
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "DarkShoro",
          name: "HeaventyFlashorama"
        },
        prerelease: true,
        draft: true
      }
    }
  ]
};
