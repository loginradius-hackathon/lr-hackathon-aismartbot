require("dotenv").config();
const NodeCache = require("node-cache");
const myCache = new NodeCache();
let prompt =
  'Here is your Elastic Search Schema: {"properties":{"Age":{"type":"integer","normalizer":"lower_case_normalizer"},"CreatedDate":{"type":"date","normalizer":"lower_case_normalizer"},"EmailVerified":{"type":"boolean","normalizer":"lower_case_normalizer"},"LocalCountry":{"type":"text","normalizer":"lower_case_normalizer"},"Provider":{"type":"text","normalizer":"lower_case_normalizer"},"NoOfLogins":{"type":"int","normalizer":"lower_case_normalizer"},"BirthDate":{"type":"date","format":"MM-dd-yyyy"},"Gender":{"type":"keyword","normalizer":"lower_case_normalizer"},"user_agent":{"properties":{"device":{"properties":{"name":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}}}},"name":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}},"original":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}},"os":{"properties":{"full":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}},"name":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}},"version":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}}}}}}}} Take Gender Male as M and Female as F and rest as U.';

const moment = require("moment");
const express = require("express");
const axios = require("axios");
const { normalizeESData, processComplexData, parseDateKey } = require("./helper");
const re = new RegExp(`\{.*}`)
const router = express.Router();
const cacheTime = process.env.CACHE_TIME || 900
//Post Method
exports.handler = async (event) => {
  let finalResponse={}
  //router.post("/query", async (req, res) => {
  let message = event[`message`]
  message = message.replace(/\s+/g, ' ').trim().toLowerCase();
  let bodyAppName = event['appname']
  let realtime = event['realtime']
  appName = process.env.DSL_ES_APPNAME
  if (bodyAppName != undefined && bodyAppName.trim() != "") {
    appName = bodyAppName.toLowerCase();
  }
  console.log(appName)
  var cache = !realtime
  let key = `${appName}_${message}`
  console.log("Query-->>", message)
  cachedData = myCache.get(key)
  if (cachedData && cache) {
    console.log("Response from cache==>", cachedData)
    finalResponse = {
      status: 200,
      response: JSON.stringify(cachedData)
    }

  } else {
    try {
      message = `Give ES Query for : ${message} with no explanation`;
      const payload = {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `${prompt}`,
          },
          {
            role: "user",
            content: message,
          },
        ],
      };
      axios
        .post("https://api.openai.com/v1/chat/completions", payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_APIKEY}`,
          },
        })
        .then(async (response) => {
          
          if (
            response.data != null &&
            response.data.choices != null &&
            response.data.choices[0].message != null &&
            response.data.choices[0].message.content != null
          ) {
            var choiceData = response.data.choices[0].message.content
              .replace(/[\r\n]/gm, "")
              .replace(/\s/g, "");
            var matchedString = choiceData.match(re);
            if (matchedString && matchedString[0]) {
              /* * AI is adding .keyword with text fields like Provider and LocalCountry 
                 *  data is not comming, so fixed that part by this logic  */
              if (matchedString[0].includes(".keyword") && !matchedString[0].includes("user_agent")) {
                matchedString[0] = matchedString[0].replace(/.keyword/g, "")
              }
              if (matchedString[0].includes("`")) {
                index = matchedString[0].indexOf("`")
                matchedString[0] = matchedString[0].substring(0, index)
              }
              console.log("es query ===> ", matchedString[0])
              const response = await DslESAPI(JSON.parse(matchedString[0]));
              const normalizeResp = {};
              if (response.data) {
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
                console.log("Response===>>", normalizeResp)
                myCache.set(key, normalizeResp, cacheTime)
                finalResponse = {
                  status: 200,
                  response: JSON.stringify(normalizeResp)
                }

              } else {
                finalResponse = {
                  status: 403,
                  response: JSON.stringify({ Message: "Invalid query" })
                }
              }
            } else {
              finalResponse = {
                status: 403,
                response: JSON.stringify({ Message: "Invalid query" })
              }
            }
          } else {
            finalResponse = {
              status: 403,
              response: JSON.stringify({ Message: "Invalid query" })
            }
          }
        })
        .catch((error) => {
          console.log("Catcha",error)
          finalResponse = {
            status: 403,
            response: JSON.stringify({ Message: error.message })
          }
        });
    } catch (ex) {
      console.log("Catcha",ex)
      finalResponse = {
        status: 403,
        response:JSON.stringify({ Message: "Invalid query" })
      }
    }
  }
  return finalResponse;
}

router.post("/esrecords", async (req, res) => {
  const response = await DslESAPI(req.body);
  const normalizeResp = {};
  if (response.data.hits) {
    normalizeResp["statsData"] = response.data.hits;
  }
  if (response.data.aggregations) {
    const aggr = response.data.aggregations;
    const charts = {};
    for (const key in aggr) {
      if (aggr[key].buckets) {
        charts[key] = normalizeESData(aggr[key].buckets);
        if (charts[key][0].data) {
          charts[key] = processComplexData(charts[key])
        }
      }
    }
    normalizeResp["chartData"] = charts;
  }
  res.json(normalizeResp);
});

async function DslESAPI(esquery, res) {
  esquery.size = 0;
  esquery.track_total_hits = true;
  const token = Buffer.from(
    `${process.env.DSL_ES_USERNAME}:${process.env.DSL_ES_PASSWORD}`,
    "utf8"
  ).toString("base64");
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
    res.json({ resposne: ex });
  }
}

//module.exports = router;
