import type{ JsonRequest, JsonResponse, StringMatchInstance } from '../model/model';

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

export function _highlightWordByOffset(text: string, offset: number, length: number): string {
    const start = offset;
    const end = offset + length;
    return `${text.slice(0, start)}<mark>${text.slice(start, end)}</mark>${text.slice(end)}`;
  }

export function _highlightInstances(text: string, instances: StringMatchInstance[]): string {
    const highlightedParts: string[] = [];
    let lastIndex = 0;
  
    instances.forEach((instance) => {
      const start = instance.offset;
      const end = start + instance.matched_length;
      const highlightedInstance = _highlightWordByOffset(text, start, instance.matched_length);
  
      highlightedParts.push(text.slice(lastIndex, start));
      highlightedParts.push(highlightedInstance);
      lastIndex = end;
    });
  
    highlightedParts.push(text.slice(lastIndex));
    return highlightedParts.join('');
  }


