const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path')

AWS.config.update({
  accessKeyId: 'AKIAUZUPLCMA6C77WFXI',
  secretAccessKey: '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',
  region: 'eu-north-1'
});

const s3 = new AWS.S3();

// Function to upload video to S3
// Function to upload video to S3

async function uploadVideoToS3(filePath, businessId) {
  try {
    const videoFileName = path.basename(filePath); // Extract file name from the path
    const params = {
      Bucket: 'fc-video-bucket',
      Key: `${businessId}/${videoFileName}`,
      Body: fs.createReadStream(filePath)
    };

    await s3.upload(params).promise();

    console.log(`Uploaded video to S3: ${videoFileName}`);
    return `https://fc-video-bucket.s3.eu-north-1.amazonaws.com/${businessId}/videos/${videoFileName}`;
  } catch (error) {
    console.error(`Error uploading video to S3: ${error}`);
    return null;
  }
}



module.exports = {
  uploadVideoToS3,
};

