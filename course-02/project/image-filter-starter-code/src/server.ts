import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles, initFilesDeletion } from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  app.get('/filteredimage', async (req:Request, res:Response) => {

    //get image url from request
    let image_url = req.query.image_url;

    // validate the image_url query
    if (!image_url) {
      return res.status(400).send({ message: 'Imageurl is required' });
    }

    console.log("image url exist", image_url);

    // check if url is valid and starts with http or https
    if (!(image_url.startsWith('https://') || image_url.startsWith("http://"))) {
      return res.status(400).send({ message: 'Imageurl is invalid, should starts with https:// or http://' });
    }

    console.log("image url is valid, starts with http...", image_url);

    try {

      //call filterImageFromURL(image_url) to filter the image
      const imagePath: string = await filterImageFromURL(image_url);

      //after image is processed
      console.log("Image processed successful");

      //send the resulting file in the response
      return res.status(200).sendFile(imagePath);

    } catch (err) {

      //catch error and return response
      return res.status(422).send({ message: `Unable to prooccess request, failed with error: ${err}` });

    } finally {
      console.log("Starting local files deletion");

      //deletes any files on the server on finish of the response
      initFilesDeletion();
    }
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  });


  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();