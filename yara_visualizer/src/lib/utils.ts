import { Encoding } from "../model/model";

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
              .join(" ");
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

export function _resetIndex(){
    index = 0;
}