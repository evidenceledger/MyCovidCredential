import { AbstractPage } from './abstractpage'
import { html } from 'lit-html';

export class displayNormalQR extends AbstractPage {

    constructor(id) {
        super(id)
    }

    enter(qrData) {

        let isURL = false
        if (qrData.startsWith("https://") || qrData.startsWith("http://")) {
            isURL = true
        }

        let theHtml = html`
        <div class="container" style="margin-top:50px;">
            <h2 class="w3-margin-bottom w3-center">Received QR</h2>
            <p class="w3-large" style="word-break: break-all;">${qrData}</p>
        
            <div class="w3-bar w3-padding-16 w3-center" style="max-width:70%;margin:50px auto;">

                <a href="javascript:void(0)" @click=${()=> window.history.back()} class="w3-button w3-left btn-color-primary btn-hover-color-primary
                    w3-large w3-round-xlarge">Back</a>
    
                ${isURL
                ? html`<a href="${qrData}" class="w3-button w3-right btn-color-primary btn-hover-color-primary
                    w3-large w3-round-xlarge">Go to site</a>`
                : html``
                }
                
            </div>
        </div>
        `

        this.render(theHtml)
    }
}

