from dotenv import load_dotenv
from fastapi import FastAPI
import inngest.fast_api
from mangum import Mangum
from .inngest_client import inngest_client
from fund_public_goods.gitcoin.functions import functions as gitcoin_functions
from fund_public_goods.workers.functions import functions as worker_functions
from .api import workers, runs
from .get_version import router as get_version_router

load_dotenv()

app = FastAPI()


inngest.fast_api.serve(app, inngest_client, [*worker_functions, *gitcoin_functions])
app.include_router(workers.router)
app.include_router(runs.router)
app.include_router(get_version_router)

handler = Mangum(app=app)
