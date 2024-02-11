const db = require('../service/pgService');
// const config = require('../common/config')


module.exports.getYoutubeLinkFromBusinessIds = async function (businessId) {
    const query = `SELECT  youtube_link
    FROM businesses
    WHERE youtube_link IS NOT NULL AND is_disabled = false AND id = $1`;
    const response = await db.executeSql(query, [businessId]);
    if (response.rows != null && response.rows !== undefined && response.rows.length > 0) {
      return response.rows
    } else {
      return null;
    }
  };
