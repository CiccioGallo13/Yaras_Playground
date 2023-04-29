export interface JsonRequest {
    rules: string;
    data: string;
    complete_scan: boolean;
}


async function sendData(jsonRequest: JsonRequest) {
    
    const response = await fetch('http://localhost:8000/set/json/', {
        method: 'POST',
        body: JSON.stringify(jsonRequest),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    return await response.json();
    
}

export default sendData;