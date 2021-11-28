import { AbstractPage } from './abstractpage'
import { html } from 'lit-html';
//import { T } from '../i18n/translate';
//import { goHome, gotoPage } from "../router";
var gotoPage = window.gotoPage

export class RefreshKeys extends AbstractPage {

    constructor(domElem) {
        super(domElem)
    }

    enter() {
        console.log("RefreshKeys: enter page")

        window.refreshTrustedKeys()

        let theHtml = html`
        <div class="container">
            <div class="w3-card-4 w3-center" style="margin-top:100px;">
        
                <header class="w3-container color-primary" style="padding:10px">
                    <h1>${T("Verification keys updated")}</h1>
                </header>
                
                <div class="w3-padding-16">
        
                    <button @click=${()=>this.acceptedButton()} class="w3-button btn-color-primary btn-hover-color-primary w3-xlarge w3-round-xlarge">${T("Accept")}</button>
        
                </div>
        
            </div>
        </div>
        `

        this.render(theHtml)
    }

    async acceptedButton() {
        window.initialHeader();
        window.history.back();
    }
}

