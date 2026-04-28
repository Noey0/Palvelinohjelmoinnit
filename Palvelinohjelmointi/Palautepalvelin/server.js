import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Palaute-data REST-apia varten
import feedbackData from "./feedback_mock.json" with { type: "json" };

let feedback = [...feedbackData];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const host = "localhost";
const port = 3000;

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "templates"));

app.use("/styles", express.static("includes/styles"));

// IMPORTANT: needed for REST JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Polkumäärittelyt ejs-sivupohjia käyttäville web-sivuille
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/palautelomake", (req, res) => {
  res.render("palaute");
});

app.post("/palautelomake", async (req, res) => {
  let name = req.body.name;
  let email = req.body.email;
  let feedbackText = req.body.feedback;

  fs.readFile("data.json", "utf8", function (err, dataString) {
    if (err) {
      console.log("ERR: Palaute-datan lukeminen epäonnistui");
    } else {
      let data = [];
      try {
        data = JSON.parse(dataString);
        if (!Array.isArray(data)) {
          data = [];
          throw new TypeError("Data not an array");
        }
      } catch (error) {
        console.log("ERR: Palaute-datan lukeminen epäonnistui");
        console.log(error);
      }

      data.push({
        name: name,
        email: email,
        feedback: feedbackText,
      });

      fs.writeFile(
        "data.json",
        JSON.stringify(data),
        { encoding: "utf8" },
        (err) => {
          if (err) {
            console.log("ERR: Palaute-datan tallettaminen epäonnistui");
          } else {
            console.log("OK:  Palaute-datan tallettaminen onnistui");
          }
        },
      );

      res.render("vastaus", { name: name, email: email });
    }
  });
});

// GET all
app.get("/palaute/", (req, res) => {
  res.json(feedback);
});

// GET one
app.get("/palaute/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const item = feedback.find((f) => f.id === id);

  if (item) res.json(item);
  else res.status(404).json({ error: "Palaute ei löytynyt" });
});

// POST new
app.post("/palaute/uusi", (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Tyhjä pyyntö" });
  }

  const newItem = {
    id: Date.now(),
    ...req.body,
  };

  feedback.push(newItem);
  res.status(201).json(newItem);
});

// PUT update
app.put("/palaute/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = feedback.findIndex((f) => f.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Palaute ei löytynyt" });
  }

  feedback[index] = {
    ...feedback[index],
    ...req.body,
  };

  res.json(feedback[index]);
});

// DELETE
app.delete("/palaute/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = feedback.findIndex((f) => f.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Palaute ei löytynyt" });
  }

  const deleted = feedback.splice(index, 1);
  res.json(deleted[0]);
});

app.listen(port, host, () => console.log(`${host}:${port} kuuntelee...`));
