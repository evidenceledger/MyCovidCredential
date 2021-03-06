import { html } from 'uhtml';
import { log } from '../log'
import { CWT } from "../components/cwt"
import { AbstractPage } from './abstractpage'
import { verifyHcert } from '../components/verifications'
import { get, set } from 'idb-keyval';
import ok_image from "../img/ok.png"
import error_image from "../img/error.png"
import warning_image from "../img/warning.png"

var gotoPage = window.gotoPage
window.inStandalone = false

export class MicroWallet extends AbstractPage {

    constructor(id) {
        super(id)
    }

    async enter() {

        let installed = window.matchMedia(
            '(display-mode: standalone)'
        ).matches
        if (installed) {
            window.inStandalone = true
        }

        // We can receive QRs via the URL or scanning with the camera

        // Check if we received a certificate via the URL
        // The URL should be: https://host:port/?eudcc=QRCodeInBase64Encoding
        // The QRCodeInBase64Encoding is the long string representing each QR code
        let params = new URLSearchParams(document.location.search.substring(1));
        let eudcc = params.get("eudcc");

        // QR code found in URL. Process and display it
        if (eudcc !== null) {
            // Decode from Base64url
            eudcc = atob(eudcc)
            console.log("EUDCC received:", eudcc)

            // Ask the user to accept the certificate
            await gotoPage("AskUserToStoreQR", eudcc)
            return;
        
        }

        // Check if we have it in the cache (for iOS)
        let mycache = await caches.open("mycache")
        let keys = await mycache.keys()
        if (keys.length > 0) {
            console.log("EUDCC found in StorageCache")
            let loc = new URL(keys[0].url)
            console.log(loc)
            let params = new URLSearchParams(loc.search.substring(1));
            let eudcc = params.get("eudcc");

            // QR code found in URL. Process and display it
            if (eudcc !== null) {
                // Decode from Base64url
                eudcc = atob(eudcc)
                console.log("Stored in permanent storage")
                await set("MYEUDCC", eudcc)

                // Ask the user to accept the certificate
                await gotoPage("displaymyhcert", eudcc)
                return;
            
            }

        }

        // Check if we have a certificate in local storage
        //let qrContent = window.localStorage.getItem("MYEUDCC")
        let qrContent = await get("MYEUDCC")
        if (qrContent) {
            // Display the certificate
            console.log("Certificate found in storage")
            await gotoPage("displaymyhcert", qrContent)
            return;        
        }

        // We do not have a QR in the local storage
        this.render(html`

            <div class="container center">
                <div id="hcertFailed" class="w3-panel  padding-16">
                    <h2>${T("There is no certificate")}</h2>

                    But you can import your certificates using one of the methods described below.
                </div>

                <div class="flex-container mb-16">
                    <div class="w3-card w-50 pd-10">
                        <button onclick='${() => gotoPage("verifier", "AskUserToStoreQR")}' class="btn color-secondary hover-color-secondary large round-xlarge mb-16">${T("Scan QR")}</button>
                        <p>You can use the camera of the mobile to scan a QR code. Press the button below to start the process.</p>
                    </div>
                    <div class="w3-card w-50 pd-10">
                        <button @click=${async (e)=>await this.readClip(e)} class="btn color-secondary hover-color-secondary large round-xlarge mb-16">${T("Clipboard")}</button>
                        <p>If you have previously copied the QR code to the clipboard, you can press the button below to import the QR into this app.</p>
                    </div>

                </div>

            </div>

       `)
        return
    }


    async readClip(e) {
        e.preventDefault()

        // Check if we have a QR in the clipboard
        try {
            var qrContent = await navigator.clipboard.readText()
            console.log("In clipboard:", qrContent)
        } catch (error) {
            console.error("Error reading from clipboard:", error)
            return;
//            alert(error)            
        }
        if (qrContent &&
            (typeof qrContent === 'string' || qrContent instanceof String) &&
            qrContent.length > 100 && qrContent.startsWith("HC1:")
            ) {
            
            console.log("EUDCC received:", qrContent)
    
            // Ask the user to accept the certificate
            gotoPage("AskUserToStoreQR", qrContent)
            return;        
        }

    }

}

export class AskUserToStoreQR extends AbstractPage {

    constructor(id) {
        super(id)
    }

    async enter(qrcode) {

        let verification = await this.verifyQRCertificate(qrcode)

        if (verification.result == "ERROR") {
            this.render(html`
            <div class="container center">
                <div id="hcertFailed" class="w3-panel bkg-error padding-16">
                    <h3>Failed!</h3>
                    <p>${verification.message}.</p>
                </div>

                <div class="w3-padding-16">
        
                    <button @click=${()=>window.location.replace(location.origin)} class="btn color-secondary hover-color-secondary w3-xlarge w3-round-xlarge">${T("Cancel")}</button>
        
                </div>
            </div>
                `
            )
            return;
        }

        this.QRCertificate = qrcode

        let theHtml = html`
        <div class="container">
            <div class="w3-card-4 w3-center" style="margin-top:100px;">
        
                <header class="w3-container color-primary" style="padding:10px">
                    <h1>${T("You received a new EU COVID certificate!")}</h1>
                </header>
        
                <div class="w3-container w3-padding-16">
                    <p>${T("You can save it in this device for easy access later.")}</p>
                    <p>${T("Please click Save to save the certificate.")}</p>
                </div>
        
                <div class="w3-padding-16">
        
                    <button @click=${()=>this.saveQRCertificate(qrcode)} class="btn color-secondary hover-color-secondary w3-xlarge w3-round-xlarge">${T("Save")}</button>
        
                </div>
        
            </div>
        </div>
        `

        this.render(theHtml)
    }

    async verifyQRCertificate(qrContent) {

        let hcert = undefined
    
        // Decode QR credential verifying it at the same time
        // At this moment we perform only technical verifications
        try {
            hcert = await CWT.decodeHC1QR(qrContent, true);
        } catch (error) {
            // An exception means there was a problem with decoding
            log.myerror("Error verifying credential", error)
            return {
                result: "ERROR",
                message: T("Signature validation failed. The certificate is not valid.")
            }
        }
    
        let technical_verification = hcert[3]
        if (technical_verification == false) {
            log.myerror("Error verifying credential")
            return {
                result: "ERROR",
                message: T("Signature validation failed. The certificate is not valid.")
            }
        }
    
        // If technical verification was OK, apply additional verifications
        console.log("Additional verifications")
        let business_verification = verifyHcert(hcert)
        console.log(business_verification)
        if (business_verification != true) {
            return {
                result: "ERROR",
                message: T(business_verification)
            }
        }
    
        // We passed all verifications, but should return a WARNING for certificates
        // with public keys in the PREPRODUCTION list
    
        // Build the verification structure
        let verification = {
            result: "OK",
            hcert: hcert,
            message: T("The certificate is valid.")
        }
    
        if (technical_verification === "PRE") {
            verification.result = "WARNING"
            verification.message = T("$warningmsg")
        }
    
        return verification
    
    }
    


    async saveQRCertificate(qrcode) {

        // Store it in local storage
        //window.localStorage.setItem("MYEUDCC", qrcode)
        await set("MYEUDCC", qrcode)

        let params = new URLSearchParams(document.location.search.substring(1));
        let eudcc = params.get("eudcc");
        if (eudcc !== null) {
            // Store also in the CacheStorage for iOS
            let mycache = await caches.open("mycache")
            await mycache.add(document.location)
            console.log("Saved in CacheStorage")
        }

        // Reload the application with a clean URL
        window.location.replace(document.location.origin)
    
    }
    
}

