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
        this.qrContent = myqr
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

            <a @click=${async (e)=>await this.clipWrite(e)} id="imagetosave" href="" class="btn color-secondary hover-color-secondary w3-xlarge w3-round-xlarge">${T("Copy to clipboard")}</a>

        </div>

        `
        this.render(theHtml)

    }

    dataURLtoFile(dataurl, filename) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type:mime});
    }


    async clipWrite(e) {
        e.preventDefault()

        await navigator.clipboard.writeText(this.qrContent)
        console.log("Copied to clipboard")
        alert("Certificate copied to clipboard")

    }

    async share(e) {
        e.preventDefault()

        console.log(e.target)

        try {
            var canvas = document.querySelector("#qrinside div canvas")
            var dataurl = canvas.toDataURL()
        } catch (error) {
            alert(error)
            return
        }

        try {
            var theFile = this.dataURLtoFile(dataurl, "MyCOVIDcertificate.png")
            var filesArray = [theFile]
        } catch (error) {
            alert(error)
            return
        }

        if (navigator.canShare && navigator.canShare({ files: filesArray })) {
            try {
                navigator.share({
                    files: filesArray,
                    title: 'MyCOVIDcertificate',
                    text: 'MyCOVIDcertificate',
                })
                console.log('Share was successful.')
            } catch (error) {
                console.log('Sharing failed', error)
                alert('Sharing failed', error)
            }
        } else {
            console.log(`Your system doesn't support sharing files.`);
            alert(`Your system doesn't support sharing files.`);
        }

    }

}

