require("dotenv").config();
let prompt =
  'Here is your Elastic Search Schema: {"properties":{"Age":{"type":"integer","normalizer":"lower_case_normalizer"},"CreatedDate":{"type":"date","normalizer":"lower_case_normalizer"},"EmailVerified":{"type":"boolean","normalizer":"lower_case_normalizer"},"LocalCountry":{"type":"text","normalizer":"lower_case_normalizer"},"Provider":{"type":"text","normalizer":"lower_case_normalizer"},"NoOfLogins":{"type":"int","normalizer":"lower_case_normalizer"},"BirthDate":{"type":"date","format":"MM-dd-yyyy"},"Gender":{"type":"keyword","normalizer":"lower_case_normalizer"},"user_agent":{"properties":{"device":{"properties":{"name":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}}}},"name":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}},"original":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}},"os":{"properties":{"full":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}},"name":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}},"version":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}}}}}}}} Take Gender Male as M and Female as F and rest a U';

const express = require("express");
const axios = require("axios");
const { normalizeESData, processComplexData } = require("./helper");
const re = new RegExp(`\{.*}`)
const router = express.Router();

//Post Method
router.post("/query", async (req, res) => {
  try {
    let message = `Give ES Query for : ${req.body.message}`;
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
            if (matchedString[0].includes(".keyword")) {
              matchedString[0] = matchedString[0].replace(/.keyword/g, "")
            }
            console.log("es query ===> ", matchedString[0])
            const response = await DslESAPI(JSON.parse(matchedString[0]));
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
                if (aggr[key].value) {
                  charts[key] = aggr[key].value
                }
              }
              normalizeResp["chartData"] = charts;
            }
            res.json(normalizeResp);
          } else {
            res.json(ParsedResponse);
          }
        } else {
          res.json(ParsedResponse);
        }
      })
      .catch((error) => {
        res.json({ response: error });
      });
  } catch (ex) {
    res.json({ resposne: ex });
  }
});

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
      `${process.env.DSL_ES_ENDPOINT}?appName=${process.env.DSL_ES_APPNAME}&type=${process.env.DSL_ES_COLLECTION}`,
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

module.exports = router;
