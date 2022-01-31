# VerificaCOVIDng

[![GitHub license](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/evidenceledger/VerificaCOVID/blob/main/LICENSE)

Extremely simple and privacy-preserving PWA (Progressive Web Application) for storing locally a single EU Digital COVID Certificates.

## Installation and building

Clone the repository to your machine:

    git clone git@github.com:evidenceledger/MyCovidCredential.git

Install dependencies:

    npm install

Test the application locally:

    npm run dev

Build the application

    npm run build

After building the application will be available in the `docs` subdirectory.

## Deploy to a web server or CDN

The app is fully static so it can be deployed to any web server or CDN.

## Branding and simple customisations

### Customising the colors

Main display characteristics can be modified in `src/app.css`. For simple modification of colors you can modify the following CSS variables:

    --fore-color-primary:  white!important;
    --bg-color-primary:  #102a3a!important;
    --fore-color-secondary:  #04FF00!important;
    --bg-color-secondary:  #102a3a!important;

The `primary` colors are used mainly for the header bar and drop-down menu.

The `secondary` colors are used for the buttons.

Additionally, you may have to modify the following:

- HTML theme color defined in file `src/index.html`, in the tag `<meta name="theme-color" content="#919597">`.
- `background_color` and `theme_color` entries in the file `src/public/manifest.webmanifest`.

### Modifying the icons of the application

You should replace the icons of the application with your icons. Those can be found in the `src/public` directory.

The `src/public` directory is special: all files in this directory are copied unmodified and unprocessed into the root destination directory (by default the `docs` directory) when building the application for production.

The relevant image files are the following:

- favicon.ico
- icon-152.png
- icon-192.png
- icon-512.png
- apple-touch-icon.png


### Customising the header title or adding a header icon

The header bar and associated drop-down menu is defined in `src/pages/headerbar.js`.

It is straightforward to modify the header title or any other property of the header, which is defined in the `HeaderBar()` function.

### Modifying the texts

All texts in the application are externalised in the `src/i18n/translations.js` file. Most simple modifications to the text literals in the application can be done in this file without touching the actual code for the different pages of the application.

The `translations.js` file is in reality in JSON format with an object for each text in the application. An example of this object is:

```json
"EU Digital COVID Credential Verifier": {
    "es": "Verificador de Credenciales COVID",
    "ca": "Verificador de Credencials COVID",
    "fr": "Outil de vérification numérique des justificatifs COVID de l'UE",
    "de": "Digitale COVID-Anmeldeinformationsüberprüfung in der EU",
    "it": "Strumento di verifica del certificato digitale COVID UE"
}
```

The key (in this case `"EU Digital COVID Credential Verifier"`) should correspond exactly with the literal used in the application. Inside this object there is a `key/value` pair for each translated language.

The application uses English as the primary language and so the keys are in this language.

However, there are some objects where the key starts with the letter `$` like in `"$intro01"`. This is done when the text in the key would be too long to be practical. In these cases, the objects include the English text in addition to the other languages. You can see an example in the very first object in `translations.js`.

### Adding a new language

Adding a new language involves two steps:

1. Adding translation objects in the file `translations.js`.
2. Adding a new option to choose the language in the file `src/i18n/i18.js`.

The `src/i18n/i18.js` file contains the code for switching languages, which is available as a page in the drop-down menu. Adding a new language is just a copy/paste and modification of the code for an existing language.

The icon refresenting the flag for the new language should be put in the `src/i18n/flags` directory. Optimum dimensions for the icon are 50x33 pixels.

## Modification of verification rules of the certificate

We distinguish between the `technical verification rules` and the `business verification rules`.

The `technical verification rules` are typically a core part of the application and should not be different across instances. They include thingas like: 

- Decoding the QR and applying formal verifications to check that it contains the relevant items specified by the EU DCC format.
- Verifying that the digital signature is correct and that the public key of the digital certificate used to sign the EU DCC is included in the official trusted list of public keys published by the countries.

The `business verification rules` are applied after the technical verification of the EU DCC and are typically related to dates of issuance vs. date of verification, number of doses required, etc.

The `technical verification rules` are very stable and should change only if some technical problem is found and fixed.

However, the `business verification rules` can be modified depending on the evolution of the pandemia or the region where they have to be applied.

`Business verification rules` tend to be very simple and they are defined in the file `src/components/verifications.js`. It should be straightforward to understand the current rules and adapt them to your needs. 