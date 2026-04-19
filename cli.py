#!/usr/bin/env python3

import os
import sys
import argparse
import textwrap

sys.path.insert(0, os.path.dirname(__file__))

from packages.core.indexer import build_index, save_index, load_index
from packages.core.query_processor import process_query

_DATA_PATH = os.path.join(os.path.dirname(__file__), 'data/documents')
_QUERIES_PATH = os.path.join(os.path.dirname(__file__), 'data/queries/queries.txt')

_USE_COLOR = sys.stdout.isatty()

def _c(code: str, text: str) -> str:
    return f'\033[{code}m{text}\033[0m' if _USE_COLOR else text

BOLD   = lambda t: _c('1', t)
CYAN   = lambda t: _c('96', t)
GREEN  = lambda t: _c('92', t)
YELLOW = lambda t: _c('93', t)
RED    = lambda t: _c('91', t)
DIM    = lambda t: _c('2', t)


def score_bar(score: float, width: int = 30) -> str:
    filled = int(score * width)
    bar = '█' * filled + '░' * (width - filled)
    colour = GREEN if score >= 0.3 else YELLOW if score >= 0.1 else RED
    return colour(f'[{bar}]') + f' {score:.4f}'


def get_snippet(doc_id: int, max_chars: int = 200) -> str:
    filepath = os.path.join(_DATA_PATH, f'speech_{doc_id}.txt')
    if not os.path.exists(filepath):
        return ''
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    snippet = ' '.join(lines[1:4]) if len(lines) > 1 else lines[0] if lines else ''
    return textwrap.shorten(snippet, width=max_chars, placeholder='...')


def ensure_index(rebuild: bool = False) -> dict:
    if not rebuild:
        idx = load_index()
        if idx is not None:
            return idx
    print(BOLD('Building TF-IDF index from documents...'))
    idx = build_index()
    save_index(idx)
    print(GREEN(f'  Index built: {len(idx["vocabulary"])} terms, {idx["N"]} documents\n'))
    return idx


def run_query(query: str, index: dict, alpha: float, top_k: int,
              verbose: bool = True) -> list:
    if verbose:
        print()
        print(BOLD('─' * 60))
        print(f'  Query : {CYAN(query)}')
        print(f'  Alpha : {alpha}   Top-K : {top_k}')
        print(BOLD('─' * 60))

    results = process_query(query, index, alpha=alpha, top_k=top_k)

    if not results:
        if verbose:
            print(YELLOW('  No documents exceeded the similarity threshold.'))
        return results

    if verbose:
        print(f'  Found {GREEN(str(len(results)))} matching document(s)\n')
        for rank, r in enumerate(results, 1):
            doc_id  = r['doc_id']
            score   = r['score']
            snippet = get_snippet(doc_id)
            print(f'  {DIM(str(rank).rjust(2))}.  {BOLD(f"speech_{doc_id}.txt")}')
            print(f'       Score : {score_bar(score)}')
            if snippet:
                print(f'       {DIM(snippet)}')
            print()

    return results


def run_all_predefined_queries(index: dict, alpha: float, top_k: int) -> None:
    if not os.path.exists(_QUERIES_PATH):
        print(RED('Queries file not found: ' + _QUERIES_PATH))
        return

    with open(_QUERIES_PATH, 'r', encoding='utf-8') as f:
        queries = [ln.strip() for ln in f if ln.strip()]

    print(BOLD(f'\n  Running {len(queries)} predefined queries\n'))
    for i, q in enumerate(queries, 1):
        print(CYAN(f'[Q{i}]'), end=' ')
        run_query(q, index, alpha, top_k, verbose=True)


def print_index_stats(index: dict) -> None:
    total_postings = sum(len(v) for v in index['tfidf'].values())
    print(BOLD('\n  Index Statistics'))
    print(f'  Documents   : {index["N"]}')
    print(f'  Vocabulary  : {len(index["vocabulary"])} terms')
    print(f'  Postings    : {total_postings}')
    print(f'  Avg/doc     : {total_postings / index["N"]:.1f} terms\n')


def main() -> None:
    parser = argparse.ArgumentParser(description='VSM Information Retrieval System — CS4051')
    parser.add_argument('query', nargs='?', default=None, help='Free-text query string')
    parser.add_argument('--alpha', type=float, default=0.005, help='Cosine similarity threshold (default: 0.005)')
    parser.add_argument('--top_k', type=int, default=20, help='Maximum results to return (default: 20)')
    parser.add_argument('--rebuild', action='store_true', help='Force rebuild of the TF-IDF index')
    parser.add_argument('--run-all-queries', action='store_true', help='Execute all 10 predefined queries')
    parser.add_argument('--stats', action='store_true', help='Print index statistics and exit')

    args = parser.parse_args()

    print(BOLD('\n  VSM Information Retrieval System — CS4051'))
    print(DIM('  Trump Speeches Dataset (56 documents)\n'))

    index = ensure_index(rebuild=args.rebuild)

    if args.stats or args.rebuild:
        print_index_stats(index)
        if not args.query and not args.run_all_queries:
            return

    if args.run_all_queries:
        run_all_predefined_queries(index, args.alpha, args.top_k)
        return

    if args.query:
        run_query(args.query, index, args.alpha, args.top_k)
    else:
        print(BOLD('  Interactive Query Mode'))
        print(DIM('  Type a query and press Enter. Type "exit" to quit.\n'))
        while True:
            try:
                query = input(CYAN('  > ')).strip()
            except (EOFError, KeyboardInterrupt):
                print('\n  Goodbye.')
                break
            if not query:
                continue
            if query.lower() in ('exit', 'quit', 'q'):
                print('  Goodbye.')
                break
            run_query(query, index, args.alpha, args.top_k)


if __name__ == '__main__':
    main()
