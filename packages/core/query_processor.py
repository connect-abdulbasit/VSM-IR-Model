from .vsm import retrieve


def process_query(query_text: str, index: dict,
                  alpha: float = 0.005, top_k: int = 20) -> list:
    results = retrieve(query_text, index, alpha=alpha, top_k=top_k)
    return [
        {'doc_id': doc_id, 'score': round(score, 6)}
        for doc_id, score in results
    ]
