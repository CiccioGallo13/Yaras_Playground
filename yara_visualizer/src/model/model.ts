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
    HEX =       "hex",
    BINARY =    "binary",
    ASCII =     "ascii",
    PLAIN =     "plain",
    UTF8 =      "utf-8",
    UTF16 =     "utf-16",
    UTF32 =     "utf-32",
    RAW =       "raw"
}

export interface EncodingMatch {
    matches: Match[];
    encoding: Encoding;
}


export interface JsonResponse {
    matches: Match[];
}

export interface HighlightedMatches {
    rules?: string[];
    highlighted_string: string;
}

export interface MatchingOccurrence {
    offset: number;
    length: number;
}

export interface State {
    rules: string;
    data: string;
}

export interface TabItem {
    name: string;
    icon: string;
}