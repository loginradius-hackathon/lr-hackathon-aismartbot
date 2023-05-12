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
      } else if (b[k].buckets) {
        obj["data"] = normalizeESData(b[k].buckets);
      }
    }
    chartData.push(obj);
  });
  return chartData;
};

module.exports = { normalizeESData };
