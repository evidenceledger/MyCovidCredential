
export class Intro {

    constructor(id) {
        this.domElem = document.getElementById('intro')
    }

    enter() {
        console.log("INTRO: enter page")
        window.initialScreen()
        this.domElem.style.display = "block"
    }
}

