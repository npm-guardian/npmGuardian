from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from models.obfuscation import detect_obfuscation

app = FastAPI(
    title="npm-Guardian AI Detection Engine",
    description="ML-powered Threat Classification for JS Ecosystem",
    version="1.0.0"
)

class CodePayload(BaseModel):
    snippet: str
    file_name: str

@app.post("/api/v1/analyze/obfuscation")
async def analyze_code(payload: CodePayload):
    """
    Receives a snippet of code (usually AST nodes marked as suspicious by Rust)
    and runs it through the Entropy and ML classifiers.
    """
    if not payload.snippet:
        raise HTTPException(status_code=400, detail="Code snippet is required")
        
    result = detect_obfuscation(payload.snippet)
    
    return {
        "file": payload.file_name,
        "analysis": result
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-detection-engine"}
