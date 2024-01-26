import uuid
from fund_public_goods.db.entities import Runs
from fund_public_goods.db.client import create, create_admin


def insert(row: Runs) -> str:
    db = create_admin()
    id = str(uuid.uuid4())
    db.table("runs").insert({
        "id": id,
        "worker_id": str(row.worker_id),
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
