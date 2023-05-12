require('dotenv').config();
let prompt =
  'Here is your Elastic Search Schema: {"properties":{"Age":{"type":"int","normalizer":"lower_case_normalizer"},"CreatedDate":{"type":"date","normalizer":"lower_case_normalizer"},"EmailVerified":{"type":"bool","normalizer":"lower_case_normalizer"},"LocalCountry":{"type":"text","normalizer":"lower_case_normalizer"},"Provider":{"type":"keyword","normalizer":"lower_case_normalizer"},"NoOfLogins":{"type":"int","normalizer":"lower_case_normalizer"},"BirthDate":{"type":"date","format":"MM-dd-yyyy"},"Gender":{"type":"keyword","normalizer":"lower_case_normalizer"},"Email":{"type":"nested","properties":{"Type":{"type":"keyword","normalizer":"lower_case_normalizer"},"Value":{"type":"text","analyzer":"email","fields":{"raw":{"type":"keyword","normalizer":"lower_case_normalizer"}}}}},"user_agent":{"properties":{"device":{"properties":{"name":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}}}},"name":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}},"original":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}},"os":{"properties":{"full":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}},"name":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}},"version":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}}}}}}}} Take Gender Male as M and Female as F and rest a U';

const express = require("express");
const axios = require("axios");
const sampleResponse = `{
  "_shards": {
      "failed": 0,
      "successful": 1,
      "total": 1
  },
  "hits": {
      "total": 0
  }
}`
const ParsedResponse=JSON.parse(sampleResponse)
const router = express.Router();

//Post Method
router.post("/query", async (req, res) => {
  try {
    let message = `Give ES Query for : ${req.body.message}`;
    const payload = {
      model: "gpt-3.5-turbo",
      //messages: message,
      //max_tokens: 2000
      messages: [
         {
           role: "system",
           content: `${prompt}` ,
        },
        {
          role: "user",
          content: message,
        },
      ],
    };


    console.log("calling api.....", payload);
    axios
      .post("https://api.openai.com/v1/chat/completions", payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_APIKEY}`,
        },
      })
      .then((response) => {
        if (response.data != null && response.data.choices != null && response.data.choices[0].message != null && response.data.choices[0].message.content != null) {
          var b = response.data.choices[0].message.content.replace(/[\r\n]/gm, '').replaceAll(/\s/g, '')
          console.log(b)
          var re = new RegExp('{".*}');
          var matchedString = b.match(re);
          if (matchedString) {
            DslESAPI(JSON.parse(matchedString[0])).then(dslRes => res.json(dslRes))
          } else {
            res.json(ParsedResponse)
          }
        } else {
          res.json(ParsedResponse)
        }
      })
      .catch((error) => {
        console.log(error);
        res.json({ response: error });
      });
  } catch (ex) {
    res.json({ resposne: ex });
  }
});

async function DslESAPI(query) {
  query.size=0;
  query.track_total_hits=true;
  let endpoint = `${process.env.DSL_ES_ENDPOINT}?appName=${process.env.DSL_ES_APPNAME}&type=${process.env.DSL_ES_COLLECTION}`
  const token = Buffer.from(`${process.env.DSL_ES_USERNAME}:${process.env.DSL_ES_PASSWORD}`, 'utf8').toString('base64')
  try {
    const response = await axios
      .post(endpoint, query, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${token}`
        },
      },
      )
    return response.data
  } catch (ex) {
    return ex
  }
}

module.exports = router;
