import type{ JsonRequest, JsonResponse, MatchingOccurrence, StringMatchInstance } from '../model/model';
import { Encoding } from '../model/model';

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

    return `<mark>${_encodeString(text.slice(offset, end), encoding)}</mark>`;
}

let index = 0;

export function _highlightInstances(text: string, instances: MatchingOccurrence[], encoding: string): string {
    index = 0;
    let occurrences: MatchingOccurrence[] = mergeIntersectingOccurrences(instances);

    const highlightedParts: string[] = [];
    let lastIndex = 0;
  
    occurrences.forEach((instance) => {
      const start = instance.offset;
      const end = start + instance.length;
      
      highlightedParts.push(_encodeString(text.slice(lastIndex, start), encoding));
      const highlightedInstance = _highlightWordByOffset(text, start, end, encoding);
      highlightedParts.push(highlightedInstance);
      lastIndex = end;
    });
  
    highlightedParts.push(_encodeString(text.slice(lastIndex), encoding));
    return highlightedParts.join('');
  }


function stringToUTF32(input: string): string {
    let utf32Array = [];
    for (let i = 0; i < input.length; i++) {
        const charCode = input.charCodeAt(i);
        utf32Array.push(String.fromCharCode((charCode >> 24) & 0xFF));
        utf32Array.push(String.fromCharCode((charCode >> 16) & 0xFF));
        utf32Array.push(String.fromCharCode((charCode >> 8) & 0xFF));
        utf32Array.push(String.fromCharCode(charCode & 0xFF));
    }
    return utf32Array.join("");
}


export function _encodeString(input: string, encoding: string): string {
    switch (encoding) {
      case Encoding.HEX:
          {
            const hexString = Array.from(input)
                .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
                .join("");

            let formattedHexString = "";
            let i = 0;
            for (i ; i < hexString.length; i += 2) {
                formattedHexString += hexString.substr(i, 2) + " ";
                if ((i+index + 2) % 16 === 0) {
                    formattedHexString += " ";
                }
            }
            index += i;
            return formattedHexString;
        }
      case Encoding.BINARY:
          return Array.from(input)
              .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
              .join(" ");
      case Encoding.ASCII:
          return Array.from(input)
              .map((char) => char.charCodeAt(0).toString(10))
              .join(" ");
      case Encoding.UTF8:
          return input;
      case Encoding.UTF16:
          return Array.from(input)
              .map((char) => char.charCodeAt(0))
              .map((code) => String.fromCharCode(code & 0xFF, (code >> 8) & 0xFF))
              .join("");
      case Encoding.UTF32:
          return stringToUTF32(input);
      case Encoding.RAW:
          return input;
      default:
          throw new Error("Unsupported encoding");
  }
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
  console.log(jsonData);
  return Object.entries(jsonData).map(([key, value]) => `  ${key}:    ${value}`).join("\n");
}