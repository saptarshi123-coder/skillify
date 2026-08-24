"""
domain_engine.py
Domain-aware content prioritization and dynamic Professional Summary
generation. No rendering logic and no database access here -- pure
transformation from (NormalizedProfile, TargetDomain) -> CVLayoutPlan.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List

from repository import NormalizedProfile
from schemas import TargetDomain

SECTION_SUMMARY = "summary"
SECTION_SKILLS = "skills"
SECTION_PROJECTS = "projects"
SECTION_INTERNSHIPS = "internships"
SECTION_CERTIFICATIONS = "certifications"
SECTION_ACHIEVEMENTS = "achievements"
SECTION_EDUCATION = "education"
SECTION_PORTFOLIO = "portfolio"
SECTION_SOFT_SKILLS = "soft_skills"
SECTION_LANGUAGES = "languages"
SECTION_INTERESTS = "interests"

TECHNICAL_DOMAINS = {
    TargetDomain.SDE,
    TargetDomain.AI_ML,
    TargetDomain.DATA_SCIENCE,
    TargetDomain.ENGINEERING,
}

CREATIVE_DOMAINS = {
    TargetDomain.UI_UX,
    TargetDomain.VIDEOGRAPHY,
    TargetDomain.PHOTOGRAPHY,
}

WRITING_DOMAINS = {
    TargetDomain.WRITER,
    TargetDomain.MARKETING,
}

DOMAIN_SUMMARY_FRAGMENTS = {
    TargetDomain.SDE: "building scalable, production-grade software",
    TargetDomain.AI_ML: "designing and deploying machine learning systems",
    TargetDomain.DATA_SCIENCE: "extracting actionable insight from complex data",
    TargetDomain.ENGINEERING: "solving applied engineering problems end-to-end",
    TargetDomain.UI_UX: "crafting intuitive, user-centered digital experiences",
    TargetDomain.VIDEOGRAPHY: "producing compelling visual storytelling and video content",
    TargetDomain.PHOTOGRAPHY: "capturing striking, story-driven visual work",
    TargetDomain.WRITER: "crafting clear, engaging written content",
    TargetDomain.MARKETING: "driving growth through data-informed marketing strategy",
}


@dataclass
class CVLayoutPlan:
    summary_text: str
    section_order: List[str]


def _collect_top_skill_names(profile: NormalizedProfile, limit: int = 5) -> List[str]:
    names: List[str] = []
    for category in profile.skills:
        for item in category.items:
            if item not in names:
                names.append(item)
            if len(names) >= limit:
                return names
    return names


def generate_professional_summary(
    profile: NormalizedProfile, target_domain: TargetDomain
) -> str:
    """Deterministic 2-3 sentence summary from degree, top skills, and domain."""
    domain_fragment = DOMAIN_SUMMARY_FRAGMENTS.get(
        target_domain, "delivering high-quality, detail-oriented work"
    )

    if profile.degree and profile.college:
        degree_clause = f"{profile.degree} candidate at {profile.college}"
    elif profile.degree:
        degree_clause = f"{profile.degree} candidate"
    elif profile.college:
        degree_clause = f"student at {profile.college}"
    else:
        degree_clause = "motivated professional"

    top_skills = _collect_top_skill_names(profile, limit=5)
    skills_clause = ""
    if top_skills:
        skills_clause = (
            top_skills[0]
            if len(top_skills) == 1
            else ", ".join(top_skills[:-1]) + f" and {top_skills[-1]}"
        )

    sentence_one = f"{degree_clause} focused on {domain_fragment}."

    sentence_two = ""
    if skills_clause:
        sentence_two = (
            f"Skilled in {skills_clause}, with hands-on experience applying "
            f"these tools to real-world {target_domain.value} work."
        )

    sentence_three = ""
    n_projects = len(profile.projects)
    n_internships = len(profile.internships)
    if n_projects or n_internships:
        parts = []
        if n_projects:
            parts.append(f"{n_projects} project{'' if n_projects == 1 else 's'}")
        if n_internships:
            parts.append(f"{n_internships} internship{'' if n_internships == 1 else 's'}")
        sentence_three = (
            f"Demonstrated impact across {' and '.join(parts)}, consistently combining "
            f"rigor with clear communication."
        )

    return " ".join(s for s in (sentence_one, sentence_two, sentence_three) if s)


def _order_technical(profile: NormalizedProfile) -> List[str]:
    return [
        SECTION_SUMMARY,
        SECTION_SKILLS,
        SECTION_PROJECTS,
        SECTION_INTERNSHIPS,
        SECTION_CERTIFICATIONS,
        SECTION_LANGUAGES,
        SECTION_INTERESTS,
        SECTION_ACHIEVEMENTS,
        SECTION_EDUCATION,
        SECTION_SOFT_SKILLS,
        SECTION_PORTFOLIO,
    ]


def _order_creative(profile: NormalizedProfile) -> List[str]:
    return [
        SECTION_SUMMARY,
        SECTION_PORTFOLIO,
        SECTION_SKILLS,
        SECTION_ACHIEVEMENTS,
        SECTION_PROJECTS,
        SECTION_INTERNSHIPS,
        SECTION_LANGUAGES,
        SECTION_INTERESTS,
        SECTION_CERTIFICATIONS,
        SECTION_EDUCATION,
        SECTION_SOFT_SKILLS,
    ]


def _order_writing(profile: NormalizedProfile) -> List[str]:
    return [
        SECTION_SUMMARY,
        SECTION_PORTFOLIO,
        SECTION_ACHIEVEMENTS,
        SECTION_SKILLS,
        SECTION_PROJECTS,
        SECTION_INTERNSHIPS,
        SECTION_LANGUAGES,
        SECTION_INTERESTS,
        SECTION_CERTIFICATIONS,
        SECTION_EDUCATION,
        SECTION_SOFT_SKILLS,
    ]


def _order_default(profile: NormalizedProfile) -> List[str]:
    return [
        SECTION_SUMMARY,
        SECTION_SKILLS,
        SECTION_ACHIEVEMENTS,
        SECTION_PROJECTS,
        SECTION_INTERNSHIPS,
        SECTION_LANGUAGES,
        SECTION_INTERESTS,
        SECTION_CERTIFICATIONS,
        SECTION_EDUCATION,
        SECTION_SOFT_SKILLS,
        SECTION_PORTFOLIO,
    ]


_SECTION_PRESENCE_CHECKS = {
    SECTION_SKILLS: lambda p: p.has_skills(),
    SECTION_PROJECTS: lambda p: p.has_projects(),
    SECTION_INTERNSHIPS: lambda p: p.has_internships(),
    SECTION_CERTIFICATIONS: lambda p: p.has_certifications(),
    SECTION_ACHIEVEMENTS: lambda p: p.has_achievements(),
    SECTION_PORTFOLIO: lambda p: p.has_portfolio_links(),
    SECTION_EDUCATION: lambda p: bool(p.college or p.degree),
    SECTION_SUMMARY: lambda p: True,
    SECTION_SOFT_SKILLS: lambda p: p.has_soft_skills(),
    SECTION_LANGUAGES: lambda p: p.has_languages(),
    SECTION_INTERESTS: lambda p: p.has_interests(),
}


def build_layout_plan(
    profile: NormalizedProfile, target_domain: TargetDomain
) -> CVLayoutPlan:
    """Ordered, empty-section-filtered section list + generated summary."""
    if target_domain in TECHNICAL_DOMAINS:
        raw_order = _order_technical(profile)
    elif target_domain in CREATIVE_DOMAINS:
        raw_order = _order_creative(profile)
    elif target_domain in WRITING_DOMAINS:
        raw_order = _order_writing(profile)
    else:
        raw_order = _order_default(profile)

    visible_order = [
        section
        for section in raw_order
        if _SECTION_PRESENCE_CHECKS.get(section, lambda p: False)(profile)
    ]

    summary_text = generate_professional_summary(profile, target_domain)
    return CVLayoutPlan(summary_text=summary_text, section_order=visible_order)
