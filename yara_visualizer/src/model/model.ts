export interface JsonRequest {
    rules: string;
    data: string;
    complete_scan: boolean;
}

export interface StringMatchInstance {
    matched_data: string
    matched_length: number
    offset: number
    xor_key: number
    plaintext: string
}

export interface StringMatch {

    identifier: string
    is_xor: boolean
    instances: StringMatchInstance[]
}

export interface Match {
    rule: string;
    meta: string;
    string_match: StringMatch[];
}

export enum Encoding {
    HEX = "hex",
    BINARY = "binary",
    ASCII = "ascii",
    UTF8 = "utf8",
    UTF16 = "utf16",
    UTF32 = "utf32",
    RAW = "raw"
}

export interface EncodingMatch {
    matches: Match[];
    encoding: string;
}


export interface JsonResponse {
    encoding_matches: EncodingMatch[];
}

export interface HighlightedMatches {
    rule?: string;
    meta?: string;
    highlighted_string: string;
}