const db = require('../service/pgService');


module.exports.createScrappingJobs = async function (businessId ,scrappingType, status) {
    const query = `INSERT INTO scrapping_jobs(businessId ,scrappingType, status)
      VALUES($1, $2, $3 ) RETURNING id`;
   const scrappingId =   await db.executeSql(query, [businessId ,scrappingType, status]);
    return scrappingId;
  };

  module.exports.createVideos = async function (businessId ,scrappingJobId,title ,description, duration ,videoUrlS3,videoUrlLocal) {
    const query = `INSERT INTO scrapping_jobs(businessId ,scrapping_job_id,title ,description, duration ,video_url_s3 ,video_url_local)
      VALUES($1, $2, $3 , $4,$5,$6,$7 ) RETURNING id`;
   const videoId =   await db.executeSql(query, [businessId ,scrappingJobId,title ,description, duration ,videoUrlS3,videoUrlLocal]);
    return videoId;
  };