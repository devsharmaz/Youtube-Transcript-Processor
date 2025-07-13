from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import uvicorn
import logging

from trasnsform_transscript import Tranform

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class QueryRequest(BaseModel):
    user_url: str

# Load transcript engine
try:
    Transcript_engine = Tranform()
    logger.info("✅ Transcript engine loaded successfully")
except Exception as e:
    logger.error(f"❌ Failed to initialize Transcript_engine: {e}")
    Transcript_engine = None

# POST endpoint with HTML response
@app.post("/transcript", response_class=HTMLResponse)
def fetch_transcript_from_API(request: QueryRequest):
    if Transcript_engine is None:
        raise HTTPException(status_code=500, detail="Transcript engine not initialized.")

    try:
        response = Transcript_engine.fetch_transform_data(request.user_url.strip())

        if not isinstance(response, str):
            raise HTTPException(status_code=500, detail="Transcript engine returned non-string response.")

        # Convert markdown-style `###` headings to HTML
        html = response.replace('---', '<hr>') \
                       .replace('### ', '<h3>') \
                       .replace('\n\n', '<br><br>') \
                       .replace('\n', '<br>') \
                       .replace('</h3><br>', '</h3>')

        return HTMLResponse(content=f"<html><body>{html}</body></html>", status_code=200)

    except Exception as e:
        logger.error(f"Transcript transformation error: {e}")
        raise HTTPException(status_code=500, detail=f"Transcript transformation error: {str(e)}")

# Run locally
if __name__ == "__main__":
    uvicorn.run("server:app", host="127.0.0.1", port=9010, reload=True)
