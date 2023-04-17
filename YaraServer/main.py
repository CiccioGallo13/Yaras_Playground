from fastapi import FastAPI
from request_model import Model
import services


app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}


# receives a json file with custom rules, data to analyze and some options
# return the matching rules
@app.post("/set/json/")
async def upload_json(file: Model):
    return services.match(file)
