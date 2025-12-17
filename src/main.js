var paramplus = "";

// if the navigator is in french, add "fr" to the url
if (navigator.language === "fr") {
    paramplus = "/fr/";
}

$("#goto-newcp").click(function(e) {
    var el = $(this);
    if ($(this).hasClass("disabled")) {
        return;
    }
    if (urlParams.get('old') === 'true') {
        window.location.href = "http://newclubpenguin.flashorama.intra" + paramplus;
        return;
    }
    // toastR to inform the user the site called Flashorama app

    toastr["info"]("Le site a demandé à ouvrir le jeu dans Flashorama. Si vous avez Flashorama installé, le jeu va s'ouvrir dans l'application.<br><br> Le site ouvrira la page dans 12 secondes si vous n'avez pas Flashorama.", "Ouverture du jeu dans Flashorama");

    window.protocolCheck("flashorama://newclubpenguin.flashorama.intra" + paramplus,
        function() {
            toastr["error"]("Flashorama n'est pas installé sur votre appareil. Vous pouvez le télécharger en cliquant sur le bouton ci-dessous.", "Flashorama n'est pas installé");
            setTimeout(function() {
                window.location = "http://newclubpenguin.flashorama.intra" + paramplus;
            }, 1000);
        },
        function() {
            toastr["success"]("Flashorama à bien ouvert le jeu dans l'application.", "Jeu ouvert dans Flashorama");
        });
    e.preventDefault ? e.preventDefault() : e.returnValue = false;
});

$("#goto-oldcp").click(function(e) {
    var el = $(this);
    if ($(this).hasClass("disabled")) {
        return;
    }
    if (urlParams.get('old') === 'true') {
        window.location.href = "http://clubpenguin.flashorama.intra" + paramplus;
        return;
    }

    toastr["info"]("Le site a demandé à ouvrir le jeu dans Flashorama. Si vous avez Flashorama installé, le jeu va s'ouvrir dans l'application.<br><br> Le site ouvrira la page dans 12 secondes si vous n'avez pas Flashorama.", "Ouverture du jeu dans Flashorama");

    window.protocolCheck("flashorama://clubpenguin.flashorama.intra" + paramplus,
        function() {
            toastr["error"]("Flashorama n'est pas installé sur votre appareil. Vous pouvez le télécharger en cliquant sur le bouton ci-dessous.", "Flashorama n'est pas installé");
            setTimeout(function() {
                window.location = "http://clubpenguin.flashorama.intra" + paramplus;
            }, 1000);
        },
        function() {
            toastr["success"]("Flashorama à bien ouvert le jeu dans l'application.", "Jeu ouvert dans Flashorama");
        });
    e.preventDefault ? e.preventDefault() : e.returnValue = false;
});

$("#goto-heabbo").click(function(e) {
    var el = $(this);
    if ($(this).hasClass("disabled")) {
        return;
    }
    if (urlParams.get('old') === 'true') {
        window.location.href = "http://heabbo.flashorama.intra";
        return;
    }

    toastr["info"]("Le site a demandé à ouvrir le jeu dans Flashorama. Si vous avez Flashorama installé, le jeu va s'ouvrir dans l'application.<br><br> Le site ouvrira la page dans 12 secondes si vous n'avez pas Flashorama.", "Ouverture du jeu dans Flashorama");

    window.protocolCheck("flashorama://heabbo.flashorama.intra",
        function() {
            toastr["error"]("Flashorama n'est pas installé sur votre appareil. Vous pouvez le télécharger en cliquant sur le bouton ci-dessous.", "Flashorama n'est pas installé");
            setTimeout(function() {
                window.location = "http://heabbo.flashorama.intra";
            }, 1000);
        },
        function() {
            toastr["success"]("Flashorama à bien ouvert le jeu dans l'application.", "Jeu ouvert dans Flashorama");
        });
    e.preventDefault ? e.preventDefault() : e.returnValue = false;
});

$("#goto-midbbo").click(function(e) {
    var el = $(this);
    if ($(this).hasClass("disabled")) {
        return;
    }
    if (urlParams.get('old') === 'true') {
        window.location.href = "http://midbbo.flashorama.intra/";
        return;
    }

    toastr["info"]("Le site a demandé à ouvrir le jeu dans Flashorama. Si vous avez Flashorama installé, le jeu va s'ouvrir dans l'application.<br><br> Le site ouvrira la page dans 12 secondes si vous n'avez pas Flashorama.", "Ouverture du jeu dans Flashorama");

    window.protocolCheck("flashorama://midbbo.flashorama.intra",
        function() {
            toastr["error"]("Flashorama n'est pas installé sur votre appareil. Vous pouvez le télécharger en cliquant sur le bouton ci-dessous.", "Flashorama n'est pas installé");
            setTimeout(function() {
                window.location = "http://midbbo.flashorama.intra/";
            }, 1000);
        },
        function() {
            toastr["success"]("Flashorama à bien ouvert le jeu dans l'application.", "Jeu ouvert dans Flashorama");
        });
    e.preventDefault ? e.preventDefault() : e.returnValue = false;
});

document.getElementById('goto-showo').addEventListener('click', () => {
    if (urlParams.get('old') === 'true') {
        // open the webpage as a popup
        window.open(`https://lightshoro.fr`, "_blank", "width=1200,height=700");
        return;
    }
    window.location.href = `https://lightshoro.fr`;
});

document.getElementById('goto-nowox').addEventListener('click', () => {
    if (urlParams.get('old') === 'true') {
        // open the webpage as a popup
        window.open(`https://misternox.net`, "_blank", "width=1200,height=700");
        return;
    }
    window.location.href = `https://misternox.net`;
});

document.getElementById('goto-win').addEventListener('click', () => {
    if (urlParams.get('old') === 'true') {
        // open the webpage as a popup
        window.open(`https://heaventy-projects.fr`, "_blank", "width=1200,height=700");
        return;
    }
    window.location.href = `https://heaventy-projects.fr`;
});

// if a "get" parameter is set and is equal to "old=true", disable the old heabbo button

var onLauncher = false;

String.prototype.escape = function() {
    var tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };
    return this.replace(/[&<>]/g, function(tag) {
        return tagsToReplace[tag] || tag;
    });
};

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('old') === 'true') {
    $("#goto-oldheabbo").addClass("disabled border-gray-500");
    $("#goto-oldheabbo").removeClass("border-white");
    $("#goto-oldheabbo").addClass("old-logo");
    $("#download-launcher-div").addClass("hidden");
    $("#open-in-app").addClass("hidden");
    $("#info").removeClass("hidden");
    $("#goto-credits").removeClass("hidden");
    onLauncher = true;
}
if (urlParams.get('launcher')) {
    var launcherVersion = urlParams.get('launcher').escape();
    $("#footer").append(` | <span class="versionLnc">Flashorama v-${launcherVersion}</span>`);
}

document.getElementById('goto-oldheabbo').addEventListener('click', () => {
    if (urlParams.get('old') === 'true') {
        return;
    }
    window.location.href = `http://oldbbo.flashorama.intra`;
});

// Add a tooltip to the buttons
document.querySelectorAll('[tooltip]').forEach((element) => {
    console.log(element);
    $(element).hover(function() {
        const tooltip = document.createElement('div');
        tooltip.classList.add('absolute', 'bg-black', 'text-white', 'p-2', 'rounded', 'text-sm', 'opacity-90');
        tooltip.textContent = element.getAttribute('tooltip');
        if ($(element).hasClass("disabled")) {
            if (element.getAttribute('data-mode') == "maintenance") {
                tooltip.textContent = "Ce jeu est actuellement en maintenance.";
            } else {
                tooltip.textContent = "Ce jeu est actuellement indisponible sur ce Lanceur.";
            }
        }
        element.appendChild(tooltip);
    }, function() {
        element.querySelector('div').remove();
    });
});

var repo = "DarkShoro" + "/HeaventyFlashorama";

// Get the latest release from the repository


function detectOS() {
    let userAgent = window.navigator.userAgent,
        platform = window.navigator.platform,
        macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
        windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
        iosPlatforms = ['iPhone', 'iPad', 'iPod'],
        os = null;

    if (macosPlatforms.indexOf(platform) !== -1) {
        os = 'Mac OS';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
        os = 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
        os = 'Windows';
    } else if (/Android/.test(userAgent)) {
        os = 'Android';
    } else if (!os && /Linux/.test(platform)) {
        os = 'Linux';
    }

    return os;
}


$.getJSON("https://api.github.com/repos/" + repo + "/releases/latest").done(function(release) {
    // Get the version number
    console.log(release);
    var version = release.tag_name;

    // DEPRECATED

    /*$("#download-launcher").attr("location", release.assets[0].browser_download_url);
    $("#download-launcher").text("Télécharger le lanceur (" + version + ")");
    $("#download-launcher-ctn").removeClass("hidden");*/

    // NEW METHOD

    var os = detectOS();

    var Exe
    var Dmg
    var RPM
    var DEB
    var Flatpak

    release.assets.forEach(asset => {
        if (asset.name.includes(".exe")) {
            Exe = asset.browser_download_url
        } else if (asset.name.includes(".dmg")) {
            Dmg = asset.browser_download_url
        } else if (asset.name.includes(".rpm")) {
            RPM = asset.browser_download_url
        } else if (asset.name.includes(".deb")) {
            DEB = asset.browser_download_url
        } else if (asset.name.includes(".flatpak")) {
            Flatpak = asset.browser_download_url
        }
    })

    switch (os) {
        case "Windows":
            $("#download-launcher").attr("location", Exe);
            $("#download-launcher").text("Télécharger le lanceur pour Windows (" + version + ")");
            $("#download-launcher-ctn").removeClass("hidden");
            break;
        case "Mac OS":
            $("#download-launcher").attr("location", Dmg);
            $("#download-launcher").text("Télécharger le lanceur pour Mac OS (" + version + ")");
            $("#download-launcher-ctn").removeClass("hidden");
            break;
        case "Linux":
            // break the button into multiple buttons, one for each distro

            var Button = document.createElement("button");
            // bg-opacity-90 border-2 rounded p-4 text-white
            Button.classList.add("bg-opacity-90", "border-2", "rounded", "p-4", "text-white", "m-2", "download-launcher");
            Button.textContent = "Télécharger le lanceur pour Linux .RPM (" + version + ")";
            Button.setAttribute("location", RPM);
            Button.addEventListener("click", function() {
                window.location.href = $(this).attr("location");
            });

            var Button2 = document.createElement("button");
            Button2.classList.add("bg-opacity-90", "border-2", "rounded", "p-4", "text-white", "m-2", "download-launcher");
            Button2.textContent = "Télécharger le lanceur pour Linux .DEB (" + version + ")";
            Button2.setAttribute("location", DEB);
            Button2.addEventListener("click", function() {
                window.location.href = $(this).attr("location");
            });

            var Button3 = document.createElement("button");
            Button3.classList.add("bg-opacity-90", "border-2", "rounded", "p-4", "text-white", "m-2", "download-launcher");
            Button3.textContent = "Télécharger le lanceur pour Linux .Flatpak (" + version + ")";
            Button3.setAttribute("location", Flatpak);
            Button3.addEventListener("click", function() {
                window.location.href = $(this).attr("location");
            });

            $("#download-launcher-ctn").append(Button);
            $("#download-launcher-ctn").append(Button2);
            $("#download-launcher-ctn").append(Button3);

            // remove the old button
            $("#download-launcher").remove();

        default:
            $("#download-launcher").attr("location", Exe);
            $("#download-launcher").text("Télécharger le lanceur pour Windows (" + version + ")");
            $("#download-launcher-ctn").removeClass("hidden");
            break;
    }


});

$("#download-launcher").click(function() {
    window.location.href = $(this).attr("location");
});

// detect if flash player is installed

var hasFlash = false;

try {
    var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
    if (fo) {
        hasFlash = true;
    }
} catch (e) {
    if (navigator.mimeTypes["application/x-shockwave-flash"] != undefined) {
        hasFlash = true;
    }
}

if (!onLauncher) {
    if (!hasFlash) {
        $("#flash-warning").removeClass("hidden");
    } else {
        $("#flash-success").removeClass("hidden");
    }
}

$(document).ready(function() {
    let hoverTimeout;
    let currentButton;

    let maintenances = [
        "goto-heabbo"
    ];

    // loop through the maintenances and disable the buttons if they are in maintenance
    maintenances.forEach(function(buttonId) {
        // Check if the button exists
        let button = $("#" + buttonId);
        if (button.length) {
            // Disable the button and add a tooltip
            button.addClass("disabled border-gray-500 old-logo");
            button.attr("data-mode", "maintenance");
        }
    });

    $(".game-button").each(function() {
        // add event hover to the buttons
        $(this).hover(function() {
            // Clear the previous timeout
            clearTimeout(hoverTimeout);

            let button = $(this);

            // Set a new timeout for the hover event
            hoverTimeout = setTimeout(function() {
                if ($(".game-button:hover").length === 0) {
                    return;
                }

                if (!button.attr("backgroundvideo")) {
                    return;
                }

                if (!button.hasClass("disabled")) {
                    $("#background-video").attr("src", "/assets/" + button.attr("backgroundvideo") + ".mp4");

                    // wait for the video to load
                    $("#background-video")[0].onloadeddata = function() {
                        if ($(".game-button:hover").length > 0 && currentButton === button) {
                            $("#background-video").fadeIn();
                            $("#background-video-container").fadeIn();
                        }
                    }
                }

                currentButton = button;

            }, 400);
        }, function() {
            // Clear the hover timeout when mouse leaves
            clearTimeout(hoverTimeout);

            $("#background-video").fadeOut();
            $("#background-video-container").fadeOut();
        });
    });
});


// a loop fading out the video if no game-button is hovered
setInterval(function() {
    if ($(".game-button:hover").length === 0) {
        $("#background-video").fadeOut();
        $("#background-video-container").fadeOut();
    }
}, 100);

$("#goto-credits").click(function() {
    // popup the credits window
    if (urlParams.get('old') === 'true') {
        window.open("/credits.html?old=true", "_blank", "width=1200,height=700");
        return;
    } else {
        window.location.href = "/credits.html";
    }
});
