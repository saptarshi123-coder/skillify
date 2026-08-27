import json
import random
import os
import threading
import time

from nlp_checker import check_answer

ACCURACY_THRESHOLD = 70.0
QUIZ_SIZE = 10
QUESTION_TIME_LIMIT = 30  # seconds per question (0 = no limit)
QUIZ_TIME_LIMIT = 600    # total quiz time in seconds (0 = no limit)
SKILL_FILES = {
    "python": "python.json",
    "web dev": "webdev.json",
    "app dev": "appdev.json",
}
VALID_SKILLS = list(SKILL_FILES.keys())
ALIASES = {
    "python": "python",
    "py": "python",
    "webdev": "web dev",
    "web dev": "web dev",
    "web development": "web dev",
    "web": "web dev",
    "appdev": "app dev",
    "app dev": "app dev",
    "app development": "app dev",
    "app": "app dev",
    "mobile": "app dev",
    "mobile dev": "app dev",
}


def normalize_skill(raw: str) -> str | None:
    return ALIASES.get(raw.lower().strip())


def load_questions(skill: str) -> list[dict]:
    """
    Loads question banks for the specified skill.
    Searches backend/quiz_engine/question_banks first, then falls back to database/question_banks.
    """
    skill_lower = skill.lower().strip()
    filename = SKILL_FILES.get(skill_lower)
    if not filename:
        raise ValueError(f"Unknown skill: '{skill}'. Choose from: {', '.join(VALID_SKILLS)}")

    script_dir = os.path.dirname(os.path.abspath(__file__))
    filepath = os.path.join(script_dir, "question_banks", filename)

    # Fallback to database/question_banks if local question bank directory is moved
    if not os.path.exists(filepath):
        database_filepath = os.path.abspath(os.path.join(script_dir, "..", "..", "database", "question_banks", filename))
        if os.path.exists(database_filepath):
            filepath = database_filepath
        else:
            raise FileNotFoundError(f"Question bank not found in {filepath} or {database_filepath}")

    with open(filepath, "r", encoding="utf-8") as f:
        questions = json.load(f)

    if len(questions) < QUIZ_SIZE:
        raise ValueError(f"Question bank for '{skill}' has only {len(questions)} questions")

    return questions


def select_quiz(questions: list[dict], n: int = QUIZ_SIZE) -> list[dict]:
    by_type = {}
    for q in questions:
        t = q.get("type", "mcq")
        by_type.setdefault(t, []).append(q)

    selected = []
    type_names = list(by_type.keys())
    per_type = max(1, n // len(type_names)) if type_names else n

    for t in type_names:
        pool = by_type[t]
        count = min(per_type, len(pool))
        selected.extend(random.sample(pool, count))

    remaining = n - len(selected)
    if remaining > 0:
        used = set(id(q) for q in selected)
        pool = [q for q in questions if id(q) not in used]
        selected.extend(random.sample(pool, min(remaining, len(pool))))

    if len(selected) > n:
        selected = selected[:n]

    random.shuffle(selected)
    return selected


def format_question_for_user(question: dict, idx: int, total: int) -> dict:
    """Format a question for sending to frontend/backend."""
    q_type = question.get("type", "mcq")
    type_labels = {
        "mcq": "Multiple Choice",
        "output": "Output Prediction",
        "short": "Short Answer",
        "oneword": "One Word Answer",
    }

    formatted = {
        "question_number": idx + 1,
        "total_questions": total,
        "question": question["q"],
        "type": q_type,
        "type_label": type_labels.get(q_type, q_type),
    }

    if q_type == "mcq" and question.get("options"):
        formatted["options"] = question["options"]
        formatted["option_letters"] = [
            chr(ord("a") + i) for i in range(len(question["options"]))
        ]

    if QUESTION_TIME_LIMIT > 0:
        formatted["time_limit"] = QUESTION_TIME_LIMIT
    if QUIZ_TIME_LIMIT > 0:
        formatted["quiz_time_limit"] = QUIZ_TIME_LIMIT

    return formatted


def grade_answer(user_answer: str, question: dict) -> dict:
    """Grade a single answer. Returns result dict."""
    is_correct = check_answer(user_answer, question)
    return {
        "correct": is_correct,
        "user_answer": user_answer or "(skipped)",
        "correct_answer": question["a"],
        "points": 1 if is_correct else (-1 if user_answer and user_answer.strip() else 0),
    }


def calculate_results(answers: list[dict], total: int = QUIZ_SIZE) -> dict:
    """Calculate final results from a list of answer dicts."""
    correct = sum(1 for a in answers if a["correct"])
    wrong = sum(1 for a in answers if not a["correct"] and a["user_answer"] != "(skipped)")
    skipped = sum(1 for a in answers if a["user_answer"] == "(skipped)")

    accuracy = (correct / total) * 100 if total > 0 else 0.0
    score = correct - wrong
    acquired = accuracy >= ACCURACY_THRESHOLD

    return {
        "acquired": acquired,
        "accuracy": round(accuracy, 1),
        "score": score,
        "correct": correct,
        "wrong": wrong,
        "skipped": skipped,
        "total": total,
        "threshold": ACCURACY_THRESHOLD,
        "message": (
            f"Congratulations! You've successfully acquired this skill!"
            if acquired
            else f"You need more correct answers to acquire this skill. Try again!"
        ),
    }


def get_review_data(answers: list[dict]) -> dict:
    """Generate review data grouped by question type."""
    by_type = {}
    for i, a in enumerate(answers):
        q_type = a.get("type", "mcq")
        by_type.setdefault(q_type, []).append({
            "index": i + 1,
            "question": a.get("question", ""),
            "user_answer": a["user_answer"],
            "correct_answer": a["correct_answer"],
            "correct": a["correct"],
            "points": a["points"],
        })

    stats = {}
    for q_type, items in by_type.items():
        t_correct = sum(1 for x in items if x["correct"])
        t_total = len(items)
        stats[q_type] = {
            "correct": t_correct,
            "total": t_total,
            "accuracy": round((t_correct / t_total) * 100, 1) if t_total > 0 else 0,
        }

    return {"by_type": by_type, "stats": stats}


# ─── TERMINAL MODE ───────────────────────────────────────────────

def _present_question_terminal(idx: int, question: dict, total: int, time_left: int = None) -> str:
    q_type = question.get("type", "mcq")
    type_labels = {
        "mcq": "Multiple Choice",
        "output": "Output Prediction",
        "short": "Short Answer",
        "oneword": "One Word Answer",
    }

    print(f"\n{'='*60}")
    timer_str = f"  | Time: {time_left}s" if time_left is not None else ""
    print(f"  Question {idx + 1} of {total}  [{type_labels.get(q_type, q_type)}]{timer_str}")
    print(f"{'='*60}")
    print(f"\n  {question['q']}\n")

    if q_type == "mcq" and question.get("options"):
        for i, opt in enumerate(question["options"]):
            letter = chr(ord("a") + i)
            print(f"    {letter}) {opt}")
        print()

    return input("  Your answer: ").strip()


def _present_question_with_timer(idx: int, question: dict, total: int, quiz_time_remaining: int = None) -> str:
    """Present question with countdown timer."""
    if QUESTION_TIME_LIMIT <= 0 and (quiz_time_remaining is None or QUIZ_TIME_LIMIT <= 0):
        return _present_question_terminal(idx, question, total)

    q_type = question.get("type", "mcq")
    type_labels = {
        "mcq": "Multiple Choice",
        "output": "Output Prediction",
        "short": "Short Answer",
        "oneword": "One Word Answer",
    }

    timer_event = threading.Event()
    timed_out = {"flag": False}

    def countdown():
        for remaining in range(QUESTION_TIME_LIMIT, 0, -1):
            if timer_event.is_set():
                return
            print(f"\r  ⏱  Time: {remaining:2d}s remaining  ", end="", flush=True)
            time.sleep(1)
        timed_out["flag"] = True

    print(f"\n{'='*60}")
    q_timer = f"  | Q-Timer: {QUESTION_TIME_LIMIT}s" if QUESTION_TIME_LIMIT > 0 else ""
    quiz_timer = f"  | Quiz: {quiz_time_remaining}s" if quiz_time_remaining is not None else ""
    print(f"  Question {idx + 1} of {total}  [{type_labels.get(q_type, q_type)}]{q_timer}{quiz_timer}")
    print(f"{'='*60}")
    print(f"\n  {question['q']}\n")

    if q_type == "mcq" and question.get("options"):
        for i, opt in enumerate(question["options"]):
            letter = chr(ord("a") + i)
            print(f"    {letter}) {opt}")
        print()

    timer_thread = threading.Thread(target=countdown, daemon=True)
    timer_thread.start()

    try:
        answer = input("  Your answer: ").strip()
    except (EOFError, KeyboardInterrupt):
        answer = ""

    timer_event.set()
    timer_thread.join(timeout=0.1)

    if timed_out["flag"]:
        print("\n  ⏱  TIME'S UP!")
        return ""

    print("\r" + " " * 50 + "\r", end="")
    return answer


def _show_review_terminal(answers: list[dict]):
    """Show detailed review after quiz completion."""
    review = get_review_data(answers)
    type_labels = {
        "mcq": "Multiple Choice",
        "output": "Output Prediction",
        "short": "Short Answer",
        "oneword": "One Word Answer",
    }

    print(f"\n{'#'*60}")
    print(f"  DETAILED REVIEW")
    print(f"{'#'*60}")

    for q_type in ["mcq", "output", "short", "oneword"]:
        if q_type not in review["by_type"]:
            continue
        items = review["by_type"][q_type]
        stats = review["stats"][q_type]
        label = type_labels.get(q_type, q_type)

        print(f"\n  --- {label} ({stats['correct']}/{stats['total']}) ---")

        for item in items:
            status = "✓" if item["correct"] else "✗"
            color = "  " if item["correct"] else "  "
            print(f"\n  {color}{status} Q{item['index']}: {item['question'][:70]}")
            if item["user_answer"] == "(skipped)":
                print(f"       Your answer: (skipped)")
            else:
                print(f"       Your answer: {item['user_answer']}")
            if not item["correct"]:
                print(f"       Correct: {item['correct_answer']}")
            print(f"       Points: {'+' if item['points'] > 0 else ''}{item['points']}")

    print(f"\n{'#'*60}")
    print(f"  REVIEW SUMMARY")
    print(f"{'#'*60}")
    for q_type in ["mcq", "output", "short", "oneword"]:
        if q_type not in review["stats"]:
            continue
        s = review["stats"][q_type]
        label = type_labels.get(q_type, q_type)
        bar_len = int(s["accuracy"] / 5)
        bar = "█" * bar_len + "░" * (20 - bar_len)
        print(f"  {label:20s} {bar} {s['accuracy']:5.1f}% ({s['correct']}/{s['total']})")
    print(f"{'#'*60}\n")


def run_quiz_terminal(skill: str, show_review: bool = True) -> dict:
    """Run the full quiz interactively in the terminal."""
    skill_lower = skill.lower().strip()
    print(f"\n{'#'*60}")
    print(f"  SKILL ASSESSMENT QUIZ")
    print(f"  Skill: {skill.upper()}")
    print(f"  Questions: {QUIZ_SIZE} | Accuracy needed: {ACCURACY_THRESHOLD}%")
    print(f"  Scoring: +1 correct | -1 wrong | 0 blank")
    if QUESTION_TIME_LIMIT > 0:
        print(f"  Timer: {QUESTION_TIME_LIMIT}s per question")
    if QUIZ_TIME_LIMIT > 0:
        print(f"  Total time: {QUIZ_TIME_LIMIT // 60}m {QUIZ_TIME_LIMIT % 60}s")
    print(f"{'#'*60}")

    questions = load_questions(skill)
    quiz = select_quiz(questions)
    answers = []
    quiz_start = time.time()
    timed_out_quiz = False

    for i, question in enumerate(quiz):
        quiz_elapsed = time.time() - quiz_start
        quiz_time_remaining = max(0, int(QUIZ_TIME_LIMIT - quiz_elapsed)) if QUIZ_TIME_LIMIT > 0 else None

        if QUIZ_TIME_LIMIT > 0 and quiz_time_remaining <= 0:
            print(f"\n  ⏱  QUIZ TIME'S UP!")
            timed_out_quiz = True
            break

        user_answer = _present_question_with_timer(i, question, QUIZ_SIZE, quiz_time_remaining)
        result = grade_answer(user_answer, question)
        result["question"] = question["q"]
        result["type"] = question["type"]
        answers.append(result)

        if result["correct"]:
            print(f"  -> Correct! (+1)")
        elif user_answer:
            print(f"  -> Wrong! (-1)")
            print(f"  -> Correct answer: {question['a']}")
        else:
            print(f"  -> Skipped (0 points)")

    answered = len(answers)
    results = calculate_results(answers, answered if timed_out_quiz else QUIZ_SIZE)
    results["skill"] = skill_lower
    results["results"] = answers
    results["timed_out"] = timed_out_quiz

    if timed_out_quiz:
        print(f"\n  Note: Quiz ended early due to time limit ({answered}/{QUIZ_SIZE} questions answered)")

    print(f"\n{'='*60}")
    print(f"  QUIZ RESULTS")
    print(f"{'='*60}")
    print(f"  Correct: {results['correct']}/{results['total']}")
    print(f"  Wrong:   {results['wrong']}/{results['total']}")
    print(f"  Skipped: {results['skipped']}/{results['total']}")
    print(f"  Score:   {results['score']}")
    print(f"  Accuracy: {results['accuracy']}%")
    print(f"  Threshold: {ACCURACY_THRESHOLD}%")
    print(f"{'='*60}")

    if results["acquired"]:
        print(f"\n  *** CONGRATULATIONS! ***")
        print(f"  You've successfully acquired this skill: {skill.upper()}")
        print(f"  Your accuracy of {results['accuracy']}% meets the {ACCURACY_THRESHOLD}% requirement.\n")
    else:
        if timed_out_quiz:
            print(f"\n  You ran out of time before completing all questions.")
        needed = int((ACCURACY_THRESHOLD / 100 * results['total']) - results["correct"]) + 1
        print(f"  You need {needed} more correct answer(s) to acquire this skill.")
        print(f"  Keep studying and try again!\n")

    if show_review and answered > 0:
        _show_review_terminal(answers)

    return results


def acquire_skill(skill: str) -> dict:
    """Run quiz in terminal mode."""
    return run_quiz_terminal(skill)


# ─── RUN DIRECTLY ────────────────────────────────────────────────

def _pick_skill_interactive() -> str:
    """Prompt user to pick a skill interactively."""
    print(f"\n{'#'*60}")
    print(f"  SKILL ASSESSMENT QUIZ")
    print(f"  Choose a skill to be assessed on:")
    print(f"{'#'*60}\n")
    for i, s in enumerate(VALID_SKILLS, 1):
        print(f"    {i}) {s.title()}")
    print(f"\n    0) Exit\n")

    while True:
        choice = input("  Enter your choice (0-3): ").strip()
        if choice == "0":
            print("  Goodbye!")
            exit(0)
        if choice in ("1", "2", "3"):
            return VALID_SKILLS[int(choice) - 1]
        skill = normalize_skill(choice)
        if skill:
            return skill
        print(f"  Invalid choice. Enter 1, 2, 3, or a skill name.\n")


if __name__ == "__main__":
    import sys

    if len(sys.argv) >= 2:
        raw_skill = " ".join(sys.argv[1:])
        skill = normalize_skill(raw_skill)
        if not skill:
            print(f"\nError: Unknown skill '{raw_skill}'")
            print(f"Available: {', '.join(VALID_SKILLS)}")
            sys.exit(1)
    else:
        skill = _pick_skill_interactive()

    result = acquire_skill(skill)
    sys.exit(0 if result["acquired"] else 1)
