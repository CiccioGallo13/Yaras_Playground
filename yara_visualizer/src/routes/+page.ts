import type{ JsonRequest, JsonResponse, MatchingOccurrence, StringMatchInstance } from '../model/model';
import { _encodeString, _resetIndex, _decodeFromUTF8Bytes, _utf8StringToBytesHex } from '$lib/utils';

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

export function _highlightWordByOffset(text: string, offset: number, end: number, encoding: string): string {

    return `<mark>${_decodeFromUTF8Bytes(text.slice(offset, end), encoding)}</mark>`;
}


export function _highlightInstances(text: string, instances: MatchingOccurrence[], encoding: string): string {
    _resetIndex();
    let occurrences: MatchingOccurrence[] = mergeIntersectingOccurrences(instances);

    let hexText = _utf8StringToBytesHex(text);

    _resetIndex();
    const highlightedParts: string[] = [];
    let lastIndex = 0;
  
    occurrences.forEach((instance) => {
      const start = instance.offset*2;
      const end = start + instance.length*2;
      
      highlightedParts.push(_decodeFromUTF8Bytes(hexText.slice(lastIndex, start), encoding));
      const highlightedInstance = _highlightWordByOffset(hexText, start, end, encoding);
      highlightedParts.push(highlightedInstance);
      lastIndex = end;
    });
  
    highlightedParts.push(_decodeFromUTF8Bytes(hexText.slice(lastIndex), encoding));

    return highlightedParts.join('');
  }


function mergeIntersectingOccurrences(occurrences: MatchingOccurrence[]): MatchingOccurrence[] {
    if (occurrences.length <= 1) {
      return occurrences;
    }
  
    const sortedOccurrences = [...occurrences].sort((a, b) => (a.offset || 0) - (b.offset || 0));
  
    const mergedOccurrences: MatchingOccurrence[] = [sortedOccurrences[0]];
  
    // Iterate through the sortedOccurrences and merge overlapping occurrences
    for (let i = 1; i < sortedOccurrences.length; i++) {
      const currentOccurrence = sortedOccurrences[i];
      const lastMergedOccurrence = mergedOccurrences[mergedOccurrences.length - 1];
  
      if (currentOccurrence.offset! <= lastMergedOccurrence.offset! + lastMergedOccurrence.length!) {

        const mergedOffset = Math.min(lastMergedOccurrence.offset!, currentOccurrence.offset!);
        const mergedLength = Math.max(
          lastMergedOccurrence.offset! + lastMergedOccurrence.length!,
          currentOccurrence.offset! + currentOccurrence.length!
        ) - mergedOffset;
  
        lastMergedOccurrence.offset = mergedOffset;
        lastMergedOccurrence.length = mergedLength;
      } else {
        mergedOccurrences.push(currentOccurrence);
      }
    }
  
    return mergedOccurrences;
  }

export function _getFormattedData(jsonData: string) {
  return Object.entries(jsonData).map(([key, value]) => `  ${key}:    ${value}`).join("\n");
}