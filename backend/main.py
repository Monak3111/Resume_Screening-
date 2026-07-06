from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import fitz
import shutil
import os

app = FastAPI(title="ATS Resume AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://resume-screening-frontend-unt1.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/")
def home():
    return {"message": "Backend Running"}


def extract_text(path):
    text = ""
    with fitz.open(path) as pdf:
        for page in pdf:
            text += page.get_text()
    return text.lower()


def analyze_resume(resume_text, job_text):
    resume_words = set(resume_text.split())
    job_words = set(job_text.lower().split())

    matched = list(resume_words & job_words)
    missing = list(job_words - resume_words)

    score = 0 if len(job_words) == 0 else int(len(matched) / len(job_words) * 100)

    return {
        "score": score,
        "matched": matched[:20],
        "missing": missing[:20]
    }


@app.post("/upload-resume/")
async def upload_resume(
    file: UploadFile = File(...),
    job_desc: str = Form("")
):

    filename = os.path.basename(file.filename)
    path = os.path.join(UPLOAD_DIR, filename)

    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    resume_text = extract_text(path)

    os.remove(path)

    result = analyze_resume(resume_text, job_desc)

    return {
        "filename": filename,
        "score": result["score"],
        "matched_skills": result["matched"],
        "missing_skills": result["missing"]
    }
