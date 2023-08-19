import http

from fastapi import FastAPI
from starlette.responses import JSONResponse

import models
import services

from fastapi.middleware.cors import CORSMiddleware
import uvicorn

import utils

app = FastAPI()
origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost:1313",
    "http://localhost:1313/*",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unicorn_exception_handler(request, exc):
    return JSONResponse(
        status_code=http.HTTPStatus.BAD_REQUEST,
        headers={"Access-Control-Allow-Origin": "*"},
        content={"message": str(exc)},
    )


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}


# receives a json file with custom rules, data to analyze and some options
# return the matching rules
@app.post("/set/json/")
async def upload_json(file: models.RequestModel):
    return services.analyze_data(file)


@app.post("/set/json/encode")
async def upload_json(file: models.RequestModel):
    return services.encode_data(file, models.Encodings.RAW)
