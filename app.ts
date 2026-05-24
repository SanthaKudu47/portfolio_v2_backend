import express from "express";
const app = express();
const PORT = 3000;


app.listen(PORT, function (err) {
  if (err) {
    console.log("Failed to start Server");
    console.log(err);
    return;
  }

  console.log(`app listening on port ${PORT}`);
});
