"""
test_local.py
Run this directly in VS Code (Run button, or `python test_local.py` in the
terminal) to sanity-check the CV generator -- no server, no Swagger, no
localhost website involved. It calls the module's functions in-process and
writes ONE demo PDF to this folder that you open and look at.

LOCAL TEST ONLY. Nothing in here is imported by server.py / main.py /
sample_data.py, so your app can never generate or return these files.
The PDF is written straight to disk; the app path keeps returning its own
PDF bytes over HTTP. Two separate outputs, one shared engine.

Each run invents a completely RANDOM fake person (random name, contact,
education, skills, projects, internships...) on a RANDOM target domain and
pushes that through the exact same service.generate_cv_pdf_bytes() the app
uses -- so what you see on paper IS the design your real users will get.

Reproducibility: pass seed= to build_random_fake_profile() to regenerate
the identical person (printed after every run).

Once the design looks right, upload the original module files to your app
unchanged -- see the commented block at the bottom.
"""

from __future__ import annotations

import base64
import io
import os
import random

from schemas import TargetDomain
from service import generate_cv_pdf_bytes


def _generate_placeholder_avatar_base64(initials: str, bg_hex: str) -> str:
    """
    Creates a simple colored-square initials avatar in memory, purely so
    this test script has SOME image to demonstrate the profile-photo slot
    with -- no real photo file needed to try it out. In your real app,
    `profile_photo_base64` would instead hold the user's actual uploaded
    photo from their Skillify profile.
    """
    from PIL import Image, ImageDraw, ImageFont

    size = 240
    img = Image.new("RGB", (size, size), bg_hex)
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("DejaVuSans-Bold.ttf", 90)
    except Exception:
        font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), initials, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((size - tw) / 2 - bbox[0], (size - th) / 2 - bbox[1]), initials, fill="white", font=font)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("ascii")


# ============================================================================
# RANDOM FAKE-IDENTITY POOLS  (LOCAL DEMO ONLY)
# ----------------------------------------------------------------------------
# Same shape and richness as real profiles: every domain draws from its own
# pools so skills/projects/summary wording genuinely differ, exactly like a
# real Skillify user's data would.
# ============================================================================

_FIRST_NAMES = [
    "Aarav", "Ananya", "Aditi", "Arjun", "Anjali", "Dev", "Diya", "Farhan",
    "Ishaan", "Kabir", "Kavya", "Meera", "Nisha", "Pooja", "Rahul", "Rohan",
    "Sara", "Siddharth", "Tanvi", "Vihaan",
]
_LAST_NAMES = [
    "Banerjee", "Bose", "Chowdhury", "Das", "Fernandes", "Gupta", "Joshi",
    "Kulkarni", "Malhotra", "Mehta", "Menon", "Nair", "Pillai", "Patel",
    "Rao", "Reddy", "Sharma", "Singh", "Verma", "Iyer",
]
_COLLEGES = [
    "XYZ Institute of Technology",
    "National Institute of Design",
    "Delhi University",
    "BITS Pilani",
    "St. Xavier's College, Mumbai",
    "Symbiosis Institute of Media & Communication",
    "Vellore Institute of Technology",
    "Christ University, Bengaluru",
    "Anna University, Chennai",
    "Srishti Manipal Institute of Art & Design",
]
_REGIONAL_LANGUAGES = [
    ("Hindi", "Native"), ("Tamil", "Native"), ("Bengali", "Native"),
    ("Telugu", "Native"), ("Marathi", "Native"), ("Gujarati", "Native"),
    ("Malayalam", "Fluent"), ("Punjabi", "Native"), ("Urdu", "Native"),
    ("Konkani", "Native"),
]
_FOREIGN_LANGUAGES = [("French", "Basic"), ("Spanish", "Basic"), ("German", "Basic"), ("Japanese", "Basic")]
_DURATIONS = [
    "May 2026 - Jul 2026", "Jan 2026 - Apr 2026", "Jun 2025 - Aug 2025",
    "Oct 2025 - Dec 2025", "Dec 2025 - Feb 2026", "Mar 2026 - May 2026",
]
_AVATAR_COLORS = ["#2F3E5C", "#2F6B5C", "#3E6B5C", "#5C4A2F", "#4A2F5C", "#5C2F3E"]

_DOMAIN_CONTENT: dict[str, dict] = {
    "SDE": {
        "headlines": [
            "Aspiring software engineer who ships",
            "Full-stack dev who loves clean APIs",
            "Builder of fast, reliable backends",
        ],
        "degrees": ["B.Tech Computer Science", "B.Tech Information Technology", "BCA"],
        "skill_sets": [
            {"category": "Languages", "items": ["Python", "JavaScript", "SQL"]},
            {"category": "Frameworks", "items": ["FastAPI", "React", "PostgreSQL"]},
            {"category": "Core CS", "items": ["Data Structures", "Algorithms", "OOP", "DBMS"]},
            {"category": "Tools & Cloud", "items": ["Git", "Docker", "AWS", "Linux"]},
        ],
        "projects": [
            {
                "title": "Skillify",
                "description": "Insta-style social app with a Python recommendation backend.",
                "tech_stack": ["Python", "FastAPI", "PostgreSQL"],
                "link": "https://github.com/{slug}/skillify",
            },
            {
                "title": "CodeCollab",
                "description": "Real-time collaborative code editor with shared cursors and chat.",
                "tech_stack": ["React", "WebSockets", "Node.js"],
                "link": "https://github.com/{slug}/codecollab",
            },
            {
                "title": "CampusCart",
                "description": "Campus buy-and-sell marketplace with JWT auth and image uploads.",
                "tech_stack": ["Next.js", "MongoDB", "Tailwind"],
                "link": "https://github.com/{slug}/campuscart",
            },
        ],
        "companies": ["Acme Corp", "Zeta Systems", "Nimbus Labs", "Qubit Softworks"],
        "roles": ["Software Engineering Intern", "Backend Development Intern", "Full-Stack Intern"],
        "highlights": [
            "Built a REST API used by {n} internal teams",
            "Reduced query latency by {pct}% through indexing",
            "Shipped {n} features end-to-end with tests and code reviews",
            "Cut CI build times by {pct}% by parallelizing test suites",
        ],
        "certifications": [
            ("AWS Cloud Practitioner", "Amazon"),
            ("Meta Front-End Developer Certificate", "Coursera"),
            ("Google Associate Cloud Engineer", "Google"),
        ],
        "achievements": [
            ("Hackathon Winner", "Won college-wide hackathon, 2025"),
            ("LeetCode Knight", "Peak rating in top 5% of participants, 2025"),
            ("Open Source Contributor", "Merged PRs into a national OSS org, 2026"),
        ],
        "interests": ["Open-source contributions", "Competitive programming", "Chess", "Tech meetups"],
        "soft_skills": ["Team collaboration", "Problem solving", "Time management", "Communication"],
        "profile_link": ("github_url", "https://github.com/{slug}"),
    },
    "AI/ML": {
        "headlines": [
            "Turning data into intelligent products",
            "ML enthusiast who ships models, not just notebooks",
            "Teaching machines, learning every day",
        ],
        "degrees": ["B.Tech CSE (AI & ML)", "B.Sc. Data Science", "B.Tech Artificial Intelligence"],
        "skill_sets": [
            {"category": "ML & DL", "items": ["scikit-learn", "TensorFlow", "PyTorch"]},
            {"category": "Languages", "items": ["Python", "SQL"]},
            {"category": "Data Handling", "items": ["Pandas", "NumPy", "Spark"]},
        ],
        "projects": [
            {
                "title": "Campus Events Recommender",
                "description": "Content-based recommender that lifted event signups during pilot week.",
                "tech_stack": ["Python", "scikit-learn", "FastAPI"],
                "link": "https://github.com/{slug}/events-recsys",
            },
            {
                "title": "Vision Attendance",
                "description": "Face-recognition attendance pipeline at 98% precision on the campus dataset.",
                "tech_stack": ["PyTorch", "OpenCV"],
                "link": "https://github.com/{slug}/vision-attendance",
            },
        ],
        "companies": ["Neura Analytics", "DeepStack AI", "Cortex Labs"],
        "roles": ["Machine Learning Intern", "AI Research Intern"],
        "highlights": [
            "Fine-tuned a transformer classifier to {pct}% F1 on production tickets",
            "Automated data labeling, saving {n} annotator-hours weekly",
            "Deployed a model endpoint serving {n}0k requests/day",
        ],
        "certifications": [
            ("TensorFlow Developer Certificate", "Google"),
            ("IBM AI Engineering Professional Certificate", "IBM / Coursera"),
        ],
        "achievements": [
            ("Smart India Hackathon Finalist", "AI track, national level, 2025"),
            ("Kaggle Notebooks Expert", "Top 5% community tier, 2025"),
        ],
        "interests": ["LLM fine-tuning", "Robotics", "Sci-fi novels", "Kaggle competitions"],
        "soft_skills": ["Analytical storytelling", "Research discipline", "Team collaboration"],
        "profile_link": ("github_url", "https://github.com/{slug}"),
    },
    "Data Science": {
        "headlines": [
            "Turning messy data into decisions",
            "Analyst who answers 'why', not just 'what'",
            "Dashboards people actually open",
        ],
        "degrees": ["M.Sc. Statistics & Data Science", "B.Tech Computer Science", "B.Sc. Statistics"],
        "skill_sets": [
            {"category": "Analytics", "items": ["Python", "R", "SQL", "Pandas"]},
            {"category": "ML & Viz", "items": ["scikit-learn", "Tableau", "Power BI"]},
        ],
        "projects": [
            {
                "title": "Churn Radar",
                "description": "Telco churn prediction pipeline with SHAP explainability dashboards for retention teams.",
                "tech_stack": ["Python", "scikit-learn", "SHAP", "Streamlit"],
                "link": "https://github.com/{slug}/churn-radar",
            },
            {
                "title": "CityAir Explorer",
                "description": "AQI trend dashboard across Indian metros with seasonal forecasting.",
                "tech_stack": ["Plotly Dash", "Prophet", "SQL"],
                "link": "https://github.com/{slug}/cityair-explorer",
            },
        ],
        "companies": ["FinEdge Analytics", "MetricMind Consulting", "InsightWorks"],
        "roles": ["Data Science Intern", "Business Analytics Intern"],
        "highlights": [
            "Automated weekly KPI reporting, saving ~{n} analyst-hours per week",
            "Lifted default-model AUC by {pct}% via feature engineering",
            "Built dashboards adopted by {n} business teams",
        ],
        "certifications": [
            ("IBM Data Science Professional Certificate", "IBM / Coursera"),
            ("Google Advanced Data Analytics Certificate", "Google"),
        ],
        "achievements": [
            ("Kaggle Expert (Top 5%)", "Tabular playground series, 2025"),
            ("Best Analytics Project", "Department capstone showcase, 2026"),
        ],
        "interests": ["Fantasy sports analytics", "Board games", "Stargazing"],
        "soft_skills": ["Analytical storytelling", "Stakeholder communication", "Attention to detail"],
        "profile_link": ("github_url", "https://github.com/{slug}"),
    },
    "Engineering": {
        "headlines": [
            "Building hardware that survives the real world",
            "Mechatronics nerd with a maker streak",
            "From CAD sketch to working prototype",
        ],
        "degrees": [
            "B.Tech Mechanical Engineering",
            "B.Tech Electronics & Communication",
            "B.Tech Electrical Engineering",
        ],
        "skill_sets": [
            {"category": "CAD & Simulation", "items": ["SolidWorks", "ANSYS", "AutoCAD"]},
            {"category": "Electronics", "items": ["Arduino", "Raspberry Pi", "PCB Design"]},
        ],
        "projects": [
            {
                "title": "Line-Follower Bot",
                "description": "PID-tuned robot that topped 40 entries at the campus roborace.",
                "tech_stack": ["Arduino", "IR Sensor Array"],
                "link": "https://github.com/{slug}/line-follower",
            },
            {
                "title": "Dual-Axis Solar Tracker",
                "description": "Prototype improving panel yield by ~22% in rooftop testing.",
                "tech_stack": ["Raspberry Pi", "LDR Array", "Servo Motors"],
                "link": None,
            },
        ],
        "companies": ["Volt & Forge Industries", "Apex Mechatronics", "Gridline Energy"],
        "roles": ["Engineering Intern", "Design & Testing Intern"],
        "highlights": [
            "Drafted {n}+ manufacturing drawings adopted by the workshop floor",
            "Cut prototype weight by {pct}% via topology optimization",
            "Ran {n} stress-test cycles and documented failure modes for the design team",
        ],
        "certifications": [
            ("Certified SolidWorks Associate (CSWA)", "Dassault Systèmes"),
            ("AutoCAD Certified User", "Autodesk"),
        ],
        "achievements": [
            ("National Robotics Challenge Finalist", "Team lead, 2025"),
            ("Best B.Tech Project", "Department award, 2026"),
        ],
        "interests": ["Drone building", "Formula student", "3D printing"],
        "soft_skills": ["Hands-on problem solving", "Teamwork under deadlines", "Workshop safety discipline"],
        "profile_link": ("linkedin_url", "https://linkedin.com/in/{slug}"),
    },
    "UI/UX": {
        "headlines": [
            "Designer who sweats the small stuff",
            "Crafting interfaces people don't have to think about",
            "Research first, pixels second",
        ],
        "degrees": ["B.Des Communication Design", "B.Des Interaction Design", "BFA Applied Arts"],
        "skill_sets": [
            {"category": "Design Tools", "items": ["Figma", "Adobe XD", "Sketch", "Illustrator"]},
            {"category": "Practices", "items": ["Wireframing", "User Research", "Prototyping"]},
        ],
        "projects": [
            {
                "title": "Grocery App Redesign",
                "description": "End-to-end UX overhaul of a grocery delivery app, raising task completion rate in usability tests.",
                "tech_stack": ["Figma", "Maze"],
                "link": "https://behance.net/{slug}/grocery-redesign",
            },
            {
                "title": "FinTrack Concept",
                "description": "Personal-finance dashboard concept with a full dark-mode design system.",
                "tech_stack": ["Figma", "After Effects"],
                "link": "https://behance.net/{slug}/fintrack",
            },
        ],
        "companies": ["Studio Petal", "Pixelmint Studio", "Brightline Design Co."],
        "roles": ["UI/UX Design Intern", "Product Design Intern"],
        "highlights": [
            "Designed onboarding flow for a wellness app",
            "Ran {n} user interviews to inform navigation redesign",
            "Built a component library cutting dev handoff time by {pct}%",
        ],
        "certifications": [
            ("Google UX Design Certificate", "Google"),
            ("UX Certification, Interaction Design Foundation", "IxDF"),
        ],
        "achievements": [
            ("Design Jam Winner", "1st place, campus-wide 48-hour design jam, 2025"),
            ("Behance Featured", "Student portfolio featured in UI/UX gallery, 2026"),
        ],
        "interests": [
            "Motion graphics", "Digital painting", "Type specimen collecting", "Photography walks",
        ],
        "soft_skills": ["Visual communication", "Empathy mapping", "Brand management", "Team collaboration"],
        "profile_link": ("portfolio_url", "https://behance.net/{slug}"),
    },
    "Videography": {
        "headlines": [
            "Cinematic stories on student budgets",
            "Frames over everything",
            "Editor's eye, director's instinct",
        ],
        "degrees": ["B.A. Film & Video Production", "B.A. Mass Communication", "B.Sc. Animation & VFX"],
        "skill_sets": [
            {"category": "Post-Production", "items": ["Premiere Pro", "After Effects", "DaVinci Resolve"]},
            {"category": "Set Craft", "items": ["Lighting Setups", "Sound Recording", "Storyboarding"]},
        ],
        "projects": [
            {
                "title": "Two Minutes of Monsoon",
                "description": "Short documentary on street vendors during rains; official selection at two college film fests.",
                "tech_stack": [],
                "link": "https://vimeo.com/{slug}/monsoon",
            },
            {
                "title": "Wedding Films Reel 2026",
                "description": "Highlight films for six client weddings, all delivered inside 48 hours.",
                "tech_stack": [],
                "link": "https://vimeo.com/{slug}/weddings",
            },
        ],
        "companies": ["Framework Studios", "Reelcraft Media", "Lumen Motion Pictures"],
        "roles": ["Video Editing Intern", "Production Intern"],
        "highlights": [
            "Cut {n}+ client reels under 48-hour turnaround SLAs",
            "Built a reusable motion-graphics template pack adopted studio-wide",
            "Color-graded a {n}-episode web series for festival submission",
        ],
        "certifications": [
            ("Adobe Certified Professional: Premiere Pro", "Adobe"),
        ],
        "achievements": [
            ("Audience Choice — Campus Shorts Fest", "For a festival short film, 2025"),
        ],
        "interests": ["Drone piloting", "Analog photography", "Film scoring"],
        "soft_skills": ["Visual storytelling", "On-set problem solving", "Client handling"],
        "profile_link": ("portfolio_url", "https://vimeo.com/{slug}"),
    },
    "Photography": {
        "headlines": [
            "Freezing stories in a single frame",
            "Available-light loyalist",
            "Chasing golden hour since 2023",
        ],
        "degrees": ["B.A. Visual Communication", "BFA Photography", "B.A. Journalism & Mass Comm"],
        "skill_sets": [
            {"category": "Camera Craft", "items": ["Mirrorless Systems", "Portrait Lighting", "Long Exposure"]},
            {"category": "Editing", "items": ["Lightroom", "Photoshop", "Capture One"]},
        ],
        "projects": [
            {
                "title": "Streets of Old Delhi",
                "description": "Documentary street series exhibited at the college annual show.",
                "tech_stack": [],
                "link": "https://behance.net/{slug}/old-delhi",
            },
            {
                "title": "Campus Sports Coverage",
                "description": "50+ match galleries shot across the university athletics meet.",
                "tech_stack": [],
                "link": None,
            },
        ],
        "companies": ["Aperture House", "Golden Hour Studios"],
        "roles": ["Photography Intern", "Photo Editing Intern"],
        "highlights": [
            "Shot {n}+ commissioned events with next-day delivery",
            "Retouch workflow cut editing time by {pct}%",
            "Second-shot {n} weddings alongside a senior photographer",
        ],
        "certifications": [
            ("Adobe Certified Professional: Photoshop", "Adobe"),
        ],
        "achievements": [
            ("Winner, College Photography Contest", "Theme: Monsoon City, 2025"),
        ],
        "interests": ["Street photography", "Film cameras", "Travel"],
        "soft_skills": ["Observation & patience", "Client direction", "Deadline reliability"],
        "profile_link": ("portfolio_url", "https://behance.net/{slug}"),
    },
    "Writer": {
        "headlines": [
            "Stories with receipts",
            "Journalist who meets deadlines before they do",
            "Clear words about complicated things",
        ],
        "degrees": ["B.A. English Literature", "B.A. Journalism", "B.A. Mass Communication"],
        "skill_sets": [
            {"category": "Writing", "items": ["Long-form Journalism", "Copywriting", "SEO Writing"]},
            {"category": "Tools", "items": ["WordPress", "Grammarly", "Google Docs"]},
        ],
        "projects": [
            {
                "title": "Campus Culture Column",
                "description": "Weekly opinion column on student life, published in the university paper for two semesters.",
                "tech_stack": [],
                "link": "https://{slug}.blog.campuschronicle.com/column",
            },
            {
                "title": "Personal Finance, Explained Simply",
                "description": "8-part beginner explainer series read 30k+ times across platforms.",
                "tech_stack": [],
                "link": None,
            },
        ],
        "companies": ["The Weekly Read", "Daily Beat Media", "Quill & Ink Publishing"],
        "roles": ["Editorial Intern", "Content Writing Intern"],
        "highlights": [
            "Wrote {n}+ published articles across culture and tech beats",
            "Cut average editor revision time by tightening first drafts",
            "Grew the society newsletter to {n}00 subscribers with weekly issues",
        ],
        "certifications": [
            ("Content Strategy Certificate", "HubSpot Academy"),
            ("SEO Fundamentals Certificate", "Semrush Academy"),
        ],
        "achievements": [
            ("Best Young Writer Award", "State-level essay competition, 2024"),
        ],
        "interests": ["Travel writing", "Podcasts", "Theatre"],
        "soft_skills": ["Storytelling", "Editing discipline", "Deadline management"],
        "profile_link": ("portfolio_url", "https://{slug}.writes.blog"),
    },
    "Marketing": {
        "headlines": [
            "Growth marketer with a data habit",
            "Campaigns that convert, decks that convince",
            "Storytelling measured in numbers",
        ],
        "degrees": ["B.M.M. Advertising", "BBA Marketing", "B.Com (Hons)"],
        "skill_sets": [
            {"category": "Platforms", "items": ["Meta Ads", "Google Ads", "GA4", "HubSpot"]},
            {"category": "Craft", "items": ["Copywriting", "SEO", "Email Funnels", "Influencer Outreach"]},
        ],
        "projects": [
            {
                "title": "#CampusThreads Campaign",
                "description": "Thrift-fashion launch campaign that grew an Instagram page from 0 to 12k followers in 90 days.",
                "tech_stack": ["Instagram Reels", "Canva", "Mailchimp"],
                "link": None,
            },
            {
                "title": "Diwali Flash Sale Push",
                "description": "Performance campaign hitting 3.1x ROAS on a lean festive budget.",
                "tech_stack": ["Meta Ads", "Google Ads"],
                "link": None,
            },
        ],
        "companies": ["Brightwave Digital", "SocialSutra Agency", "AdVent Media"],
        "roles": ["Marketing Intern", "Digital Marketing Intern"],
        "highlights": [
            "Managed monthly paid campaigns at a {ri}.{rd}x average ROAS",
            "Rewrote onboarding email flow, lifting click-through by {pct}%",
            "Grew organic reach {pct}% quarter-over-quarter with a content calendar",
        ],
        "certifications": [
            ("Google Ads Search Certification", "Google"),
            ("HubSpot Inbound Marketing", "HubSpot Academy"),
        ],
        "achievements": [
            ("Best Live Campaign Award", "National B-school fest marketing event, 2026"),
        ],
        "interests": ["Street photography", "Stand-up comedy", "Trend forecasting"],
        "soft_skills": ["Persuasive communication", "Campaign planning", "Cross-team coordination"],
        "profile_link": ("portfolio_url", "https://{slug}.marketing.carrd.co"),
    },
}


def build_random_fake_profile(
    target_domain: str | TargetDomain | None = None,
    *,
    seed: int | None = None,
) -> tuple[str, dict]:
    """
    Invent a COMPLETELY RANDOM fake person for the given target domain
    (random domain when omitted). Returns (domain_label, profile_dict)
    shaped exactly like a real profile, ready for generate_cv_pdf_bytes().

    Pass seed=<int> to get the identical person back on re-runs.
    LOCAL TESTING ONLY -- nothing in the app ever calls this.
    """
    rng = random.Random(seed)

    if target_domain is None:
        target_domain = rng.choice(list(TargetDomain))
    if isinstance(target_domain, str):
        target_domain = TargetDomain(target_domain)
    content = _DOMAIN_CONTENT[target_domain.value]

    # --- Identity -----------------------------------------------------
    first, last = rng.choice(_FIRST_NAMES), rng.choice(_LAST_NAMES)
    full_name = f"{first} {last}"
    slug = f"{first}{last}".lower()
    email = f"{first.lower()}.{last.lower()}{rng.randint(10, 99)}@example.com"
    phone_digits = "".join(rng.choices("0123456789", k=10))
    initials = (first[0] + last[0]).upper()
    link_field, link_template = content["profile_link"]

    profile: dict = {
        "full_name": full_name,
        "email": email,
        "phone": f"+91 {phone_digits[:5]} {phone_digits[5:]}",
        "headline": rng.choice(content["headlines"]),
        link_field: link_template.format(slug=slug),
        "college": rng.choice(_COLLEGES),
        "degree": rng.choice(content["degrees"]),
        "graduation_year": str(rng.choice([2026, 2027, 2028])),
        "skills": [dict(cat) for cat in rng.sample(content["skill_sets"], k=min(2, len(content["skill_sets"])))],
        "projects": [],
        "internships": [
            {
                "company": rng.choice(content["companies"]),
                "role": rng.choice(content["roles"]),
                "duration": rng.choice(_DURATIONS),
                "highlights": [
                    h.format(n=rng.randint(2, 15), pct=rng.randint(15, 45), ri=rng.randint(2, 4), rd=rng.randint(1, 9))
                    for h in rng.sample(content["highlights"], k=2)
                ],
            }
        ],
        "certifications": [
            {"name": name, "issuer": issuer, "year": str(rng.choice([2024, 2025]))}
            for name, issuer in rng.sample(content["certifications"], k=min(2, len(content["certifications"])))
        ],
        "achievements": [dict(zip(("title", "description"), rng.choice(content["achievements"])))],
        # Photo slot exercised with a generated initials avatar, same as a
        # real user photo would be. Swap for real data in your app.
        "profile_photo_base64": _generate_placeholder_avatar_base64(initials, rng.choice(_AVATAR_COLORS)),
        "languages": [],
        "interests": sorted(rng.sample(content["interests"], k=3)),
        "soft_skills": sorted(rng.sample(content["soft_skills"], k=min(4, len(content["soft_skills"])))),
    }

    projects = rng.sample(content["projects"], k=rng.randint(1, min(2, len(content["projects"]))))
    for template in projects:
        entry = dict(template)
        entry["link"] = template["link"].format(slug=slug) if template.get("link") else None
        profile["projects"].append(entry)

    native = _REGIONAL_LANGUAGES[rng.randrange(len(_REGIONAL_LANGUAGES))]
    languages = [{"name": native[0], "level": native[1]}, {"name": "English", "level": "Fluent"}]
    if rng.random() < 0.5:
        foreign = rng.choice(_FOREIGN_LANGUAGES)
        languages.append({"name": foreign[0], "level": foreign[1]})
    profile["languages"] = languages

    return target_domain.value, profile


# Path to the Skillify logo file, resolved relative to THIS file so the
# script works no matter which directory you run it from.
LOGO_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "skillify_logo.jpeg")


def _check_logo_path() -> None:
    abs_path = os.path.abspath(LOGO_PATH)
    if os.path.isfile(LOGO_PATH):
        size = os.path.getsize(LOGO_PATH)
        if size == 0:
            print(f"[LOGO] Found at {abs_path} but the file is 0 bytes (corrupted) -- re-copy it.")
        else:
            print(f"[LOGO] OK -- found at {abs_path} ({size} bytes).")
    else:
        print(f"[LOGO] NOT FOUND at {abs_path}.")
        print(f"       Current working directory: {os.getcwd()}")
        print("       Fix: make sure the logo file sits at that exact path, or update LOGO_PATH above.")


def run_test(target_domain: str, raw_profile: dict, output_filename: str, seed=None) -> None:
    pdf_bytes = generate_cv_pdf_bytes(
        target_domain=target_domain,
        raw_profile=raw_profile,
        logo_path=LOGO_PATH,
    )
    with open(output_filename, "wb") as f:
        f.write(pdf_bytes)
    print(f"[OK] {target_domain} ({raw_profile['full_name']}) -> {output_filename} ({len(pdf_bytes)} bytes)")


if __name__ == "__main__":
    _check_logo_path()
    print()

    # One run = one random fake person on a random domain. Pass seed=42 to
    # build_random_fake_profile below to reproduce the exact same person.
    used_seed = random.randrange(1_000_000)
    domain_label, fake_profile = build_random_fake_profile(seed=used_seed)

    safe_name = fake_profile["full_name"].split()[0]
    safe_domain = "".join(c for c in domain_label if c.isalnum())
    output_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), f"demo_cv_{safe_name}_{safe_domain}.pdf")

    run_test(domain_label, fake_profile, output_file, seed=used_seed)

    print()
    print("Generated identity (all fake):")
    print(f"  Name      : {fake_profile['full_name']}")
    print(f"  Email     : {fake_profile['email']}")
    print(f"  Phone     : {fake_profile['phone']}")
    print(f"  College   : {fake_profile['college']} -- {fake_profile['degree']} ({fake_profile['graduation_year']})")
    print(f"  Domain    : {domain_label}")
    print(f"  Seed      : {used_seed}   <- reuse via build_random_fake_profile(seed={used_seed})")
    print(f"\nDone. Open the PDF in this folder to check the design.")
    print("This file is LOCAL TEST ONLY -- your app never generates or returns it.")

    # --- Once the sample output looks right, upload the ORIGINAL module
    # --- files unchanged and wire your real DB function in your app:
    #
    # from your_existing_app.profiles import get_user_profile  # already exists
    #
    # pdf_bytes = generate_cv_pdf_bytes(
    #     target_domain="SDE",
    #     user_id="the-real-user-id",
    #     fetch_profile_fn=get_user_profile,
    #     logo_path=LOGO_PATH,
    # )
    # return pdf_bytes   # over HTTP, straight to your app
