
const GRAMMAR = `
Expression
  = "rule" RuleName "{" _ ("meta:"Meta)? _ ("strings:"Strings)? _ ("condition:"Condition) _ "}"

RuleName
	= __ [_a-zA-Z][_\-$a-zA-Z0-9]* _ { return text().trim() }

Meta
	= _ KeyValuePair+ _ { return text().trim()}
    
Strings
	= Variable+ 
    
Condition
	= "" _ 
  	

Variable
	= _ "$"[_a-zA-Z][_\-$a-zA-Z0-9]* _ "=" _ VariableBody _n { return text().trim() }
    
VariableBody
	= HexString / TextString / Regex

TextString
	= "\"" (Escape / [^\"\\])* "\"" [ ]* StringModifier?

Regex
	= "/" RegularExpression "/"("is"/"i"/"s")? [ ]* RegexModifier?

HexString
	= "{" _ (HexByte __ / Jump __/ OrHex __)+ _ "}" [ ]* "private"?

RegularExpression
	= ""

HexByte
	= _ "~"?[?0-9ABCDEF].{2}
    
//TODO Il numero a destra dovrebbe essere sempre >= di quello a sinistra

Jump
	= _ "["_ ( (NumberLower256 "-" NumberLower256?) / NumberLower256 / "-") _ "]"
    
OrHex
	= _ "("_ OrHex+ _ "|" _ OrHex+ _ ")" / HexByte __
   

KeyValuePair
	= [a-zA-Z0-9]+ _ "=" _ (Integer / String / "true" / "false") _n { return text() }
    
String
	= "\"" [^\"]* "\""
    
Integer "integer"
  = _ [0-9]+ { return parseInt(text(), 10); }
  
NumberLower256
	= ([2][5][0-6]) / ([2][0-4][0-9]) / ([1][0-9][0-9]) / [1-9][0-9] / [0-9]

StringModifier
	= ("nocase" ([ ]+!("xor")!("base64")!("base64wide")AllModifier[ ]*)*)
    / ("wide" ([ ]+AllModifier[ ]*)*) / ("ascii" ([ ]+AllModifier[ ]*)*)
    / ("xor" ([ ]+!("nocase")!("base64")!("base64wide")AllModifier[ ]*)*)
    / ("base64" ([ ]+!("xor")!("nocase")!("fullword")AllModifier[ ]*)*)
    / ("base64wide" ([ ]+!("xor")!("nocase")!("fullword")AllModifier[ ]*)*)
    / ("fullword" ([ ]+!("base64")!("base64wide")AllModifier[ ]*)*)
	/ ("private" ([ ]+AllModifier[ ]*)*)
    
RegexModifier
	= ("nocase" ([ ]+ReModifier[ ]*)*)
    / ("wide" ([ ]+ReModifier[ ]*)*) / ("ascii" ([ ]+ReModifier[ ]*)*)
    / ("fullword" ([ ]+ReModifier[ ]*)*)
	/ ("private" ([ ]+ReModifier[ ]*)*)
    
ReModifier
	= ("nocase" / "ascii" / "wide" / "fullword" / "private")

AllModifier
	= ("nocase" / "ascii" / "wide" / "fullword" / "base64" / "base64wide" / "xor" / "private")

Escape
	= "\\\"" / "\\\\" / "\\t" / "\\n" / "\\xdd"

_ "whitespace"
  = [ \t\n\r]*
  
__ "atLeastOneWhitespace"
	= [ ]+
    
_n "newline"
	= ([ ]*[\n]+[ ]*)+
`