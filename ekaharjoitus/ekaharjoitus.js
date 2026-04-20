// Ensin importit
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Luodaan express-palvelin instanssi
const app = express();

// Määritellään vakiot
const port = 3000;
const host = "localhost";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Staattiset polut
app.use("/images", express.static("kuvat"));
app.use("")
// Määritellään polut
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Käynnistetään palvelin kuuntelemaan vakioiden mukaista osoitetta
app.listen(port, host, () => console.log(`${host}:${port} kuuntelee...`));
