require("dotenv").config();
const NodeCache = require("node-cache");
const axios = require("axios");
const util = require('./utility')

const myCache = new NodeCache();
const re = new RegExp(`\{.*}`)
const cacheTime = process.env.CACHE_TIME || 900

let prompt =
  'Here is your Elastic Search Schema: {"properties":{"Age":{"type":"integer","normalizer":"lower_case_normalizer"},"CreatedDate":{"type":"date","normalizer":"lower_case_normalizer"},"EmailVerified":{"type":"boolean","normalizer":"lower_case_normalizer"},"LocalCountry":{"type":"text","normalizer":"lower_case_normalizer"},"Provider":{"type":"text","normalizer":"lower_case_normalizer"},"NoOfLogins":{"type":"int","normalizer":"lower_case_normalizer"},"BirthDate":{"type":"date","format":"MM-dd-yyyy"},"Gender":{"type":"keyword","normalizer":"lower_case_normalizer"},"user_agent":{"properties":{"device":{"properties":{"name":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}}}},"name":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}},"original":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}},"os":{"properties":{"full":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}},"name":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}},"version":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}}}}}}}} Take Gender Male as M and Female as F and rest as U.';


//Post Method
// AWS handler method intialization
exports.handler = async (event) => {
  let body = {};
  // body parsing
  if (event.body !== null && event.body !== undefined) {
    body = JSON.parse(event.body)
  }

  let message = body.message || event['message'] || "total no of users"//  event[`message`] || ""
  message = message.replace(/\s+/g, ' ').trim().toLowerCase();
  let bodyAppName = body.appname || event['appname'] //event['appname']
  let realtime = body.realtime || event['realtime']//event['realtime']
  appName = process.env.DSL_ES_APPNAME
  if (bodyAppName != undefined && bodyAppName.trim() != "") {
    appName = bodyAppName.toLowerCase();
  }
  var cache = !realtime
  let key = `${appName}_${message}`
  console.log("Query-->>", message)
  console.log("appname", appName)
  console.log("realtime", realtime)

  // get response from cache 
  cachedData = myCache.get(key)
  if (cachedData && cache) {
    console.log("Response from cache==>", cachedData)
    return {
      statusCode: 200,
      headers: util.responseHeaders,
      body: JSON.stringify(cachedData)
    };

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
      // Open AI API calling...
      const response = await axios
        .post("https://api.openai.com/v1/chat/completions", payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_APIKEY}`,
          },
        })
      if (
        response.data != null &&
        response.data.choices != null &&
        response.data.choices[0].message != null &&
        response.data.choices[0].message.content != null
      ) {
        //Response filter from OpenAI
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
          console.log("es query ===> ", matchedString[0])

          //Calling DSL ES API

          const response = await DslESAPI(JSON.parse(matchedString[0]));
          if (response != null) {
            //Data normalization into stats and charts
            if (response.data) {
              const normalizeResp=util.NormalizationSchema(response);
              console.log("Response===>>", normalizeResp)
              myCache.set(key, normalizeResp, cacheTime)
              return {
                statusCode: 200,
                headers: util.responseHeaders,
                body: JSON.stringify(normalizeResp)
              }
            } else {
              return util.ErrorResponse;
            }
          } else {
            return util.ErrorResponse;
          }
        } else {
          return util.ErrorResponse;
        }
      } else {
        return util.ErrorResponse;
      }
    } catch (ex) {
      console.log("catch", ex)
      return util.ErrorResponse;
    }
  }
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
