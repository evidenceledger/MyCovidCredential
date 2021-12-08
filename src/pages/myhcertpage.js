import { html } from 'uhtml';
import { log } from '../log'
import { CWT } from "../components/cwt"
import { AbstractPage } from './abstractpage'
import { verifyHcert } from '../components/verifications'
import ok_image from "../img/ok.png"
import error_image from "../img/error.png"
import warning_image from "../img/warning.png"
import { get, set, del } from 'idb-keyval';

var gotoPage = window.gotoPage

export class DisplayMyHcert extends AbstractPage {

    constructor(id) {
        super(id)
    }

    async enter(qrContent) {

        // Check if we have a certificate in local storage
        //qrContent = window.localStorage.getItem("MYEUDCC")
        qrContent = await get("MYEUDCC")
        if (qrContent == null) {
            this.render(html`
            <div id="hcertFailed" class="w3-panel bkg-fail">
                <h2>${T("There is no certificate.")}</h2>
            </div>
            `)
            return
        }

        await navigator.clipboard.writeText(qrContent)

        let hcert = undefined
        let verified = false
        let thehtml = ""

        // Decode credential verifying it at the same time
        try {
            hcert = await CWT.decodeHC1QR(qrContent, true);
            verified = hcert[3]
        } catch (error) {
            log.myerror("Error verifying credential", error)
            this.render(this.renderGeneralError(error))
            return;
        }

        // Build the verification structure
        let verification = {
            result: "OK",
            message: T("The certificate is valid.")
        }

        if (verified === false) {
            verification.result = "ERROR"
            verification.message = T("Signature validation failed. The certificate is not valid.")
        } else if (verified === "PRE") {
            verification.result = "WARNING"
            verification.message = T("$warningmsg")
        }

        // If basic verification was OK, apply additional verifications
        console.log(verification)
        if ((verified === true) || (verified === "PRE")) {
            console.log("Additional verifications")
            verified = verifyHcert(hcert)
            console.log(verified)
            if (verified != true) {
                verification.result = "ERROR",
                verification.message = T(verified)
            }
        }

        console.log(verification)

        try {
            // Render the credential
            thehtml = this.renderDetail(hcert, verification);
        } catch (error) {
            log.myerror("Error rendering credential", error)
            this.render(this.renderGeneralError(error))
            return;
        }

        let fullPage = html`
        ${thehtml}

        <div class="flex-container center">
            <div class="w3-card w-50 pd-10">
                <button @click=${()=> gotoPage("DisplayQR")} class="btn color-secondary hover-color-secondary large round-xlarge mb-16">${T("Show QR")}</button>
                <p>Display the QR code so it can be verified.</p>
            </div>
            <div class="w3-card w-50 pd-10">
                <button @click=${()=>this.deleteQRCertificate()} class="btn color-secondary hover-color-secondary large round-xlarge mb-16">${T("Delete QR")}</button>
                <p>Delete the QR from this device.</p>
            </div>

        </div>

        `
        this.render(fullPage)

    }


    async deleteQRCertificate() {

        await del("MYEUDCC")
    
        // Reload the application with a clean URL
        window.location.replace(document.location.origin)
    
    }

    renderGeneralError(error) {
        return html`
            <div id="hcertFailed" class="w3-panel bkg-fail">
                <h3>Failed!</h3>
                <p>The credential has an invalid format.</p>
            </div>
            `
    }

    renderDetail(cred, verification) {
        // The credential
        let payload = cred[1];

        // Parameters in case of correct validation
        let title = "Validated"
        let image = ok_image
        let color = "bkg-success"

        // Modify the parameters if WARNING or ERROR
        if (verification.result === "WARNING") {
            title = "Warning"
            image = warning_image
            color = "bkg-warning"
        } else if (verification.result === "ERROR") {
            title = "Not Validated"
            image = error_image
            color = "bkg-error"
        }

        let thehtml = html`
            <div class="container">

                <div id="hcertWarning" class=${`w3-panel ${color}`}>
                    <img src=${image}  alt="" />
                    <h3>${T(title)}</h3>
                    <p>${verification.message}</p>
                </div>

                <div class="section">
                    <div class="subsection">
                        <div class="etiqueta">${T("Surname and forename")}</div>
                        <div class="valor h4">${payload.fullName}</div>
                    </div>
                    <div class="subsection">
                        <div class="etiqueta">${T("Date of birth")}</div>
                        <div class="valor h4">${payload.dateOfBirth}</div>
                    </div>
                </div>
           
            </div>
        `;


        return thehtml;
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
        
                    <button @click=${()=>this.saveQRCertificate()} class="btn color-secondary hover-color-secondary w3-xlarge w3-round-xlarge">${T("Save")}</button>
        
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
    


    async saveQRCertificate() {

        // Store it in local storage
        //window.localStorage.setItem("MYEUDCC", this.QRCertificate)
        await set("MYEUDCC", this.QRCertificate)
    
        // Reload the application with a clean URL
        window.location.replace(document.location.origin)
    
    }

    async deleteQRCertificate() {

        await del("MYEUDCC")
    
        // Reload the application with a clean URL
        window.location.replace(document.location.origin)
    
    }
    
}

