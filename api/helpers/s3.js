import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';

const region = process.env.S3_BUCKET_REGION
const bucketName = process.env.S3_BUCKET
//const keyName = 'goku.png'

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: region
})

const imageData = fs.readFileSync(path.resolve("./api/img/goku.png"))

export const uploadFile = async (keyName) => {
    try {

        const params = {
            Bucket: process.env.S3_BUCKET,
            Key: keyName,
            Body: imageData
        };
        
        return s3.upload(params, (err, data) => {
            if (err) { console.error(err) }
            else { console.log(`image Uploaded Successfully at ${data.Location}`) }
        })

    } catch (err) {
        console.error(err)
    }
}