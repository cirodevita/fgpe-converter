const unzipper = require("unzipper");
const fs = require("fs");

let config = require('./config');
let builder = require('xmlbuilder');

exports.yapexil2mef = function(path, debug=false) {
    let file = fs.createReadStream(path);
    this.yapexil2mefStream(file,debug);
}

exports.yapexil2mefStream = async function (file, debug=false) {
    let metadata_flag = false; //Search for metadata.json file
    const main_folder = 'mef/';
    let folders = config.folders;
    let informations = config.temp_info; //Used to store temp informations to compose Content.xml

    if(debug)
        console.log("START UNZIPPING ...");

    file
        .pipe(unzipper.Parse())
        .on('entry', async function (entry) {

            const data_raw = await entry.buffer();
            let file = await getFilesInfo(entry.path);

            for (const x in folders){
                let folder = folders[x];
                if (file.folder === folder.name){ //If FILE is in some FOLDERS
                    if(file.name !== 'metadata.json'){

                        //Search for EMBEDDABLES folder
                        if(file.folder === "embeddables"){
                            if(config.imageExtensions.includes(file.extension)){
                                 fs.mkdir(main_folder + folder.mef_img, { recursive: true }, (err) => {
                                    if (err) throw err;
                                });
                                 entry.pipe(fs.createWriteStream(main_folder + folder.mef_img + file.name))
                                     .on('finish', function () {
                                         informations['images'].push(file.name);
                                         if(debug)
                                             console.log(main_folder + folder.mef_img + file.name);
                                     });

                            }
                            else{
                                fs.mkdir(main_folder + folder.mef_other, { recursive: true }, (err) => {
                                    if (err) throw err;
                                });
                                entry.pipe(fs.createWriteStream(main_folder + folder.mef_other + file.name));
                                informations['problem_root'].push(file.name);

                                if(debug)
                                    console.log(main_folder + folder.mef_other + file.name);
                                }
                        }
                        else{
                            //Save STATEMENT file's path
                            if(config.statementExtensions.includes(file.extension))
                                informations['statement'] = file.name;
                            else
                                informations[file.folder].push(file.name);

                            fs.mkdir(main_folder + folder.mef, { recursive: true }, (err) => {
                                if (err) throw err;
                            });
                            entry.pipe(fs.createWriteStream(main_folder + folder.mef + file.name));

                            if(debug)
                                console.log(main_folder + folder.mef + file.name);
                            }
                    }

                }

            }
            //Search for METADATA.JSON
            if(file.folder === 'metadata.json' && file.name === 'metadata.json'){
                metadata_flag = true;
                informations['metadata'] = JSON.parse(data_raw.toString()); //Save METADATA

                if(debug)
                    console.log(main_folder + file.name);
            }

            entry.autodrain(); //Load next file

        }).on('finish',async function (finish){
        if(metadata_flag)
            console.log(informations);
        else
            console.error("No metadata.json file found!");
    });

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