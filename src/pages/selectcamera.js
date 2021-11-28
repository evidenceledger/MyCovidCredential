import { AbstractPage } from '../pages/abstractpage'
import { html } from 'lit-html';

export class SelectCamera extends AbstractPage {

    constructor(domElem) {
        super(domElem)
    }

    async enter() {
        console.log("Select camera")

        var preferredLabel = "Undefined"
        let preferredCamera = await getPreferredVideoDevice()
        if (preferredCamera) {
            preferredLabel = preferredCamera.label
        }

        if (window.videoDevices.length == 0) {
            this.render(html`<p>No camera available</p>`)
            return;
        }

        let theHtml = html`
        <div class="container padding-16">

            <ul class="w3-ul w3-card-4">
            ${window.videoDevices.map((camera) =>

                html`
                <li class="bar">
                    <a @click=${()=>this.setCamera(camera.deviceId)} href="javascript:void(0)">
                        <div class="bar-item" style="padding:8px;">
                            <div class="h5" style="vertical-align:middle;">${camera.label}</div>
                        </div>
                    </a>
                </li>`
                
                )}
            </ul>

        </div>
        `
        this.render(theHtml)
    }

    async setCamera(l) {
        console.log("Selecting camera", l)
        window.selectedCamera = l
        localStorage.setItem("selectedCamera", l)
        window.history.back()
        window.initialHeader();
    }

    async checkCamera() {
        let stream;
        let constraints = {
            audio: false,
            video: {
                width: { ideal: 1080, max: 1920 },
                facingMode: "environment"
            }
        }


        try {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            let track = stream.getVideoTracks()[0]
            let settings = track.getSettings()
            console.log(settings)
            let s = `${settings.width}x${settings.height}`
            return s;
        }
        catch {
            // Ignored
        }
        finally {
            if (stream !== undefined) {
                stream.getVideoTracks().forEach((track) => {
                    track.stop();
                });
            }
        }


    }
}

