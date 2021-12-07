//import { gotoPage } from "../router";
var gotoPage = window.gotoPage
import { html } from 'uhtml';
import {log} from '../log'
import { BrowserQRCodeReader } from '@zxing/browser';
import { AbstractPage } from './abstractpage'
import { get, set } from 'idb-keyval';

// This is to facilitate debugging of certificates
var testQRdata = "HC1:set the data for the test QR here"

var testQR = {
    text: testQRdata
}

// Set the QR raw data above and enable debugging setting this flag to true
var debugging = false

export class ScanQrPage extends AbstractPage {

    constructor(id) {
        console.log("SCANQR: Inside constructor")
        super(id);

        // Initialize the QR library
        this.codeReader = new BrowserQRCodeReader()
        this.controls = undefined

        // Create the 'video' element and attach the event handler
        this.videoElem = document.createElement("video")
        this.videoElem.style.display = "none"
        this.videoElem.oncanplay = this.canPlay

    }

    async enter(displayPage) {
        console.log("SCANQR Enter: ", displayPage)

        if (!displayPage) {displayPage = "displayhcert"}

        // If debugging, just try to decode the test QR
        if (debugging) {
            await processQRpiece(testQR)
            return
        }

        // Use this camera if the user selected it sometime in the past
        var selectedCameraId = localStorage.getItem("selectedCamera")
 
        // Otherwise, try to select the most appropriate camera for scanning a QR
        if (selectedCameraId == null) {
            let preferredCamera = await window.getPreferredVideoDevice()
            if (preferredCamera != undefined) {
                selectedCameraId = preferredCamera.deviceId
            }
        }
        if (selectedCameraId == null) {
            selectedCameraId == undefined
        }

        let theHtml = html`${this.videoElem}`;

        // Prepare the screen, waiting for the video
        this.render(theHtml)

        let constraints;
        if (selectedCameraId == undefined) {
            constraints = {
                audio: false,
                video: {
                    width: { ideal: 1080, max: 1920 },
                    facingMode: "environment"
                }
            }
        } else {
            constraints = {
                audio: false,
                video: {
                    width: { ideal: 1080, max: 1920 },
                    deviceId: selectedCameraId
                }
            }
        }

        // Call the QR decoder using the video element just created
        // If cameraQR is undefined, the decoder will choose the appropriate camera
        this.controls = await this.codeReader.decodeFromConstraints(constraints, this.videoElem, (result, err, controls) => {
            if (result) {
                // Successful decode
                console.log("RESULT", result)

                // Only decode Health Certificates
                let qrType = detectQRtype(result)

                if (qrType === QR_HC1) {
                    // Stop scanning
                    controls.stop()
                    // And process the scanned QR code
                    processQRpiece(result, displayPage)
                }

            }
        })

    }

    canPlay(e){
        // The video stream is ready, show the 'video' element
        e.target.style.display = "block"
    }
    
    async exit() {
        // Reset the decoder just in case the camera was still working
        if (this.controls) {
            this.controls.stop()
        }
        this.videoElem.style.display = "none"
    }

}


const QR_UNKNOWN = 0
const QR_URL = 1
const QR_MULTI = 2
const QR_HC1 = 3

async function processQRpiece(readerResult, displayPage) {
    let qrData = readerResult.text

    let qrType = detectQRtype(readerResult)
    if (qrType !== QR_HC1) {
        return false;
    }

    // Display data of a normal QR
    if (qrType === QR_UNKNOWN || qrType === QR_URL) {
        gotoPage("displayNormalQR", qrData)
        return true;
    }

    // Handle HCERT data
    if (qrType === QR_HC1) {
        console.log("Going to ", displayPage)
        gotoPage(displayPage, qrData)
        return true;
    }

}



function detectQRtype(readerResult) {
    // Try to detect the type of data received
    let qrData = readerResult.text
  
    console.log("detectQRtype:", qrData);
    if (!qrData.startsWith) {
        log.myerror("detectQRtype: data is not string")
    }
  
    if (qrData.startsWith("https")) {
      // We require secure connections
      // Normal QR: we receive a URL where the real data is located
      return QR_URL;
    } else if (qrData.startsWith("multi|w3cvc|")) {
      // A multi-piece JWT
      return QR_MULTI;
    } else if (qrData.startsWith("HC1:")) {
      return QR_HC1;
    } else {
        return QR_UNKNOWN
    }
}

