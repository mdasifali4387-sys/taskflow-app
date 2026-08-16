# backend/schemas.py
from pydantic import BaseModel, field_validator
from typing import Optional, List

# --- USER PIPELINE SCHEMAS ---
class UserCreate(BaseModel):
    name: str
    email: str
    role: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True


# --- PROJECT PIPELINE SCHEMAS ---
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    owner_id: int

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    owner_id: int

    class Config:
        from_attributes = True


# --- REAL TASK STRUCTURAL SCHEMAS ---
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "todo"
    priority: str = "medium"
    due_date: Optional[str] = None
    project_id: int
    assigned_to: Optional[int] = None

    # Custom Validator to completely reject empty blank titles after whitespace stripping
    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Title field configuration parameters cannot be completely blank spaces.")
        return v.strip()

    # Field Constraint restricting inputs to strict closed set configuration parameters
    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        valid_set = {"low", "medium", "high"}
        if v.lower() not in valid_set:
            raise ValueError("Priority boundary parameter constraints restrict values to 'low', 'medium', or 'high'.")
        return v.lower()

class TaskUpdate(BaseModel):
    status: Optional[str] = None
    title: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    due_date: Optional[str] = None
    project_id: int
    assigned_to: Optional[int] = None

    class Config:
        from_attributes = True


# --- NATIVE DATABASE STATS AGGREGATION LOOKUP SCHEMAS ---
class ProjectStats(BaseModel):
    project_id: int
    project_name: str
    total_tasks: int
    todo_count: int
    in_progress_count: int
    done_count: int
