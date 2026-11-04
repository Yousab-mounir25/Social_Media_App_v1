import multer from "multer";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileTypeFromBuffer } from "file-type";
import { BadRequestException } from "../../exception/domain.exception.js";
import { Request } from "express";
import { StorageApproachEnum } from "../../enum/multer.enum.js";
import { tmpdir } from "node:os";
import { readFileSync } from "node:fs";

export const fileValidation = {
  image: ["image/jpeg", "image/png", "image/gif"],
  files: ["application/pdf", "application/json"],
};
export const localFileUpload = ({ maxSize = 5 , storageApproach=StorageApproachEnum.MEMORY } : {maxSize?:number , storageApproach?:StorageApproachEnum}) => {
  //   const storage = multer.diskStorage({
  //     destination: function (req, file, cb) {
  //       cb(null, "./assets");
  //     },
  //     file: function (req, file, cb) {
  //       console.log({ file });
  //       cb(null, randomUUID() + file.originalname);
  //     },
  //   });
  //     function fileFilter(req, file, cb) {
  //     if (validation.includes(file.mimetype)) {
  //       cb(null, true); //true --> ba2olo ro7 khazenha
  //     } else {
  //       cb(new Error("invalid format", { cause: { status: 400 } }), false);
  //     }
  //   }

  const storage = storageApproach==StorageApproachEnum.MEMORY? multer.memoryStorage() : multer.diskStorage({
    destination(req,file,callback){
      callback(null , tmpdir()) // windows+R
    },
    filename(req,file,callback){
      callback(null , randomUUID()+file.originalname)
    }
  })

  return multer({
    storage,
    limits: { fileSize: maxSize * 1024 * 1024 },
  });
};

//Joker function
export const processFile = async ({
  customPath = "general",
  file,
  validation 
}:{customPath?:string, file:Express.Multer.File, validation:string[]}) => {

  if(file.path){
    file.buffer = await readFile(file.path)
  }

  const result = await fileTypeFromBuffer(file.buffer);
  // console.log({ result });
  if (!result || !validation.includes(result.mime)) {
    await unlink(file.path);
    throw new BadRequestException("invalid file formats");
  } else {
    await mkdir(resolve(`./assets/${customPath}`), { recursive: true });
    const uniqueFilePath = `assets/${customPath}/${randomUUID()}.${result.ext}`;
    await writeFile(resolve(`./${uniqueFilePath}`), file.buffer);
    if(file.path) {
      await unlink(file.path);
    }
    file.path = uniqueFilePath;
  }
  return file;
};

//this function is used to process multiple files in an array
export const processFiles = async ({
  customPath = "general",
  files ,
  validation 
}:{customPath?:string, files:Express.Multer.File[], validation:string[]}) => {
  const assets = [];
  for (const file of files) {
    const uploadFile = await processFile({ customPath, file, validation });
    assets.push(uploadFile);
  }
  return assets;
};
export const processFields = async ({
  customPath="general",
  fields ,
  validation ,
}:{customPath?:string, fields:Record<string, Express.Multer.File[]>, validation:string[]}) => {
  const assets = [];
  for (const field of Object.keys(fields)) {
    const files = await processFiles({
      customPath,
      files: fields[field] as Express.Multer.File[],
      validation,
    });
    assets.push({ field, files });
  }
  return assets;
};
export const processMulterUpload = async ({
  req,
  customPath = "general",
  isRequired=true,
  validation = [],
}:{ req:Request, isRequired?:boolean,customPath?:string, validation:string[]}) => {

  if(
    isRequired && 
    (
      !req.file
      &&
      !(Array.isArray(req.files)&& req.files?.length)
      &&
      !(typeof req.files =="object" && Object.keys(req.files))
    )
  ){
    throw new BadRequestException("file is required")
  }

  if (req.file) {
    await processFile({ customPath, file: req.file, validation });
  } else if (Array.isArray(req.files)) {
    await processFiles({ customPath, files: req.files, validation });
  } else if (typeof req.files == "object" && Object.keys(req.files)?.length) {
    await processFields({ customPath, fields: req.files, validation });
  }
};



// export const processFile = ({validation=[]})=>{
//     return async (req,res,next)=>{
//         const filePath = resolve(`./${req.file.path}`)
//         console.log({f:req.file , filePath})
//         const fileBuffer = await readFile(filePath)
//         console.log({fileBuffer})
//         const result = await fileTypeFromBuffer(fileBuffer)
//         console.log({result})

//         if(!result || !validation.includes(result.mime)){
//             next(new Error("invalid file fromats" , {cause:{status:400}}))
//         }

//         next()
//     }
// }
