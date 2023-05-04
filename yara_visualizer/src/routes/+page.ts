import type internal from "stream";

export interface JsonRequest {
    rules: string;
    data: string;
    complete_scan: boolean;
}

export interface StringMatchIntance {
    matched_data: string
    matched_length: number
    offset: number
    xor_key: number
    plaintext: string
}

export interface StringMatch {

    identifier: string
    is_xor: boolean
    instances: StringMatchIntance[]
}

export interface Match {
    rule: string;
    meta: string;
    string_match: StringMatch[];
}

export interface JsonResponse {
    matches: Match[];

}

export async function _sendData(jsonRequest: JsonRequest) {
    
    const response = await fetch('http://localhost:8000/set/json/', {
        method: 'POST',
        body: JSON.stringify(jsonRequest),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    return await response.json() as JsonResponse;
    
}
