
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
	= ("/^"/"/") RegularExpression ("/"/"$/")("is"/"i"/"s")? [ ]* RegexModifier?

HexString
	= "{" _ (HexByte __ / Jump __/ OrHex __)+ _ "}" [ ]* "private"?


RegularExpression
	= Grouping Quantifier / Bracketed Quantifier / RegexChar
    
Grouping
	= ""
    
Bracketed
	= ""

RegexChar
	= ("\\t"/"\\n"/"\\r"/"\\f"/"\\a"/"\\xNN"
    /"\\w"/"\\W"/"\\s"/"\\S"/"\\d"/"\\D"/"\\b"/"\\B"
    /"\\\\"/"\\("/"\\)"/"\\["/"\\]"/"\\{"/"\\}"/"\\-"
    /"\\."/"\\+"/"\\*"/"\\|"/"\\?"/"\\$"/"\\^"
    /[^/\(\)\[\]\{\}\-\.|\*\+?$^])+

Quantifier
	= [*+?]/"{"[0-9]","?"}"

HexByte
	= _ "~"?[?0-9ABCDEF][?0-9ABCDEF]
    
Jump
	= _ "["_ ( Interval256 / NumberLower256 / "-") _ "]"
    
Interval256
	= lb:NumberLower256 "-" ub:NumberLower256?
    { if(typeof ub !== 'undefined' && parseInt(lb,10) > parseInt(ub,10)) error("invalid interval"); else return text() }
    
OrHex
	= _ "("_ OrHex+ _ "|" _ OrHex+ _ ")" / HexByte __
   

KeyValuePair
	= [a-zA-Z0-9]+ _ "=" _ (Integer / String / "true" / "false") _n { return text() }
    
String
	= "\"" [^\"]* "\""
    
Integer "integer"
  = _ [0-9]+ { return parseInt(text(), 10); }
  
NumberLower256
	= num:([2][5][0-6] / [2][0-4][0-9] / [1][0-9][0-9] / [1-9][0-9] / [0-9])
    { if( typeof num === 'string' ) return num; else return num.join('') }

//TODO controllare che ogni modificatore sia presente una sola volta
StringModifier
	= ("nocase" ([ ]+!("xor")!("base64")!("base64wide")AllModifier[ ]*)*)
    / ("wide" ([ ]+AllModifier[ ]*)*) / ("ascii" ([ ]+AllModifier[ ]*)*)
    / ("xor" ([ ]+!("nocase")!("base64")!("base64wide")AllModifier[ ]*)*)
    / ("base64"CustomAlphabet? ([ ]+!("xor")!("nocase")!("fullword")AllModifier[ ]*)*)
    / ("base64wide"CustomAlphabet? ([ ]+!("xor")!("nocase")!("fullword")AllModifier[ ]*)*)
    / ("fullword" ([ ]+!("base64")!("base64wide")AllModifier[ ]*)*)
	/ ("private" ([ ]+AllModifier[ ]*)*)
    
RegexModifier
	= ("nocase" ([ ]+ReModifier[ ]*)*)
    / ("wide" ([ ]+ReModifier[ ]*)*) / ("ascii" ([ ]+ReModifier[ ]*)*)
    / ("fullword" ([ ]+ReModifier[ ]*)*)
	/ ("private" ([ ]+ReModifier[ ]*)*)

CustomAlphabet
	= "(\"" alphabet:( Escape / HexChar / [a-zA-Z0-9!@#$%^&*\(\)\{\}\[\]\.\-|] )+ "\")"
    { if(alphabet.length != 64) error("invalid alphabet size, it must be 64 bytes long"); else return text() }

ReModifier
	= ("nocase" / "ascii" / "wide" / "fullword" / "private")

AllModifier
	= ("nocase" / "ascii" / "wide" / "fullword" / "base64" / "base64wide" / "xor" / "private")

Escape
	= "\\\"" / "\\\\" / "\\t" / "\\n" / "\\xdd"

HexChar
	= "\\x"[0-9a-fA-F].{2}

_ "whitespace"
  = [ \t\n\r]*
  
__ "atLeastOneWhitespace"
	= [ ]+
    
_n "newline"
	= ([ ]*[\n]+[ ]*)+
`