require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const bodyParser = require("body-parser");

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use("/public", express.static(`${process.cwd()}/public`));

// ✅ Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: false }));

// Serve front page
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Example API
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// ✅ In-memory storage for demo
const urlDatabase = {};
let counter = 1;

// ✅ POST to create short URL
app.post("/api/shorturl", (req, res) => {
  const url = req.body.url;

  try {
    const urlObj = new URL(url);

    // Only accept http or https
    if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
      return res.json({ error: "invalid url" });
    }

    // Validate the hostname with DNS
    dns.lookup(urlObj.hostname, (err) => {
      if (err) {
        return res.json({ error: "invalid url" });
      } else {
        const shortUrl = counter++;
        urlDatabase[shortUrl] = url;
        res.json({
          original_url: url,
          short_url: shortUrl,
        });
      }
    });
  } catch (e) {
    return res.json({ error: "invalid url" });
  }
});

// ✅ GET to redirect to original URL
app.get("/api/shorturl/:short_url", (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: "No short URL found for given input" });
  }
});

// Start server
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
