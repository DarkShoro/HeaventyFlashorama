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
    repo: "DarkShoro/NewCP-App-Build"
});

const ALLOWED_ORIGINS = [
    "https://newclubpenguin.heaventy-projects.fr",
    "https://heaventy-projects.fr",
    "https://cpas3media.heaventy-projects.fr",
    "https://cpas2media.heaventy-projects.fr",
    "https://newclubpenguin.heaventy-projects.fr",
    "https://heabbo.heaventy-projects.fr",
    "https://flashorama.heaventy-projects.fr",
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
        icon: path.join(__dirname, 'assets/icon.png')
    });

    mainWindow.webContents.on("did-finish-load", () => {
        if (splashWindow) {
            splashWindow.close();
            mainWindow.show();
        }
        discord_integration.initDiscordRichPresence();
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
    });

    app.on('before-quit', (e) => {
        mainWindow.destroy();
    });

    mainWindow.on("closed", () => (mainWindow = null));

    new Promise((resolve) =>
        setTimeout(() => {
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