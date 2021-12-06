import { html } from 'uhtml';
import { AbstractPage } from './abstractpage'


export class Intro extends AbstractPage {

    constructor(id) {
        super(id)
    }

    enter() {

        let theHtml = html`<div class="sect-white">
            <h2 class="margin-bottom" style="word-break:break-word">${T("EU Digital COVID Credential Verifier")}</h2>
            <p>${T("$intro01")}</p>

            <div class="padding-16 center">

                <button onclick='${() => gotoPage("verifier")}' class="btn color-secondary hover-color-secondary
                    xlarge round-xlarge focus-visible-only">
                    ${T("Start verifying")}
                </button>
                <br/><br/>
                <a style="font-weight: bold" onclick='gotoPage("faqs")' href="javascript:void(0)">${T("Frequently asked questions (FAQS)")}</a>

            </div>
        </div>`;

        this.render(theHtml)
    }
}

