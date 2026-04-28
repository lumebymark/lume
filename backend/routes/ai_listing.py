# backend/routes/ai_listing.py
"""
AI-powered listing parser for LUME CMS.

POST /api/admin/ai-parse-listing

Accepts (multipart/form-data):
  - `text`  (str)        — pasted raw listing text
  - `file`  (UploadFile) — a .pdf or .docx file

Returns structured JSON matching the listings table schema.
Does NOT save to the database — the frontend previews and admin confirms.

Prompt lives in: backend/prompts/listing_parser.txt
Edit that file to tune Claude's behaviour — no code change needed.

Dependencies (in requirements.txt):
    anthropic
    pdfplumber
    python-docx
    python-multipart
"""

import io
import json
import os
import re
from functools import lru_cache
from pathlib import Path
from typing import Optional

import anthropic
from auth import require_admin
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

router = APIRouter(prefix="/api/admin", tags=["admin-ai"])

# Prompt file is one level up from routes/, inside prompts/
_PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "listing_parser.txt"


# ─────────────────────────────────────────────────────────────────────────────
# Prompt loader — cached so the file is read once per process.
# Call _load_prompt.cache_clear() if you ever need a hot-reload in dev.
# ─────────────────────────────────────────────────────────────────────────────


@lru_cache(maxsize=1)
def _load_prompt() -> str:
    if not _PROMPT_PATH.exists():
        raise RuntimeError(
            f"Prompt file not found: {_PROMPT_PATH}\n"
            "Create backend/prompts/listing_parser.txt"
        )
    return _PROMPT_PATH.read_text(encoding="utf-8").strip()


# ─────────────────────────────────────────────────────────────────────────────
# File text extraction helpers
# ─────────────────────────────────────────────────────────────────────────────


def _extract_pdf(file_bytes: bytes) -> str:
    import pdfplumber

    parts: list[str] = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                parts.append(t)
    return "\n\n".join(parts)


def _extract_docx(file_bytes: bytes) -> str:
    from docx import Document  # python-docx

    doc = Document(io.BytesIO(file_bytes))
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


# ─────────────────────────────────────────────────────────────────────────────
# Route
# ─────────────────────────────────────────────────────────────────────────────


@router.post("/ai-parse-listing")
async def ai_parse_listing(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    admin=Depends(require_admin),
):
    """
    Parse a raw listing (pasted text, PDF, or DOCX) with Claude AI.
    Returns structured JSON ready to pre-fill the listing form.
    Does NOT write to the database.
    """
    # ── Check API key ─────────────────────────────────────────────────────────
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="ANTHROPIC_API_KEY is not set in environment variables.",
        )

    # ── Load prompt ───────────────────────────────────────────────────────────
    try:
        system_prompt = _load_prompt()
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    # ── Extract raw text ──────────────────────────────────────────────────────
    raw_text = ""

    if file and file.filename:
        file_bytes = await file.read()
        name = file.filename.lower()

        if name.endswith(".pdf"):
            try:
                raw_text = _extract_pdf(file_bytes)
            except Exception as exc:
                raise HTTPException(status_code=422, detail=f"Could not read PDF: {exc}")

        elif name.endswith(".docx"):
            try:
                raw_text = _extract_docx(file_bytes)
            except Exception as exc:
                raise HTTPException(status_code=422, detail=f"Could not read DOCX: {exc}")

        else:
            raise HTTPException(
                status_code=422,
                detail=f"Unsupported file type '{file.filename}'. Please upload a PDF or DOCX.",
            )

    elif text:
        raw_text = text.strip()

    if not raw_text:
        raise HTTPException(status_code=422, detail="Please provide text or a file.")

    if len(raw_text) < 20:
        raise HTTPException(status_code=422, detail="Text is too short to analyse.")

    # ── Call Claude ───────────────────────────────────────────────────────────
    client = anthropic.Anthropic(api_key=api_key)

    try:
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            system=system_prompt,
            messages=[
                {
                    "role": "user",
                    "content": (
                        "Here is the raw listing information to analyse:\n\n"
                        + raw_text[:12000]  # guard against huge files
                    ),
                }
            ],
        )
    except anthropic.APIError as exc:
        raise HTTPException(status_code=502, detail=f"Claude API error: {exc}")

    # ── Parse response ────────────────────────────────────────────────────────
    raw_response = message.content[0].text.strip()

    # Strip accidental markdown fences
    raw_response = re.sub(r"^```(?:json)?\s*", "", raw_response)
    raw_response = re.sub(r"\s*```$", "", raw_response.strip())

    try:
        parsed: dict = json.loads(raw_response)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Claude returned invalid JSON ({exc}). Raw start: {raw_response[:200]}",
        )

    # ── Safety defaults ───────────────────────────────────────────────────────
    safe_defaults = {
        "status": "draft",
        "internal_status": "draft",
        "currency": "EUR",
        "country": "Portugal",
        "featured": False,
        "confidential": False,
        "address_visibility": "approximate",
        "company": "LUME by Mark",
        "listing_agent": "Mark",
        "priority": "medium",
        "cover_image": "https://placehold.co/1200x800/1a1a2e/ffffff?text=Awaiting+Image",
    }
    for k, v in safe_defaults.items():
        if not parsed.get(k):
            parsed[k] = v

    # ── Confidence score ──────────────────────────────────────────────────────
    skip_defaults = set(safe_defaults.keys()) | {"slug"}
    extracted = sum(
        1
        for k, v in parsed.items()
        if k not in skip_defaults
        and v is not None
        and v != ""
        and v != []
        and v != {}
        and v is not False
    )

    return {
        "listing": parsed,
        "meta": {
            "fields_extracted": extracted,
            "model": "claude-sonnet-4-20250514",
            "source": "file" if file else "text",
            "prompt_file": str(_PROMPT_PATH),
        },
    }