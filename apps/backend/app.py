import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from flask import Flask, request, jsonify
from flask_cors import CORS

from packages.core.indexer import build_index, save_index, load_index
from packages.core.query_processor import process_query

app = Flask(__name__)
CORS(app)

_DATA_PATH = os.path.join(os.path.dirname(__file__), '../../data/documents')
_QUERIES_PATH = os.path.join(os.path.dirname(__file__), '../../data/queries/queries.txt')

_index = None


def get_index() -> dict:
    global _index
    if _index is None:
        _index = load_index()
        if _index is None:
            print("[API] Building index from scratch...")
            _index = build_index()
            save_index(_index)
    return _index


@app.route('/health', methods=['GET'])
def health():
    idx = get_index()
    return jsonify({
        'status': 'ok',
        'index_loaded': idx is not None,
        'vocabulary_size': len(idx['vocabulary']) if idx else 0,
        'num_documents': idx['N'] if idx else 0,
    })


@app.route('/stats', methods=['GET'])
def stats():
    idx = get_index()
    total_postings = sum(len(v) for v in idx['tfidf'].values())
    return jsonify({
        'vocabulary_size': len(idx['vocabulary']),
        'num_documents': idx['N'],
        'total_postings': total_postings,
        'avg_terms_per_doc': round(total_postings / idx['N'], 1),
    })


@app.route('/queries', methods=['GET'])
def predefined_queries():
    if not os.path.exists(_QUERIES_PATH):
        return jsonify({'queries': []})
    with open(_QUERIES_PATH, 'r', encoding='utf-8') as f:
        queries = [line.strip() for line in f if line.strip()]
    return jsonify({'queries': queries})


@app.route('/search', methods=['POST'])
def search():
    data = request.get_json(force=True)
    query = (data.get('query') or '').strip()
    alpha = float(data.get('alpha', 0.005))
    top_k = int(data.get('top_k', 20))

    if not query:
        return jsonify({'error': 'Query cannot be empty'}), 400

    idx = get_index()
    results = process_query(query, idx, alpha=alpha, top_k=top_k)

    return jsonify({
        'query': query,
        'results': results,
        'total': len(results),
        'alpha': alpha,
    })


@app.route('/document/<int:doc_id>', methods=['GET'])
def get_document(doc_id: int):
    filename = f'speech_{doc_id}.txt'
    filepath = os.path.join(_DATA_PATH, filename)

    if not os.path.exists(filepath):
        return jsonify({'error': f'Document {doc_id} not found'}), 404

    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    title = next((line.strip() for line in content.splitlines() if line.strip()), filename)

    return jsonify({
        'id': doc_id,
        'filename': filename,
        'title': title,
        'content': content,
        'word_count': len(content.split()),
    })


@app.route('/build', methods=['POST'])
def build():
    global _index
    data = request.get_json(force=True) or {}
    min_df = int(data.get('min_df', 1))
    max_df_ratio = float(data.get('max_df_ratio', 0.95))

    _index = build_index(min_df=min_df, max_df_ratio=max_df_ratio)
    save_index(_index)

    return jsonify({
        'status': 'ok',
        'vocabulary_size': len(_index['vocabulary']),
        'num_documents': _index['N'],
        'min_df': min_df,
        'max_df_ratio': max_df_ratio,
    })


if __name__ == '__main__':
    print("=" * 60)
    print("  VSM Information Retrieval System — Backend API")
    print("=" * 60)
    get_index()
    idx = get_index()
    print(f"  Documents : {idx['N']}")
    print(f"  Vocabulary: {len(idx['vocabulary'])} terms")
    print("  Server    : http://localhost:8080")
    print("=" * 60)
    app.run(debug=False, port=8080)
