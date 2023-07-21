from __future__ import annotations

import enum

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


class Encodings(enum.Enum):
    HEX = "hex"
    BINARY = "binary"
    ASCII = "ascii"
    UTF8 = "utf-8"
    UTF16 = "utf-16"
    UTF32 = "utf-32"
    RAW = "raw"


class EncodingMatch(BaseModel):
    matches: list[CustomMatch]
    encoding: Encodings


class ResponseModel(BaseModel):
    encoding_matches: list[EncodingMatch]
