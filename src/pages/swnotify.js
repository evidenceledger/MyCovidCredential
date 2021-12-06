import { AbstractPage } from './abstractpage'
import { html } from 'uhtml'

var gotoPage = window.gotoPage

export class SWNotify extends AbstractPage {

    constructor(id) {
        super(id)
    }

    enter() {
        console.log("SWNOTIFY: enter page")

        let theHtml = html`
        <div class="container">
            <div class="w3-card-4 w3-center" style="margin-top:100px;">
        
                <header class="w3-container color-primary" style="padding:10px">
                    <h1>${T("Application updated")}</h1>
                </header>
        
                <div class="w3-container w3-padding-16">
                    <p>${T("There is a new version of the application and it has already been updated.")}</p>
                    <p>${T("Please click Accept to refresh the page.")}</p>
                </div>
        
                <div class="w3-padding-16">
        
                    <button @click=${()=>window.location.reload()} class="btn color-secondary hover-color-secondary w3-xlarge w3-round-xlarge">${T("Accept")}</button>
        
                </div>
        
            </div>
        </div>
        `

        this.render(theHtml)
    }
}

