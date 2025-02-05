from fastapi import FastAPI
from agent.trip_agent_server import app

# Export the trip planner app directly
export_app = app

### Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

@app.get("/api/py/helloFastApi")
def hello_fast_api():
    return {"message": "Hello from FastAPI"}

# Mount the trip planner app
app.mount("/api/py/trip-planner", export_app)