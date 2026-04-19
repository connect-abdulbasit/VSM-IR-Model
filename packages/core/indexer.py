import os
import json
import math
from collections import defaultdict
from .preprocessing import load_stopwords, preprocess_text

_DATA_PATH = os.path.join(os.path.dirname(__file__), '../../data/documents')
_INDEX_PATH = os.path.join(os.path.dirname(__file__), '../../indexes')
_INDEX_FILE = os.path.join(_INDEX_PATH, 'vsm_index.json')


def _load_documents(data_path: str) -> dict:
    doc_files = sorted(
        [f for f in os.listdir(data_path) if f.endswith('.txt')],
        key=lambda x: int(x.split('_')[1].split('.')[0])
    )
    documents = {}
    for filename in doc_files:
        doc_id = int(filename.split('_')[1].split('.')[0])
        filepath = os.path.join(data_path, filename)
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            documents[doc_id] = f.read()
    return documents


def build_index(min_df: int = 1, max_df_ratio: float = 0.95,
                data_path: str = None) -> dict:
    if data_path is None:
        data_path = _DATA_PATH

    stopwords = load_stopwords()
    documents = _load_documents(data_path)
    N = len(documents)
    print(f"[Indexer] Loaded {N} documents.")

    tf = {}
    for doc_id, text in documents.items():
        tokens = preprocess_text(text, stopwords)
        term_counts = defaultdict(int)
        for token in tokens:
            term_counts[token] += 1
        tf[doc_id] = dict(term_counts)

    df = defaultdict(int)
    for term_counts in tf.values():
        for term in term_counts:
            df[term] += 1

    max_df_count = int(max_df_ratio * N)
    vocabulary = sorted(
        term for term, count in df.items()
        if min_df <= count <= max_df_count
    )
    vocab_set = set(vocabulary)
    print(f"[Indexer] Vocabulary: {len(vocabulary)} terms "
          f"(min_df={min_df}, max_df_ratio={max_df_ratio})")

    idf = {term: math.log(N / df[term]) for term in vocab_set}

    tfidf = {}
    for doc_id, term_counts in tf.items():
        vec = {}
        for term, count in term_counts.items():
            if term in vocab_set:
                vec[term] = count * idf[term]
        tfidf[doc_id] = vec

    doc_norms = {
        doc_id: math.sqrt(sum(w * w for w in vec.values()))
        for doc_id, vec in tfidf.items()
    }

    return {
        'tfidf': {str(k): v for k, v in tfidf.items()},
        'tf': {str(k): v for k, v in tf.items()},
        'idf': idf,
        'df': {term: df[term] for term in vocab_set},
        'doc_norms': {str(k): v for k, v in doc_norms.items()},
        'vocabulary': vocabulary,
        'N': N,
    }


def save_index(index: dict, path: str = None) -> None:
    os.makedirs(_INDEX_PATH, exist_ok=True)
    filepath = path or _INDEX_FILE
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(index, f)
    size_kb = os.path.getsize(filepath) / 1024
    print(f"[Indexer] Saved → {filepath} ({size_kb:.1f} KB)")


def load_index(path: str = None) -> dict | None:
    filepath = path or _INDEX_FILE
    if not os.path.exists(filepath):
        return None
    with open(filepath, 'r', encoding='utf-8') as f:
        index = json.load(f)
    index['tfidf'] = {int(k): v for k, v in index['tfidf'].items()}
    index['tf'] = {int(k): v for k, v in index['tf'].items()}
    index['doc_norms'] = {int(k): v for k, v in index['doc_norms'].items()}
    print(f"[Indexer] Loaded → {len(index['vocabulary'])} terms, {index['N']} docs")
    return index
