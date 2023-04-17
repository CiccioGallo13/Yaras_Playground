from pydantic import BaseModel


# class for the json mapping
class Model(BaseModel):
    rules: str | None = None
    data: str
    complete_scan: bool
