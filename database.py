import sqlite3
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

DB_FILE = "skillify_app.db"

def get_connection(db_path: Optional[str] = None) -> sqlite3.Connection:
    target_path = db_path or DB_FILE
    conn = sqlite3.connect(target_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(db_path: Optional[str] = None) -> None:
    conn = get_connection(db_path)
    try:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                required_skills_json TEXT NOT NULL,
                deadline_days INTEGER DEFAULT 7,
                created_at TEXT NOT NULL
            );
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS job_applicants (
                job_id INTEGER NOT NULL,
                applicant_id TEXT NOT NULL,
                email TEXT NOT NULL,
                name TEXT,
                status TEXT DEFAULT 'invited',
                created_at TEXT NOT NULL,
                PRIMARY KEY (job_id, applicant_id)
            );
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS candidates (
                applicant_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT,
                position TEXT,
                status TEXT DEFAULT 'registered',
                created_at TEXT NOT NULL
            );
        """)
        conn.commit()
    finally:
        conn.close()

def create_job(title: str, description: str, required_skills: List[str], deadline_days: int = 7, db_path: Optional[str] = None) -> Dict[str, Any]:
    now = datetime.now(timezone.utc).isoformat()
    skills_json = json.dumps(required_skills)
    conn = get_connection(db_path)
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO jobs (title, description, required_skills_json, deadline_days, created_at) VALUES (?, ?, ?, ?, ?)",
            (title, description, skills_json, deadline_days, now)
        )
        job_id = cursor.lastrowid
        conn.commit()
    finally:
        conn.close()

    return {
        "id": job_id,
        "title": title,
        "description": description,
        "required_skills": required_skills,
        "deadline_days": deadline_days,
        "created_at": now
    }

def get_jobs(db_path: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_connection(db_path)
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT j.id, j.title, j.description, j.required_skills_json, j.deadline_days, j.created_at,
                   COUNT(ja.applicant_id) AS applicant_count
            FROM jobs j
            LEFT JOIN job_applicants ja ON j.id = ja.job_id
            GROUP BY j.id
            ORDER BY j.id DESC
        """)
        rows = cursor.fetchall()
        result = []
        for r in rows:
            result.append({
                "id": r["id"],
                "title": r["title"],
                "description": r["description"],
                "required_skills": json.loads(r["required_skills_json"]) if r["required_skills_json"] else [],
                "deadline_days": r["deadline_days"],
                "applicant_count": r["applicant_count"],
                "created_at": r["created_at"]
            })
        return result
    finally:
        conn.close()

def get_job_by_id(job_id: int, db_path: Optional[str] = None) -> Optional[Dict[str, Any]]:
    conn = get_connection(db_path)
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM jobs WHERE id = ?", (job_id,))
        r = cursor.fetchone()
        if not r:
            return None
        return {
            "id": r["id"],
            "title": r["title"],
            "description": r["description"],
            "required_skills": json.loads(r["required_skills_json"]) if r["required_skills_json"] else [],
            "deadline_days": r["deadline_days"],
            "created_at": r["created_at"]
        }
    finally:
        conn.close()

def add_job_applicants(job_id: int, applicants: List[Dict[str, Any]], db_path: Optional[str] = None) -> None:
    now = datetime.now(timezone.utc).isoformat()
    conn = get_connection(db_path)
    try:
        cursor = conn.cursor()
        for app in applicants:
            applicant_id = str(app.get("applicant_id") or app.get("id"))
            email = str(app.get("email", ""))
            name = app.get("name")
            status = app.get("status", "invited")
            cursor.execute(
                """
                INSERT INTO job_applicants (job_id, applicant_id, email, name, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(job_id, applicant_id) DO UPDATE SET
                    email=excluded.email,
                    name=excluded.name,
                    status=excluded.status
                """,
                (job_id, applicant_id, email, name, status, now)
            )
        conn.commit()
    finally:
        conn.close()

def get_job_applicants(job_id: int, db_path: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_connection(db_path)
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM job_applicants WHERE job_id = ?", (job_id,))
        rows = cursor.fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()

def update_applicant_status(applicant_id: str, new_status: str, db_path: Optional[str] = None) -> None:
    conn = get_connection(db_path)
    try:
        cursor = conn.cursor()
        cursor.execute("UPDATE job_applicants SET status = ? WHERE applicant_id = ?", (new_status, applicant_id))
        cursor.execute("UPDATE candidates SET status = ? WHERE applicant_id = ?", (new_status, applicant_id))
        conn.commit()
    finally:
        conn.close()

def add_candidate(applicant_id: str, name: str, email: str, phone: Optional[str] = None, position: Optional[str] = None, status: str = "registered", db_path: Optional[str] = None) -> Dict[str, Any]:
    now = datetime.now(timezone.utc).isoformat()
    conn = get_connection(db_path)
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO candidates (applicant_id, name, email, phone, position, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(applicant_id) DO UPDATE SET
                name=excluded.name,
                email=excluded.email,
                phone=excluded.phone,
                position=excluded.position,
                status=excluded.status
            """,
            (applicant_id, name, email, phone, position, status, now)
        )
        conn.commit()
    finally:
        conn.close()

    return {
        "applicant_id": applicant_id,
        "name": name,
        "email": email,
        "phone": phone,
        "position": position,
        "status": status,
        "created_at": now
    }

def get_candidate(applicant_id: str, db_path: Optional[str] = None) -> Optional[Dict[str, Any]]:
    conn = get_connection(db_path)
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM candidates WHERE applicant_id = ?", (applicant_id,))
        r = cursor.fetchone()
        if not r:
            return None
        return dict(r)
    finally:
        conn.close()
