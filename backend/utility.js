const { normalizeESData, processComplexData, parseDateKey } = require("./helper");
const moment = require("moment");

const responseHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
  }

  const ErrorResponse={
    statusCode: 403,
    headers: responseHeaders,
    body: JSON.stringify({ Message: 'Invalid Query' })
  }

  function NormalizationSchema(response){
    const normalizeResp = {};
    if (response.data.hits) {
        normalizeResp["statsData"] = response.data.hits;
      }
      if (response.data.aggregations) {
        const aggr = response.data.aggregations;
        const charts = {};
        for (const key in aggr) {
          if (aggr[key].buckets && aggr[key].buckets.length) {
            let normalizeData = normalizeESData(aggr[key].buckets);
            if (normalizeData[0].data) {
              normalizeData = processComplexData(normalizeData)
            }
            if (normalizeData[0].key && moment(normalizeData[0].key).isValid()) {
              normalizeData = parseDateKey(normalizeData)
            }
            charts[key] = normalizeData;
          }
          if (aggr[key].value) {
            charts[key] = aggr[key].value
          }
        }
        normalizeResp["chartData"] = charts;
      }
      return normalizeResp
  }
async function DslESAPI(esquery, res) {
  // Adding below fields in DSL ES Query
  esquery.size = 0;
  esquery.track_total_hits = true;

  // Token generation
  const token = Buffer.from(
    `${process.env.DSL_ES_USERNAME}:${process.env.DSL_ES_PASSWORD}`,
    "utf8"
  ).toString("base64");

  //DSL ES API calling....
  try {
    const response = await axios.post(
      `${process.env.DSL_ES_ENDPOINT}?appName=${appName}&type=${process.env.DSL_ES_COLLECTION}`,
      esquery,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${token}`,
        },
      }
    );
    return response;
  } catch (ex) {
    res.json({ resposne: null });
  }
}
  module.exports={NormalizationSchema}