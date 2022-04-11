
// Import the components implementing the pages
// import { DemoPage } from './pages/demo'
// import { Spinner } from "./pages/spinner";
// import { displayNormalQR } from "./pages/displayNormalQR";
// import { TermsOfUse } from './pages/termsofuse';
// import { PrivacyPolicy } from './pages/privacypolicy';

import { Intro } from "./pages/intropage";
import { ScanQrPage } from './pages/scanqr'
import { Faqs } from './pages/faqs';
import { RefreshKeys } from './pages/refreshkeys'
import { SelectLanguage } from "./i18n/i18";
import { Help } from './pages/help';
import { DisplayHcert } from './pages/hcertpage'
import { DisplayMyHcert } from "./pages/myhcertpage";
import { MicroWallet, AskUserToStoreQR } from "./pages/microwallet";
import { DisplayQR } from "./pages/displayqr";
import { SelectCamera } from './pages/selectcamera';
import { SWNotify } from "./pages/swnotify";
import { Page404 } from './pages/page404'

export var homePage = "MicroWallet"

export var pageDefs = [
    {
        name: "intro",
        className: Intro
    },
    {
        name: "verifier",
        className: ScanQrPage
    },
    {
        name: "faqs",
        className: Faqs
    },
    {
        name: "refreshKeys",
        className: RefreshKeys
    },
    {
        name: "selectLanguage",
        className: SelectLanguage
    },
    {
        name: "help",
        className: Help
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
        name: "MicroWallet",
        className: MicroWallet
    },
    {
        name: "AskUserToStoreQR",
        className: AskUserToStoreQR
    },
    {
        name: "AskUserToConfirmDeleteQR",
        className: AskUserToStoreQR
    },
    {
        name: "DisplayQR",
        className: DisplayQR
    },
    {
        name: "selectCamera",
        className: SelectCamera
    },
    {
        name: "swnotify",
        className: SWNotify
    },
    {
        name: "page404",
        className: Page404
    },
    // {
    //     name: "demo",
    //     className: DemoPage
    // },
    // {
    //     name: "spinner",
    //     className: Spinner
    // },
    // {
    //     name: "displayNormalQR",
    //     className: displayNormalQR
    // },
    // {
    //     name: "termsOfUse",
    //     className: TermsOfUse
    // },
    // {
    //     name: "privacyPolicy",
    //     className: PrivacyPolicy
    // },
]

