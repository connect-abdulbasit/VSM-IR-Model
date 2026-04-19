import re
import os
import nltk
from nltk.stem import WordNetLemmatizer
from nltk.corpus import wordnet

for resource in ('wordnet', 'omw-1.4', 'averaged_perceptron_tagger'):
    nltk.download(resource, quiet=True)

_STOPWORDS_PATH = os.path.join(
    os.path.dirname(__file__), '../../data/stopwords/stopwords-list.txt'
)

_lemmatizer = WordNetLemmatizer()
_stopwords_cache = None


def load_stopwords(path: str = None) -> set:
    global _stopwords_cache
    if _stopwords_cache is not None:
        return _stopwords_cache
    filepath = path or _STOPWORDS_PATH
    with open(filepath, 'r', encoding='utf-8') as f:
        _stopwords_cache = {line.strip().lower() for line in f if line.strip()}
    return _stopwords_cache


def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^a-z\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def tokenize(text: str) -> list:
    return text.split()


def remove_stopwords(tokens: list, stopwords: set) -> list:
    return [t for t in tokens if t not in stopwords]


def lemmatize_token(token: str) -> str:
    return _lemmatizer.lemmatize(token, pos=wordnet.NOUN)


def preprocess_text(text: str, stopwords: set = None) -> list:
    if stopwords is None:
        stopwords = load_stopwords()
    text = clean_text(text)
    tokens = tokenize(text)
    tokens = remove_stopwords(tokens, stopwords)
    tokens = [lemmatize_token(t) for t in tokens]
    return tokens
