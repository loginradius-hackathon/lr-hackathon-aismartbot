const express = require("express");
const routes = require('./routes');
const ngrok = require('ngrok');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4000
app.use(cors({
  origin: '*'
}));
app.use(express.json());
app.use("/api", routes)


app.listen(port, () => {
  console.log(`Server Started at ${port}`);
});
ngrok.connect({
  proto : 'http',
  addr : port,
}, (err, url) => {
  if (err) {
      console.error('Error while connecting Ngrok',err);
      return new Error('Ngrok Failed');
  }
});