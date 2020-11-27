const unzipper = require("unzipper");
const fs = require("fs");

exports.yapexil2mef = function(path) {
    let file = fs.createReadStream(path);
    this.yapexil2mefStream(file);
}

exports.yapexil2mefStream = async function (file) {
    const zip = file.pipe(unzipper.Parse({forceStream: true}));

    for await (const entry of zip) {
        const fileName = entry.path;
        const type = entry.type; // 'Directory' or 'File'

        if (fileName === "metadata.json"){
            console.log(entry);
        }
    }
}