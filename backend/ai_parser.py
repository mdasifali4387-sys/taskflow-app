# backend/ai_parser.py
from typing import Tuple, Optional

def parse_quick_add_text(description: str) -> Tuple[str, str, Optional[str]]:
    """
    Parses a free-text task string deterministically based on keyword groups.
    Returns a Tuple of (title, priority, due_date_hint).
    """
    desc_lower = description.lower()
    
    # Priority Evaluation Logic
    priority = "medium"  # Default
    has_high = "urgent" in desc_lower or "asap" in desc_lower
    has_low = "whenever" in desc_lower or "low priority" in desc_lower
    
    if has_high:
        priority = "high"
    elif has_low:
        priority = "low"

    # Due Date Evaluation Logic
    due_date_hint = None
    
    if "today" in desc_lower:
        due_date_hint = "today"
    elif "tomorrow" in desc_lower:
        due_date_hint = "tomorrow"
    elif "next week" in desc_lower:
        due_date_hint = "next week"
    else:
        next_weekdays = [
            "next monday", "next tuesday", "next wednesday", 
            "next thursday", "next friday", "next saturday", "next sunday"
        ]
        for phrase in next_weekdays:
            if phrase in desc_lower:
                due_date_hint = phrase
                break
                
        if not due_date_hint:
            bare_weekdays = [
                "monday", "tuesday", "wednesday", 
                "thursday", "friday", "saturday", "sunday"
            ]
            for day in bare_weekdays:
                if day in desc_lower:
                    due_date_hint = day
                    break

    # Title-Stripping Configuration Logic
    strip_keywords = ["urgent", "asap", "whenever", "low priority"]
    if due_date_hint:
        strip_keywords.append(due_date_hint)

    title_working = description
    for kw in strip_keywords:
        while True:
            idx = title_working.lower().find(kw.lower())
            if idx == -1:
                break
            title_working = title_working[:idx] + title_working[idx + len(kw):]

    final_title = title_working.strip()
    if not final_title:
        final_title = "Untitled task"

    return final_title, priority, due_date_hint
