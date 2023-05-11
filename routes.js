let prompt =
  'Here is your Elastic Search Schema: {"properties":{"Age":{"type":"int","normalizer":"lower_case_normalizer"},"CreatedDate":{"type":"date","normalizer":"lower_case_normalizer"},"EmailVerified":{"type":"bool","normalizer":"lower_case_normalizer"},"LocalCountry":{"type":"text","normalizer":"lower_case_normalizer"},"Provider":{"type":"keyword","normalizer":"lower_case_normalizer"},"NoOfLogins":{"type":"int","normalizer":"lower_case_normalizer"},"BirthDate":{"type":"date","format":"MM-dd-yyyy"},"Gender":{"type":"keyword","normalizer":"lower_case_normalizer"},"Email":{"type":"nested","properties":{"Type":{"type":"keyword","normalizer":"lower_case_normalizer"},"Value":{"type":"text","analyzer":"email","fields":{"raw":{"type":"keyword","normalizer":"lower_case_normalizer"}}}}},"user_agent":{"properties":{"device":{"properties":{"name":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}}}},"name":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}},"original":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}},"os":{"properties":{"full":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}},"name":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}},"version":{"type":"text","fields":{"keyword":{"type":"keyword","ignore_above":256}}}}}}}}}';

const express = require("express");
const axios = require("axios");

const router = express.Router();

//Post Method
router.post("/query", async (req, res) => {
  try {
    let message = `${prompt}, Give ES Query for : ${req.body.message}`;
    const payload = {
      model: "text-davinci-003",
      prompt: message,
      max_tokens: 2000
    };


    console.log("calling api.....", payload);
    axios
      .post("https://api.openai.com/v1/completions", payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.OPENAI_APIKEY,
        },
      })
      .then((response) => {
        // console.log(response.data);
        res.json({ response: response.data });
      })
      .catch((error) => {
        console.log(error);
        res.json({ response: error });
      });
  } catch (ex) {
    res.json({ resposne: ex });
  }
});

module.exports = router;
