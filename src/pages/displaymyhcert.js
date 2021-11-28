import { html, render } from 'lit-html';
import { log } from '../log'
import { CWT } from "../components/cwt"
import { AbstractPage } from './abstractpage'
import { verifyHcert } from '../components/verifications'
import ok_image from "../img/ok.png"
import error_image from "../img/error.png"
import warning_image from "../img/warning.png"

var gotoPage = window.gotoPage

export class DisplayMyHcert extends AbstractPage {

    constructor(id) {
        console.log("MYHCERT: Constructor")
        super(id)
    }

    async enter(qrContent, historyData) {
        console.log("PRESENT Enter", qrContent)
//        if (historyData) { gotoPage("verifier"); return;}
        // let qrContent = pageData.text

        qrContent = window.localStorage.getItem("MYEUDCC")

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
        <div class="sect-white">
            <button @click=${()=> gotoPage("displayqr")} class="w3-button btn-color-primary btn-hover-color-primary
            w3-xlarge w3-round-xlarge">
            ${T("Display QR")}</button>
        </div>
        `
        this.render(fullPage)

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

        let title = "Validated"
        let image = ok_image
        let color = "bkg-success"

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

                <div id="hcertWarning" class="w3-panel ${color}">
                    <img src=${image}  alt="">
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


