const db = require('../service/pgService');


module.exports.createScrappingJobs = async function (businessId ,scrappingType, status) {
    const query = `INSERT INTO scrapping_jobs(business_id ,scraping_type, status)
      VALUES($1, $2, $3 ) RETURNING id`;
   const scrappingId =   await db.executeSql(query, [businessId ,scrappingType, status]);
    return scrappingId.rows[0].id
  };

  module.exports.createVideos = async function (businessId ,scrappingJobId,title ,description, duration ,videoUrlS3,videoUrlLocal,thumbnailUrl , uploadedAt ,type) {
    console.log('create video')
    console.log(businessId ,scrappingJobId,title ,description, duration ,videoUrlS3,videoUrlLocal)
    const query = `INSERT INTO videos(business_id ,scraping_job_id,title ,description, duration ,video_url_s3 ,video_url_local , thumbnail_url , upload_time , type)
      VALUES($1, $2, $3 , $4,$5,$6,$7 , $8 , $9 , $10 ) RETURNING id`;
   const videoId =   await db.executeSql(query, [businessId ,scrappingJobId,title ,description, duration ,videoUrlS3,videoUrlLocal , thumbnailUrl , uploadedAt , type]);
    return videoId;
  };
