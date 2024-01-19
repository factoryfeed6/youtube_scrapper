const { google } = require('googleapis');
const ytdl = require('youtube-dl-exec');
const fs = require('fs');
const https = require('https');
const { channelId } = require('@gonetone/get-youtube-id-by-url');
const model = require('../models/businesses');

const API_KEY = 'AIzaSyB3_Xk37iC2o_GOwvuVqEBq59KJ_33_-cM';
const youtube = google.youtube({ version: 'v3', auth: API_KEY });

async function getVideos(channelId) {
    try {
        const searchResponse = await youtube.search.list({
            part: 'snippet',
            channelId: channelId,
            maxResults: 50,
            type: 'video',
            order: 'date'
        });

        const videoIds = searchResponse.data.items.map(item => item.id.videoId);

        const videosResponse = await youtube.videos.list({
            part: 'snippet,contentDetails',
            id: videoIds.join(',')
        });

        return videosResponse.data.items.map(item => ({
            title: item.snippet.title,
            description: item.snippet.description,
            duration: item.contentDetails.duration,
            url: `https://www.youtube.com/watch?v=${item.id}`,
            thumbnailUrl: item.snippet.thumbnails.high.url
        }));
    } catch (error) {
        console.error('Error fetching video data:', error);
        return [];
    }
}

async function downloadVideo(video , businessId) {
    try {
        const videoFileName = video.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.mp4';
        await ytdl(video.url, {
            format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            output: `.${businessId}/videos/${videoFileName}`
        });
        console.log(`Downloaded video: ${video.title}`);
    } catch (error) {
        console.error(`Error downloading video: ${error}`);
    }
}

async function downloadThumbnail(video) {
    const thumbnailFileName = video.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.jpg';
    const file = fs.createWriteStream(`./thumbnails/${thumbnailFileName}`);
    https.get(video.thumbnailUrl, function(response) {
        response.pipe(file);
        console.log(`Downloaded thumbnail for: ${video.title}`);
    });
}

async function getVideosAndDownload(channelId, businessId) {
    const videoData = await getVideos(channelId);
    const scrappingJobId = await model.createScrappingJobs(businessId, 'youtube', 'started');

    for (const video of videoData) {
        await downloadVideo(video , businessId);
        await downloadThumbnail(video);
        // Assuming videoUrlS3 is not available immediately, set it to null or appropriate value
        await model.createVideos(businessId, scrappingJobId, video.title, video.description, video.duration, null, `./videos/${video.title}`);
    }

    // Update the scrapping job status after completion
    await db.executeSql(`UPDATE scrapping_jobs SET status = 'completed' WHERE id = $1`, [scrappingJobId]);
}

async function getChannelId  (channelUrl) {
    return new Promise((resolve, reject) => {
        channelId(channelUrl)
            .then(id => {
                console.log(id);
                resolve(id);
            })
            .catch(error => {
                console.error(error);
                reject(error);
            });
    });
};

exports.youtubeScrapper = async function(businessIds) {
    for (let i = 0; i < businessIds.length; i++) {
        const businessId = businessIds[i];
        const getChannels = await model.getYoutubeLinkFromBusinessIds(businessId);
        for (let j = 0; j < getChannels.length; j++) {
            const channelUrl = getChannels[j].youtube_link;
            try {
                const channelId = await getChannelId(channelUrl);
                await getVideosAndDownload(channelId, businessId);
            } catch (error) {
                console.error(`Error processing channel: ${channelUrl}`, error);
            }
        }
    }
};

const BUSINESS_IDS = ['BUSINESS_ID_1', 'BUSINESS_ID_2'];
exports.youtubeScrapper(BUSINESS_IDS).catch(console.error);
