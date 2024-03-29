import uuid
from fund_public_goods.db.entities import Runs
from fund_public_goods.db.app_db import create, create_admin, Client

def insert(row: Runs, db: Client) -> str:
    id = str(uuid.uuid4())
    db.table("runs").insert({
        "id": id,
        "prompt": row.prompt
    }).execute()
    return id


def get_prompt(run_id: str) -> str:
    db = create()
    return (
        db.table("runs")
        .select("prompt")
        .eq("id", run_id)
        .limit(1)
        .single()
        .execute()
        .data["prompt"]
    )


def exists(run_id: str) -> bool:
    try:
        db = create_admin()
        run = db.table("runs").select("id").eq("id", run_id).execute()
        return len(run.data) > 0
    except Exception as error:
        print(error)
        return False
