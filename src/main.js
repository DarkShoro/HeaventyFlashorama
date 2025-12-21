const {
    app,
    BrowserWindow,
    autoUpdater,
    dialog,
    session
} = require("electron");
const discord_integration = require('./integrations/discord');
const path = require("path");
const fetch = require('node-fetch');
const yargs = require('yargs');
const ejs = require('ejs');
const fs = require('fs');

const AbortController = require('abort-controller');

const options = yargs
    .usage("Usage: -game <name>")
    .option("game", {
        alias: "game",
        describe: "Game string (cpas3, cpas2, heabbo, midbbo, oldbbo, cpas3-intra, cpas2-intra, heabbo-intra, midbbo-intra, oldbbo-intra)",
        type: "string",
        demandOption: false
    })
    .argv;

const os = require("os");
const localIPs = Object.values(os.networkInterfaces())
    .flat()
    .filter(i => i.family === "IPv4" && !i.internal)
    .map(i => i.address);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) app.quit();

// Check for updates except for macOS
try {
    if (process.platform != "darwin") {
        require("update-electron-app")({
            repo: "DarkShoro/HeaventyFlashorama"
        });
    }
} catch (error) {
    console.error("Failed to update the Electron app:", error);
}

const DOMAINS = [
    "heaventy-projects.fr",
    "lightshoro.fr",
    "misternox.net",
    "flashorama.heaventy-projects.fr",
    "clubpenguin.heaventy-projects.fr",
    "cpas2media.heaventy-projects.fr",
    "newclubpenguin.heaventy-projects.fr",
    "cpas3media.heaventy-projects.fr",
    "oldbbo.heaventy-projects.fr",
    "midbbo.heaventy-projects.fr",
    "heabbo.heaventy-projects.fr",
    "heaventy-projects.intra",
    "flashorama.intra",
    "clubpenguin.flashorama.intra",
    "cpmedia00.flashorama.intra",
    "newclubpenguin.flashorama.intra",
    "cpmedia01.flashorama.intra",
    "oldbbo.flashorama.intra",
    "midbbo.flashorama.intra",
    "heabbo.flashorama.intra",
];

// Silently rewrite HTTP to HTTPS
const normalizeUrl = (urlString) => {
    if (urlString.startsWith('http://')) {
        return urlString.replace('http://', 'https://');
    }
    return urlString;
};

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

var launcherVersion = app.getVersion();

let ses;
let mainWindow;
var nextUrlMain = null;

const checkWebsiteConnection = (url, timeout = 5000) => {
    return new Promise((resolve, reject) => {
        const controller = new AbortController();
        const signal = controller.signal;

        const timeoutId = setTimeout(() => {
            controller.abort();
            reject(new Error('Connection timed out'));
        }, timeout);

        fetch(url, {
                signal
            })
            .then(response => {
                clearTimeout(timeoutId);
                if (response.ok) {
                    resolve();
                } else {
                    reject(new Error('Failed to connect'));
                }
            })
            .catch(err => {
                clearTimeout(timeoutId);
                reject(new Error('Failed to connect'));
            });
    });
};

const createSplashWindow = (isIntranet = false) => {
    const templatePath = path.join(__dirname, 'index.ejs');
    const htmlPath = path.join(__dirname, 'index.html');
    
    // Render splash with correct logo
    const logoFile = isIntranet ? 'flashorama_intra_logo.png' : 'flashorama_full_logo.png';
    const template = fs.readFileSync(templatePath, 'utf-8');
    const html = ejs.render(template, { logoFile });
    fs.writeFileSync(htmlPath, html);

    // Create the splash window
    const splashWindow = new BrowserWindow({
        width: 600,
        height: 320,
        frame: false,
        title: "Flashorama - Heaventy's Projects",
        transparent: true,
        show: false,
        icon: path.join(__dirname, 'assets/icon.png')
    });

    splashWindow.setResizable(false);
    splashWindow.loadURL("file://" + htmlPath);
    splashWindow.webContents.on("did-finish-load", () => {
        splashWindow.show();
        splashWindow.focus();
    });

    return splashWindow;
};

const createWindow = (isIntranet = false) => {
    let splashWindow = createSplashWindow(false); // Start with generic logo

    ses = session.fromPartition("persist:main"); // Ensure the session is initialized here

    // Intercept all HTTP requests and rewrite to HTTPS (except for intranet domains)
    ses.webRequest.onBeforeRequest({ urls: ['http://*/*'] }, (details, callback) => {
        // Check if the URL is an intranet domain
        const isIntranetUrl = details.url.includes('.intra');
        
        if (!isIntranetUrl) {
            // Rewrite HTTP to HTTPS for non-intranet URLs
            const httpsUrl = details.url.replace('http://', 'https://');
            callback({ redirectURL: httpsUrl });
        } else {
            // Allow HTTP requests for intranet domains
            callback({});
        }
    });

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

    // force icon on macos 

    if (process.platform === "darwin") {
        app.dock.setIcon(path.join(__dirname, 'assets/icon.png'));
        app.setName("Flashorama");
    }

    var nextUrl = null;

    if (nextUrlMain) {
        nextUrl = nextUrlMain;
    }

    if (process.argv[1] && process.argv[1].startsWith('flashorama://')) {
        nextUrl = process.argv[1];
        nextUrl = nextUrl.replace("flashorama://", "https://");
    }

    if (process.argv[1] && process.argv[1].startsWith('flashorama-intra://')) {
        nextUrl = process.argv[1];
        nextUrl = nextUrl.replace("flashorama-intra://", "http://");
    }

    // Check if we're loading an intranet URL and update splash accordingly
    const isIntranetUrl = (url) => url && (url.includes('flashorama.intra') || url.includes('.intra'));

    let pageLoadTimeout = null;
    let hasShownMainWindow = false;
    let splashStartTime = Date.now();
    const minSplashDisplayTime = 1500; // Minimum 1.5 seconds

    mainWindow.webContents.on("did-finish-load", () => {
        if (pageLoadTimeout) clearTimeout(pageLoadTimeout);
        if (!hasShownMainWindow) {
            hasShownMainWindow = true;
            
            // Calculate remaining time to show splash
            const elapsedTime = Date.now() - splashStartTime;
            const remainingTime = Math.max(0, minSplashDisplayTime - elapsedTime);
            
            setTimeout(() => {
                if (splashWindow && !splashWindow.isDestroyed()) {
                    splashWindow.close();
                }
                mainWindow.show();
                console.log("Main window loaded successfully");
            }, remainingTime);
        }
        discord_integration.initDiscordRichPresence();
    });

    mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
        console.error("Failed to load:", errorCode, errorDescription);
        if (pageLoadTimeout) clearTimeout(pageLoadTimeout);
        if (!hasShownMainWindow) {
            hasShownMainWindow = true;
            if (splashWindow && !splashWindow.isDestroyed()) {
                splashWindow.close();
            }
            dialog.showErrorBox("Erreur de chargement", "Impossible de charger la page: " + errorDescription);
            app.quit();
        }
    });

    mainWindow.webContents.on('page-title-updated', (event) => {
        event.preventDefault();

        // set the title of the window
        mainWindow.setTitle("Flashorama - Heaventy's Projects");

        // DO NOT TOUCH MY TITLE >:(
    });

    mainWindow.webContents.on("will-navigate", (event, urlString) => {
        const normalizedUrl = normalizeUrl(urlString);
        const hostname = new URL(normalizedUrl).hostname;
        
        if (!DOMAINS.includes(hostname)) {
            event.preventDefault();

            if (
                urlString.includes("oldbbo.heaventy-projects.fr") ||
                urlString.includes("oldbbo.heaventy-projects.intra")
            ) {
                dialog.showErrorBox(
                    "Non supporté",
                    "Oldbbo n'est pas supporté par l'application, veuillez utiliser un navigateur supportant Shockwave Flash."
                );
                return;
            }

            dialog.showErrorBox(
                "Non autorisé",
                "Vous ne pouvez pas naviguer vers cette page car elle réside en dehors du domaine autorisé.\n\nLien bloqué: " + urlString
            );
        }

        // if the site is flashorama, add the ?old=true parameter to the url

        if (new URL(normalizedUrl).hostname === "flashorama.heaventy-projects.fr") {
            if (urlString.includes("old=true")) return;
            event.preventDefault();
            mainWindow.loadURL("https://flashorama.heaventy-projects.fr?old=true&launcher=" + launcherVersion);
        }

        if (new URL(normalizedUrl).hostname === "flashorama.intra") {
            if (urlString.includes("old=true")) return;
            event.preventDefault();
            mainWindow.loadURL("http://flashorama.intra?old=true&launcher=" + launcherVersion);
        }

        let domain = new URL(normalizedUrl).hostname;

        switch (domain) {
            case "heaventy-projects.fr":
                discord_integration.updatePresence("Sur le site Heaventy Projects", "Heaventy Projects", "win");
                break;
            case "heaventy-projects.intra":
                discord_integration.updatePresence("Sur le site Heaventy Projects", "Heaventy Projects", "win");
                break;
            case "lightshoro.fr":
                discord_integration.updatePresence("Sur le site LightShoro", "Heaventy Projects", "win");
                break;
            case "misternox.net":
                discord_integration.updatePresence("Sur le site MisterNox", "Heaventy Projects", "win");
                break;
            case "newclubpenguin.heaventy-projects.fr":
            case "newclubpenguin.flashorama.intra":
                discord_integration.updatePresence("Sur le serveur Club Penguin", "Club Penguin (AS3) - Heaventy Projects", "cpnewiconnotm");
                break;
            case "clubpenguin.heaventy-projects.fr":
            case "clubpenguin.flashorama.intra":
                discord_integration.updatePresence("Sur le serveur Club Penguin", "Club Penguin (AS2) - Heaventy Projects", "cpoldicon");
                break;
            case "heabbo.heaventy-projects.fr":
            case "heabbo.flashorama.intra":
                discord_integration.updatePresence("Sur le site Heabbo", "Heabbo - Heaventy Projects", "heabboicon");
                break;
            case "midbbo.heaventy-projects.fr":
            case "midbbo.flashorama.intra":
                discord_integration.updatePresence("Sur le site Midbbo", "Flashorama - Heaventy Projects", "midbboicon");
                break;
            case "oldbbo.heaventy-projects.fr":
            case "oldbbo.flashorama.intra":
                discord_integration.updatePresence("Sur le site Oldbbo", "Flashorama - Heaventy Projects", "oldbboicon");
                break;
            case "flashorama.heaventy-projects.fr":
            case "flashorama.intra":
                discord_integration.updatePresence("Sur le lanceur Flashorama", "Flashorama - Heaventy Projects", "flashoramaicon");
                break;
            case "cpas3media.heaventy-projects.fr":
            case "cpmedia01.flashorama.intra":
            case "cpas2media.heaventy-projects.fr":
            case "cpmedia00.flashorama.intra":
            default:
                discord_integration.updatePresence("En dehors du site", "Hors du site - Heaventy Projects", "win");
                break;
        }

    });

    app.on('before-quit', (e) => {
        // if not on macos, destroy main window
        if (process.platform !== "darwin") {
            mainWindow.destroy();
        }
    });

    mainWindow.on("closed", () => (mainWindow = null));

    if (nextUrl === null) {
        // Check both internet and intranet availability in parallel
        const internetUrl = "https://flashorama.heaventy-projects.fr";
        const intranetUrl = "http://flashorama.intra";
        
        Promise.all([
            checkWebsiteConnection(internetUrl, 5000).then(() => true).catch(() => false),
            checkWebsiteConnection(intranetUrl, 8000).then(() => true).catch(() => false)
        ]).then(([internetAvailable, intranetAvailable]) => {
            // If neither is available, show error and quit
            if (!internetAvailable && !intranetAvailable) {
                if (splashWindow && !splashWindow.isDestroyed()) {
                    splashWindow.close();
                }
                dialog.showErrorBox("Erreur de connexion", "Impossible de se connecter aux serveurs Internet et Intranet. Veuillez vérifier votre connexion.");
                app.quit();
                return;
            }

            let chosenIsIntranet = false;

            // If both are available, ask user
            if (internetAvailable && intranetAvailable) {
                // Close splash before showing dialog
                if (splashWindow && !splashWindow.isDestroyed()) {
                    splashWindow.close();
                }

                const choice = dialog.showMessageBoxSync(mainWindow, {
                    type: 'question',
                    buttons: ['Internet', 'Intranet'],
                    defaultId: 1,
                    title: 'Sélection de la version',
                    message: 'L\'intranet est disponible',
                    detail: 'Quelle version souhaitez-vous utiliser ?'
                });

                chosenIsIntranet = (choice === 1);

                // Recreate splash with chosen logo
                splashWindow = createSplashWindow(chosenIsIntranet);
                splashStartTime = Date.now();
            } else if (intranetAvailable) {
                // Only intranet available, use it as fallback
                chosenIsIntranet = true;
                // Close and recreate splash with intranet logo
                if (splashWindow && !splashWindow.isDestroyed()) {
                    splashWindow.close();
                }
                splashWindow = createSplashWindow(true);
                splashStartTime = Date.now();
            } else {
                // Only internet available, use it
                chosenIsIntranet = false;
            }

            // Set the URL based on choice
            if (chosenIsIntranet) {
                nextUrl = "http://flashorama.intra?old=true&launcher=" + launcherVersion;
            } else {
                nextUrl = "https://flashorama.heaventy-projects.fr?old=true&launcher=" + launcherVersion;
            }

            loadMainWindow(nextUrl);
        });
        return; // Exit early to wait for connection checks
    }

    // If nextUrl is already set (from command line args or game option), load directly
    loadMainWindow(nextUrl);

    function loadMainWindow(url) {
        // Start loading immediately and show window after a timeout regardless
        mainWindow.loadURL(url);
        mainWindow.setSize(1600, 900);
        // Center the window on screen
        mainWindow.center();
        
        // Force show window after timeout (longer for intranet)
        const pageLoadTimeoutDuration = url.includes('flashorama.intra') ? 10000 : 8000;
        
        pageLoadTimeout = setTimeout(() => {
            if (!hasShownMainWindow) {
                hasShownMainWindow = true;
                if (splashWindow && !splashWindow.isDestroyed()) {
                    splashWindow.close();
                }
                mainWindow.show();
            }
        }, Math.max(pageLoadTimeoutDuration, minSplashDisplayTime));
    }
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
        const protocolPrefix = 'flashorama://';
        const url = _commandLine.find(arg => arg.startsWith(protocolPrefix));

        if (url) {
            // If it was, load that URL in the main window
            //replace the protocol prefix with the correct one

            newUrl = url.replace(protocolPrefix, "https://");
            // this is done to prevent the app from calling itself again
            mainWindow.loadURL(newUrl);
        }
    });
    app.setAsDefaultProtocolClient("flashorama");

    // verify launch argument "game" to launch the game directly

    var game = options.game;

    switch (game) {
        case "cpas3":
            nextUrlMain = "https://newclubpenguin.heaventy-projects.fr";
            break;
        case "cpas2":
            nextUrlMain = "https://clubpenguin.heaventy-projects.fr";
            break;
        case "heabbo":
            nextUrlMain = "https://heabbo.heaventy-projects.fr";
            break;
        case "midbbo":
            nextUrlMain = "https://midbbo.heaventy-projects.fr";
            break;
        case "oldbbo":
            nextUrlMain = "https://oldbbo.heaventy-projects.fr";
            break;
        case "cpas3-intra":
            nextUrlMain = "http://newclubpenguin.flashorama.intra";
            break;
        case "cpas2-intra":
            nextUrlMain = "http://clubpenguin.flashorama.intra";
            break;
        case "heabbo-intra":
            nextUrlMain = "http://heabbo.flashorama.intra";
            break;
        case "midbbo-intra":
            nextUrlMain = "http://midbbo.flashorama.intra";
            break;
        case "oldbbo-intra":
            nextUrlMain = "http://oldbbo.flashorama.intra";
            break;
    }

    app.whenReady().then(() => {
        // Determine if we should use intranet mode based on command-line args
        const isIntranetMode = nextUrlMain && nextUrlMain.includes('.intra');
        createWindow(isIntranetMode);

        app.on("activate", () => {
            // On OS X it's common to re-create a window in the app when the
            // dock icon is clicked and there are no other windows open.
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow(isIntranetMode);
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
};

launchMain();
