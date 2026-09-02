import os
import sys
import io
import csv
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
import database as db
from app_server import app

TEST_DB = "test_skillify_app.db"

@pytest.fixture(autouse=True)
def setup_test_db(monkeypatch):
    monkeypatch.setattr(db, "DB_FILE", TEST_DB)
    if os.path.exists(TEST_DB):
        try:
            os.remove(TEST_DB)
        except OSError:
            pass
    db.init_db(TEST_DB)
    yield
    if os.path.exists(TEST_DB):
        try:
            os.remove(TEST_DB)
        except OSError:
            pass

@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client

def test_root_index(client):
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["service"] == "Skillify Mobile App Backend API"
    assert "endpoints" in data

def test_health_check(client, monkeypatch):
    async def mock_get(*args, **kwargs):
        class MockResponse:
            status_code = 200
            def json(self):
                return []
        return MockResponse()

    monkeypatch.setattr("httpx.AsyncClient.get", mock_get)
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["backend"] == "ok"
    assert data["upstream_hiring_ai"] == "ok"

def test_create_job(client, monkeypatch):
    monkeypatch.setenv("ADMIN_KEY", "test-secret-key")

    # Unauthorized without header
    res = client.post("/api/app/jobs", json={"title": "Backend Dev", "description": "Python FastAPI", "required_skills": ["Python"]})
    assert res.status_code == 401

    # Authorized with header
    res = client.post(
        "/api/app/jobs",
        headers={"X-Admin-Key": "test-secret-key"},
        json={"title": "Backend Dev", "description": "Python FastAPI", "required_skills": ["Python", "FastAPI"], "deadline_days": 7}
    )
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "Backend Dev"
    assert "Python" in data["required_skills"]

def test_get_jobs(client, monkeypatch):
    monkeypatch.setenv("ADMIN_KEY", "test-secret-key")
    db.create_job("Frontend Dev", "React Developer", ["React"], 7, TEST_DB)
    
    res = client.get("/api/app/jobs", headers={"X-Admin-Key": "test-secret-key"})
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    titles = [j["title"] for j in data]
    assert "Frontend Dev" in titles

def test_upload_job_applicants(client, monkeypatch):
    monkeypatch.setenv("ADMIN_KEY", "test-secret-key")
    job = db.create_job("AI Engineer", "PyTorch Specialist", ["Python", "PyTorch"], 7, TEST_DB)
    job_id = job["id"]

    async def mock_upload_applicants_csv(client_obj, base_url, csv_bytes, filename):
        csv_text = csv_bytes.decode("utf-8")
        reader = csv.DictReader(io.StringIO(csv_text))
        rows = list(reader)
        assert len(rows) == 1
        assert rows[0]["name"] == "Jane Doe"
        assert rows[0]["email"] == "jane@example.com"
        assert rows[0]["position"] == "AI Engineer"
        
        return 200, {
            "created": 1,
            "failed": 0,
            "errors": [],
            "applicants": [{"applicant_id": "app_jane_123", "name": "Jane Doe", "email": "jane@example.com", "status": "invited"}]
        }

    monkeypatch.setattr("hiring_bridge.upload_applicants_csv", mock_upload_applicants_csv)

    csv_content = "name,email\nJane Doe,jane@example.com\n"
    res = client.post(
        f"/api/app/jobs/{job_id}/applicants",
        headers={"X-Admin-Key": "test-secret-key"},
        files={"file": ("applicants.csv", csv_content, "text/csv")}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["created"] == 1

    applicants = db.get_job_applicants(job_id, TEST_DB)
    assert len(applicants) == 1
    assert applicants[0]["applicant_id"] == "app_jane_123"

def test_get_job_applicants_reconcile(client, monkeypatch):
    monkeypatch.setenv("ADMIN_KEY", "test-secret-key")
    job = db.create_job("DevOps Engineer", "K8s", ["Docker"], 7, TEST_DB)
    job_id = job["id"]
    db.add_job_applicants(job_id, [{"applicant_id": "app_devops_1", "email": "devops@example.com", "name": "Dev Ops"}], TEST_DB)

    async def mock_get_hiring_status(client_obj, base_url):
        return 200, {
            "invited": [],
            "completed_applicants": [{"applicant_id": "app_devops_1", "email": "devops@example.com"}],
            "completed": ["app_devops_1"],
            "expired": []
        }

    monkeypatch.setattr("hiring_bridge.get_hiring_status", mock_get_hiring_status)

    res = client.get(f"/api/app/jobs/{job_id}/applicants", headers={"X-Admin-Key": "test-secret-key"})
    assert res.status_code == 200
    data = res.json()
    assert data["job_id"] == job_id
    assert len(data["applicants"]) == 1
    assert data["applicants"][0]["status"] == "completed"

def test_get_job_ranking_csv_proxy(client, monkeypatch):
    monkeypatch.setenv("ADMIN_KEY", "test-secret-key")
    job = db.create_job("Data Scientist", "Python ML", ["Python"], 7, TEST_DB)

    async def mock_get_ranking_csv(client_obj, base_url):
        csv_data = "rank,name,email,score\n1,Jane Doe,jane@example.com,95.0\n".encode("utf-8")
        return 200, "text/csv", csv_data

    monkeypatch.setattr("hiring_bridge.get_ranking_csv", mock_get_ranking_csv)

    res = client.get(f"/api/app/jobs/{job['id']}/ranking", headers={"X-Admin-Key": "test-secret-key"})
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    assert "attachment; filename=" in res.headers["content-disposition"]
    assert b"Jane Doe" in res.content

def test_candidate_register(client, monkeypatch):
    async def mock_upload_applicants_json(client_obj, base_url, applicants):
        assert applicants[0]["email"] == "alex.rivera@example.com"
        return 200, {
            "created": 1,
            "failed": 0,
            "errors": [],
            "applicants": [{"applicant_id": "cand_alex_99", "name": "Alex Rivera", "email": "alex.rivera@example.com"}]
        }

    monkeypatch.setattr("hiring_bridge.upload_applicants_json", mock_upload_applicants_json)

    res = client.post("/api/app/candidates/register", json={
        "name": "Alex Rivera",
        "email": "alex.rivera@example.com",
        "phone": "+15550199",
        "position": "Frontend Software Engineer"
    })
    assert res.status_code == 201
    data = res.json()
    assert data["applicant_id"] == "cand_alex_99"
    assert data["name"] == "Alex Rivera"

def test_candidate_quiz_proxy_masked(client, monkeypatch):
    async def mock_get_quiz(client_obj, base_url, applicant_id):
        return 200, {
            "applicant_id": applicant_id,
            "applicant_name": "Alex Rivera",
            "position": "Frontend Software Engineer",
            "already_completed": False,
            "deadline_days": 7,
            "questions": [
                {
                    "id": "q1",
                    "question": "What is React?",
                    "options": ["A library", "A framework", "A database", "An OS"],
                    "correct_index": 0
                }
            ]
        }

    monkeypatch.setattr("hiring_bridge.get_quiz", mock_get_quiz)

    res = client.get("/api/app/candidates/cand_alex_99/quiz")
    assert res.status_code == 200
    data = res.json()
    assert data["applicant_id"] == "cand_alex_99"
    assert len(data["questions"]) == 1
    assert "correct_index" not in data["questions"][0]
    assert data["questions"][0]["question"] == "What is React?"

def test_candidate_quiz_submit_success_and_expiry_403(client, monkeypatch):
    async def mock_submit_success(client_obj, base_url, applicant_id, answers):
        return 200, {
            "status": "completed",
            "technical_score_pct": 92.5,
            "personality_score_pct": 88.0,
            "completion_seconds": 340.0
        }

    monkeypatch.setattr("hiring_bridge.submit_quiz", mock_submit_success)

    res = client.post("/api/app/candidates/cand_alex_99/quiz/submit", json={
        "answers": [{"question_id": "q1", "selected_index": 0, "time_taken_seconds": 15.5}]
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "completed"
    assert data["technical_score_pct"] == 92.5

    async def mock_submit_expired(client_obj, base_url, applicant_id, answers):
        return 403, {"detail": "Applicant missed the 7-day deadline and is excluded."}

    monkeypatch.setattr("hiring_bridge.submit_quiz", mock_submit_expired)

    res = client.post("/api/app/candidates/cand_alex_99/quiz/submit", json={
        "answers": [{"question_id": "q1", "selected_index": 0, "time_taken_seconds": 15.5}]
    })
    assert res.status_code == 403
    assert "deadline" in res.json()["detail"]

def test_candidate_result(client, monkeypatch):
    async def mock_get_ranking_json(client_obj, base_url):
        return 200, [
            {
                "applicant_id": "cand_alex_99",
                "name": "Alex Rivera",
                "position": "Frontend Software Engineer",
                "rank": 1,
                "technical_score_pct": 92.5,
                "personality_score_pct": 88.0,
                "total_score": 90.25,
                "status": "completed"
            }
        ]

    monkeypatch.setattr("hiring_bridge.get_ranking_json", mock_get_ranking_json)

    res = client.get("/api/app/candidates/cand_alex_99/result")
    assert res.status_code == 200
    data = res.json()
    assert data["applicant_id"] == "cand_alex_99"
    assert data["rank"] == 1
    assert data["technical_score_pct"] == 92.5

def test_candidate_cv_generation(client, monkeypatch):
    async def mock_generate_cv_pdf(client_obj, cv_url, target_domain, profile):
        assert profile["full_name"] == "Alex Rivera"
        return 200, "application/pdf", b"%PDF-1.4 Fake PDF Content"

    monkeypatch.setattr("hiring_bridge.generate_cv_pdf", mock_generate_cv_pdf)

    db.add_candidate("cand_alex_99", "Alex Rivera", "alex@example.com", "+1555", "Frontend Dev", "completed", TEST_DB)

    res = client.post("/api/app/candidates/cand_alex_99/cv")
    assert res.status_code == 200
    assert "application/pdf" in res.headers["content-type"]
    assert "attachment; filename=" in res.headers["content-disposition"]
    assert b"%PDF-1.4" in res.content
