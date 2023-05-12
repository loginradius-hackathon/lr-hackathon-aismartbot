require("dotenv").config();
let prompt =
  'Here is your Elastic Search Schema: {"properties":{"Age":{"type":"int","normalizer":"lower_case_normalizer"},"CreatedDate":{"type":"date","normalizer":"lower_case_normalizer"},"EmailVerified":{"type":"bool","normalizer":"lower_case_normalizer"},"LocalCountry":{"type":"text","normalizer":"lower_case_normalizer"},"Provider":{"type":"keyword","normalizer":"lower_case_normalizer"},"NoOfLogins":{"type":"int","normalizer":"lower_case_normalizer"},"BirthDate":{"type":"date","format":"MM-dd-yyyy"},"Gender":{"type":"keyword","normalizer":"lower_case_normalizer"},"Email":{"type":"nested","properties":{"Type":{"type":"keyword","normalizer":"lower_case_normalizer"},"Value":{"type":"text","analyzer":"email","fields":{"raw":{"type":"keyword","normalizer":"lower_case_normalizer"}}}}},"user_agent":{"properties":{"device":{"properties":{"name":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}}}},"name":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}},"original":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}},"os":{"properties":{"full":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}},"name":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}},"version":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}}}}}}}} Take Gender Male as M and Female as F and rest a U';

const express = require("express");
const axios = require("axios");
const { normalizeESData } = require("./helper");
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
  const response = await DslESAPI(req.body.esquery);
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
