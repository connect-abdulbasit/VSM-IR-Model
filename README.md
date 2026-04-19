# VSM Information Retrieval System
### CS4051 — Programming Assignment 2 | Spring 2026

A Vector Space Model (VSM) based Information Retrieval system built on 56 Trump speeches (June 2015 – November 2016). Documents are ranked using **TF·IDF weighting** and **cosine similarity**.

---

## Project Structure

```
VSM-IR-Model/
├── apps/
│   ├── backend/
│   │   ├── app.py               Flask REST API
│   │   └── requirements.txt     Python dependencies
│   └── frontend/
│       ├── src/
│       │   ├── App.jsx
│       │   ├── components/
│       │   │   ├── SearchBar.jsx
│       │   │   ├── QueryPresets.jsx
│       │   │   ├── Results.jsx
│       │   │   ├── StatsPanel.jsx
│       │   │   └── DocumentModal.jsx
│       │   ├── context/
│       │   │   └── SearchContext.jsx
│       │   └── services/
│       │       └── api.js
│       └── package.json
├── packages/
│   └── core/
│       ├── preprocessing.py     Tokenization, stopwords, lemmatization
│       ├── indexer.py           TF-IDF index builder + save/load
│       ├── vsm.py               Cosine similarity engine
│       └── query_processor.py  Query entry point
├── data/
│   ├── documents/               56 Trump speech .txt files
│   ├── stopwords/               stopwords-list.txt
│   └── queries/                 queries.txt (10 sample queries)
├── indexes/
│   └── vsm_index.json           Saved TF-IDF index (auto-generated)
├── cli.py                       Command-line interface
└── venv/                        Python virtual environment
```

---

## Setup

### 1. Create and activate the virtual environment

```bash
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Python dependencies

```bash
pip install flask flask-cors nltk
```

### 3. Download NLTK data (one-time)

```bash
python -c "import nltk; nltk.download('wordnet'); nltk.download('omw-1.4')"
```

### 4. Install frontend dependencies

```bash
cd apps/frontend
npm install
```

---

## Running the App

### Start the backend (Terminal 1)

```bash
source venv/bin/activate
python apps/backend/app.py
```

Server starts at **http://localhost:8080**. The TF-IDF index loads automatically on first run (or rebuilds if not found).

### Start the frontend (Terminal 2)

```bash
cd apps/frontend
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## CLI Usage

```bash
source venv/bin/activate

# Single query
python cli.py "make america great again"

# Adjust threshold and result count
python cli.py "immigration border wall" --alpha 0.01 --top_k 5

# Run all 10 assignment queries
python cli.py --run-all-queries

# Show index statistics
python cli.py --stats

# Force rebuild the index
python cli.py --rebuild

# Interactive mode
python cli.py
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server and index status |
| GET | `/stats` | Vocabulary size, document count, postings |
| GET | `/queries` | Load the 10 predefined queries |
| POST | `/search` | Run a VSM query |
| GET | `/document/<id>` | Fetch full text of a document |
| POST | `/build` | Rebuild index with custom min_df / max_df_ratio |

**POST /search** request body:
```json
{
  "query": "military defense national security",
  "alpha": 0.005,
  "top_k": 20
}
```

---

## How It Works

### Preprocessing Pipeline
1. **Case folding** — lowercase all text
2. **Tokenization** — split on whitespace
3. **Stopword removal** — filter 26 common words from provided list
4. **Lemmatization** — reduce words to base form using WordNet

### Indexing
- **TF** — raw term count per document
- **IDF** — `log(N / df)` where N = 56, df = document frequency
- **TF-IDF weight** — `tf × idf` stored per document per term
- **Feature selection** — terms filtered by `min_df` and `max_df_ratio`
- Index serialised to `indexes/vsm_index.json`

### Query Processing
1. Query preprocessed through same pipeline as documents
2. Query TF-IDF vector built in the same feature space
3. Cosine similarity computed against every document vector
4. Documents with score ≤ α (0.005) are filtered out
5. Results returned sorted by descending similarity score

### Cosine Similarity
```
sim(q, d) = (q · d) / (|q| × |d|)
```

---

## Index Statistics

| Metric | Value |
|--------|-------|
| Documents | 56 |
| Vocabulary | 5,985 terms |
| Total postings | 36,768 |
| Avg terms/doc | 656 |
| Index file size | ~1.9 MB |

---

## Sample Queries & Results

| Query | Top Result | Score |
|-------|-----------|-------|
| military defense national security | speech_17.txt | 0.3109 |
| veterans service military support | speech_5.txt | 0.2960 |
| education school teachers | speech_18.txt | 0.1799 |
| healthcare obamacare repeal | speech_30.txt | 0.1043 |
| crime law enforcement police | speech_10.txt | 0.1210 |

---

## Grading Criteria

| Component | Marks |
|-----------|-------|
| Preprocessing (tokenization, stopwords, lemmatization) | 3 |
| Index formation + save/load | 2 |
| Simple VSM queries | 2 |
| Complex VSM queries | 2 |
| Code complexity | 1 |
| GUI (bonus) | 2 |
