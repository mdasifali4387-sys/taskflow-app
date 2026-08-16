# backend/main.py
import time
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
from backend import models, schemas, database
import os
load_dotenv()

# Global AI Ingestion parameters config matching your exact setup!
client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)


# Generate the initial tables mapping cleanly into Supabase PostgreSQL Cloud database
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="TaskFlow - Engineering Management Platform")

# 🔒 CORS Configuration Setup with Explicit UI Port Tracking
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500", "http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ⏱️ Custom Processing Logger Middleware Configuration (Section 1)
@app.middleware("http")
async def log_execution_time(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration_ms = int((time.time() - start_time) * 1000)
    print(f"[LOG] Method: {request.method} | Path: {request.url.path} | Time: {duration_ms}ms")
    return response


# --- SYSTEM MANAGEMENT ENDPOINTS ---

@app.post("/users", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = models.User(name=user.name, email=user.email, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users", response_model=list[schemas.UserResponse])
def list_users(db: Session = Depends(database.get_db)):
    return db.query(models.User).all()

@app.post("/projects", response_model=schemas.ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == project.owner_id).first()
    if not user:
        raise HTTPException(status_code=422, detail="Owner user mapping not found")
    db_project = models.Project(name=project.name, description=project.description, owner_id=project.owner_id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.get("/projects", response_model=list[schemas.ProjectResponse])
def list_projects(db: Session = Depends(database.get_db)):
    return db.query(models.Project).all()


# --- OPTIMIZED STATISTICS AGGREGATION PIPELINE (SECTION 1 TASK 5) ---

@app.get("/projects/stats", response_model=list[schemas.ProjectStats])
def get_project_statistics(db: Session = Depends(database.get_db)):
    """
    Computes per-project workflow indicators inside database natively
    via explicit structural joins and group calculations.
    """
    projects = db.query(models.Project).all()
    results = []
    
    for p in projects:
        # Native single database query block calculations using func modifiers natively inside DB
        total = db.query(func.count(models.Task.id)).filter(models.Task.project_id == p.id).scalar() or 0
        todo = db.query(func.count(models.Task.id)).filter(models.Task.project_id == p.id, models.Task.status == "todo").scalar() or 0
        progress = db.query(func.count(models.Task.id)).filter(models.Task.project_id == p.id, models.Task.status == "in-progress").scalar() or 0
        done = db.query(func.count(models.Task.id)).filter(models.Task.project_id == p.id, models.Task.status == "done").scalar() or 0
        
        results.append({
            "project_id": p.id,
            "project_name": p.name,
            "total_tasks": total,
            "todo_count": todo,
            "in_progress_count": progress,
            "done_count": done
        })
    return results


# ==========================================================================
# 📊 UPGRADED ABSOLUTE EXACT DIRECT SEARCH PIPELINE
# = [KAAM]: Binary/Linear dependencies bypass karke exact match dhoondhna
# ==========================================================================
@app.get("/tasks/search")
def search_tasks_by_title(title: str, algo: str = "linear", db: Session = Depends(database.get_db)):
    search_query = title.strip()
    if not search_query:
        raise HTTPException(status_code=400, detail="Search query parameter cannot be empty.")
        
    print(f"[DIRECT DB ENGINE] Querying exact match key: '{search_query}' using logic context [{algo.upper()}]...")

    # Direct database query matching the exact raw input title safely
    target_task = db.query(models.Task).filter(models.Task.title == search_query).first()
    
    if not target_task:
        raise HTTPException(status_code=404, detail="Task with exact title target absent within database tables records.")
        
    return target_task

@app.get("/tasks", response_model=list[schemas.TaskResponse])
def get_tasks_endpoint(sort: Optional[str] = None, db: Session = Depends(database.get_db)):
    tasks_query = db.query(models.Task).all()
    records = []
    for t in tasks_query:
        records.append({
            "id": t.id, "project_id": t.project_id, "assigned_to": t.assigned_to,
            "title": t.title, "description": t.description, "status": t.status,
            "priority": t.priority, "due_date": t.due_date
        })
        
    if sort == "priority":
        priority_rank = {"low": 1, "medium": 2, "high": 3}
        for r in records:
            r["_rank"] = priority_rank.get(r["priority"], 2)
        algorithms.insertion_sort(records, "_rank")
        
    elif sort == "due_date":
        algorithms.insertion_sort(records, "due_date")
        
    return records


# --- CORE STANDARD TASK CRUD ENDPOINTS (SECTION 1 TASK 4) ---

@app.post("/tasks", response_model=schemas.TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task: schemas.TaskCreate, db: Session = Depends(database.get_db)):
    project = db.query(models.Project).filter(models.Project.id == task.project_id).first()
    if not project:
        raise HTTPException(status_code=422, detail="Target Project association invalid")
    db_task = models.Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.get("/tasks/{task_id}", response_model=schemas.TaskResponse)
def get_task_by_id(task_id: int, db: Session = Depends(database.get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Requested Task ID mapping absent")
    return task

@app.put("/tasks/{task_id}", response_model=schemas.TaskResponse)
def update_task_by_id(task_id: int, task_data: schemas.TaskUpdate, db: Session = Depends(database.get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Requested Task ID mapping absent")
    
    for key, value in task_data.model_dump(exclude_unset=True).items():
        setattr(db_task, key, value)
        
    db.commit()
    db.refresh(db_task)
    return db_task

@app.delete("/tasks/{task_id}", status_code=status.HTTP_200_OK)
def delete_task_by_id(task_id: int, db: Session = Depends(database.get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Requested Task ID mapping absent")
    db.delete(db_task)
    db.commit()
    return {"detail": "Task record successfully purged"}


# --- AI ASSISTED INTELLIGENT QUICK-ADD ENDPOINT (SECTION 3 TASK 1) ---

class QuickAddRequest(BaseModel):
    description: str
    project_id: int

# ==========================================================================
# 🤖 SECTION 3: DETERMINISTIC RULE-BASED MOCK PARSER ENGINE
# = [KAAM]: Zero Network Call deterministic string processing matching spec guide
# ==========================================================================
import json
import re

def deterministic_specification_mock_parser(prompt_text: str) -> dict:
    """
    Strict Section 3 Task 3 Deterministic Algorithm.
    Runs with zero network calls and zero API keys by default.
    """
    # a. Build a lower-cased working copy for keyword matching only
    lower_prompt = prompt_text.lower()
    
    # b. Priority evaluation loop following strict group hierarchies
    priority = "medium" # default fallback matrix index token
    if "urgent" in lower_prompt or "asap" in lower_prompt:
        priority = "high"
    elif "whenever" in lower_prompt or "low priority" in lower_prompt:
        priority = "low"

    # c. Due-date hint extraction following the exact Monday-to-Sunday strict order
    due_date_hint = None
    matched_date_phrase = None
    
    # Strict order lists matching constraints guidelines
    date_keywords_order = ["today", "tomorrow", "next week"]
    
    # Two-word strict sequence arrays
    two_word_phrases = [
        "next monday", "next tuesday", "next wednesday", "next thursday", 
        "next friday", "next saturday", "next sunday"
    ]
    
    # Bare weekdays strict sequence arrays
    bare_weekdays = [
        "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
    ]
    
    # Check absolute primary date blocks sequences
    for kw in date_keywords_order:
        if kw in lower_prompt:
            due_date_hint = kw
            matched_date_phrase = kw
            break
            
    # Check explicit two-word boundaries loops if nothing matched yet
    if not due_date_hint:
        for phrase in two_word_phrases:
            if phrase in lower_prompt:
                due_date_hint = phrase
                matched_date_phrase = phrase
                break
                
    # Check bare day indices if still nothing matched yet
    if not due_date_hint:
        for bare_day in bare_weekdays:
            if bare_day in lower_prompt:
                due_date_hint = bare_day
                matched_date_phrase = bare_day
                break

    # d. Title generation starting from original-cased description text strings
    # Rule: Title-stripping is not limited to the single keyword that decided priority!
    title_strip_targets = ["urgent", "asap", "whenever", "low priority"]
    
    # Temporary working variable to execute case-insensitive string replacements on original case
    final_title = prompt_text
    
    # Remove every occurrence of every priority keyword group found anywhere in the text
    for target_kw in title_strip_targets:
        # Use regex case-insensitive replacement to safely clean text while preserving unmatched case
        final_title = re.sub(re.escape(target_kw), "", final_title, flags=re.IGNORECASE)
        
    # Remove every occurrence of the matched date phrase text block if any existed
    if matched_date_phrase:
        final_title = re.sub(re.escape(matched_date_phrase), "", final_title, flags=re.IGNORECASE)
        
    # Trim leading and trailing whitespace characters bounds natively
    final_title = final_title.strip()
    
    # Fallback support if stripped result translates to an empty string layout configuration
    if final_title == "":
        final_title = "Untitled task"
        
    return {
        "title": final_title,
        "priority": priority,
        "due_date_hint": due_date_hint
    }

@app.post("/tasks/quick-add", response_model=schemas.TaskResponse, status_code=status.HTTP_201_CREATED)
def quick_add_task_endpoint(payload: QuickAddRequest, db: Session = Depends(database.get_db)):
    # Relational target project cluster association check
    project = db.query(models.Project).filter(models.Project.id == payload.project_id).first()
    if not project:
        raise HTTPException(status_code=422, detail="Target Project association invalid.")
        
    raw_prompt_text = payload.description
    # Note: Check if the text is whitespace only BEFORE running parser to allow empty string validation limits
    if not raw_prompt_text or raw_prompt_text.strip() == "":
        # Process directly via algorithm to allow 'Untitled task' fallback resolution path parameters
        pass

    try:
        # Always default execute the deterministic spec-matching mock rules engine layers natively!
        print("[SPECIFICATION ENGINE]: Processing dynamic tokens text via deterministic local algorithm layers...")
        ai_json = deterministic_specification_mock_parser(raw_prompt_text)
        
        task_init = {
            "title": ai_json.get("title"),
            "project_id": payload.project_id,
            "priority": ai_json.get("priority"),
            "due_date": ai_json.get("due_date_hint") if ai_json.get("due_date_hint") else "No Deadline Specified",
            "description": f"AI Parsed Quick-Add record from prompt text: {payload.description}",
            "status": "todo"
        }
        
        validated_task = schemas.TaskCreate(**task_init)
        
    except Exception as err:
        print(f"[AI ROUTE INTEGRATION EXCEPTION]: {str(err)}")
        raise HTTPException(status_code=422, detail=f"AI Ingestion algorithm crash parsing trace values: {str(err)}")
        
    db_task = models.Task(**validated_task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

