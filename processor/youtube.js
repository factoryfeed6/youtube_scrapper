const { google } = require('googleapis');
const { channelId } = require('@gonetone/get-youtube-id-by-url');
const model = require('../models/scrapping');
const modelBusinesses = require('../models/businesses');
const s3Service = require('../service/aws'); // Import the S3 service module
const ytdl = require('youtube-dl-exec');
const fs = require('fs');
const db = require('../service/pgService');


const API_KEY = 'AIzaSyCjsvjo-yqKxHwV0cXnXSqKYy9En4C4-rM';
const youtube = google.youtube({ version: 'v3', auth: API_KEY });

async function getVideos(channelId) {
  try {
    const searchResponse = await youtube.search.list({
      part: 'snippet',
      channelId: channelId,
      maxResults: 10,
      type: 'video',
      order: 'date'
    });

    const videoIds = searchResponse.data.items.map(item => item.id.videoId);

    const videosResponse = await youtube.videos.list({
      part: 'snippet,contentDetails',
      id: videoIds.join(',')
    });

    return videosResponse.data.items.map(item => {
      const videoUrl = `https://www.youtube.com/watch?v=${item.id}`;
      const isShort = item.snippet.thumbnails.default.url.includes('/shorts/'); // Determine if it's a short
      const uploadedAt = item.snippet.publishedAt; // Get the upload time

      return {
        title: item.snippet.title,
        description: item.snippet.description,
        duration: item.contentDetails.duration,
        uploadedAt: uploadedAt, // Include the upload time
        url: videoUrl,
        thumbnailUrl: item.snippet.thumbnails.high.url,
        type: isShort ? 'short' : 'normal' // Add type as 'short' or 'normal'
      };
    });
  } catch (error) {
    console.error('Error fetching video data:', error);
    return [];
  }
}

async function downloadVideo(video, businessId) {
    try {
      const videoFileName = video.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.mp4';
      const downloadedFilePath = `./${businessId}/videos/${videoFileName}`;
  
      await ytdl(video.url, {
        format: 'worst[ext=mp4]',
        output: downloadedFilePath
      });
  
      console.log(`Downloaded video: ${video.title}`);
      return downloadedFilePath;
    } catch (error) {
      console.error(`Error downloading video: ${error}`);
      return null;
    }
  }
  

  async function getVideosAndUpload(channelId, businessId, scrappingJobId) {
    const videoData = await getVideos(channelId);
    for (const video of videoData) {
      console.log(video.url , 'url')
      console.log(video.type , 'tyoe')

      // Download the video 
      const downloadedFilePath = await downloadVideo(video, businessId);
  
      if (downloadedFilePath) {
        // Upload the downloaded video to S3
        // Here, pass the downloadedFilePath instead of the video title
        const s3VideoUrl = await s3Service.uploadVideoToS3(downloadedFilePath, businessId);
        if (s3VideoUrl) {
          // Create video record with the S3 URL
          await model.createVideos(businessId, scrappingJobId, video.title, video.description, video.duration, s3VideoUrl, downloadedFilePath , video.thumbnailUrl , video.uploadedAt , video.type);
  
          // Delete the downloaded video from local storage after successful upload to S3
          fs.unlinkSync(downloadedFilePath);
          console.log(`Deleted video from local storage: ${downloadedFilePath}`);
        }
      }
    }
  
    // Update the scraping job status after completion
    await db.executeSql(`UPDATE scraping_jobs SET status = 'completed' WHERE id = $1`, [scrappingJobId]);
  }
  

async function getChannelId(channelUrl) {
  return new Promise((resolve, reject) => {
    channelId(channelUrl)
      .then(id => {
        console.log(id, 'youtube id');
        resolve(id);
      })
      .catch(error => {
        console.error(error);
        reject(error);
      });
  });
};

exports.youtubeScrapper = async function (businessIds) {
  for (let i = 0; i < businessIds.length; i++) {
    const businessId = businessIds[i];
    console.log(businessId, 'businessids')
    const getChannels = await modelBusinesses.getYoutubeLinkFromBusinessIds(businessId);
    for (let j = 0; j < getChannels.length; j++) {
      const channelUrl = getChannels[j].youtube_link;
      console.log(channelUrl, 'url')
      try {
        const channelId = await getChannelId(channelUrl);
        const scrappIdId = await model.createScrappingJobs(businessId, 'old', null);
        console.log(scrappIdId, 'ids');

        await getVideosAndUpload(channelId, businessId, scrappIdId);

      } catch (error) {
        console.error(`Error processing channel: ${channelUrl}`, error);
      }
    }
  }
};
