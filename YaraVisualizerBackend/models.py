from pydantic import BaseModel


# class for the json mapping
class RequestModel(BaseModel):
    rules: str | None = None
    data: str
    complete_scan: bool


class CustomStringMatchInstance(BaseModel):
    matched_data: str
    matched_length: int
    offset: int
    xor_key: int
    plaintext: str


class CustomStringMatch(BaseModel):
    identifier: str
    is_xor: bool
    instances: list[CustomStringMatchInstance]


class CustomMatch(BaseModel):
    rule: str
    meta: str
    string_match: list[CustomStringMatch]


class ResponseModel(BaseModel):
    matches: list[CustomMatch]
