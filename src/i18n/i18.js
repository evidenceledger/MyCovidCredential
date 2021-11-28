import { AbstractPage } from '../pages/abstractpage'
import { html } from 'lit-html';

import ukflag from './flags/uk.png'
import esflag from './flags/es.png'
import caflag from './flags/ca.png'
import frflag from './flags/fr.png'
import deflag from './flags/de.png'
import itflag from './flags/it.png'

export class SelectLanguage extends AbstractPage {

    constructor(domElem) {
        super(domElem)
    }

    enter() {
        console.log("Select language")

        let theHtml = html`
<div class="w3-container" style="padding:10px 0px;">

    <ul class="w3-ul w3-card-4">

        <li> 
            <a class="w3-bar focus-visible-only" @click=${()=>this.selectLang("en")} href="javascript:void(0)">
                <div class="w3-bar-item" style="padding:8px;">
                    <img src=${ukflag} style="padding:8px;width:70px">
                    <span class="h3" style="vertical-align:middle;">English</span>
                </div>
            </a>
        </li>

        <li> 
            <a class="w3-bar focus-visible-only" @click=${()=>this.selectLang("ca")} href="javascript:void(0)">
                <div class="w3-bar-item" style="padding:8px;">
                    <img src=${caflag} style="padding:8px;width:70px">
                    <span class="h3" style="vertical-align:middle;">Català</span>
                </div>
            </a>
        </li>

        <li>
            <a class="w3-bar focus-visible-only" @click=${()=>this.selectLang("es")} href="javascript:void(0)">
                <div class="w3-bar-item" style="padding:8px;">
                    <img src=${esflag} style="padding:8px;width:70px">
                    <span class="h3" style="vertical-align:middle;">Español</span>
                </div>
            </a>
        </li>

        <li>
            <a class="w3-bar focus-visible-only" @click=${()=>this.selectLang("fr")} href="javascript:void(0)">
                <div class="w3-bar-item" style="padding:8px;">
                    <img src=${frflag} style="padding:8px;width:70px">
                    <span class="h3" style="vertical-align:middle;">Français</span>
                </div>
            </a>
        </li>

        <li>
            <a class="w3-bar focus-visible-only" @click=${()=>this.selectLang("de")} href="javascript:void(0)">
                <div class="w3-bar-item" style="padding:8px;">
                    <img src=${deflag} style="padding:8px;width:70px">
                    <span class="h3" style="vertical-align:middle;">Deutsch</span>
                </div>
            </a>
        </li>

        <li>
            <a class="w3-bar focus-visible-only" @click=${()=>this.selectLang("it")} href="javascript:void(0)">
                <div class="w3-bar-item" style="padding:8px;">
                    <img src=${itflag} style="padding:8px;width:70px">
                    <span class="h3" style="vertical-align:middle;">Italiano</span>
                </div>
            </a>
        </li>

    </ul>
</div>
`
        this.render(theHtml)
    }

    async selectLang(l) {
        console.log("Selecting language", l)
        window.preferredLanguage = l
        localStorage.setItem("preferredLanguage", l)
        window.history.back()
        window.initialHeader();
    }
}

