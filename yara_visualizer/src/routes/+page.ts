import type{ JsonRequest, JsonResponse, StringMatchInstance } from '../model/model';
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


export function _encodeString(input: string, encoding: Encoding): string {
  switch (encoding) {
      case Encoding.HEX:
          if (typeof Buffer !== "undefined") {
              return Buffer.from(input).toString("hex");
          } else {
              return Array.from(input)
                  .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
                  .join("");
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
