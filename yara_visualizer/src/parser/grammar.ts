
const GRAMMAR = `
Expression
  	= Import* "rule" RuleName (":" RuleNameImport+)? "{" _ ("meta:"Meta)? _ ("strings:"Strings)? _ ("condition:"Condition) _ "}" _

//TODO: Implment Anonymous strings

Import
	= "import" _ "\"" VariableName "\"" _n { return text().trim() }

RuleName
	= __ [_a-zA-Z][_\-$a-zA-Z0-9]* _ { return text().trim() }
    
RuleNameImport
	= _ [_a-zA-Z][_\-$a-zA-Z0-9]* _ { return text().trim() }

Meta
	= _ KeyValuePair+ _ { return text().trim()}
    
Strings
	= Variable+ 
    
Condition
	= _ ("not defined"/"not")? _ (BooleanExpression / BooleanExpression1 )  _ 

ConditionExpression
	=   ("not defined"/"not")? _ (ConditionVariableOperation / BooleanExpression1 / BooleanExpression / StringSet / InInterval / ConditionVariable)

BooleanExpression
	= "(" _ ConditionExpression+ _ ")" _ ( _ ("and"/"or") _ ConditionExpression)*

BooleanExpression1
	= _ (ConditionVariableOperation  / BooleanExpression / StringSet / InInterval / ConditionVariable)+ _ ( _ ("and"/"or") _ ConditionExpression)*


    
ConditionVariable
	=("not defined"/"not")? _ not:"~"? _ type:[#$@!] name:VariableName sub:ArraySub? 
    { if(((type === '#' || type === '$') && sub) || (type === '$' && not)) error("syntax error"); else return text().trim() }

ConditionVariableOperation
	= _ ("filesize"/DataAccess/ImportFunction/ConditionVariableNumeric/VirtualAddress/CondInteger) _ ConditionOperatorNumeric _ 
    ("filesize"/DataAccess/ImportFunction/ConditionVariableNumeric / VirtualAddress /CondInteger / "("ConditionVariableOperation+")") 
    (_ ConditionOperatorNumeric _ ("filesize"/DataAccess/ImportFunction/ConditionVariableNumeric / VirtualAddress / CondInteger / "("ConditionVariableOperation+")"))?
    
    { return text().trim() }
    
ConditionVariableNumeric
	= _ "~"? _ type:[#@!] name:VariableName sub:ArraySub? _ {if((type === '#') && sub) error("syntax error"); else return text().trim()}

InInterval
	= _ ("not defined"/"not")? _ ("$" VariableName _ "at" _ (CondInteger / "(" _ CondInteger _ ")")
    / not:"~"? type:[$#] VariableName _ "in" _ "(" ConditionVariableInterval ".." ConditionVariableInterval ")" { if(not && type === '$') error("syntax error"); else return text().trim() } )

ConditionVariableInterval
	= _ ("not defined"/"not")? _ "~"? _ ("(" _ ("not defined"/"not")? _ "~"? _ (ConditionVariableNumeric/CondInteger/"filesize"/ImportFunction) _ ")" /(ConditionVariableNumeric/[0-9]+/"filesize"/ImportFunction)) _ (NumericOperator _ 
    "~"? _ (ConditionVariableNumeric / CondInteger /"filesize"/ImportFunction/"("ConditionVariableInterval+")"))?
    ( NumericOperator _ "~"? _ (ConditionVariableNumeric / CondInteger / "filesize"/ImportFunction/ "("ConditionVariableInterval+")"))?

StringSet
	= ("any"/"all"/"none"/Integer) _ "of" __ ("them"/"(" _ ("$*"/"$" VariableName "*"? (_ "," _ "$" VariableName "*"?)*) _ ")")

ArraySub
	= "["[0-9]+"]"

NumericOperator
	= _ ([\-\*\\%\+&^|]/"<<"/">>") _ { return text().trim() }

Variable
	= _ "$"VariableName _ "=" _ VariableBody _n { return text().trim() }
    
VariableBody
	= HexString / TextString / Regex

ImportFunction
	= ("pe"/"cuckoo")"."VariableName

TextString
	= "\"" (Escape / [^\"\\])* "\"" [ ]* StringModifier?

Regex
	= ("/^"/"/") RegularExpression ("/"/"$/")("is"/"i"/"s")? [ ]* RegexModifier?

HexString
	= "{" _ (HexByte __ / Jump __/ OrHex __)+ _ "}" [ ]* "private"?


RegularExpression
	= Grouping / Bracketed / RegexChar
    
Grouping
	= "(" RegularExpression+ ")" Quantifier? RegularExpression?
    
Bracketed
	= "["(RegexChar "^" RegexChar / "^" RegexChar)? RegularExpression* "]" Quantifier? RegularExpression?

RegexChar
	= ("\\t"/"\\n"/"\\r"/"\\f"/"\\a"/"\\xNN"
    /"\\w"/"\\W"/"\\s"/"\\S"/"\\d"/"\\D"/"\\b"/"\\B"
    /"\\\\"/"\\("/"\\)"/"\\["/"\\]"/"\\{"/"\\}"/"\\-"
    /"\\."/"\\+"/"\\*"/"\\|"/"\\?"/"\\$"/"\\^"/"\\/"
    /[^/\\\(\)\[\]\{\}\.\*\+?$^])+

Quantifier
	= ([*+?] / "{"( RegexOccurrenceInterval / [0-9]+","? / ","?[0-9]+)"}")"?"? 
    
RegexOccurrenceInterval
	= lb:[0-9]+","ub:[0-9]+ { if(parseInt(lb.join(''),10) > parseInt(ub.join(''),10)) error("invalid interval")}

HexByte
	= _ "~"?[?0-9ABCDEF][?0-9ABCDEF]
    
Jump
	= _ "["_ ( Interval256 / NumberLower256 / "-") _ "]"
    
Interval256
	= lb:NumberLower256 "-" ub:NumberLower256?
    { if( ub && parseInt(lb,10) > parseInt(ub,10)) error("invalid interval"); else return text() }
    
OrHex
	= _ "("_ OrHex+ _ "|" _ OrHex+ _ ")" / HexByte __
   

KeyValuePair
	= [a-zA-Z0-9]+ _ "=" _ (Integer / String / "true" / "false") _n { return text() }
    
String
	= "\"" [^\"]* "\""
    
Integer "integer"
  	= _ ("(" _ (ConditionVariableNumeric/Integer/ [0-9]+) _ (_ NumericOperator _ Integer)* _ ")" _ 
    / _ (ConditionVariableNumeric/[0-9]+) (_ NumericOperator _ Integer)* _ ) { return parseInt(text().trim(), 10); }
 
CondInteger
	= _ [0-9]+("KB"/"MB")?
  
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

DataAccess
	= "u"?"int" ("8"/"16"/"32") "be"? "(" _ (VirtualAddress/CondInteger/DataAccess)_ ")"

VirtualAddress
	= "0x"[0-9a-fA-F]+

ReModifier
	= ("nocase" / "ascii" / "wide" / "fullword" / "private")

AllModifier
	= ("nocase" / "ascii" / "wide" / "fullword" / "base64" / "base64wide" / "xor" / "private")

ConditionOperatorNumeric
	= "<<" / ">>" / "<=" / ">=" / "==" / "!=" 
    /[\-\*\\%\+&^|<>]

ConditionOperatorStrings
	= "i"? ("contains"/"startswith"/"endswith") / "iequals" / "matches"

Escape
	= "\\\"" / "\\\\" / "\\t" / "\\n" / "\\xdd"

VariableName
	= [_a-zA-Z][_\-$a-zA-Z0-9]*
   
HexChar
	= "\\x"[0-9a-fA-F].{2}

_ "whitespace"
  = [ \t\n\r]*
  
__ "atLeastOneWhitespace"
	= [ ]+
    
_n "newline"
	= ([ ]*[\n]+[ ]*)+
`