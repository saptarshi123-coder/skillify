import httpx
from typing import Dict, Any, List, Tuple, Optional

async def upload_applicants_csv(client: httpx.AsyncClient, base_url: str, csv_bytes: bytes, filename: str = "applicants.csv") -> Tuple[int, Dict[str, Any]]:
    url = f"{base_url.rstrip('/')}/hiring/upload-applicants"
    files = {"file": (filename, csv_bytes, "text/csv")}
    res = await client.post(url, files=files)
    try:
        return res.status_code, res.json()
    except Exception:
        return res.status_code, {"detail": res.text}

async def upload_applicants_json(client: httpx.AsyncClient, base_url: str, applicants: List[Dict[str, Any]]) -> Tuple[int, Dict[str, Any]]:
    url = f"{base_url.rstrip('/')}/hiring/upload-applicants-json"
    res = await client.post(url, json={"applicants": applicants})
    try:
        return res.status_code, res.json()
    except Exception:
        return res.status_code, {"detail": res.text}

async def get_all_applicants(client: httpx.AsyncClient, base_url: str) -> Tuple[int, Any]:
    url = f"{base_url.rstrip('/')}/hiring/applicants"
    res = await client.get(url)
    try:
        return res.status_code, res.json()
    except Exception:
        return res.status_code, {"detail": res.text}

async def get_hiring_status(client: httpx.AsyncClient, base_url: str) -> Tuple[int, Dict[str, Any]]:
    url = f"{base_url.rstrip('/')}/hiring/status"
    res = await client.get(url)
    try:
        return res.status_code, res.json()
    except Exception:
        return res.status_code, {"detail": res.text}

async def get_quiz(client: httpx.AsyncClient, base_url: str, applicant_id: str) -> Tuple[int, Dict[str, Any]]:
    url = f"{base_url.rstrip('/')}/hiring/quiz/{applicant_id}"
    res = await client.get(url)
    if res.status_code != 200:
        try:
            return res.status_code, res.json()
        except Exception:
            return res.status_code, {"detail": res.text}
    
    data = res.json()
    # Mask questions: ensure correct_index is NOT included
    if isinstance(data, dict) and "questions" in data:
        masked_questions = []
        for q in data["questions"]:
            q_copy = dict(q)
            q_copy.pop("correct_index", None)
            q_copy.pop("correct_answer", None)
            masked_questions.append(q_copy)
        data["questions"] = masked_questions
    
    return res.status_code, data

async def submit_quiz(client: httpx.AsyncClient, base_url: str, applicant_id: str, answers: List[Dict[str, Any]]) -> Tuple[int, Dict[str, Any]]:
    url = f"{base_url.rstrip('/')}/hiring/quiz/{applicant_id}/submit"
    payload = {
        "applicant_id": applicant_id,
        "answers": answers
    }
    res = await client.post(url, json=payload)
    try:
        return res.status_code, res.json()
    except Exception:
        return res.status_code, {"detail": res.text}

async def get_ranking_csv(client: httpx.AsyncClient, base_url: str) -> Tuple[int, str, bytes]:
    url = f"{base_url.rstrip('/')}/hiring/ranking?download=true"
    res = await client.get(url)
    content_type = res.headers.get("content-type", "")
    return res.status_code, content_type, res.content

async def get_ranking_json(client: httpx.AsyncClient, base_url: str) -> Tuple[int, Any]:
    url = f"{base_url.rstrip('/')}/hiring/ranking/json"
    res = await client.get(url)
    try:
        return res.status_code, res.json()
    except Exception:
        return res.status_code, {"detail": res.text}

async def generate_cv_pdf(client: httpx.AsyncClient, cv_url: str, target_domain: str, profile: Dict[str, Any]) -> Tuple[int, str, bytes]:
    url = f"{cv_url.rstrip('/')}/api/v1/cv/generate"
    payload = {
        "target_domain": target_domain,
        "profile": profile
    }
    res = await client.post(url, json=payload)
    content_type = res.headers.get("content-type", "application/pdf")
    return res.status_code, content_type, res.content
