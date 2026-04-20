# VSM Information Retrieval System
### CS4051 — Programming Assignment 2 | Spring 2026

A Vector Space Model (VSM) based Information Retrieval system built on 56 Trump speeches (June 2015 – November 2016). Documents are ranked using **TF·IDF weighting** and **cosine similarity**.

---

## Project Structure

```
VSM-IR-Model/
├── apps/
│   ├── backend/
│   │   ├── app.py               Flask REST API (6 endpoints)
│   │   └── requirements.txt     Python dependencies
│   └── frontend/
│       ├── src/
│       │   ├── App.jsx              Root layout — mounts all components
│       │   ├── main.jsx             React entry point
│       │   ├── index.css            Global CSS variables and reset
│       │   ├── components/
│       │   │   ├── SearchBar.jsx    Query input and submit button
│       │   │   ├── QueryPresets.jsx Clickable preset query chips
│       │   │   ├── Results.jsx      Ranked result cards with score badges
│       │   │   ├── StatsPanel.jsx   Index statistics (vocab, docs, postings)
│       │   │   └── DocumentModal.jsx Full document viewer with term highlighting
│       │   ├── context/
│       │   │   └── SearchContext.jsx Global state via useReducer + Context API
│       │   └── services/
│       │       └── api.js           HTTP client for all backend calls
│       ├── vite.config.js           Vite dev server config (port 3000)
│       └── package.json
├── packages/
│   └── core/
│       ├── preprocessing.py     Text cleaning, tokenization, stopword removal, lemmatization
│       ├── indexer.py           TF-IDF index builder + JSON save/load
│       ├── vsm.py               Query vector builder + cosine similarity engine
│       └── query_processor.py  Thin wrapper — formats results for the API
├── data/
│   ├── documents/               speech_0.txt through speech_55.txt (56 files)
│   ├── stopwords/               stopwords-list.txt (26 words)
│   └── queries/                 queries.txt (17 sample queries)
├── indexes/
│   └── vsm_index.json           Pre-built TF-IDF index (~1.9 MB, auto-generated)
├── cli.py                       Command-line interface with colored output
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

The server starts at **http://localhost:8080**. On first run it loads the pre-built index from `indexes/vsm_index.json`. If that file is missing it builds the index from scratch (takes ~10–15 seconds).

### Start the frontend (Terminal 2)

```bash
cd apps/frontend
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## CLI Usage

The CLI is a standalone interface that works entirely without the web server.

```bash
source venv/bin/activate

# Single query
python cli.py "make america great again"

# Adjust similarity threshold and result count
python cli.py "immigration border wall" --alpha 0.01 --top_k 5

# Run all 17 predefined queries
python cli.py --run-all-queries

# Show index statistics
python cli.py --stats

# Force rebuild the index from documents
python cli.py --rebuild

# Interactive mode (REPL)
python cli.py
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server status and index load confirmation |
| GET | `/stats` | Vocabulary size, document count, total postings, avg terms/doc |
| GET | `/queries` | Returns the 17 predefined queries from `queries.txt` |
| POST | `/search` | Run a VSM query, returns ranked results with scores |
| GET | `/document/<id>` | Fetch full text and word count of a single document |
| POST | `/build` | Rebuild the index with custom `min_df` / `max_df_ratio` |

**POST /search** request body:
```json
{
  "query": "military defense national security",
  "alpha": 0.005
}
```

Response:
```json
{
  "query": "military defense national security",
  "results": [
    { "doc_id": 17, "score": 0.310923 },
    { "doc_id": 5,  "score": 0.289441 }
  ],
  "total": 12,
  "alpha": 0.005
}
```

---

## How It Works

### 1. Preprocessing (`packages/core/preprocessing.py`)

Every document and every query goes through the same four-step pipeline:

| Step | Operation | Detail |
|------|-----------|--------|
| 1 | Case folding | `text.lower()` |
| 2 | Cleaning | `re.sub(r'[^a-z\s]', ' ', text)` — removes all non-alpha characters |
| 3 | Tokenization | `text.split()` — whitespace split |
| 4 | Stopword removal | Filters 26 words from `data/stopwords/stopwords-list.txt` |
| 5 | Lemmatization | WordNet lemmatizer, NOUN POS for all tokens |

Applying the same pipeline to queries and documents guarantees the query vector and document vectors live in the same feature space.

### 2. Indexing (`packages/core/indexer.py`)

`build_index()` constructs the following data structures and returns them as a single dictionary:

| Key | Type | Description |
|-----|------|-------------|
| `tfidf` | `{doc_id: {term: weight}}` | TF-IDF weight for every term in every document |
| `tf` | `{doc_id: {term: count}}` | Raw term frequencies (stored for reference) |
| `idf` | `{term: float}` | `log(N / df)` for each vocabulary term |
| `df` | `{term: int}` | Document frequency per term |
| `doc_norms` | `{doc_id: float}` | Euclidean norm of each document's TF-IDF vector |
| `vocabulary` | `[str]` | Sorted list of all retained terms |
| `N` | `int` | Total number of documents (56) |

**TF-IDF formula:**
```
tf(t, d)  = raw count of term t in document d
idf(t)    = log(N / df(t))
w(t, d)   = tf(t, d) × idf(t)
```

**Feature selection:** terms with `df < min_df` (default 1) or `df > max_df_ratio × N` (default 0.95 × 56 = 53) are excluded from the vocabulary.

The index is serialised to `indexes/vsm_index.json`. JSON only supports string keys, so integer `doc_id` keys are stringified on save and converted back to `int` on load.

### 3. Query Processing (`packages/core/vsm.py` + `query_processor.py`)

```
query text
    └─► preprocess_text()         same pipeline as documents
    └─► build_query_vector()      raw TF × IDF for each query term in vocabulary
    └─► cosine_similarity()       per document
    └─► filter by alpha           drop documents with score ≤ 0.005
    └─► sort descending           return ranked list
```

**Cosine similarity formula:**
```
sim(q, d) = (q⃗ · d⃗) / (|q⃗| × |d⃗|)
```

- The dot product only iterates over terms shared between query and document (sparse optimisation).
- `doc_norms` are pre-computed at index time so they are not recomputed per query.
- `query_norm` is computed from all query terms (including those with no document match), which correctly penalises partial matches.

### 4. Flask API (`apps/backend/app.py`)

- Index is loaded once at startup into the module-level `_index` variable.
- Subsequent requests reuse the cached index — no disk I/O per query.
- `get_index()` handles both the load-from-disk and build-from-scratch paths transparently.

### 5. Frontend (`apps/frontend/src/`)

| File | Role |
|------|------|
| `SearchContext.jsx` | Single source of truth. Holds `query`, `results`, `loading`, `error`, `stats`, `selectedDocId` via `useReducer`. |
| `api.js` | Thin fetch wrapper. All requests go to `http://localhost:8080`. Throws on non-2xx responses. |
| `SearchBar.jsx` | Controlled input. Dispatches `SET_QUERY` and calls `search()` on submit. |
| `QueryPresets.jsx` | Renders preset query chips from `/queries`. Clicking a chip sets the query and immediately searches. |
| `Results.jsx` | Maps `state.results` to ranked cards. Score badge colour: green ≥ 0.30, yellow ≥ 0.10, red < 0.10. |
| `StatsPanel.jsx` | Displays vocabulary size, document count, total postings, avg terms/doc from `/stats`. Also shows the score legend and TF-IDF formula. |
| `DocumentModal.jsx` | Full-screen overlay showing raw document text. Highlights query terms using `String.split()` with a capture-group regex. |

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
