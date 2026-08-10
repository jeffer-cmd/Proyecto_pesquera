const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({


    destination:(req,file,cb)=>{


        cb(
            null,
            "uploads/"
        );


    },


    filename:(req,file,cb)=>{


        cb(
            null,
            "backup-restaurar-" +
            Date.now() +
            path.extname(file.originalname)
        );


    }


});



const uploadBackup =
    multer({

        storage,

        fileFilter:(req,file,cb)=>{


            if(
                path.extname(file.originalname)
                !== ".json"
            ){

                return cb(
                    new Error(
                        "Solo se permiten archivos JSON"
                    )
                );

            }


            cb(null,true);


        }


    });



module.exports =
    uploadBackup;