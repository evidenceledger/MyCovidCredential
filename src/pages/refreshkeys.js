import { AbstractPage } from './abstractpage'
import { html } from 'uhtml';
import { HeaderBar } from './headerbar';


export class RefreshKeys extends AbstractPage {

    constructor(id) {
        super(id)
    }

    async enter() {

        await refreshTrustedKeys()

        let theHtml = html`
        <div class="container">
            <div class="w3-card-4 w3-center" style="margin-top:100px;">
        
                <header class="w3-container color-primary" style="padding:10px">
                    <h1>${T("Verification keys updated")}</h1>
                </header>
                
                <div class="w3-padding-16">
        
                    <button @click=${()=>this.acceptedButton()} class="btn color-secondary hover-color-secondary w3-xlarge w3-round-xlarge">${T("Accept")}</button>
        
                </div>
        
            </div>
        </div>
        `

        this.render(theHtml)
    }

    async acceptedButton() {
        HeaderBar()
        goHome()
    }
}

// This function refreshes the EU trusted list
async function refreshTrustedKeys() {
    let response = await fetch("./eu_jwk_keys.json")
    if (!response.ok) {
        log.myerror("fetch for TL failed");
        return;
    }
    window.eu_trusted_keys = await response.json()
    return;
}
window.refreshTrustedKeys = refreshTrustedKeys