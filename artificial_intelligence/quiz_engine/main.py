import sys
from quiz_engine import acquire_skill, normalize_skill, VALID_SKILLS, ACCURACY_THRESHOLD


def print_usage():
    print(f"\nUsage: python main.py <skill_name>")
    print(f"\nAvailable skills:")
    for s in VALID_SKILLS:
        print(f"  - {s}")
    print(f"\nAliases: py, webdev, web, web development, appdev, app, mobile, mobile dev")
    print(f"Accuracy threshold: {ACCURACY_THRESHOLD}%")
    print(f"\nExample:")
    print(f"  python main.py python")
    print(f"  python main.py web dev")


def main():
    if len(sys.argv) < 2:
        print_usage()
        sys.exit(1)

    raw_skill = " ".join(sys.argv[1:])
    skill = normalize_skill(raw_skill)

    if not skill:
        print(f"\nError: Unknown skill '{raw_skill}'")
        print_usage()
        sys.exit(1)

    result = acquire_skill(skill)
    sys.exit(0 if result["acquired"] else 1)


if __name__ == "__main__":
    main()
