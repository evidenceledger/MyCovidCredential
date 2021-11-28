import { inflate } from "pako";
import { log } from "../log";

//********************************
// CRYPTO KEY SUPPORT
//********************************

const KEYPAIR = 1;
const SYMMETRIC = 2;

/*
Convert  an ArrayBuffer into a string
from https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
*/
function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

/*
Convert a string into an ArrayBuffer
from https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
*/
function str2ab(str) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

class DGCKey {
    constructor() { }

    static async fromSPKI(SPKI) {
        const binaryDerString = window.atob(SPKI);
        // convert from a binary string to an ArrayBuffer
        const binaryDer = str2ab(binaryDerString);

        const extractable = true;
        const format = "spki";

        let algorithm = {
            name: "ECDSA",
            namedCurve: "P-256",
        };

        let key = await crypto.subtle.importKey(
            format,
            binaryDer,
            algorithm,
            extractable,
            ["verify"]
        );

        return key;
    }


    static async fromJWK(jwk) {
        // Create a CryptoKey from JWK format

        // Fix the "use" field for malformed keys from Sweden
        jwk["use"] = "sig";
        const extractable = true;
        const format = "jwk";
        const keyType = jwk["kty"];
        let algorithm;

        if (keyType == "EC") {
            algorithm = {
                name: "ECDSA",
                namedCurve: "P-256",
            };
        } else if (keyType == "RSA") {
            algorithm = {
                name: "RSA-PSS",
                hash: "SHA-256",
            };
        } else {
            throw new Error(`Invalid key type specified: ${jwk["kty"]}`);
        }

        // If "d" is in the JWK, then it is a private key for signing.
        // Otherwise it is a prublic key for verification
        let keyUsages = jwk["d"] ? ["sign"] : ["verify"];

        let key = await crypto.subtle.importKey(
            format,
            jwk,
            algorithm,
            extractable,
            keyUsages
        );

        return key;
    }

    static async generateECDSAKeyPair() {
        // Create an ECDSA/P-256 CryptoKey

        const extractable = true;
        const algorithm = {
            name: "ECDSA",
            namedCurve: "P-256",
        };
        const keyUsages = ["sign", "verify"];

        // Ask browser to create a key pair with the P256 curve
        let keyPair = await crypto.subtle.generateKey(
            algorithm,
            extractable,
            keyUsages
        );

        return keyPair;
    }

    static async generateEncryptionKey() {
        // Generate a symmetric key for encrypting credentials when in transit
        // The credentials (and other material) will be encrypted when sent to the
        // Secure Messaging Server

        // Ask browser to create a symmetric key
        let key = await crypto.subtle.generateKey(
            {
                name: "AES-GCM",
                length: 256,
            },
            true,
            ["encrypt", "decrypt"]
        );

        return key;
    }

    static async exportToJWK(key) {
        // Convert a key from CryptoKey (native) format to JWK format

        // Export the key to the JWK format (see spec for details)
        let keyJWK = await crypto.subtle.exportKey("jwk", key);
        return keyJWK;
    }

    static async exportToPEM(key) {
        // Convert a key from CryptoKey (native) format to PEM format

        let keyJWK = await crypto.subtle.exportKey("spki", key);
        return keyJWK;
    }

    static async importFromPEMRaw(keyPEMString) {
        // base64 decode the string to get the binary data
        const binaryDerString = window.atob(keyPEMString);
        console.log(binaryDerString);
        // convert from a binary string to an ArrayBuffer
        const binaryDer = str2ab(binaryDerString);
        console.log(binaryDer);

        // Import a public key
        let key = await crypto.subtle.importKey(
            "spki",
            binaryDer,
            {
                name: "ECDSA",
                namedCurve: "P-256",
            },
            true,
            ["verify"]
        );

        return key;
    }

    static async sign(key, bytes) {
        if (key.type != "private") {
            throw new Error("Not a private key");
        }

        let signature = await window.crypto.subtle.sign(
            {
                name: "ECDSA",
                hash: { name: "SHA-256" },
            },
            key,
            bytes
        );

        return signature;
    }

    static async verify(key, signature, bytes) {
        if (key.type != "public") {
            throw new Error("Not a public key");
        }

        console.log("Inside VERIFY", key);
        let algo = key.algorithm
        console.log("Key algorithm", algo)

        // Set the proper parameters depending on algorithm used when signing
        if (key.algorithm.name === "RSA-PSS") {
            algo = {
                name: "RSA-PSS",
                saltLength: 32,
            }
        } else if (key.algorithm.name === "ECDSA") {
            algo = {       
                name: "ECDSA",
                hash: "SHA-256"         
            }
        } else {
            throw `Invalid signature algorithm: ${key.algorithm.name}`;
        }

        let result
        try {
            result = await window.crypto.subtle.verify(
                algo,
                key,
                signature,
                bytes
            );
        } catch (error) {
            throw `Verification of payload failed: ${error}`;
        }

        console.log("Result:", result);
        return result;
    }

    // Encrypt a byte array message with a symmetric key
    static async encryptMessage(key, bytes) {
        if (key.type != "secret") {
            throw new Error("Not a symmetric encryption key");
        }

        // Generate the iv
        // The iv must never be reused with a given key.
        let iv = crypto.getRandomValues(new Uint8Array(12));

        // Perform the actual encryption
        let ciphertext = await crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            key,
            bytes
        );

        // Return the resulting ArrayBuffer, together with the iv
        return { iv: iv, ciphertext: ciphertext };
    }

    static async decryptMessage(key, iv, ciphertext) {
        if (key.type != "secret") {
            throw new Error("Not a symmetric encryption key");
        }

        // Perform the decryption of the received ArrayBuffer
        let decrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            key,
            ciphertext
        );

        // Return the byte array
        return decrypted;
    }
}


//********************************
// AUXILIARY FUNCTIONS
//********************************


function uint(bytes) {
    // Convert a byte array of 2 or 4 bytes to an unsigned integer
    // The byte array is in network byte order

    // Get the first byte
    var value = bytes[0];

    // If there are more bytes, iterate the byte array
    var i = bytes.length;
    for (let j = 1; j < i; j = j + 1) {
        value = value * 256;
        value = value + bytes[j];
    }

    return value;
}

// The character codes for the ranges
var aCode = "a".charCodeAt(0);
var fCode = "f".charCodeAt(0);
var ACode = "A".charCodeAt(0);
var FCode = "F".charCodeAt(0);
var zeroCode = "0".charCodeAt(0);
var nineCode = "9".charCodeAt(0);

function charValue(char) {
    // Given a character, return the hex value
    // "0" -> 0
    // "a" or "A" -> 10
    // "f" or "F" -> 15
    var c = char.charCodeAt(0);

    if (c >= aCode && c <= fCode) {
        return c - aCode + 10;
    }

    if (c >= ACode && c <= FCode) {
        return c - ACode + 10;
    }

    if (c >= zeroCode && c <= nineCode) {
        return c - zeroCode;
    }
}

function hexStr2bytes(hexString) {
    // Converts a string of hex values to a byte array (Uint8Array)
    // The input string should have 2 hex characters for each byte (even size)
    // The string should not start by 0X or any other prefix
    // Example: 'd28449a2012704'

    // Check if there is an even number of characters
    if (hexString.length % 2 > 0) {
        console.log("ERROR: Hex String length incorrect");
        return undefined;
    }

    // Create a byte array with one byte for each two input characters
    var array = new Uint8Array(hexString.length / 2);

    // Iterate for each pair of input characters
    for (let i = 0; i < hexString.length; i = i + 2) {
        // get the integer value for each of the two characters
        var code1 = charValue(hexString[i]);
        var code2 = charValue(hexString[i + 1]);

        // code1 is the most significant byte, code2 the least

        // Set the array entry. Index is i/2
        array[i / 2] = code1 * 16 + code2;
    }

    return array;
}

const lutArray = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
];

function bytes2hexStr(bytes) {
    // Convert a byte array to a hex string
    // Each byte is converted into two hex chars representing the byte

    // Initialize the hex string
    var hexStr = "";

    // Iterate the input byte array
    for (let i = 0; i < bytes.length; i = i + 1) {
        // Get the value of the 4 most significant bits
        nibHigh = bytes[i] >>> 4;
        // Get the value of the 4 least significant bits
        nibLow = bytes[i] & 0x0f;

        // Concatenate the two chars to the whole hex string
        hexStr = hexStr + lutArray[nibHigh] + lutArray[nibLow];
    }

    return hexStr;
}

const baseSize = 45;
const baseSizeSquared = 2025;
const chunkSize = 2;
const encodedChunkSize = 3;
const smallEncodedChunkSize = 2;
const byteSize = 256;

const encoding = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    " ",
    "$",
    "%",
    "*",
    "+",
    "-",
    ".",
    "/",
    ":",
];

var decoding;

function encodeB45(byteArrayArg) {
    if (byteArrayArg === null || byteArrayArg === undefined)
        throw new Error("byteArrayArg is null or undefined.");

    //TODO check is array-like?

    const wholeChunkCount = Math.trunc(byteArrayArg.length / chunkSize);
    const resultSize =
        wholeChunkCount * encodedChunkSize +
        (byteArrayArg.length % chunkSize === 1 ? smallEncodedChunkSize : 0);

    if (resultSize === 0) return "";

    const result = new Array(resultSize);
    var resultIndex = 0;
    const wholeChunkLength = wholeChunkCount * chunkSize;
    for (let i = 0; i < wholeChunkLength;) {
        const value = byteArrayArg[i++] * byteSize + byteArrayArg[i++];
        result[resultIndex++] = encoding[value % baseSize];
        result[resultIndex++] = encoding[Math.trunc(value / baseSize) % baseSize];
        result[resultIndex++] =
            encoding[Math.trunc(value / baseSizeSquared) % baseSize];
    }

    if (byteArrayArg.length % chunkSize === 0) return result.join("");

    result[result.length - 2] =
        encoding[byteArrayArg[byteArrayArg.length - 1] % baseSize];
    result[result.length - 1] =
        byteArrayArg[byteArrayArg.length - 1] < baseSize
            ? encoding[0]
            : encoding[
            Math.trunc(byteArrayArg[byteArrayArg.length - 1] / baseSize) %
            baseSize
            ];

    return result.join("");
}

function decodeB45(utf8StringArg) {
    if (utf8StringArg === null || utf8StringArg === undefined)
        throw new Error("utf8StringArg is null or undefined.");

    if (utf8StringArg.length === 0) return [];

    var remainderSize = utf8StringArg.length % encodedChunkSize;
    if (remainderSize === 1)
        throw new Error("utf8StringArg has incorrect length.");

    if (decoding === undefined) {
        decoding = {};
        for (let i = 0; i < encoding.length; ++i) decoding[encoding[i]] = i;
    }

    const buffer = new Array(utf8StringArg.length);
    for (let i = 0; i < utf8StringArg.length; ++i) {
        const found = decoding[utf8StringArg[i]];
        if (found === undefined)
            throw new Error("Invalid character at position ".concat(i).concat("."));
        buffer[i] = found;
    }

    const wholeChunkCount = Math.trunc(buffer.length / encodedChunkSize);
    var result = new Array(
        wholeChunkCount * chunkSize + (remainderSize === chunkSize ? 1 : 0)
    );
    var resultIndex = 0;
    const wholeChunkLength = wholeChunkCount * encodedChunkSize;
    for (let i = 0; i < wholeChunkLength;) {
        const val =
            buffer[i++] + baseSize * buffer[i++] + baseSizeSquared * buffer[i++];
        result[resultIndex++] = Math.trunc(val / byteSize); //result is always in the range 0-255 - % ByteSize omitted.
        result[resultIndex++] = val % byteSize;
    }

    if (remainderSize === 0) return result;

    result[result.length - 1] =
        buffer[buffer.length - 2] + baseSize * buffer[buffer.length - 1]; //result is always in the range 0-255 - % ByteSize omitted.
    return result;
}

function decodeToUtf8String(utf8StringArg) {
    var data = decodeB45(utf8StringArg);

    var str = "";
    var count = data.length;
    for (let i = 0; i < count; ++i) str += String.fromCharCode(data[i]);

    return str;
}

//********************************
// CBOR/COSE/CWT ENCODE/DECODE SUPPORT
//********************************

// CBOR tags to assign semantic to the data structures
const CBOR_Magic_ID = 55799; // Magic tag number that identifies the data as CBOR-encoded
const COSE_Sign = 98; // COSE Signed Data Object
const COSE_Sign1 = 18; // COSE Single Signer Data Object

const MT_INTEGER = 0;
const MT_NEGINTEGER = 1;
const MT_BYTES = 2;
const MT_UTF8 = 3;
const MT_ARRAY = 4;
const MT_MAP = 5;
const MT_TAG = 6;
const MT_FLOAT = 7;

const CWT_ALG = 1;
const CWT_KID = 4;

// For converting from string to byte array (Uint8Array) in UTF-8 and viceversa
const utf8Encoder = new TextEncoder();
const utf8Decoder = new TextDecoder();

// Mapping from COSE Tags to COSE algorithm name
var CWT_ALG_TO_JWT = new Map();
CWT_ALG_TO_JWT.set(-7, "ES256");
CWT_ALG_TO_JWT.set(-37, "RSA");

export class CWT {
    static POW_2_24 = 5.960464477539063e-8
    static POW_2_32 = 4294967296
    static POW_2_53 = Number.MAX_SAFE_INTEGER

    static encode(value) {
        // Allocate a buffer to hold the binary encoding
        // Its size starts small and expands as needed (prepareWrite)
        var data = new ArrayBuffer(256);
        var dataView = new DataView(data);
        var lastLength;
        var offset = 0;

        function prepareWrite(length) {
            // If needed, expand the buffer to make room for length bytes
            var newByteLength = data.byteLength;
            var requiredLength = offset + length;
            while (newByteLength < requiredLength) newByteLength <<= 1;
            if (newByteLength !== data.byteLength) {
                var oldDataView = dataView;
                data = new ArrayBuffer(newByteLength);
                dataView = new DataView(data);
                var uint32count = (offset + 3) >> 2;
                for (var i = 0; i < uint32count; ++i)
                    dataView.setUint32(i << 2, oldDataView.getUint32(i << 2));
            }

            lastLength = length;
            return dataView;
        }
        function commitWrite() {
            offset += lastLength;
        }
        function writeFloat64(value) {
            commitWrite(prepareWrite(8).setFloat64(offset, value));
        }
        function writeUint8(value) {
            commitWrite(prepareWrite(1).setUint8(offset, value));
        }
        function writeUint8Array(value) {
            var dataView = prepareWrite(value.length);
            for (var i = 0; i < value.length; ++i)
                dataView.setUint8(offset + i, value[i]);
            commitWrite();
        }
        function writeUint16(value) {
            commitWrite(prepareWrite(2).setUint16(offset, value));
        }
        function writeUint32(value) {
            commitWrite(prepareWrite(4).setUint32(offset, value));
        }
        function writeUint64(value) {
            var low = value % POW_2_32;
            var high = (value - low) / POW_2_32;
            var dataView = prepareWrite(8);
            dataView.setUint32(offset, high);
            dataView.setUint32(offset + 4, low);
            commitWrite();
        }
        function writeTypeAndLength(type, length) {
            if (length < 24) {
                writeUint8((type << 5) | length);
            } else if (length < 0x100) {
                writeUint8((type << 5) | 24);
                writeUint8(length);
            } else if (length < 0x10000) {
                writeUint8((type << 5) | 25);
                writeUint16(length);
            } else if (length < 0x100000000) {
                writeUint8((type << 5) | 26);
                writeUint32(length);
            } else {
                writeUint8((type << 5) | 27);
                writeUint64(length);
            }
        }

        function encodeItem(value) {
            var i;

            // First handle simple values
            if (value === false) return writeUint8(0xf4);
            if (value === true) return writeUint8(0xf5);
            if (value === null) return writeUint8(0xf6);
            if (value === undefined) return writeUint8(0xf7);

            // Handle numbers and strings
            switch (typeof value) {
                case "number":
                    // First handle integers, both positive and negative
                    if (Math.floor(value) === value) {
                        if (0 <= value && value <= POW_2_53) {
                            // Positive numbers
                            return writeTypeAndLength(MT_INTEGER, value);
                        }
                        if (-POW_2_53 <= value && value < 0) {
                            // Negative numbers
                            return writeTypeAndLength(MT_NEGINTEGER, -(value + 1));
                        }
                    }

                    // Handle floats. For the moment, encode always as a 64-bit float
                    // 0xfb = MT_FLOAT | 27 = IEEE 754 Double-Precision Float (64 bits follow)
                    writeUint8(0xfb);
                    return writeFloat64(value);

                case "string":
                    // Convert from Javascript utf16 strings to utf8
                    var utf8data = [];
                    for (i = 0; i < value.length; ++i) {
                        var charCode = value.charCodeAt(i);
                        if (charCode < 0x80) {
                            utf8data.push(charCode);
                        } else if (charCode < 0x800) {
                            utf8data.push(0xc0 | (charCode >> 6));
                            utf8data.push(0x80 | (charCode & 0x3f));
                        } else if (charCode < 0xd800) {
                            utf8data.push(0xe0 | (charCode >> 12));
                            utf8data.push(0x80 | ((charCode >> 6) & 0x3f));
                            utf8data.push(0x80 | (charCode & 0x3f));
                        } else {
                            charCode = (charCode & 0x3ff) << 10;
                            charCode |= value.charCodeAt(++i) & 0x3ff;
                            charCode += 0x10000;

                            utf8data.push(0xf0 | (charCode >> 18));
                            utf8data.push(0x80 | ((charCode >> 12) & 0x3f));
                            utf8data.push(0x80 | ((charCode >> 6) & 0x3f));
                            utf8data.push(0x80 | (charCode & 0x3f));
                        }
                    }

                    writeTypeAndLength(MT_UTF8, utf8data.length);
                    return writeUint8Array(utf8data);

                default:
                    // Handle Javascript objects
                    var length;

                    if (Array.isArray(value)) {
                        // Normal arrays (except byte arrays)
                        length = value.length;
                        writeTypeAndLength(MT_ARRAY, length);
                        for (i = 0; i < length; ++i) encodeItem(value[i]);
                    } else if (value instanceof Uint8Array) {
                        // Byte arrays
                        writeTypeAndLength(MT_BYTES, value.length);
                        writeUint8Array(value);
                    } else if (value instanceof Map) {
                        // Javascript Map, will be encoded as CBOR Map
                        length = value.size;
                        writeTypeAndLength(MT_MAP, length);
                        for (let [key, val] of value) {
                            encodeItem(key);
                            encodeItem(val);
                        }
                    } else {
                        // Assume we have a "normal" object, will be encoded as a CBOR Map
                        var keys = Object.keys(value);
                        length = keys.length;
                        writeTypeAndLength(MT_MAP, length);
                        for (i = 0; i < length; ++i) {
                            var key = keys[i];
                            encodeItem(key);
                            encodeItem(value[key]);
                        }
                    }
            }
        }

        // Encode recursively the Javascript object received
        encodeItem(value);

        // Return a new ArrayBuffer with the just the used bytes
        return data.slice(0, offset);
    }

    static async verifyCWT(_cwt, verificationKey) {
        // Verify the CWT object using the verificationKey
        // The verificationKey should be a JWK object with the public key
        // The method is async because we call async crypto methods (SubtleCrypto)

        // Decode the object into an Array with 4 elements
        let [ph, uph, payload, signature] = CWT.decode(_cwt);

        // Zero-length bstr
        let zeroBstr = new Uint8Array(0);

        // Create the Sig_structure
        const Sig_structure = ["Signature1", ph, zeroBstr, payload];

        // And CBOR-encode it
        let Sig_structure_encoded = CWT.encode(Sig_structure);

        // Verify the signature
        let verified = false;
        try {
            verified = await DGCKey.verify(
                verificationKey,
                signature,
                Sig_structure_encoded
            );
            console.log("VERIFIED:", verified);
        } catch (error) {
            console.log("ERROR:", error);
        }

        return verified;
    }

    static decode(data, tagger, simpleValue) {
        // data: an ArrayBuffer with the contents to decode

        var dataView = new DataView(data);
        var offset = 0;

        if (typeof tagger !== "function")
            tagger = function (value) {
                return value;
            };
        if (typeof simpleValue !== "function")
            simpleValue = function () {
                return undefined;
            };

        function commitRead(length, value) {
            offset += length;
            return value;
        }
        function readArrayBuffer(length) {
            return commitRead(length, new Uint8Array(data, offset, length));
        }
        function readFloat16() {
            var tempArrayBuffer = new ArrayBuffer(4);
            var tempDataView = new DataView(tempArrayBuffer);
            var value = readUint16();

            var sign = value & 0x8000;
            var exponent = value & 0x7c00;
            var fraction = value & 0x03ff;

            if (exponent === 0x7c00) exponent = 0xff << 10;
            else if (exponent !== 0) exponent += (127 - 15) << 10;
            else if (fraction !== 0) return (sign ? -1 : 1) * fraction * POW_2_24;

            tempDataView.setUint32(
                0,
                (sign << 16) | (exponent << 13) | (fraction << 13)
            );
            return tempDataView.getFloat32(0);
        }
        function readFloat32() {
            return commitRead(4, dataView.getFloat32(offset));
        }
        function readFloat64() {
            return commitRead(8, dataView.getFloat64(offset));
        }
        function readUint8() {
            return commitRead(1, dataView.getUint8(offset));
        }
        function readUint16() {
            return commitRead(2, dataView.getUint16(offset));
        }
        function readUint32() {
            return commitRead(4, dataView.getUint32(offset));
        }
        function readUint64() {
            return readUint32() * POW_2_32 + readUint32();
        }
        function readBreak() {
            if (dataView.getUint8(offset) !== 0xff) return false;
            offset += 1;
            return true;
        }
        function readLength(additionalInformation) {
            if (additionalInformation < 24) return additionalInformation;
            if (additionalInformation === 24) return readUint8();
            if (additionalInformation === 25) return readUint16();
            if (additionalInformation === 26) return readUint32();
            if (additionalInformation === 27) return readUint64();
            if (additionalInformation === 31) return -1;
            throw "Invalid length encoding";
        }
        function readIndefiniteStringLength(majorType) {
            var initialByte = readUint8();
            if (initialByte === 0xff) return -1;
            var length = readLength(initialByte & 0x1f);
            if (length < 0 || initialByte >> 5 !== majorType)
                throw "Invalid indefinite length element";
            return length;
        }

        function appendUtf16Data(utf16data, length) {
            for (var i = 0; i < length; ++i) {
                var value = readUint8();
                if (value & 0x80) {
                    if (value < 0xe0) {
                        value = ((value & 0x1f) << 6) | (readUint8() & 0x3f);
                        length -= 1;
                    } else if (value < 0xf0) {
                        value =
                            ((value & 0x0f) << 12) |
                            ((readUint8() & 0x3f) << 6) |
                            (readUint8() & 0x3f);
                        length -= 2;
                    } else {
                        value =
                            ((value & 0x0f) << 18) |
                            ((readUint8() & 0x3f) << 12) |
                            ((readUint8() & 0x3f) << 6) |
                            (readUint8() & 0x3f);
                        length -= 3;
                    }
                }

                if (value < 0x10000) {
                    utf16data.push(value);
                } else {
                    value -= 0x10000;
                    utf16data.push(0xd800 | (value >> 10));
                    utf16data.push(0xdc00 | (value & 0x3ff));
                }
            }
        }

        function decodeItem() {
            var initialByte = readUint8();
            var majorType = initialByte >> 5;
            var additionalInformation = initialByte & 0x1f;
            var i;
            var length;

            if (majorType === MT_FLOAT) {
                switch (additionalInformation) {
                    case 25:
                        return readFloat16();
                    case 26:
                        return readFloat32();
                    case 27:
                        return readFloat64();
                }
            }

            length = readLength(additionalInformation);
            if (length < 0 && (majorType < 2 || 6 < majorType))
                throw "Invalid length";

            switch (majorType) {
                case MT_INTEGER:
                    return length;
                case MT_NEGINTEGER:
                    return -1 - length;
                case MT_BYTES:
                    if (length < 0) {
                        // Handle indefinite length byte array
                        var elements = [];
                        var fullArrayLength = 0;
                        while ((length = readIndefiniteStringLength(majorType)) >= 0) {
                            fullArrayLength += length;
                            elements.push(readArrayBuffer(length));
                        }
                        var fullArray = new Uint8Array(fullArrayLength);
                        var fullArrayOffset = 0;
                        for (i = 0; i < elements.length; ++i) {
                            fullArray.set(elements[i], fullArrayOffset);
                            fullArrayOffset += elements[i].length;
                        }
                        return fullArray;
                    }
                    // A normal byte array
                    return readArrayBuffer(length);
                case MT_UTF8:
                    var utf16data = [];
                    if (length < 0) {
                        // Handle indefinite length utf8 strings
                        while ((length = readIndefiniteStringLength(majorType)) >= 0)
                            appendUtf16Data(utf16data, length);
                    } else {
                        // Normal utf8 strings
                        appendUtf16Data(utf16data, length);
                    }
                    return String.fromCharCode.apply(null, utf16data);
                case MT_ARRAY:
                    var retArray;
                    if (length < 0) {
                        // Handle indefinite length arrays
                        console.log("INDEFINITE LENGTH ARRAY");
                        retArray = [];
                        while (!readBreak()) retArray.push(decodeItem());
                    } else {
                        // Normal arrays
                        retArray = new Array(length);
                        for (i = 0; i < length; ++i) retArray[i] = decodeItem();
                    }
                    return retArray;
                case MT_MAP:
                    var retMap = new Map();
                    for (i = 0; i < length || (length < 0 && !readBreak()); ++i) {
                        var key = decodeItem();
                        retMap.set(key, decodeItem());
                    }
                    return retMap;
                case MT_TAG:
                    return tagger(decodeItem(), length);
                case 7:
                    switch (length) {
                        case 20:
                            return false;
                        case 21:
                            return true;
                        case 22:
                            return null;
                        case 23:
                            return undefined;
                        default:
                            return simpleValue(length);
                    }
            }
        }

        var ret = decodeItem();
        if (offset !== data.byteLength) throw "Remaining bytes";
        return ret;
    }

    static async decodeCWT(data, verify) {
        var dataView = new DataView(data);

        function decodeHeaders(protectedHeaders, unprotectedHeaders) {
            // protectedHeaders: CBOR Map, that should be decoded
            // unprotectedHeaders: a javascript Map already decoded

            // Make a copy to perform decoding
            let newProtectedHeaders = protectedHeaders.slice();
            let headers = CWT.decode(newProtectedHeaders.buffer);

            // Check if we have the algorithm in the protected header
            let alg_number = headers.get(CWT_ALG);
            if (alg_number === undefined) {
                throw "Missing algorithm in protected headers";
            }
            let alg_string = CWT_ALG_TO_JWT.get(alg_number);
            if (alg_string === undefined) {
                throw `Invalid algorithm specified: ${alg_number}`;
            }

            // Create a standard Javascript object
            let headers_obj = {};
            headers_obj["alg"] = alg_string;

            // Check for kid in protectedHeaders, otherwise in unprotectedHeaders.
            // It is an error if it is not in either
            let kid = headers.get(CWT_KID);
            if (kid === undefined) {
                // Check in unprotectedHeaders
                kid = unprotectedHeaders.get(CWT_KID);
            }
            if (kid === undefined) {
                throw "Missing kid in headers";
            }

            // Encode the kid to base64
            let kid_str = "";
            for (let i = 0; i < kid.length; i++) {
                kid_str = kid_str + String.fromCodePoint(kid[i]);
            }
            kid_str = window.btoa(kid_str);
            headers_obj["kid"] = kid_str;

            return headers_obj;
        }

        function decodePayloadAsObject(payload) {
            // Decode and flatten the objects to facilitate presentation and validation

            const CWT_ISS = 1;
            const CWT_SUB = 2;
            const CWT_AUD = 3;
            const CWT_EXP = 4;
            const CWT_NBF = 5;
            const CWT_IAT = 6;
            const CWT_CTI = 7;

            const HCERT = -260;
            const EU_DCC = 1;
            const T_VACCINATION = "v";
            const T_TEST = "t";
            const T_RECOVERY = "r";

            // Make a copy to perform decoding
            payload = payload.slice();
            let decodedPayload = CWT.decode(payload.buffer);

            payload = {};

            for (let [key, value] of decodedPayload) {
                switch (key) {
                    case CWT_ISS:
                        payload["iss"] = value;
                        break;
                    case CWT_SUB:
                        payload["sub"] = value;
                        break;
                    case CWT_AUD:
                        payload["aud"] = value;
                        break;
                    case CWT_EXP:
                        payload["exp"] = value;
                        break;
                    case CWT_NBF:
                        payload["nbf"] = value;
                        break;
                    case CWT_IAT:
                        payload["iat"] = value;
                        break;
                    case CWT_CTI:
                        payload["cti"] = value;
                        break;

                    default:
                        break;
                }
            }

            // Check for HCERT in payload
            let hcert = decodedPayload.get(HCERT);
            if (hcert == undefined) {
                throw "No hcert found";
            }

            // Check for EU COVID certificate inside HCERT
            let euCovid = hcert.get(EU_DCC);
            if (euCovid == undefined) {
                throw "No EU COVID certificate found";
            }

            // Common fields
            try {
                // Schema version
                payload["version"] = euCovid.get("ver");

                // The patient name
                payload["foreName"] = euCovid.get("nam").get("fn");
                payload["givenName"] = euCovid.get("nam").get("gn");
                payload["fullName"] = payload["foreName"] + ", " + payload["givenName"];

                // Date of birth
                payload["dateOfBirth"] = euCovid.get("dob");
            } catch (error) {
                throw `Error accessing required common fields: ${error}`;
            }

            // Access the hcert depending on its type "v", "r", "t"
            let c;
            if (euCovid.get("v")) {
                payload["certType"] = T_VACCINATION;
                c = euCovid.get("v")[0];
            } else if (euCovid.get("r")) {
                payload["certType"] = T_RECOVERY;
                c = euCovid.get("r")[0];
            } else if (euCovid.get("t")) {
                payload["certType"] = T_TEST;
                c = euCovid.get("t")[0];
            } else {
                throw `Invalid EU COVID certificate type`;
            }

            // Process each type of certificate
            if (payload["certType"] === T_VACCINATION) {

                payload["diseaseTargeted"] = vs.get(c.get("tg"), "disease-agent-targeted");
                payload["vaccineProphylaxis"] = vs.get(c.get("vp"), "vaccine-prophylaxis")
                payload["medicinalProduct"] = vs.get(c.get("mp"), "vaccine-medicinal-product")
                payload["manufacturer"] = vs.get(c.get("ma"), "vaccine-mah-manf")

                payload["doseNumber"] = c.get("dn");
                payload["doseTotal"] = c.get("sd");
                payload["dateVaccination"] = c.get("dt");

                payload["country"] = vs.get(c.get("co"), "country-2-codes")
                payload["certificateIssuer"] = c.get("is");
                payload["uniqueIdentifier"] = c.get("ci");

            } else if (payload["certType"] === T_TEST) {

                payload["diseaseTargeted"] = vs.get(c.get("tg"), "disease-agent-targeted");
                payload["typeTest"] = vs.get(c.get("tt"), "test-type");
                payload["testName"] = c.get("nm");
                payload["manufacturer"] = vs.get(c.get("ma"), "test-manf")
                payload["timeSample"] = c.get("sc");
                payload["testResult"] = vs.get(c.get("tr"), "test-result")
                payload["testingCentre"] = c.get("tc");

                payload["country"] = vs.get(c.get("co"), "country-2-codes")
                payload["certificateIssuer"] = c.get("is");
                payload["uniqueIdentifier"] = c.get("ci");

            } else if (payload["certType"] === T_RECOVERY) {

                payload["diseaseTargeted"] = vs.get(c.get("tg"), "disease-agent-targeted");
                payload["datePositive"] = c.get("fr");
                payload["dateFrom"] = c.get("df");
                payload["dateUntil"] = c.get("du");

                payload["country"] = vs.get(c.get("co"), "country-2-codes")
                payload["certificateIssuer"] = c.get("is");
                payload["uniqueIdentifier"] = c.get("ci");

            }

            return payload;
        }

        function decodePayload(payload) {
            const CWT_ISS = 1;
            const CWT_SUB = 2;
            const CWT_AUD = 3;
            const CWT_EXP = 4;
            const CWT_NBF = 5;
            const CWT_IAT = 6;
            const CWT_CTI = 7;

            // Make a copy to perform decoding
            payload = payload.slice();
            let decodedPayload = CWT.decode(payload.buffer);

            payload = new Map();

            for (let [key, value] of decodedPayload) {
                switch (key) {
                    case CWT_ISS:
                        payload.set("iss", value);
                        break;
                    case CWT_SUB:
                        payload.set("sub", value);
                        break;
                    case CWT_AUD:
                        payload.set("aud", value);
                        break;
                    case CWT_EXP:
                        payload.set("exp", value);
                        break;
                    case CWT_NBF:
                        payload.set("nbf", value);
                        break;
                    case CWT_IAT:
                        payload.set("iat", value);
                        break;
                    case CWT_CTI:
                        payload.set("cti", value);
                        break;

                    default:
                        break;
                }
            }

            // Check for HCERT in payload
            let hcert = decodedPayload.get(HCERT);
            if (hcert == undefined) {
                throw "No hcert found";
            }

            // Check for EU COVID certificate inside HCERT
            let euCovid = hcert.get(1);
            if (euCovid == undefined) {
                throw "No EU COVID certificate found";
            }

            let euCovidMap = new Map();
            euCovidMap.set("euCovid", euCovid);

            payload.set("hcert", euCovidMap);

            return payload;
        }

        // Get the initial byte to check for a COSE Tag
        // Every COSE object should start with a TAG
        var initialByte = dataView.getUint8(0);
        var mt = initialByte >> 5;
        var additionalInformation = initialByte & 0x1f;

        // As per RFC-8152, the COSE object may be tagged or untagged. We accept both
        // COSE_Sign1_Tagged = #6.18(COSE_Sign1)
        if (mt == MT_TAG) {
            // This is a tagged structure.
            // Then the object should start with a COSE_Sign1 Tag
            if (additionalInformation != COSE_Sign1) {
                throw new Error(
                    `Not a COSE Single signature, tag: ${additionalInformation}`
                );
            }

            // Get rid of the tag for further processing
            data = data.slice(1);
        }

        // Decode the object into an Array with 4 elements
        let [protectedHeaders, unprotectedHeaders, payload, signature] =
            CWT.decode(data);

        // Decode and join the headers, protected and unprotected
        let headers = decodeHeaders(protectedHeaders, unprotectedHeaders);

        // The flag indicating result of verification (if done)
        let verified = false;

        if (verify) {
            // Get the kid from the header (can be in protected and in unprotected)
            let kid = headers["kid"];

            let k = await getTrustedKey(kid)
            if (k !== undefined) {

                if (k.list === "EU_PRO") {

                    // Create the native public key
                    console.log(k)
                    let verificationKey = await DGCKey.fromJWK(k.publicKey);
    
                    // Verify the CWT with the verification key
                    verified = await CWT.verifyCWT(data, verificationKey);
    
                } else if (k.list === "UK_PRO") {
    
                    // Create the native public key
                    let verificationKey = await DGCKey.fromSPKI(k.publicKey)
    
                    // Verify the CWT with the verification key
                    verified = await CWT.verifyCWT(data, verificationKey);
    
                } else if (k.list === "EU_PREPRODUCTION") {
    
                    // Signal that the list is in PRE
                    verified = "PRE"
                }
    
            }

        }

        // Decode the payload
        payload = decodePayloadAsObject(payload);
        console.log("Payload:", payload);

        return [headers, payload, signature, verified];
    }

    // Decodes a HC1 QR and optionally verifies the signature
    static async decodeHC1QR(data, verify = false) {
        // data: string obtained for example from a QR scan

        // Check if the string is a HC1 certificate
        if (!data.startsWith("HC1:")) {
            throw new Error("Certificate does not start with 'HC1:'");
        }

        // Remove the leading 4 chars: "HC1:"
        data = data.slice(4);

        // First decode from Base45
        let cvdCompressed = decodeB45(data);
        cvdCompressed = new Uint8Array(cvdCompressed);

        // cvdCompressed is the ZLIB-compressed CVD in CWT(COSE/CBOR) format
        let coseCVD = inflate(cvdCompressed);

        // coseCVD is the CWT-encoded CVD
        let [headers, payload, signature, verified] = await CWT.decodeCWT(
            coseCVD.buffer,
            verify
        );

        return [headers, payload, signature, verified];
    }

    static displayMB(ib) {
        var majorType = ib >> 5;
        var additionalInformation = ib & 0x1f;
        var i;
        var length = additionalInformation;

        if (majorType === MT_FLOAT) {
            console.log("FLOAT");
        }

        switch (majorType) {
            case MT_INTEGER:
                console.log(`Integer ${length}`);
                return;
            case MT_NEGINTEGER:
                console.log(`Negative Integer ${-1 - length}`);
                return;
            case MT_BYTES:
                console.log(`Bstr ${length}`);
                return `Bstr ${length}`;
            case MT_UTF8:
                console.log(`String ${length}`);
                return;
            case MT_ARRAY:
                console.log(`Array ${length}`);
                return;
            case MT_MAP:
                console.log(`Map ${length}`);
                return;
            case MT_TAG:
                console.log(`Tag ${length}`);
                return;
            case 7:
                switch (length) {
                    case 20:
                        console.log(`FALSE`);
                        return;
                    case 21:
                        console.log(`TRUE`);
                        return;
                    case 22:
                        console.log(`NULL`);
                        return;
                    case 23:
                        console.log(`UNDEFINED`);
                        return;
                    default:
                        console.log(`Simple Value`);
                        return;
                }
        }
    }

}

export class HCERT {
    constructor() { }

    static async renderSummary(key, cred) {
        // The credential

        // Decode credential without verification
        let hcert = await CWT.decodeHC1QR(
            cred["encoded"],
            false
        );

        // Get the payload part
        let payload = hcert[1];
        console.log("renderSummary", cred)

        // Calculate the display name and date for the card
        let displayName = "Unrecognized";
        let cred_date = "Unrecognized";

        if (payload["certType"] == "v") {
            displayName = "EU COVID VACCINATION";
            cred_date = payload.dateVaccination;
        } else if (payload["certType"] == "t") {
            displayName = "EU COVID TEST";
            cred_date = payload.timeSample;
        } else if (payload["certType"] == "r") {
            displayName = "EU COVID RECOVERY";
            cred_date = payload.dateFrom;
        }

        // Render the HTML
        let html = `
        <div class="card my-3 shadow">
            <a onclick="displayCredentialFromKey('${key}')">
            <div class="card-body">
                <h5 class="card-title">${payload.fullName}</h5>
                <p>${displayName}</p>
                <p>${cred_date}</p>
            </div>
            </a>
        </div>
        `;

        return html;
    }

}
