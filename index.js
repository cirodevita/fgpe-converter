const unzipper = require("unzipper");
const fs = require("fs");
let stream = require('stream');
const readline = require('readline');
const etl = require("etl");

let config = require('./config');

exports.yapexil2mef = function(path) {
    let file = fs.createReadStream(path);
    this.yapexil2mefStream(file);
}

exports.yapexil2mefStream = async function (file) {
    file
        .pipe(unzipper.Parse())
        .pipe(etl.map(async entry => {
            //SEARCH FOLDERS
            let folders = config.folders;

            for (const x in folders){
                let folder = folders[x];
                let file = getFilesInfo(entry.path);

                if ((file.fullPath).match(folder.yapexil)){ //If FILE is in some FOLDERS
                    console.log(file);
                }
            }
            /*
            if (entry.path === "metadata.json") {
                const content = await entry.buffer();
                let str = content.toString();
                console.log(JSON.parse(str));



                //await fs.writeFile('output/path',content); //Usare alla fine per scrivere il file MEF
            }
            else {
                entry.autodrain();
            }

             */
        }))
}

getFilesInfo = function (fileName){
    let extension = fileName.split(".")[1];

    let temp_name = fileName.split("/");
    let name = temp_name[temp_name.length-1];

    return {
        name: name,
        extension: extension,
        folder:temp_name[0],
        fullPath: fileName
    }

}