import { Router, Request, Response } from 'express';
import { FeedItem } from '../models/FeedItem';
import { requireAuth } from '../../users/routes/auth.router';
import * as AWS from '../../../../aws';

const router: Router = Router();

// Get all feed items
router.get('/', async (req: Request, res: Response) => {
    const items = await FeedItem.findAndCountAll({ order: [['id', 'DESC']] });
    items.rows.map((item) => {
        if (item.url) {
            item.url = AWS.getGetSignedUrl(item.url);
        }
    });
    res.send(items);
});

//@TODO
//Add an endpoint to GET a specific resource by Primary Key
router.get("/:id",
    // requireAuth,
    async (req: Request, res: Response) => {
        let { id } = req.params;
        console.log(id);
        const item = await FeedItem.findByPk(id);

        if (!item) {
            res.status(500).send("Invalid Id");
        }

        const signedUrl = AWS.getGetSignedUrl(item.url);
        item.url = signedUrl;
        res.status(200).send(item);
    })

// update a specific resource
router.patch('/:id',
    requireAuth,
    async (req: Request, res: Response) => {
        //@TODO try it yourselfx
        let { id } = req.params;
        const item = await FeedItem.findByPk(id);

        const caption = req.body.caption;  
        const url = req.body.url;

        if (!caption && !url) {
            res.status(500).send("At least one resource must be updated")
        }

        if (caption) {
            item.set("caption", caption);
        }

        if (url) {
            item.set("url", url);
        }

        const updated_item = await item.save();

        updated_item.url = AWS.getGetSignedUrl(updated_item.url);
        res.status(201).send(updated_item);
    });


// Get a signed url to put a new item in the bucket
router.get('/signed-url/:fileName',
    requireAuth,
    async (req: Request, res: Response) => {
        let { fileName } = req.params;
        const url = AWS.getPutSignedUrl(fileName);
        res.status(201).send({ url: url });
    });

// Post meta data and the filename after a file is uploaded 
// NOTE the file name is they key name in the s3 bucket.
// body : {caption: string, fileName: string};
router.post('/',
    requireAuth,
    async (req: Request, res: Response) => {
        const caption = req.body.caption;
        const fileName = req.body.url;

        // check Caption is valid
        if (!caption) {
            return res.status(400).send({ message: 'Caption is required or malformed' });
        }

        // check Filename is valid
        if (!fileName) {
            return res.status(400).send({ message: 'File url is required' });
        }

        const item = await new FeedItem({
            caption: caption,
            url: fileName
        });

        const saved_item = await item.save();

        saved_item.url = AWS.getGetSignedUrl(saved_item.url);
        res.status(201).send(saved_item);
    });

export const FeedRouter: Router = router;