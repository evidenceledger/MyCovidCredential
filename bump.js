const fs = require('fs');

const versionFileName = "src/version.txt"

var text = Date()
console.log("Version:", text)

fs.writeFileSync(versionFileName, text)