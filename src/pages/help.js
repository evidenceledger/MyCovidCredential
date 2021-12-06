import { AbstractPage } from "./abstractpage";
import { html } from 'uhtml';

export class Help extends AbstractPage {

    constructor(domElem) {
        super(domElem)
    }

    async enter() {
        let theHtml = html`
        <div class="container padding-16" style="text-align: justify;">

            <p style="margin-bottom: 10px;">${T("$help01")}</p>
            <p>${T("$help02")}</p>
            <ul style="list-style-type:disc">
                <li style="margin-bottom: 10px;">${T("$help03")}</li>
                <li style="text-align: justify;">${T("$help04")}</li>
            </ul>
            <p>${T("$help05")}</p>&nbsp;
            <div>
                <p style="margin-bottom: 10px;"><strong>${T("$help06")}</strong></p>
                <div style="padding-left: 20px;">
                    <p style="margin-bottom: 10px;">${T("$help07")}</p>
                    <p style="margin-bottom: 10px;">${T("$help08")}</p>
                    <p>${T("$help09")} <a href="https://canalsalut.gencat.cat/ca/salut-a-z/c/coronavirus-2019-ncov/ciutadania/certificat-covid-digital-ue/" rel="noopener noreferrer" target="_blank">https://canalsalut.gencat.cat/ca/salut-a-z/c/coronavirus-2019-ncov/ciutadania/certificat-covid-digital-ue/</a></p>&nbsp
                </div>
            </div>
            <p style="margin-bottom: 40px">${T("$help10")}<a href="mailto:verificacovid.salut@gencat.cat">verificacovid.salut@gencat.cat</a></p>
        </div>
        `
        this.render(theHtml)
    }
}