
// Import the components implementing the pages
import { DisplayHcert } from './pages/hcertpage'
import { DemoPage } from './pages/demo'
import { Page404 } from './pages/page404'
import { ScanQrPage } from './pages/scanqr'
import { SWNotify } from "./pages/swnotify";
import { Intro } from "./pages/intro";
import { Spinner } from "./pages/spinner";
import { displayNormalQR } from "./pages/displayNormalQR";
import { SelectLanguage } from "./i18n/i18";
import { TermsOfUse } from './pages/termsofuse';
import { PrivacyPolicy } from './pages/privacypolicy';
import { SelectCamera } from './pages/selectcamera';
import { RefreshKeys } from './pages/refreshkeys'
import { DisplayMyHcert } from './pages/displaymyhcert';
import { Help } from './pages/help';
import { DisplayQR } from './pages/displayqr';

export var pageDefs = [
    {
        name: "intro",
        className: Intro
    },
    {
        name: "displayhcert",
        className: DisplayHcert
    },
    {
        name: "displaymyhcert",
        className: DisplayMyHcert
    },
    {
        name: "displayqr",
        className: DisplayQR
    },
    {
        name: "demo",
        className: DemoPage
    },
    {
        name: "verifier",
        className: ScanQrPage
    },
    {
        name: "swnotify",
        className: SWNotify
    },
    {
        name: "spinner",
        className: Spinner
    },
    {
        name: "page404",
        className: Page404
    },
    {
        name: "displayNormalQR",
        className: displayNormalQR
    },
    {
        name: "selectLanguage",
        className: SelectLanguage
    },
    {
        name: "termsOfUse",
        className: TermsOfUse
    },
    {
        name: "privacyPolicy",
        className: PrivacyPolicy
    },
    {
        name: "selectCamera",
        className: SelectCamera
    },
    {
        name: "help",
        className: Help
    },
    {
        name: "refreshKeys",
        className: RefreshKeys
    },
]

