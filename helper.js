const normalizeESData = (bucket) => {
  const chartData = [];

  bucket.forEach((b) => {
    const obj = {};
    for (const k in b) {
      if (k === "key" && b[k]) {
        obj[k] = b[k];
      } else if (k === "doc_count") {
        obj["count"] = b[k];
      } else if (k === "key_as_string") {
        obj["key"] = b[k];
      } else if (b[k].doc_count) {
        obj[k] = b[k].doc_count
      } else if (b[k].buckets) {
        obj["data"] = normalizeESData(b[k].buckets);
      }
    }
    chartData.push(obj);
  });
  return chartData;
};

const processComplexData = (data) => {
  const chartData = data.map(obj => {
    const columnObj = { ...obj }
    let others = obj.count;
    if (obj.data) {
      obj.data.forEach(cObj => {
        columnObj[cObj.key] = cObj.count;
        others -= cObj.count
      })
      if (others > 0) {
        columnObj[`others`] = others;
      }
      delete columnObj["count"]
      delete columnObj["data"]
    }
    return columnObj;
  })
  return chartData;
}

module.exports = { normalizeESData, processComplexData };
