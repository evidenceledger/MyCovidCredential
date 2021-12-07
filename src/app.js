// Get the build date of the application
import buildDate from './version.txt?raw'

// Store the version in global Window object and in local storage
import { get, set } from 'idb-keyval';
window.appVersion = buildDate
window.localStorage.setItem("VERSION", appVersion)
console.log("Version:", appVersion)

import { log } from "./log";

// ************************************************
// This is a micro-router with enough functionality
// ************************************************

// This will hold all pages of the app
var pages = new Map();

// Register a new page name, associated to a class instance
export function route(pageName, classInstance) {
    console.log("ROUTER: register page:", pageName)
    pages.set(pageName, classInstance)
}
// Make it available in the global scope
window.route = route

// The default home page where to start and when refreshing the app
var homePage = ""

export function setHomePage(page) {
    homePage = page
}

// Listen for PopStateEvent (Back or Forward buttons are clicked)
window.addEventListener("popstate", async function (event) {
    // Set defaults
    var pageName = homePage;
    var pageData = undefined;

    // Get current state data if not null
    var state = event.state;
    if (state != null) {
        pageName = state.pageName;
        pageData = state.pageData;
    }
    console.log("Popstate: ", pageName);

    // Process the page transition
    await processPageEntered(pageName, pageData, true);
});

// Handle page transition
async function processPageEntered(pageName, pageData, historyData) {
    try {
        // Hide all pages of the application. Later we unhide the one we are entering
        // We also tell all other pages to exit, so they can perform any cleanup
        for (let [name, classInstance] of pages) {
            classInstance.domElem.style.display = "none"
            // Call the page exit(), so it can perform any cleanup 
            if ((name !== pageName) && classInstance.exit) {
                await classInstance.exit()
            }
        }
    } catch (error) {
        console.error("Trying to call exit", error);
        return;
    }

    let targetPage = pages.get(pageName)  

    // If the target page is not a registered page, go to the page404 page
    if (targetPage === undefined) {
        pageName = "page404"
    }

    // Reset scroll position to make sure the page is at the top
    window.scrollTo(0, 0);

    try {
        // Invoke the registered function when page has entered
        // This will allow the page to create dynamic content
        if (targetPage.enter) {
            await targetPage.enter(pageData, historyData);
        } else {
            // Make sure the target page is visible even if no enter() defined
            targetPage.style.display = "block"
        }

    } catch (error) {
        console.error("Calling enter()", error);
        return;
    }

}

export async function goHome() {
    if (homePage != undefined) {
        await gotoPage(homePage);
    }
}
window.goHome = goHome

// gotoPage transitions to the target page passing pageData object
// It is up to the page to define the structure of pageData or if it is required
export async function gotoPage(pageName, pageData) {
    console.log("Inside gotoPage:", pageName)

    // Make sure the target page always receives an object even if empty
    if (!pageData) {
        pageData = {}
    }

    // If pageName is not a registered page, go to the 404 error page
    if (pages.get(pageName) === undefined) {
        console.error("Target page does not exist: ", pageName);
        pageName = "page404"
    }

    // Create a new browser history state
    window.history.pushState(
        { pageName: pageName, pageData: pageData },
        `${pageName}`
    );

    // Process the page transition
    await processPageEntered(pageName, pageData);
}
window.gotoPage = gotoPage


// **************************************
// Support for the Trusted Lists
// **************************************

// Embed the trusted lists
import eu_jwk_keys from "./json/eu_jwk_keys.json"
import prePublicKeys from "./json/pre_jwk_keys.json"
import valueSets from "./json/value-sets.json"

// https://covid-status.service.nhsx.nhs.uk/pubkeys/keys.json
import ukRawKeys from "./json/uk_jwk_keys.json"

// Set the initial value of the EU Trusted List, to be refreshed later
// Use a global scope variable so it can be refreshed later
window.eu_trusted_keys = eu_jwk_keys

// Search for a public key in the several trusted lists
async function getTrustedKey(kid) {

    let undefinedKey = {
        kid: kid,
        publicKey: undefined,
        list: undefined,
        format: undefined
    }

    if (!kid) { log.myerror("kid is undefined"); return undefinedKey; }
    
    // First, try to get it from the PRODUCTION EU list
    let entry = window.eu_trusted_keys[kid]
    if (entry) {
        console.log(`kid "${kid}" found in EU_PRO trusted list`)
        return {
            kid: kid,
            publicKey: entry.jwk,
            list: "EU_PRO",
            format: "jwk"
        }
    }
    log.mywarn(`kid "${kid}" not found in EU_PRO trusted list`)

    // Now check in the PRODUCTION listfrom the UK
    for (let i = 0; i < ukRawKeys.length; i++) {
        if (ukRawKeys[i].kid == kid) {
            console.log(`kid "${kid}" found in UK_PRO trusted list`)
            return {
                kid: kid,
                publicKey: ukRawKeys[i].publicKey,
                list: "UK_PRO",
                format: "spki"
            }
        }
    }
    log.mywarn(`kid "${kid}" not found in UK_PRO trusted list`)

    // And finally in the PREPRODUCTION EU list
    if (prePublicKeys.includes(kid)) {
        log.mywarn(`kid "${kid}" found in EU PREPRODUCTION trusted list`)
        return {
            kid: kid,
            publicKey: undefined,
            list: "EU_PREPRODUCTION",
            format: undefined
        }
    }
    log.myerror(`KEY ${kid} not found in any Trusted List`)
    return undefinedKey;

}
window.getTrustedKey = getTrustedKey

export var vs = {
    get: function (key, valueSetName) {
        if (!key) { return "N/A" }

        let valueSet = valueSets[valueSetName];
        if (!valueSet) { return key; }

        let values = valueSet["valueSetValues"];
        if (!values) { return key; }

        let value = values[key];
        if (!value) { return key; }

        return value["display"];
    },
};

window.vs = vs


// **************************************
// Initialise the camera
// **************************************

function getPlatformOS() {
    const userAgent = window.navigator.userAgent;
    let os = null;
  
    const isIOS = (/iPad|iPhone|iPod/.test(userAgent) ||
    (/Mac|Mac OS|MacIntel/gi.test(userAgent) && (navigator.maxTouchPoints > 1 || "ontouchend" in document))) && !window.MSStream;
  
    if (/Macintosh|Mac|Mac OS|MacIntel|MacPPC|Mac68K/gi.test(userAgent)) {
      os = 'Mac OS';
    } else if (isIOS) {
      os = 'iOS';
    } else if (/'Win32|Win64|Windows|Windows NT|WinCE/gi.test(userAgent)) {
      os = 'Windows';
    } else if (/Android/gi.test(userAgent)) {
      os = 'Android';
    } else if (/Linux/gi.test(userAgent)) {
      os = 'Linux';
    }
  
    return os;
  }
  console.log(getPlatformOS())

window.defaultPreferredCamera = undefined
window.selectedCamera = undefined
window.videoDevices = []

async function getVideoDevices() {

    // Get the video devices
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.log("enumerateDevices() not supported.");
        return;
    }

    let allDevices = await navigator.mediaDevices.enumerateDevices()
    window.videoDevices = allDevices.filter((device) => {
        return device.kind === "videoinput";
    });

    let stream = undefined;
    // Check if they have labels. If they don't, it means we have to request permission from the user
    if (window.videoDevices.length > 0) {
        let allLabelsEmpty = window.videoDevices.every((device) => {return device.label === ""})
        if (allLabelsEmpty) {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false,
                });
                // Try again to get the devices with label and id information
                allDevices = await navigator.mediaDevices.enumerateDevices()
                window.videoDevices = allDevices.filter((device) => {
                    return device.kind === "videoinput";
                });
            }
            catch {
                // Ignored
            }
            finally {
                if (stream !== undefined) {
                    stream.getVideoTracks().forEach((track) => {
                        track.stop();
                    });
                }
            }

        }
    }

}
window.getVideoDevices = getVideoDevices

async function getPreferredVideoDevice() {

    // Get all video devices, front and back
    await getVideoDevices()

    // Select specific device only for Android devices
    if ("Android" !== getPlatformOS()) {
        return undefined;
    }

    if (window.videoDevices.length > 0) {
        // The main recommended back camera is the last one in the list
        // Get the last back camera
        window.defaultPreferredCamera = window.videoDevices[window.videoDevices.length - 1]
    } else {
        return undefined
    }
    return window.defaultPreferredCamera

}
window.getPreferredVideoDevice = getPreferredVideoDevice

// Request camera access permission when DOM is loaded
document.addEventListener('DOMContentLoaded', async (event) => {
    console.log('DOM fully loaded and parsed');

    // Get the best camera for QR scanning
    getPreferredVideoDevice()

});


var INSTALL_SERVICE_WORKER = true

// This function is called on first load and when a refresh is triggered in any page
// When called the DOM is fully loaded and safe to manipulate
window.addEventListener('load', async (event) => {

    // Install Service Worker only when in Production
    if (import.meta.env.DEV) {
        console.log("In development")
        INSTALL_SERVICE_WORKER = false
    } else {
        console.log("In production")
    }


    // Lazy-load the pages of the application
    var pagesModule = await import("./all_pages.js")
    var pageDefs = pagesModule.pageDefs
    setHomePage(pagesModule.homePage)
   
    // All pages go inside the <main> element
    var mainElem = document.querySelector('main')
    mainElem.innerHTML = ""

    // Add the pages as childs of main
    for (let i = 0; i < pageDefs.length; i++) {

        // Create the instance of the associated class, passing the element to its constructor
        let name = pageDefs[i].name
        let className = pageDefs[i].className
        let classInstance = new className(name)

        // Append to body
        mainElem.append(classInstance.domElem)

        // Add the page to the routing table
        route(name, classInstance)
    }

    console.log("Home_page:", homePage)

    // Install service worker for off-line support
    if (INSTALL_SERVICE_WORKER && ("serviceWorker" in navigator)) {
        const {Workbox} = await import('workbox-window');
        
        const wb = new Workbox("./sw.js");

        wb.addEventListener("message", (event) => {
            if (event.data.type === "CACHE_UPDATED") {
                const { updatedURL } = event.data.payload;

                console.log(`A newer version of ${updatedURL} is available!`);
            }
        });

        wb.addEventListener("activated", async (event) => {
            // `event.isUpdate` will be true if another version of the service
            // worker was controlling the page when this version was registered.
            if (event.isUpdate) {
                console.log("Service worker has been updated.");
                await performAppUpgrade()
            } else {
                console.log("Service worker has been installed for the first time.");
                await performAppUpgrade()
            }
        });

        wb.addEventListener("waiting", (event) => {
            console.log(
                `A new service worker has installed, but it can't activate` +
                `until all tabs running the current version have fully unloaded.`
            );
        });

        // Register the service worker after event listeners have been added.
        wb.register();

        //    const swVersion = await wb.messageSW({ type: "GET_VERSION" });
        //    console.log("Service Worker version:", swVersion);

    }

    // Go to the home page of the application
    await goHome();

});


// This is called when a new version of the Service Worker has been activated.
// This means that a new version of the application has been installed
async function performAppUpgrade() {
    console.log("Performing Upgrade");

    // Notify the user and ask to refresh the application
    gotoPage("swnotify")

}
