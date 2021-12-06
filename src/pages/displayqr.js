import { AbstractPage } from './abstractpage'
import { html } from 'uhtml';
import { QRCode } from 'easyqrcodejs'

export class DisplayQR extends AbstractPage {

    constructor(id) {
        super(id)
    }

    enter() {

        const myqr = window.localStorage.getItem("MYEUDCC")
        console.log(myqr)

        let qrelement = document.createElement("div");

        let params = {
            text: myqr,
            correctLevel : QRCode.CorrectLevel.L,
            width: 300,
            height: 300
        }
        var qrcode = new QRCode(qrelement, params);

        let theHtml = html`
        <div style="text-align:center; margin-top:100px">
            ${qrelement}
        </div>
        `

        this.render(theHtml)
    }
}

