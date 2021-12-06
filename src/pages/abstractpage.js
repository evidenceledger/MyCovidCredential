import { HeaderBar } from './headerbar'
import {render, html, svg} from 'uhtml';


export class AbstractPage {

    constructor(id) {
        // Subclasses can choose its tag name, the default is a <div>
        if (this.tagName === undefined) {
            this.tagName = "div"
        }
        // Create a tag to contain the page
        this.domElem = document.createElement(this.tagName)
        // Set the id of the page for routing
        if (id) { this.domElem.id = id }
        // The page starts hidden
        this.domElem.style.display = "none"
    }

    render(theHtml) {
        // This is called by subclasses to render its contents
        // Show the page
        this.domElem.style.display = "block"
        // Redraw the header just in case the menu was active
        HeaderBar()
        // Render the html of the page into the DOM element of this page
        render(this.domElem, theHtml)
    }
}
