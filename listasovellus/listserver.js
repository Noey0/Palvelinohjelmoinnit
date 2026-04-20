import express from "express";
import ohjelmointikielet from "./data/ohjelmointikielet.json" with { type: "json" };

// luodaan Express-sovellus
const app = express();

// vakiot
const port = 3000;
const host = "localhost";

// otetaan EJS-moottori käyttöön
app.set("view engine", "ejs");

// kerrotaan EJS-moottorille, missä sivupohjat ovat. Oletus on views-kansio.
app.set("views", "sivupohjat");

app.get("/ohjelmointikielet", (req, res) => {
  res.render("listaus", {
    otsikko: "Ohjelmointikielet",
    tiedot: ohjelmointikielet,
  });
});

app.get("/ohjelmointikielet/:id", (req, res) => {
  const haettava = req.params.id;
  const tulos = ohjelmointikielet.filter((kieli) => kieli.id == haettava);
  res.render("tiedot", {
    nimi: tulos[0].nimi,
    kuvaus: tulos[0].kuvaus,
  });
});

// käynnistetään palvelin
app.listen(port, host, () => console.log(`${host}:${port} kuuntelee...`));
