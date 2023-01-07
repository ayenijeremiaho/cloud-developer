import fs from "fs";
import path from "path"
import Jimp = require("jimp");

// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
export async function filterImageFromURL(inputURL: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {

      const photo = await Jimp.read(inputURL);
      const outpath =
        "/tmp/filtered." + Math.floor(Math.random() * 2000) + ".jpg";
      await photo
        .resize(256, 256) // resize
        .quality(60) // set JPEG quality
        .greyscale() // set greyscale
        .write(__dirname + outpath, (img) => {
          resolve(__dirname + outpath);
        });
    } catch (error) {
      console.log("An error occurred while processing image download ", error)
      reject(error);
    }
  });
}

// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export async function deleteLocalFiles(files: Array<string>) {
  for (let file of files) {
    fs.unlinkSync(file);
  }
}


export function initFilesDeletion() {
  const fullPath = path.join(__dirname, 'tmp')

  console.log("folder path", fullPath);
  fs.readdir(fullPath, (error, files) => {
    if (error) {
      console.log("No file exist");
      return
    }

    console.log("Preparing file(s) to delete...");

    let filesList: Array<string> = files.map(file => path.join(fullPath, file))

    console.log("File(s) to delete prepared", filesList);

    deleteLocalFiles(filesList);

    console.log("Files deleted successfully");

  })
}
