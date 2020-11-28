const unzipper = require("unzipper");
const fs = require("fs");

let config = require('./config');

exports.yapexil2mef = function(path) {
    let file = fs.createReadStream(path);
    this.yapexil2mefStream(file);
}
//TODO Write on file!!
exports.yapexil2mefStream = async function (file) {
    file
        .pipe(unzipper.Parse())
        .on('entry', function (entry) {

            let folders = config.folders;
            const main_folder = 'yapexil/'

            for (const x in folders){
                let folder = folders[x];
                let file = getFilesInfo(entry.path);
                if (file.folder === folder.name){ //If FILE is in some FOLDERS
                    if(file.name !== 'metadata.json'){

                        if(file.folder === "embeddables"){
                            if(config.imageExtensions.includes(file.extension)){
                                console.log(main_folder + folder.mef_img + file.name);
                                //entry.pipe(fs.createWriteStream(main_folder + folder.mef_img + file.name));

                            }
                            else{
                                console.log(main_folder + folder.mef_other + file.name);
                                //entry.pipe(fs.createWriteStream(main_folder + folder.mef_other + file.name));

                            }
                        }
                        else{
                            const content =  entry.buffer();
                            console.log(main_folder + folder.mef + file.name);

                            //entry.pipe(
                            //    fs.writeFile('test',content)
                            //
                            //entry.pipe(fs.createWriteStream(main_folder + folder.mef + file.name));
                        }
                    }

                }
                else{
                }
            }
            entry.autodrain(); //Load next file

        });
        /*
        .pipe(etl.map(async entry => {
            //SEARCH FOLDERS
            let folders = config.folders;
            console.log(entry.path);

            for (const x in folders){
                let folder = folders[x];
                let file = getFilesInfo(entry.path);
                if (file.folder === folder.name){ //If FILE is in some FOLDERS
                    if(file.name !== 'metadata.json'){

                        if(file.folder === "embeddables"){
                            console.log("EMB");
                            if(file.extension.match(config.imageExtensions)){
                                console.log(folder.mef_img + file.name);
                            }
                            else{
                                console.log(folder.mef_other + file.name);

                            }
                        }
                        //console.log(folder.mef + file.name);
                    }

                }
                else{
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


        }))

         */
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