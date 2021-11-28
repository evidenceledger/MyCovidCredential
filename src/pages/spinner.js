import { AbstractPage } from './abstractpage'

export class Spinner extends AbstractPage {

    constructor(id) {
        console.log("SPINNER: inside constructor")
        super(id)
    }

    enter(pageData) {
        // window.initialScreen()
        window.location.reload()
    }
}

