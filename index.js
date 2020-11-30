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
    let temp_test = config.temp_test;

    if(debug)
        console.log("START UNZIPPING ...");

    file
        .pipe(unzipper.Parse())
        .on('entry', async function (entry) {

            if(entry.path[0] !== '_' && !entry.path.includes('.DS_Store')){
                const data_raw = await entry.buffer();
                let file = await getFilesInfo(entry.path);
                //console.log(file.name, file.folder);


                for (const x in folders){
                    let folder = folders[x];
                    if (file.folder === folder.name){ //If FILE is in some FOLDERS
                        if(file.name !== 'metadata.json'){

                            //Search for EMBEDDABLES folder
                            if(file.folder === "embeddables"){

                                if(config.imageExtensions.includes(file.extension)){
                                    await fs.mkdir(main_folder + folder.mef_img, { recursive: true }, async(err) => {
                                        if (err) throw err;
                                        await fs.writeFile(main_folder + folder.mef_img + file.name,data_raw, function () {
                                            informations['images'].push(file.name);
                                            if(debug)
                                                console.log(main_folder + folder.mef_img + file.name);
                                        })

                                    });


                                }
                                else{
                                    await fs.mkdir(main_folder + folder.mef_other, { recursive: true }, (err) => {
                                        if (err) throw err;
                                        fs.writeFile(main_folder + folder.mef_other + file.name,data_raw, function () {
                                            informations['problem_root'].push(file.name);
                                            if(debug)
                                                console.log(main_folder + folder.mef_other + file.name);

                                        });

                                    });

                                }
                            }
                            else{
                                //Save STATEMENT file's path


                                await fs.mkdir(main_folder + folder.mef, { recursive: true }, async (err) => {
                                    if (err) throw err;
                                    await fs.writeFile(main_folder + folder.mef + file.name,data_raw, function () {
                                        if(file.extension !== undefined){
                                            if(config.statementExtensions.includes(file.extension)) //SEARCH FOR HTML, PDF, DOCS  statements
                                                informations['statement'] = file.name;

                                            else if (file.folder === 'tests'){
                                                console.log(file.nextfolder);
                                                console.log(file.name);
                                                //TODO CONTINUA QUI ...
                                                let x;

                                                if(file.name.includes('in'))
                                                    if(temp_test[file.nextfolder]['out'] !== undefined )
                                                        x = {in: file.name, out: temp_test[file.nextfolder]['out']};
                                                    else
                                                        x = {in: file.name, out: ''};
                                                else
                                                    if(temp_test[file.nextfolder]['in'] !== undefined )
                                                        x = {in: temp_test[file.nextfolder]['in'], out: file.name};
                                                    else
                                                        x = {in: '', out: file.name};

                                                temp_test[file.nextfolder] = x;


                                                if(file.folder !== undefined)
                                                    informations[file.folder].push(file.name);

                                            }
                                            else{
                                                if(file.folder !== undefined)
                                                    informations[file.folder].push(file.name);
                                            }


                                            if(debug)
                                                console.log(main_folder + folder.mef + file.name);
                                        }



                                    });

                                });

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

            }
        })
        .on('finish',async function (finish){
            console.log(finish);
            if(metadata_flag)
                console.log(temp_test);
            else
                console.error("No metadata.json file found!");
        });

}

getFilesInfo = function (fileName){
    let extension = fileName.split(".")[1];

    let temp_name = fileName.split("/");
    let name = temp_name[temp_name.length-1];
    //console.log(name);
    //console.log(temp_name[0]);

    return {
        name: name,
        extension: extension,
        folder:temp_name[0],
        nextfolder: temp_name[1],
        fullPath: fileName
    }

}