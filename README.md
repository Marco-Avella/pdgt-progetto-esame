# Progetto d'Esame di Piattaforme Digitali per la Gestione del Territorio

## Sessione d'Esami Invernale (A.A. 2023-2024)

## Informazioni Generali

- **Autore:** Marco Avella
- **Matricola:** 260901
- **Titolo del Progetto:** Servizio Web per il Monitoraggio del COVID-19 nella Regione Marche

### Descrizione del Servizio Implementato e del Suo Scopo

Il servizio web sviluppato offre un'interfaccia API RESTful per l'accesso e la gestione dei dati relativi ai casi di COVID-19 nella Regione Marche. Il servizio permette agli utenti di visualizzare rapporti giornalieri, aggiungere nuovi rapporti, aggiornare o eliminare quelli esistenti e visualizzare statistiche aggregate.

### Descrizione di Architettura e Scelte Implementative

Il servizio è costruito utilizzando Node.js e il framework Express, che facilita la creazione di API web in modo efficiente e scalabile. I dati sono memorizzati in un file JSON, simulando un database per la persistenza dei dati. L'autenticazione è gestita tramite JWT (JSON Web Tokens), permettendo operazioni di scrittura e cancellazione solo agli utenti autenticati.

- **Componenti Software:** Node.js, Express.
- **Database:** File JSON (`covid-marche.json`) per la persistenza dei dati.
- **Autenticazione:** JWT per operazioni protette.
- **Librerie:** `jsonwebtoken` per la gestione dei token, `moment` per la manipolazione delle date.

### Riferimento a Dati o Servizi Esterni

N/A - Tutti i dati sono gestiti internamente e non si fa affidamento su servizi esterni.

### Documentazione dell’API Implementata

### Autenticazione

- **POST `/marche/covid/login`**
  - **Descrizione:** Autenticazione dell'utente per ricevere un token JWT.
  - **Body richiesta:** `{"username": "string", "password": "string"}`
  - **Risposta:** Token JWT per autenticazione nelle operazioni protette.
  - **Esempio di richiesta:**
    ```json
    {
      "username": "admin",
      "password": "admin"
    }
    ```
  - **Esempio di risposta:**
    ```json
    {
      "token": "<JWT_TOKEN>"
    }
    ```

### Lettura Dati

- **GET `/marche/covid/rapporti-quotidiani`**

  - **Descrizione:** Restituisce tutti i rapporti quotidiani disponibili.
  - **Risposta:** Array di oggetti rapporto.

- **GET `/marche/covid/rapporti-quotidiani/ultimo`**

  - **Descrizione:** Restituisce l'ultimo rapporto disponibile.
  - **Risposta:** Oggetto contenente l'ultimo rapporto.

- **GET `/marche/covid/rapporti-quotidiani/:data`**

  - **Descrizione:** Restituisce il rapporto per la data specificata.
  - **Parametri URL:** `data` (formato YYYY-MM-DD)
  - **Risposta:** Oggetto rapporto per la data specificata.

- **GET `/marche/covid/rapporti-quotidiani/:dataInizio/:dataFine`**
  - **Descrizione:** Restituisce i rapporti in un intervallo di date.
  - **Parametri URL:** `dataInizio` e `dataFine` (formato YYYY-MM-DD)
  - **Risposta:** Array di oggetti rapporto nell'intervallo specificato.

### Modifica Dati (Protetto da Autenticazione)

- **POST `/marche/covid/rapporti-quotidiani`**

  - **Descrizione:** Aggiunge un nuovo rapporto.
  - **Body richiesta:** Oggetto contenente i dati del nuovo rapporto.
  - **Risposta:** Messaggio di conferma.

- **PUT `/marche/covid/rapporti-quotidiani/:data`**

  - **Descrizione:** Aggiorna il rapporto per la data specificata.
  - **Parametri URL:** `data` (formato YYYY-MM-DD)
  - **Body richiesta:** Oggetto con i dati aggiornati del rapporto.
  - **Risposta:** Messaggio di conferma.

- **DELETE `/marche/covid/rapporti-quotidiani/:data`**
  - **Descrizione:** Elimina il rapporto per la data specificata.
  - **Parametri URL:** `data` (formato YYYY-MM-DD)
  - **Risposta:** Messaggio di conferma.

### Lettura Statistiche

- **Totale Casi Positivi**

  - **Endpoint**: `GET /marche/covid/statistiche/totale-casi-positivi`
  - **Descrizione**: Restituisce il totale dei casi positivi registrati da inizio pandemia nella Regione Marche.
  - **Risposta**:
    - **Formato**: JSON
    - **Esempio**: `{"totale_casi_positivi": 123456}`

- **Totale Casi Guariti**

  - **Endpoint**: `GET /marche/covid/statistiche/totale-casi-guariti`
  - **Descrizione**: Restituisce il totale dei casi guariti registrati da inizio pandemia nella Regione Marche.
  - **Risposta**:
    - **Formato**: JSON
    - **Esempio**: `{"totale_casi_guariti": 120000}`

- **Totale Casi Deceduti**

  - **Endpoint**: `GET /marche/covid/statistiche/totale-casi-deceduti`
  - **Descrizione**: Restituisce il totale dei decessi registrati da inizio pandemia nella Regione Marche.
  - **Risposta**:
    - **Formato**: JSON
    - **Esempio**: `{"totale_casi_deceduti": 3456}`

- **Nuovi Positivi Quotidiani**

  - **Endpoint**: `GET /marche/covid/statistiche/nuovi-positivi-quotidiani/:dataInizio/:dataFine`
  - **Descrizione**: Restituisce il numero di nuovi casi positivi per ogni giorno nell'intervallo specificato.
  - **Parametri URL**:
    - `dataInizio`: Data di inizio dell'intervallo (YYYY-MM-DD).
    - `dataFine`: Data di fine dell'intervallo (YYYY-MM-DD).
  - **Risposta**:
    - **Formato**: JSON
    - **Esempio**: `[{ "data": "YYYY-MM-DD", "nuovi_positivi": 100 }, ...]`

- **Nuovi Guariti Quotidiani**

  - **Endpoint**: `GET /marche/covid/statistiche/nuovi-guariti-quotidiani/:dataInizio/:dataFine`
  - **Descrizione**: Restituisce il numero di nuovi guariti per ogni giorno nell'intervallo specificato.
  - **Parametri URL**:
    - `dataInizio` e `dataFine` come sopra.
  - **Risposta**:
    - **Formato**: JSON
    - **Esempio**: `[{ "data": "YYYY-MM-DD", "nuovi_guariti": 95 }, ...]`

- **Nuovi Deceduti Quotidiani**

  - **Endpoint**: `GET /marche/covid/statistiche/nuovi-deceduti-quotidiani/:dataInizio/:dataFine`
  - **Descrizione**: Restituisce il numero di nuovi decessi per ogni giorno nell'intervallo specificato.
  - **Parametri URL**:
    - `dataInizio` e `dataFine` come sopra.
  - **Risposta**:
    - **Formato**: JSON
    - **Esempio**: `[{ "data": "YYYY-MM-DD", "nuovi_deceduti": 2 }, ...]`

- **Media Nuovi Positivi**

  - **Endpoint**: `GET /marche/covid/statistiche/media-nuovi-positivi/:dataInizio/:dataFine`
  - **Descrizione**: Calcola la media mobile a 7 giorni dei nuovi positivi per l'intervallo specificato.
  - **Parametri URL**:
    - `dataInizio` e `dataFine` come sopra.
  - **Risposta**:
    - **Formato**: JSON
    - **Esempio**: `[{ "data": "YYYY-MM-DD", "media_nuovi_positivi": 75.5 }, ...]`

- **Tasso di Positività**

  - **Endpoint**: `GET /marche/covid/statistiche/tasso-positivita/:dataInizio/:dataFine`
  - **Descrizione**: Calcola il tasso di positività giornaliero (percentuale di test positivi sui test effettuati) per ogni giorno nell'intervallo specificato.
  - **Parametri URL**:
    - `dataInizio` e `dataFine` come sopra.
  - **Risposta**:
    - **Formato**: JSON
    - **Esempio**: `[{ "data": "YYYY-MM-DD", "tasso_positivita": 5.5 }, ...]`

### Tasso di Letalità

- **Endpoint**: `GET /marche/covid/statistiche/tasso-letalita`
- **Descrizione**: Restituisce il tasso di letalità complessivo (percentuale dei decessi sui casi totali) da inizio pandemia.
- **Risposta**:
  - **Formato**: JSON
  - **Esempio**: `{"tasso_letalita": 2.3}`

Per ogni endpoint protetto, è necessario includere l'header `Authorization` con il token JWT ottenuto dalla rotta di login.

### Modalità della Messa Online del Servizio

Il servizio è stato messo online utilizzando Glitch, rendendolo accessibile da qualsiasi client HTTP capace di effettuare richieste ai suddetti endpoint.

## Esempi di Utilizzo del Servizio Web

### Autenticazione e Ottenimento Token

Per iniziare ad interagire con il servizio, è necessario autenticarsi per ottenere un token JWT. Questo token sarà utilizzato per le successive richieste che richiedono autenticazione.

- **Richiesta di autenticazione:**

  ```http
  POST /marche/covid/login
  Content-Type: application/json

  {
    "username": "admin",
    "password": "admin"
  }

  ```

- **Risposta(Token JWT)**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### Creazione di un Nuovo Rapporto

Dopo aver ottenuto il token, è possibile utilizzarlo per creare un nuovo rapporto.

**Richiesta per creare un nuovo rapporto:**

```http
POST /marche/covid/rapporti-quotidiani
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "data": "2024-02-15T17:00:00",
  "..."
  "nuovi_positivi": 3,
  "dimessi_guariti": 732317,
  "deceduti": 4555,
  "..."
  "totale_casi": 736812,
  "tamponi": 3800801
  "..."
}

```

- **Risposta**
  ```http
  Rapporto creato con successo.
  ```

## Lettura dell'Ultimo Rapporto

Per ottenere l'ultimo rapporto disponibile, inviare una richiesta GET (non necessita di autenticazione).

**Richiesta:**

```http
GET /marche/covid/rapporti-quotidiani/ultimo
```

- **Risposta**
  ```json
  {
    "data": "2024-02-07T17:00:00",
    "stato": "ITA",
    "codice_regione": 11,
    "denominazione_regione": "Marche",
    "lat": 43.61675973,
    "long": 13.5188753,
    "ricoverati_con_sintomi": 17,
    "terapia_intensiva": 1,
    "totale_ospedalizzati": 18,
    "isolamento_domiciliare": 0,
    "totale_positivi": 18,
    "variazione_totale_positivi": -7,
    "nuovi_positivi": 2,
    "dimessi_guariti": 732314,
    "deceduti": 4554,
    "casi_da_sospetto_diagnostico": null,
    "casi_da_screening": null,
    "totale_casi": 736886,
    "tamponi": 3800744,
    "casi_testati": 2798450,
    "note": null,
    "ingressi_terapia_intensiva": 0,
    "note_test": null,
    "note_casi": null,
    "totale_positivi_test_molecolare": 223416,
    "totale_positivi_test_antigenico_rapido": 513470,
    "tamponi_test_molecolare": 2020770,
    "tamponi_test_antigenico_rapido": 1779974,
    "codice_nuts_1": "ITI",
    "codice_nuts_2": "ITI3"
  }
  ```

## Ottenimento del Tasso di Letalità

Per ottenere il tasso di letalità complessivo, inviare una richiesta GET (non necessita di autenticazione).

**Richiesta:**

```http
GET /marche/covid/statistiche/tasso-letalita
```

- **Risposta**
  ```json
  {
    "tasso_letalita": 0.62
  }
  ```
