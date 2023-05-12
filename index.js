const express = require("express");
const routes = require('./routes');
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