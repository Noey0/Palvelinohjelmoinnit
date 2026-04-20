// Ensin kirjastojen importit
import express from "express";

// Luodaan express-palvelin instanssi
const app = express();

// Otetaan käyttöön EJS-moottori
app.set("view engine", "ejs");
app.set("views", "templates");

// Määritellään staattiset kansiot
app.use("/tyylit", express.static("includes/styles"));
app.use("/images", express.static("includes/images"));

// Määritellään vakiot
const port = 3000;
const host = "localhost";

// Määritellään polut
app.get("/", (req, res) => {
  let nimi = req.query.nimi || "vierailija";
  res.render("index", { nimi });
});


app.get("/kissat", (req, res) => {
  res.render("kissat");
});

// Käynnistetään palvelin kuuntelemaan vakioiden mukaista osoitetta
app.listen(port, host, () => console.log(`${host}:${port} kuuntelee...`));
