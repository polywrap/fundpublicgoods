from fund_public_goods.lib.strategy.create import create
from fund_public_goods.lib.strategy.utils.initialize_logs import initialize_logs
from fund_public_goods.db import tables, entities, app_db
from supabase.lib.client_options import ClientOptions
from fastapi import APIRouter, HTTPException, Header
from fastapi_events.dispatcher import dispatch
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class Params(BaseModel):
    prompt: str


class Response(BaseModel):
    run_id: str

@router.post("/api/runs")
async def runs(params: Params, authorization: Optional[str] = Header(None)) -> Response:
    if authorization:
        supabase_auth_token = authorization.split(" ")[1]
    else:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    prompt = params.prompt if params.prompt else ""
    if prompt == "":
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")
    db = app_db.create(options=ClientOptions(postgrest_client_timeout=15))
    db.postgrest.auth(supabase_auth_token)

    run_id = tables.runs.insert(entities.Runs(
        prompt=prompt
    ), db)
    initialize_logs(run_id)

    dispatch(
        "create-strategy",
        payload={"run_id": run_id, "authorization": authorization}
    )

    return Response(run_id=run_id)
