import warnings
import difflib
import re

warnings.filterwarnings("ignore", message=".*word vectors.*")

# Optional spacy
nlp = None
try:
    import spacy
    try:
        nlp = spacy.load("en_core_web_sm")
    except Exception:
        nlp = None
except ImportError:
    nlp = None

# Optional fuzzywuzzy
try:
    from fuzzywuzzy import fuzz
    def get_fuzz_ratio(s1: str, s2: str) -> int:
        return fuzz.ratio(s1, s2)
except ImportError:
    def get_fuzz_ratio(s1: str, s2: str) -> int:
        return int(difflib.SequenceMatcher(None, s1, s2).ratio() * 100)


def normalize(text: str) -> str:
    return text.strip().lower().replace("_", " ")


def check_mcq(user_answer: str, correct_answer: str, options: list[str] | None = None) -> bool:
    user_norm = normalize(user_answer)
    correct_norm = normalize(correct_answer)

    if user_norm == correct_norm:
        return True

    if options:
        letter_map = {}
        for i, opt in enumerate(options):
            letter = chr(ord("a") + i)
            letter_map[letter] = normalize(opt)

        if user_norm in letter_map and letter_map[user_norm] == correct_norm:
            return True

        for letter, opt_norm in letter_map.items():
            if user_norm.startswith(letter + ".") or user_norm.startswith(letter + ")") or user_norm.startswith(letter + " "):
                remainder = user_norm[len(letter):].lstrip(".) ").strip()
                if remainder == opt_norm:
                    return True

    ratio = get_fuzz_ratio(user_norm, correct_norm)
    return ratio >= 85


def check_output(user_answer: str, correct_answer: str) -> bool:
    user_norm = normalize(user_answer).replace(" ", "")
    correct_norm = normalize(correct_answer).replace(" ", "")
    return user_norm == correct_norm


def check_oneword(user_answer: str, correct_answer: str) -> bool:
    user_norm = normalize(user_answer)
    correct_norm = normalize(correct_answer)

    if user_norm == correct_norm:
        return True

    if correct_norm in user_norm or user_norm in correct_norm:
        return True

    if nlp:
        user_doc = nlp(user_norm)
        correct_doc = nlp(correct_norm)
        user_lemmas = set(token.lemma_ for token in user_doc)
        correct_lemmas = set(token.lemma_ for token in correct_doc)
        if user_lemmas == correct_lemmas:
            return True

    ratio = get_fuzz_ratio(user_norm, correct_norm)
    return ratio >= 80


def check_short_answer(user_answer: str, correct_answer: str) -> bool:
    user_norm = normalize(user_answer)
    correct_norm = normalize(correct_answer)

    if user_norm == correct_norm:
        return True

    if correct_norm in user_norm or user_norm in correct_norm:
        return True

    if nlp:
        user_doc = nlp(user_norm)
        correct_doc = nlp(correct_norm)
        similarity = user_doc.similarity(correct_doc)
        user_keywords = set(
            token.lemma_.lower()
            for token in user_doc
            if token.pos_ in ("NOUN", "PROPN", "ADJ", "VERB") and not token.is_stop
        )
        correct_keywords = set(
            token.lemma_.lower()
            for token in correct_doc
            if token.pos_ in ("NOUN", "PROPN", "ADJ", "VERB") and not token.is_stop
        )

        if not correct_keywords:
            keyword_coverage = 1.0 if similarity >= 0.6 else 0.0
        else:
            matched = user_keywords & correct_keywords
            keyword_coverage = len(matched) / len(correct_keywords)

        combined_score = 0.5 * similarity + 0.5 * keyword_coverage
        return combined_score >= 0.60
    else:
        # High accuracy text and keyword coverage fallback
        user_words = set(re.findall(r'\b\w+\b', user_norm))
        correct_words = set(re.findall(r'\b\w+\b', correct_norm))
        stopwords = {"the", "a", "an", "is", "in", "it", "to", "for", "of", "and", "by", "on", "with"}
        key_user = user_words - stopwords
        key_correct = correct_words - stopwords
        
        ratio = get_fuzz_ratio(user_norm, correct_norm) / 100.0
        if not key_correct:
            return ratio >= 0.70
        coverage = len(key_user & key_correct) / len(key_correct)
        return (0.4 * ratio + 0.6 * coverage) >= 0.60


def check_answer(user_answer: str, question: dict) -> bool:
    if not user_answer or not user_answer.strip():
        return False

    q_type = question.get("type", "mcq")
    correct_answer = question["a"]
    options = question.get("options")

    if q_type == "mcq":
        return check_mcq(user_answer, correct_answer, options)
    elif q_type == "output":
        return check_output(user_answer, correct_answer)
    elif q_type == "oneword":
        return check_oneword(user_answer, correct_answer)
    elif q_type == "short":
        return check_short_answer(user_answer, correct_answer)
    else:
        return check_mcq(user_answer, correct_answer, options)
