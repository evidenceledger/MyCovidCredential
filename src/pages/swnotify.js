import { AbstractPage } from './abstractpage'
import { html } from 'uhtml'
import { set } from 'idb-keyval';

var gotoPage = window.gotoPage

export class SWNotify extends AbstractPage {

    constructor(id) {
        super(id)
    }

    async enter(status) {
        console.log("SWNOTIFY: enter page")
        let qrContent = await get("MYEUDCC")
        if (qrContent) {
            window.location.reload()
            window.goHome()
            return;
        }        

        let theHtml = html`
        <div class="container">
            <div class="w3-card-4 w3-center" style="margin-top:100px;">
        
                <header class="w3-container color-primary" style="padding:10px">
                    <h1>${T("Application updated")}</h1>
                </header>
        
                <div class="w3-container w3-padding-16">
                    <p>${T("Please click Accept to refresh the page.")}</p>
                </div>
        
                <div class="w3-padding-16">
        
                    <button @click=${async ()=>await this.readClip()} class="btn color-secondary hover-color-secondary w3-xlarge w3-round-xlarge">${T("Accept")}</button>
        
                </div>
        
            </div>
        </div>
        `

        this.render(theHtml)
    }

    async readClip() {

        if (window.inStandalone) {

            // Check if we have a QR in the clipboard
            try {
                var qrContent = await navigator.clipboard.readText()
                console.log("In clipboard:", qrContent)
            } catch (error) {
                console.error("Error reading from clipboard:", error)
                alert(error)            
            }
            if (qrContent &&
                (typeof qrContent === 'string' || qrContent instanceof String) &&
                qrContent.length > 100 && qrContent.startsWith("HC1:")
                ) {
                
                console.log("EUDCC received:", qrContent)
                await set("MYEUDCC", qrContent)        
            }

        }

        window.location.reload()
    }

}

