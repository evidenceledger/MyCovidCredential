const CERT_OK = true
const INV_CERT_TYPE = "Invalid certificate type"

export function verifyHcert(hcert) {

    // The credential
    let payload = hcert[1];

    if (payload["certType"] == "v") {
        return verifyVaccinationCert(hcert)
    } else if (payload["certType"] == "t") {
        return verifyTestCert(hcert)
    } else if (payload["certType"] == "r") {
        return verifyRecoveryCert(hcert)
    }

    //It is an error if the credential is not of one of those types
    return INV_CERT_TYPE

}

function verifyVaccinationCert(hcert) {
    // The credential
    let payload = hcert[1];

    let doseNumber = payload["doseNumber"]
    let doseTotal = payload["doseTotal"]

    if (doseNumber < doseTotal) {
        return "Vaccination not completed."
    }

    let dateVaccination = Date.parse(payload["dateVaccination"])
    let timeValidFrom = dateVaccination + 14*24*60*60*1000

    let timeNow = Date.now()

    if (timeNow < timeValidFrom) {
        return "Certificate is not yet valid as vaccination is too recent."
    }

    return CERT_OK
}

function verifyTestCert(hcert) {
    // The credential
    let payload = hcert[1];

    // The time when the sample was taken
    let timeSample = Date.parse(payload["timeSample"])
    let timeNow = Date.now()

    // The test is valid for 72 hours
    let validityTime = 72*60*60*1000

    // But only 48 hours if is a TAR
    if (payload["typeTest"] === "LP217198-3") {
        validityTime = 48*60*60*1000      
    }

    // The time until the test is valid
    let timeUntil = timeSample + validityTime

    if (timeNow > timeUntil) {
        return "Certificate is expired."
    }

    return CERT_OK
}

function verifyRecoveryCert(hcert) {
    // The credential
    let payload = hcert[1];

    let dateUntil = Date.parse(payload["dateUntil"])

    // The test is also valid the day that expires
    let validityTime = 24*60*60*1000

    //The time until the test is valid
    let timeUntil = dateUntil + validityTime

    let dateNow = Date.now()
    if (dateNow > timeUntil) {
        return "Certificate is expired."
    }

    return CERT_OK
}
