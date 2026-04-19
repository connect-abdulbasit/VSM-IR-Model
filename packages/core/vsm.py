import math
from collections import defaultdict
from .preprocessing import load_stopwords, preprocess_text


def build_query_vector(query_text: str, idf: dict, vocab_set: set) -> dict:
    stopwords = load_stopwords()
    tokens = preprocess_text(query_text, stopwords)

    query_tf = defaultdict(int)
    for token in tokens:
        if token in vocab_set:
            query_tf[token] += 1

    return {
        term: count * idf[term]
        for term, count in query_tf.items()
        if term in idf
    }


def cosine_similarity(query_vec: dict, doc_vec: dict, doc_norm: float) -> float:
    if doc_norm == 0.0 or not query_vec:
        return 0.0

    dot_product = sum(
        query_vec[term] * doc_vec[term]
        for term in query_vec
        if term in doc_vec
    )

    query_norm = math.sqrt(sum(w * w for w in query_vec.values()))
    if query_norm == 0.0:
        return 0.0

    return dot_product / (query_norm * doc_norm)


def retrieve(query_text: str, index: dict, alpha: float = 0.005,
             top_k: int = None) -> list:
    vocab_set = set(index['vocabulary'])
    idf = index['idf']
    tfidf = index['tfidf']
    doc_norms = index['doc_norms']

    query_vec = build_query_vector(query_text, idf, vocab_set)

    if not query_vec:
        return []

    scored = []
    for doc_id, doc_vec in tfidf.items():
        score = cosine_similarity(query_vec, doc_vec, doc_norms[doc_id])
        if score > alpha:
            scored.append((doc_id, score))

    scored.sort(key=lambda x: x[1], reverse=True)

    if top_k is not None:
        scored = scored[:top_k]

    return scored
