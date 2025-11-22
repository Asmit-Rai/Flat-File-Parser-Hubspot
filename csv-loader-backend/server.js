import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { objectRoute } from "./route/objectRoute.js";
dotenv.config();
import crypto from "crypto";

const app = express();
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const corsOptions = {
  origin: [
    "https://flat-file-parser-hubspot.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "https://sententious-unhortatively-makena.ngrok-free.dev/",
  ],
};
app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const upload = multer({ dest: "uploads/" });
let storedCsvData = "";
app.post("/sign-in", (req, res) => {
  const { userEmail, userPassword } = req.body;
  const savedEmail = process.env.EMAIL;
  const savedPassword = process.env.PASSWORD;

  if (savedEmail === userEmail && savedPassword === userPassword) {
    res.json({ auth: true, user: { email: savedEmail } });
  } else {
    res.json({ auth: false });
  }
});

app.post("/csv-data", (req, res) => {
  storedCsvData = req.body.csvData || req.body;
  res.json({ success: true });
});

app.get("/get-csv-data", (req, res) => {
  if (storedCsvData) {
    res.json({ success: true, csvData: storedCsvData });
  } else {
    res.status(404).json({ success: false, message: "No CSV data found." });
  }
});

app.post("/api/uploads", upload.single("file"), async (req, res) => {
  const file = req.file;
  const config = req.body;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  const preview = { headers: [], rows: [] };

  try {
    const fileContent = fs.readFileSync(file.path, "utf8");
    const hasHeaders = config.hasHeaders === "true";
    const lines = fileContent.split("\n").filter((line) => line.trim() !== "");

    if (config.delimiter === "fixed") {
      const fixedWidths = [
        { start: 0, length: 10 },
        { start: 10, length: 25 },
        { start: 35, length: 15 },
      ];

      const parseLine = (line) =>
        fixedWidths.map((col) =>
          line.substring(col.start, col.start + col.length).trim()
        );

      if (hasHeaders && lines.length > 0) {
        preview.headers = parseLine(lines[0]);
        preview.rows = lines.slice(1).map(parseLine);
      } else {
        preview.headers = fixedWidths.map((_, i) => `Column ${i + 1}`);
        preview.rows = lines.map(parseLine);
      }
    } else {
      const options = {
        delimiter: config.delimiter || ",",
        columns: hasHeaders,
        skip_empty_lines: true,
        trim: true,
        quote: '"',
        escape: '"',
        relax_column_count: true,
      };
      const records = parse(fileContent, options);

      if (records.length > 0) {
        if (hasHeaders) {
          preview.headers = Object.keys(records[0]);
          preview.rows = records.map((record) => Object.values(record));
          // await objectRoute(preview.headers,preview.rows);
        } else {
          preview.headers = records[0].map((_, i) => `Column ${i + 1}`);
          preview.rows = records;
        }
      }
    }

    fs.unlinkSync(file.path);
  } catch (error) {
    console.error("Error processing CSV file:", error);
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    return res
      .status(500)
      .json({ message: "Failed to parse the uploaded file." });
  }

  console.log("--- Processing Complete ---");
  res.status(200).json({
    message: `File '${file.originalname}' processed successfully!`,
    preview,
  });
});

app.post("/process-csv", async (req, res) => {
  try {
    res.json({ success: true });
    if (!storedCsvData) {
      console.log("no csv found");
      return;
    }
    const { headers, rows } = storedCsvData;
    await objectRoute(headers, rows);
  } catch (err) {
    console.error("error in process csv route" + err);
  }
});

const webhookDataArray = [];

app.post("/webhooks", (req, res) => {
    const reqHostname = req.hostname;
    const reqUrl = req.url;
    const reqMethod = req.method;
    const reqUri = `https://${reqHostname}${reqUrl}`;
    const reqBody = JSON.stringify(req.body);
    const timeStamp = req.headers["x-hubspot-request-timestamp"];
    const requestSignature = req.headers["x-hubspot-signature-v3"];

    if ((Date.now() - timeStamp) > 300000) {
      return res.status(408).send({ auth: false, message: "Request Timeout" });
    }

    //rawString STRUCTURE = method+uri+body+timestamp
    const rawString = `${reqMethod}${reqUri}${reqBody}${timeStamp}`;

    const token = crypto
      .createHmac("sha256", CLIENT_SECRET)
      .update(rawString)
      .digest("base64");

    console.log("token " + token);
    console.log("signature " + requestSignature);
    if (token == requestSignature) {
      webhookDataArray.push(req.body);
      console.log("Authentication Successful");
      res.status(200).send({ auth: true, message: "User Authenticated" });
    } else {
      console.log("Authentication Error");
      res.status(401).send({ auth: false, message: "Authentication Error" });
    }
  });
  

app.listen(3000);
