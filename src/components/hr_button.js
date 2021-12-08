import { html, render } from "uhtml";

class hrButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.update();
    }

    template() {
        return html`
        <style>
            :host {
                display: inline-block;
            }

            .btn {
                color: var(--fore-color-secondary);
                background-color: var(--bg-color-secondary);
                font-size: 18px!important;
                border: none;
                display: inline-block;
                padding: 16px 16px;
                vertical-align: middle;
                overflow: hidden;
                text-decoration: none;
                text-align: center;
                cursor: pointer;
                white-space: normal;
                border-radius: 10px;
                box-shadow: 0 8px 16px 0 rgb(0 0 0 / 20%), 0 6px 20px 0 rgb(0 0 0 / 19%);
            }

        </style>
        <div class="btn" >${this.innerHTML}</div>
        `;
    }

    routeToPage() {
        console.log("Inside route")
        if (this.hasAttribute('targetPage')) {
            window.gotoPage(this.getAttribute('targetPage'))
        }
    }

    resendEvent (e) {
        this.dispatchEvent(new CustomEvent("clicked", {
            detail: "h"
        }));
    }

    update() {
        render(this.shadowRoot, this.template());
    }
}

customElements.define("hr-button", hrButton);