// **************************************************************************************************** //
// IMPORTAZIONE DEI MODULI ESTERNI                                                                      //
// **************************************************************************************************** //
const express = require("express");
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const jwt = require("jsonwebtoken");

// **************************************************************************************************** //
// INIZIALIZZAZIONE DEL SERVER WEB                                                                      //
// **************************************************************************************************** //
const app = express();
const port = process.env.PORT || 3000;
const secret = process.env.SECRET;

let dailyReports = [];
const filePath = path.join(__dirname, "database", "covid-marche.json");

try {
  const rawData = fs.readFileSync(filePath, "utf8");
  dailyReports = JSON.parse(rawData);
  console.log("Dati COVID-19 per la Regione Marche caricati con successo.");
} catch (err) {
  console.error("Errore durante la lettura o il parsing del file.", err);
}

// **************************************************************************************************** //
// DEFINIZIONE DELLE FUNZIONI DI UTILITA'                                                               //
// **************************************************************************************************** //

/**
 * Filtra i rapporti per intervallo di date.
 *
 * @param {Array} reports - Array di oggetti rapporto da filtrare.
 * @param {String} startDate - Data di inizio dell'intervallo, in formato "YYYY-MM-DD".
 * @param {String} endDate - Data di fine dell'intervallo, in formato "YYYY-MM-DD".
 * @returns {Array} Array filtrato di rapporti che cadono nell'intervallo specificato.
 */
function filterReportsByDateRange(reports, startDate, endDate) {
  return reports.filter((report) => {
    const reportDate = moment(report.data.split("T")[0], "YYYY-MM-DD");
    return (
      reportDate.isSameOrAfter(moment(startDate, "YYYY-MM-DD")) &&
      reportDate.isSameOrBefore(moment(endDate, "YYYY-MM-DD"))
    );
  });
}

// **************************************************************************************************** //
// DEFINIZIONE DELLE FUNZIONI MIDDLEWARE                                                                //
// **************************************************************************************************** //

/**
 * Middleware per verificare la presenza e la validità del token JWT nelle richieste.
 * Estrae il token dall'header 'Authorization', lo verifica e, se valido, aggiunge il payload decodificato a `req.user`.
 *
 * @param {Object} req - L'oggetto richiesta di Express.
 * @param {Object} res - L'oggetto risposta di Express.
 * @param {Function} next - La funzione callback per passare al prossimo middleware.
 */
function verifyToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(403).send("Token di autenticazione richiesto.");
  }
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).send("Token di autenticazione non valido.");
    }
    req.user = decoded;
    next();
  });
}

/**
 * Middleware per validare il formato della data presente nei parametri della richiesta.
 * Utilizza Moment.js per verificare la validità della data nel formato "YYYY-MM-DD".
 *
 * @param {Object} req - L'oggetto richiesta di Express.
 * @param {Object} res - L'oggetto risposta di Express.
 * @param {Function} next - La funzione callback per passare al prossimo middleware.
 */
function validateDate(req, res, next) {
  const date = req.params.data;
  if (!moment(date, "YYYY-MM-DD", true).isValid()) {
    return res.status(400).send("Data non valida.");
  }
  next();
}

/**
 * Middleware per validare un intervallo di date presente nei parametri della richiesta.
 * Verifica che le date di inizio e fine siano valide e che la data di inizio non sia successiva alla data di fine.
 *
 * @param {Object} req - L'oggetto richiesta di Express.
 * @param {Object} res - L'oggetto risposta di Express.
 * @param {Function} next - La funzione callback per passare al prossimo middleware.
 */
function validateDateRange(req, res, next) {
  const startDate = req.params.dataInizio;
  const endDate = req.params.dataFine;
  if (!moment(startDate, "YYYY-MM-DD", true).isValid()) {
    return res.status(400).send("Data di inizio non valida.");
  }
  if (!moment(endDate, "YYYY-MM-DD", true).isValid()) {
    return res.status(400).send("Data di fine non valida.");
  }
  if (moment(startDate).isSameOrAfter(endDate)) {
    return res.status(400).send("Intervallo di date non valido.");
  }
  next();
}

// **************************************************************************************************** //
// UTILIZZO DELLE FUNZIONI MIDDLEWARE                                                                   //
// **************************************************************************************************** //

// Utilizzo del middleware express.json() per analizzare automaticamente i corpi delle richieste in arrivo in formato JSON.
// Questo è necessario per poter accedere ai dati JSON tramite req.body nelle rotte dell'applicazione.
app.use(express.json());

// **************************************************************************************************** //
// DEFINIZIONE DELLE ROTTE                                                                              //
// **************************************************************************************************** //

// Endpoint per l'autenticazione degli utenti.
// Riceve username e password nel corpo della richiesta.
// Se l'autenticazione ha successo, restituisce un token JWT; altrimenti, restituisce un errore 401.
app.post("/marche/covid/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin") {
    const userForToken = { username };
    const token = jwt.sign(userForToken, secret, { expiresIn: "1h" });
    res.json({ token });
  } else {
    res.status(401).send("Username o password non corretti");
  }
});

// ========================================== //
// SERVIZI PER L'AGGIUNTA DI RISORSE (Crud)   //
// ========================================== //

// Crea un nuovo rapporto quotidiano relativo ai dati COVID-19 per la Regione Marche.
// Richiede un token JWT valido per l'autenticazione.
// Verifica che non esista un rapporto con la stessa data; se esiste, restituisce un errore 400.
// In caso di successo, salva il nuovo rapporto e restituisce uno status 201.
app.post("/marche/covid/rapporti-quotidiani", verifyToken, (req, res) => {
  const newReport = req.body;
  const dateAlreadyExists = dailyReports.some(
    (report) => report.data.split("T")[0] === newReport.data.split("T")[0]
  );
  if (dateAlreadyExists) {
    return res.status(400).send("Un rapporto con la stessa data esiste già.");
  }
  dailyReports.push(newReport);
  fs.writeFile(
    filePath,
    JSON.stringify(dailyReports, null, 2),
    "utf8",
    (err) => {
      if (err) {
        console.error("Errore durante la scrittura del file:", err);
        return res
          .status(500)
          .send("Errore durante il salvataggio del nuovo rapporto.");
      }
      res.status(201).send("Rapporto creato con successo.");
    }
  );
});

// ========================================== //
// SERVIZI PER LA LETTURA DI RISORSE (cRud)   //
// ========================================== //

// Restituisce tutti i rapporti quotidiani disponibili.
app.get("/marche/covid/rapporti-quotidiani", (req, res) => {
  res.json(dailyReports);
});

// Restituisce il rapporto quotidiano più recente.
app.get("/marche/covid/rapporti-quotidiani/ultimo", (req, res) => {
  if (dailyReports.length > 0) {
    const latestReport = dailyReports[dailyReports.length - 1];
    res.json(latestReport);
  } else {
    res.status(404).send("Nessun rapporto disponibile.");
  }
});

// Restituisce un rapporto quotidiano specifico basato sulla data fornita.
app.get("/marche/covid/rapporti-quotidiani/:data", validateDate, (req, res) => {
  const date = req.params.data;
  const desiredReport = dailyReports.find((report) =>
    report.data.startsWith(date)
  );
  if (desiredReport) {
    res.json(desiredReport);
  } else {
    res
      .status(404)
      .send("Nessun rapporto disponibile per la data specificata.");
  }
});

// Restituisce i rapporti quotidiani in un intervallo di date specificato.
app.get(
  "/marche/covid/rapporti-quotidiani/:dataInizio/:dataFine",
  validateDateRange,
  (req, res) => {
    const startDate = req.params.dataInizio;
    const endDate = req.params.dataFine;
    const desiredReports = filterReportsByDateRange(
      dailyReports,
      startDate,
      endDate
    );
    if (desiredReports.length > 0) {
      res.json(desiredReports);
    } else {
      res
        .status(404)
        .send("Nessun rapporto disponibile per l'intervallo specificato.");
    }
  }
);

// OPERAZIONI DI NATURA STATISTICA

// Restituisce il totale dei casi positivi da inizio pandemia.
app.get("/marche/covid/statistiche/totale-casi-positivi", (req, res) => {
  if (dailyReports.length > 0) {
    const latestReport = dailyReports[dailyReports.length - 1];
    res.json({ totale_casi_positivi: latestReport.totale_casi });
  } else {
    res.status(404).send("Nessun rapporto disponibile.");
  }
});

// Restituisce il totale dei casi guariti da inizio pandemia.
app.get("/marche/covid/statistiche/totale-casi-guariti", (req, res) => {
  if (dailyReports.length > 0) {
    const latestReport = dailyReports[dailyReports.length - 1];
    res.json({ totale_casi_guariti: latestReport.dimessi_guariti });
  } else {
    res.status(404).send("Nessun rapporto disponibile.");
  }
});

// Restituisce il totale dei casi deceduti da inizio pandemia.
app.get("/marche/covid/statistiche/totale-casi-deceduti", (req, res) => {
  if (dailyReports.length > 0) {
    const latestReport = dailyReports[dailyReports.length - 1];
    res.json({ totale_casi_deceduti: latestReport.deceduti });
  } else {
    res.status(404).send("Nessun rapporto disponibile.");
  }
});

// Restituisce i nuovi positivi quotidiani per un intervallo di date specificato.
app.get(
  "/marche/covid/statistiche/nuovi-positivi-quotidiani/:dataInizio/:dataFine",
  validateDateRange,
  (req, res) => {
    const startDate = req.params.dataInizio;
    const endDate = req.params.dataFine;
    const filteredReports = filterReportsByDateRange(
      dailyReports,
      startDate,
      endDate
    );
    const dailyNewCases = filteredReports.map((report) => ({
      data: report.data.split("T")[0],
      nuovi_positivi: report.nuovi_positivi,
    }));
    if (dailyNewCases.length > 0) {
      res.json(dailyNewCases);
    } else {
      res
        .status(404)
        .send("Nessun rapporto disponibile per l'intervallo specificato.");
    }
  }
);

// Restituisce i nuovi guariti quotidiani per un intervallo di date specificato.
app.get(
  "/marche/covid/statistiche/nuovi-guariti-quotidiani/:dataInizio/:dataFine",
  validateDateRange,
  (req, res) => {
    const startDate = req.params.dataInizio;
    const endDate = req.params.dataFine;
    const filteredReports = filterReportsByDateRange(
      dailyReports,
      startDate,
      endDate
    );
    const dailyNewRecovered = filteredReports.map((report, index) => {
      const prevDayIndex = dailyReports.findIndex(
        (r) =>
          r.data.split("T")[0] ===
          moment(report.data).subtract(1, "days").format("YYYY-MM-DD")
      );
      const newRecovered =
        prevDayIndex !== -1
          ? report.dimessi_guariti - dailyReports[prevDayIndex].dimessi_guariti
          : report.dimessi_guariti;
      return {
        data: report.data.split("T")[0],
        nuovi_guariti: newRecovered,
      };
    });
    if (dailyNewRecovered.length > 0) {
      res.json(dailyNewRecovered);
    } else {
      res
        .status(404)
        .send("Nessun rapporto disponibile per l'intervallo specificato.");
    }
  }
);

// Restituisce i nuovi deceduti quotidiani per un intervallo di date specificato.
app.get(
  "/marche/covid/statistiche/nuovi-deceduti-quotidiani/:dataInizio/:dataFine",
  validateDateRange,
  (req, res) => {
    const startDate = req.params.dataInizio;
    const endDate = req.params.dataFine;
    const filteredReports = filterReportsByDateRange(
      dailyReports,
      startDate,
      endDate
    );
    const dailyNewDeceased = filteredReports.map((report, index) => {
      const prevDayIndex = dailyReports.findIndex(
        (r) =>
          r.data.split("T")[0] ===
          moment(report.data).subtract(1, "days").format("YYYY-MM-DD")
      );
      const newDeceased =
        prevDayIndex !== -1
          ? report.deceduti - dailyReports[prevDayIndex].deceduti
          : report.deceduti;
      return { data: report.data.split("T")[0], nuovi_deceduti: newDeceased };
    });
    if (dailyNewDeceased.length > 0) {
      res.json(dailyNewDeceased);
    } else {
      res
        .status(404)
        .send("Nessun rapporto disponibile per l'intervallo specificato.");
    }
  }
);

// Restituisce la media mobile a 7 giorni dei nuovi positivi per l'intervallo di date specificato.
app.get(
  "/marche/covid/statistiche/media-nuovi-positivi/:dataInizio/:dataFine",
  validateDateRange,
  (req, res) => {
    const startDate = req.params.dataInizio;
    const endDate = req.params.dataFine;
    const newCasesMovingAverages = dailyReports.reduce(
      (acc, report, index, array) => {
        const reportDate = moment(report.data.split("T")[0], "YYYY-MM-DD");
        if (reportDate.isBetween(startDate, endDate, null, "[]")) {
          const previousReports = array.slice(
            Math.max(0, index - 6),
            index + 1
          );
          const sum = previousReports.reduce(
            (sumAcc, curr) => sumAcc + curr.nuovi_positivi,
            0
          );
          const average = sum / previousReports.length;
          acc.push({
            data: report.data.split("T")[0],
            media_nuovi_positivi: Number(average.toFixed(2)),
          });
        }
        return acc;
      },
      []
    );
    if (newCasesMovingAverages.length > 0) {
      res.json(newCasesMovingAverages);
    } else {
      res
        .status(404)
        .send("Nessun rapporto disponibile per l'intervallo specificato.");
    }
  }
);

// Restituisce il tasso di positività giornaliero per l'intervallo di date specificato.
app.get(
  "/marche/covid/statistiche/tasso-positivita/:dataInizio/:dataFine",
  validateDateRange,
  (req, res) => {
    const startDate = req.params.dataInizio;
    const endDate = req.params.dataFine;
    const extendedStartDate = startDate.clone().subtract(1, "days");
    const filteredReports = filterReportsByDateRange(
      dailyReports,
      extendedStartDate,
      endDate
    );
    const relevantReports = filteredReports.filter((report) =>
      moment(report.data.split("T")[0]).isSameOrAfter(startDate)
    );
    const dailyPositivityRates = relevantReports.map((report, index) => {
      const currentIndex = filteredReports.indexOf(report);
      const previousDayTampons =
        currentIndex > 0 ? filteredReports[currentIndex - 1].tamponi : 0;
      const newTests = report.tamponi - previousDayTampons;
      const positivityRate =
        newTests > 0 ? (report.nuovi_positivi / newTests) * 100 : 0;
      return {
        data: report.data.split("T")[0],
        tasso_positivita: Number(positivityRate.toFixed(2)),
      };
    });
    if (dailyPositivityRates.length > 0) {
      res.json(dailyPositivityRates);
    } else {
      res
        .status(404)
        .send("Nessun rapporto disponibile per l'intervallo specificato.");
    }
  }
);

// Restituisce il tasso di letalità complessivo da inizio pandemia.
app.get("/marche/covid/statistiche/tasso-letalita", (req, res) => {
  if (dailyReports.length > 0) {
    const latestReport = dailyReports[dailyReports.length - 1];
    const lethalityRate =
      (latestReport.deceduti / latestReport.totale_casi) * 100;
    res.json({
      tasso_letalita: Number(lethalityRate.toFixed(2)),
    });
  } else {
    res.status(404).send("Nessun rapporto disponibile.");
  }
});

// ========================================== //
// SERVIZI PER LA MODIFICA DI RISORSE (crUd)  //
// ========================================== //

// Aggiorna un rapporto quotidiano esistente basato sulla data specificata.
// Richiede un token JWT valido per l'autenticazione.
// I dati aggiornati devono essere forniti nel corpo della richiesta.
// Se il rapporto specificato non esiste, restituisce un errore 404.
// In caso di successo, aggiorna il rapporto con i nuovi dati e restituisce un messaggio di conferma.
app.put("/marche/covid/rapporti-quotidiani/:data", verifyToken, (req, res) => {
  const dataReport = req.params.data;
  let datiAggiornati = req.body;
  const reportIndex = dailyReports.findIndex((report) =>
    report.data.startsWith(dataReport)
  );
  if (reportIndex === -1) {
    return res.status(404).send({ message: "Rapporto non trovato." });
  }
  Object.assign(dailyReports[reportIndex], datiAggiornati);
  fs.writeFile(
    filePath,
    JSON.stringify(dailyReports, null, 2),
    "utf8",
    (err) => {
      if (err) {
        console.error("Errore durante la scrittura del file:", err);
        return res
          .status(500)
          .send("Errore durante l'aggiornamento del rapporto.");
      }
      res.send("Rapporto aggiornato con successo.");
    }
  );
});

// ========================================== //
// SERVIZI PER LA RIMOZIONE DI RISORSE (cruD) //
// ========================================== //

// Rimuove un rapporto quotidiano basato sulla data specificata.
// Richiede un token JWT valido per l'autenticazione.
// Se il rapporto specificato non esiste, restituisce un errore 404.
// In caso di successo, rimuove il rapporto dall'archivio e restituisce un messaggio di conferma.
app.delete(
  "/marche/covid/rapporti-quotidiani/:data",
  verifyToken,
  (req, res) => {
    const data = req.params.data;
    const reportIndex = dailyReports.findIndex((report) =>
      report.data.startsWith(data)
    );
    if (reportIndex !== -1) {
      dailyReports.splice(reportIndex, 1);
      const updatedData = JSON.stringify(dailyReports, null, 2);
      fs.writeFile(filePath, updatedData, "utf8", (err) => {
        if (err) {
          console.error(
            "Si è verificato un errore durante l'aggiornamento del file:",
            err
          );
          return res
            .status(500)
            .send("Errore durante la memorizzazione delle modifiche.");
        }
        res.send("Rapporto rimosso con successo e modifiche memorizzate.");
      });
    } else {
      res.status(404).send("Rapporto non trovato.");
    }
  }
);

// **************************************************************************************************** //
// AVVIO DEL SERVER WEB                                                                                 //
// **************************************************************************************************** //
app.listen(port, () => {
  console.log(`Server avviato con successo. In ascolto sulla porta ${port}.`);
});
