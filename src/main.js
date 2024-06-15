const {
    app,
    BrowserWindow,
    autoUpdater,
    dialog,
    session
} = require("electron");
const discord_integration = require('./integrations/discord');
const path = require("path");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) app.quit();

// Check for updates except for macOS
if (process.platform != "darwin") require("update-electron-app")({
    repo: "DarkShoro/HeaventyFlashorama"
});

const ALLOWED_ORIGINS = [
    "https://newclubpenguin.heaventy-projects.fr",
    "https://heaventy-projects.fr",
    "https://cpas3media.heaventy-projects.fr",
    "https://cpas2media.heaventy-projects.fr",
    "https://clubpenguin.heaventy-projects.fr",
    "https://heabbo.heaventy-projects.fr",
    "https://flashorama.heaventy-projects.fr",
    "https://lightshoro.fr",
];

const pluginPaths = {
    win32: path.join(path.dirname(__dirname), "lib/pepflashplayer.dll"),
    darwin: path.join(path.dirname(__dirname), "lib/PepperFlashPlayer.plugin"),
    linux: path.join(path.dirname(__dirname), "lib/libpepflashplayer.so"),
};

if (process.platform === "linux") app.commandLine.appendSwitch("no-sandbox");
const pluginName = pluginPaths[process.platform];
console.log("pluginName", pluginName);

app.commandLine.appendSwitch("ppapi-flash-path", pluginName);
app.commandLine.appendSwitch("ppapi-flash-version", "31.0.0.122");
app.commandLine.appendSwitch("ignore-certificate-errors");

let ses;
let mainWindow;

const createWindow = () => {
    // Create the browser window.
    let splashWindow = new BrowserWindow({
        width: 600,
        height: 320,
        frame: false,
        title: "Flashorama - Heaventy's Projects",
        transparent: true,
        show: false,
        icon: path.join(__dirname, 'assets/icon.png')
    });

    splashWindow.setResizable(false);
    splashWindow.loadURL(
        "file://" + path.join(path.dirname(__dirname), "src/index.html"),
    );
    splashWindow.on("closed", () => (splashWindow = null));
    splashWindow.webContents.on("did-finish-load", () => {
        splashWindow.show();
    });

    ses = session.fromPartition("persist:main"); // Ensure the session is initialized here

    mainWindow = new BrowserWindow({
        autoHideMenuBar: true,
        useContentSize: true,
        show: false,
        webPreferences: {
            plugins: true,
            session: ses, // Reference the session here
        },
        icon: path.join(__dirname, 'assets/icon.png'),
        title: "Flashorama - Heaventy Projects",
    });

    var nextUrl = null;

    if (process.argv[1] && process.argv[1].startsWith('heav://')) {
        nextUrl = process.argv[1];
    }

    mainWindow.webContents.on("did-finish-load", () => {
        if (splashWindow) {
            splashWindow.close();
            mainWindow.show();
        }
        discord_integration.initDiscordRichPresence();
    });

    mainWindow.webContents.on('page-title-updated', (event) => {
        event.preventDefault();

        // set the title of the window
        mainWindow.setTitle("Flashorama - Heaventy's Projects");

        // DO NOT TOUCH MY TITLE >:(
    });

    mainWindow.webContents.on("will-navigate", (event, urlString) => {
        if (!ALLOWED_ORIGINS.includes(new URL(urlString).origin)) {
            event.preventDefault();
            if (urlString.includes("oldbbo.heaventy-projects.fr")) {
                // make an error box to tell the user that the oldbbo is not supported
                dialog.showErrorBox("Non supporté", "Oldbbo n'est pas supporté par l'application, veuillez utiliser un navigateur supportant Shockwave Flash.");
                return;
            }
            dialog.showErrorBox("Non autorisé", "Vous ne pouvez pas naviguer vers cette page car elle réside en dehors du domaine autorisé.\n\n Lien bloqué: " + urlString);
        }

        // if the site is flashorama, add the ?old=true parameter to the url

        if (new URL(urlString).hostname === "flashorama.heaventy-projects.fr") {
            if (urlString.includes("old=true")) return;
            event.preventDefault();
            mainWindow.loadURL("https://flashorama.heaventy-projects.fr?old=true");
        }

        let domain = new URL(urlString).hostname;

        switch (domain) {
            case "newclubpenguin.heaventy-projects.fr":
                discord_integration.updatePresence("Sur le serveur Club Penguin", "Club Penguin (AS3) - Heaventy Projects", "cpnewiconnotm");
                break;
            case "clubpenguin.heaventy-projects.fr":
                discord_integration.updatePresence("Sur le serveur Club Penguin", "Club Penguin (AS2) - Heaventy Projects", "cpoldicon");
                break;
            case "heaventy-projects.fr":
                discord_integration.updatePresence("Sur le site Heaventy Projects", "Heaventy Projects", "win");
                break;
            case "heabbo.heaventy-projects.fr":
                discord_integration.updatePresence("Sur le site Heabbo", "Heabbo - Heaventy Projects", "heabboicon");
                break;
            case "flashorama.heaventy-projects.fr":
                discord_integration.updatePresence("Sur le lanceur Flashorama", "Flashorama - Heaventy Projects", "flashoramaicon");
                break;
            case "cpas3media.heaventy-projects.fr":
            case "cpas2media.heaventy-projects.fr":
            case "oldbbo.heaventy-projects.fr":
                break;
            default:
                discord_integration.updatePresence("En dehors du site", "Hors du site - Heaventy Projects", "win");
                break;
        }

    });

    app.on('before-quit', (e) => {
        mainWindow.destroy();
    });

    mainWindow.on("closed", () => (mainWindow = null));

    new Promise((resolve) =>
        setTimeout(() => {
            if (nextUrl) {
                mainWindow.loadURL(nextUrl);
                mainWindow.setSize(1124, 800);
                resolve();
            }
            mainWindow.loadURL("https://flashorama.heaventy-projects.fr?old=true");
            // set main window size
            mainWindow.setSize(1124, 800);
            resolve();
        }, 5000)
    );
};

const launchMain = () => {
    // Disallow multiple clients running
    if (!app.requestSingleInstanceLock()) return app.quit();
    app.on("second-instance", (_event, _commandLine, _workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }

        // Check if the second instance was trying to open a "heav" link
        const protocolPrefix = 'heav://';
        const url = _commandLine.find(arg => arg.startsWith(protocolPrefix));

        if (url) {
            // If it was, load that URL in the main window
            //replace the protocol prefix with the correct one

            newUrl = url.replace(protocolPrefix, "https://");
            // this is done to prevent the app from calling itself again

            mainWindow.loadURL(newUrl);
        }
    });
    app.setAsDefaultProtocolClient("heav");

    app.whenReady().then(() => {
        createWindow();

        app.on("activate", () => {
            // On OS X it's common to re-create a window in the app when the
            // dock icon is clicked and there are no other windows open.
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow();
            }
        });
    })

    // Quit when all windows are closed, except on macOS. There, it's common
    // for applications and their menu bar to stay active until the user quits
    // explicitly with Cmd + Q.
    app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
            app.quit();
        }
    });
}

launchMain();