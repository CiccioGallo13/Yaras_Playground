import type{ JsonRequest, JsonResponse, MatchingOccurrence } from '../model/model';
import { Encoding } from '../model/model';

function stringToUTF8(input: string) {
    let utf8HexArray: string[] = [];
    for (let i = 0; i < input.length; i++) {
      const codePoint = input.codePointAt(i)!;
      if (codePoint < 0x80) {
        utf8HexArray.push(String.fromCharCode(codePoint));
      } else if (codePoint < 0x800) {
        utf8HexArray.push(`\\x${(((codePoint >> 6) & 0x1f) | 0xc0).toString(16).padStart(2, "0")}`);
        utf8HexArray.push(`\\x${((codePoint & 0x3f) | 0x80).toString(16).padStart(2, "0")}`);
      } else if (codePoint < 0x10000) {
        utf8HexArray.push(`\\x${(((codePoint >> 12) & 0x0f) | 0xe0).toString(16).padStart(2, "0")}`);
        utf8HexArray.push(`\\x${(((codePoint >> 6) & 0x3f) | 0x80).toString(16).padStart(2, "0")}`);
        utf8HexArray.push(`\\x${((codePoint & 0x3f) | 0x80).toString(16).padStart(2, "0")}`);
      } else if (codePoint < 0x110000) {
        utf8HexArray.push(`\\x${(((codePoint >> 18) & 0x07) | 0xf0).toString(16).padStart(2, "0")}`);
        utf8HexArray.push(`\\x${(((codePoint >> 12) & 0x3f) | 0x80).toString(16).padStart(2, "0")}`);
        utf8HexArray.push(`\\x${(((codePoint >> 6) & 0x3f) | 0x80).toString(16).padStart(2, "0")}`);
        utf8HexArray.push(`\\x${((codePoint & 0x3f) | 0x80).toString(16).padStart(2, "0")}`);
      }
    }
  
    return utf8HexArray.join("");
  }

function stringToUTF32(input: string): string {
    const utf32Array = new Uint32Array(input.length);
    for (let i = 0; i < input.length; i++) {
      utf32Array[i] = input.charCodeAt(i);
    }
  
    let hexString = "";
    for (let i = 0; i < utf32Array.length; i++) {
      const byte1 = (utf32Array[i] & 0xff).toString(16).padStart(2, "0");
      const byte2 = ((utf32Array[i] >> 8) & 0xff).toString(16).padStart(2, "0");
      const byte3 = ((utf32Array[i] >> 16) & 0xff).toString(16).padStart(2, "0");
      const byte4 = ((utf32Array[i] >> 24) & 0xff).toString(16).padStart(2, "0");
      hexString += `\\x${byte4}${byte3}${byte2}${byte1}`;
    }
  
    return hexString;
  }

  let index = 0;

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
              .join(" ")+' ';

        case Encoding.UTF8:
          return stringToUTF8(input);

        case Encoding.UTF16:
            const utf16Array = new Uint16Array(input.length);
            for (let i = 0; i < input.length; i++) {
            utf16Array[i] = input.charCodeAt(i);
            }

            let hexString = "";
            for (let i = 0; i < utf16Array.length; i++) {
            const byte1 = (utf16Array[i] & 0xff).toString(16).padStart(2, "0");
            const byte2 = ((utf16Array[i] >> 8) & 0xff).toString(16).padStart(2, "0");
            hexString += `\\x${byte2}${byte1}`;
            }

            return hexString;

        case Encoding.UTF32:
          return stringToUTF32(input);
        case Encoding.RAW:
          return input;
        
        case Encoding.PLAIN:
            return input;

        
      default:
          throw new Error("Unsupported encoding");
  }
}

export function _decodeFromUTF8Bytes(hexString: string, encoding: string): string{

    const cleanedHexString = hexString.replace(/\s/g, '').replace(/[^0-9a-fA-F]/g, '');
    if (cleanedHexString.length % 2 !== 0) {
      throw new Error('Invalid hexadecimal string. It should have an even number of characters.');
    }
    let plainString = utf8HexBytesToPlain(cleanedHexString);
    switch (encoding) {
        case Encoding.HEX:
          let hexString = '';
          for (let i = 0; i < plainString.length; i++) {
            const charCode = plainString.charCodeAt(i);
            // Replace non-ASCII characters with '?'
            const hexByte = charCode >= 32 && charCode <= 126 ? charCode.toString(16).toUpperCase().padStart(2, '0') : '3F';
            hexString += hexByte;
          }
          return _justify(hexString, encoding);

        case Encoding.BINARY:
            let binaryString = cleanedHexString
                .split('')
                .map((hex) => parseInt(hex, 16).toString(2).padStart(4, '0'))
                .join('');
            return _justify(binaryString, encoding);
        
        case Encoding.ASCII:
          return _encodeString(plainString, encoding);

        case Encoding.PLAIN:
          return plainString;
          
        case Encoding.UTF8:
            
            return _encodeString(plainString, encoding);

        case Encoding.UTF16:
            return _encodeString(plainString, encoding);

        case Encoding.UTF32:
            return _encodeString(plainString, encoding);

        case Encoding.RAW:
            const rawBytes = [];
            for (let i = 0; i < cleanedHexString.length; i += 2) {
              rawBytes.push(cleanedHexString.substr(i, 2));
            }
            return rawBytes.join(' ')+' ';
        
        default:
            throw new Error("Unsupported encoding");
    }
}


export function _resetIndex(){
    index = 0;
}

function utf8HexBytesToPlain(hexString: string){
  const utf8Array = [];
          for (let i = 0; i < hexString.length; i += 2) {
            const hexPair = hexString.substr(i, 2);
            utf8Array.push(parseInt(hexPair, 16));
          }
          const utf8String = new TextDecoder().decode(Uint8Array.from(utf8Array));
          return utf8String;
}

function _justify(input: string, encoding: string):string {
  let formattedString = "";
  let i = 0;
  switch (encoding) {
    case Encoding.HEX:
      for (i ; i < input.length; i += 2) {
          formattedString += input.substr(i, 2) + " ";
          if ((i+index + 2) % 16 === 0) {
              formattedString += " ";
          }
      }
      index += i;
      return formattedString;

    case Encoding.BINARY:
      for (i ; i < input.length; i += 1) {
          formattedString += input[i];
          if ((i+index + 1) % 8 === 0) {
              formattedString += " ";
          }
      }
      index += i;
      return formattedString;
    
    default:
      return input;
  }
}

export function _utf8StringToBytesHex(utf8String: string): string {
    const encoder = new TextEncoder();
    const utf8Encoded = encoder.encode(utf8String);
  
    const hexBytesArray: string[] = [];
    for (const byte of utf8Encoded) {
      hexBytesArray.push(byte.toString(16).padStart(2, '0').toUpperCase());
    }
  
    return hexBytesArray.join('');
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