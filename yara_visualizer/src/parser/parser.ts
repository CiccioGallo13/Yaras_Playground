import { grammar } from "./grammar";
import { default as peg } from "pegjs";


var parser = peg.generate(grammar);

export function parse(input: string) {
    try {
        parser.parse(input);
    }
    catch (e: any) {
        return e;
    }
    return 'Rule parsed successfully'
}