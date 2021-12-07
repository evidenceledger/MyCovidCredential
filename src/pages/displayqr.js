import { AbstractPage } from './abstractpage'
import { html } from 'uhtml';
import { QRCode } from 'easyqrcodejs'
import { get, set } from 'idb-keyval';

export class DisplayQR extends AbstractPage {

    constructor(id) {
        super(id)
    }

    async enter() {

        //const myqr = window.localStorage.getItem("MYEUDCC")
        const myqr = await get("MYEUDCC")
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
        <div id="qrinside" style="text-align:center; margin-top:100px">
            ${qrelement}
        </div>

        <div class="w3-padding-16 center">

            <a id="imagetosave" href="" class="btn color-secondary hover-color-secondary w3-xlarge w3-round-xlarge" download="MyCertificateCOVID">${T("Save locally")}</a>

        </div>


        `

        this.render(theHtml)

        let canvas = document.querySelector("#qrinside div canvas")
        let dataurl = canvas.toDataURL()
        console.log(dataurl)
        let imagetosave = document.querySelector("#imagetosave")
        imagetosave.href = dataurl
    }
}

