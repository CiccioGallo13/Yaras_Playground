
const GRAMMAR = `
Rules
	= (Import* _ {return text().trim()}) ( RuleType? Rule)+

RuleType
	= (p:"private" __ g:"global" __ { return [p,g] }  
    / g:"global" __ p:"private" __ { return [p,g] }
    / ("global"/"private") __) { return text().trim() }
    

Rule
  	= _ rule:"rule" RuleName tag:(":" RuleNameImport+)? body:("{" _ meta:("meta:"Meta)? _ str:("strings:"Strings)? _ cond:("condition:"Condition) _ "}" {return [meta, str, cond] }) _
	{ return [rule, tag, body] }

//TODO: Implment Anonymous strings

Import
	=  _"import" _ "\"" VariableName "\"" _n { return text().trim() }

RuleName
	= __ [_a-zA-Z][_\-$a-zA-Z0-9]* _ { return text().trim() }
    
RuleNameImport
	= _ [_a-zA-Z][_\-$a-zA-Z0-9]* _ { return text().trim() }

Meta
	= _ val:KeyValuePair+ _ { return val}
    
Strings
	= Variable+ 
    
Condition
	= _ ("not defined"/"not")? _ (BooleanExpression / BooleanExpression1 )  _ 

ConditionExpression
	=   ("not defined"/"not")? _ (ConditionVariableOperation / For / BooleanExpression1 / BooleanExpression / InInterval / StringSet / ConditionVariable)

BooleanExpression
	= "(" _ ConditionExpression _ ")" _ ( _ ("and"/"or") _ ConditionExpression)*

BooleanExpression1
	= _ (ConditionVariableOperation / For / BooleanExpression / InInterval / StringSet / ConditionVariable) _ ( _ ("and"/"or") _ ConditionExpression)*


    
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
	= _ ("not defined"/"not")? _ (("$" VariableName/StringSet) _ "at" _ (CondInteger / "(" _ CondInteger _ ")")
    / IntervalVariable _ "in" _ "(" ConditionVariableInterval ".." ConditionVariableInterval ")") { return text().trim() } 

IntervalVariable
	= not:"~"? type:[$#] VariableName { if(not && type === '$') error("syntax error"); else return text().trim() }  / StringSet 

ConditionVariableInterval
	= _ ("not defined"/"not")? _ "~"? _ ("(" _ ("not defined"/"not")? _ "~"? _ (ConditionVariableNumeric/CondInteger/"filesize"/ImportFunction) _ ")" /(ConditionVariableNumeric/[0-9]+/"filesize"/ImportFunction)) _ (NumericOperator _ 
    "~"? _ (ConditionVariableNumeric / CondInteger /"filesize"/ImportFunction/"("ConditionVariableInterval+")"))?
    ( NumericOperator _ "~"? _ (ConditionVariableNumeric / CondInteger / "filesize"/ImportFunction/ "("ConditionVariableInterval+")"))?

StringSet
	= ("any"/ "all" / "none" / Integer) _ "of" __ ("them"/"(" _ ("$*"/"$" VariableName "*"? (_ "," _ "$" VariableName "*"?)*) _ ")")

//TODO Check that the variable used for accessing the data is referenced in 'ForInterval'
For
	= "for" __ ForInterval ":" _ "(" ForContext ")"
    
ForContext
	= _  (BooleanForContext/BooleanForContext1) _ {return text().trim() }

ConditionExpressionFor
	=   ("not defined"/"not")? _ (ForVariableOperation / BooleanForContext1 / BooleanForContext / InInterval / StringSet / ConditionVariable)

BooleanForContext
	= "(" _ ConditionExpressionFor _ ")" _ ( _ ("and"/"or") _ ConditionExpressionFor)*

BooleanForContext1
	= _ (ForVariableOperation / BooleanForContext / InInterval / StringSet / ConditionVariable) _ ( _ ("and"/"or") _ ConditionExpressionFor)*

ForVariableOperation
	= _ ("filesize"/ForVariable/DataAccess/ImportFunction/ConditionVariableNumeric/VirtualAddress/CondInteger/String) _ ConditionOperatorNumeric _ 
    ("filesize"/ForVariable/DataAccess/ImportFunction/ConditionVariableNumeric / VirtualAddress /CondInteger / String / "("ConditionVariableOperation+")") 
    (_ ConditionOperatorNumeric _ ("filesize"/ForVariable/DataAccess/ImportFunction/ConditionVariableNumeric / VirtualAddress / CondInteger /String / "("ConditionVariableOperation+")"))?

ForVariable
	= [@!]? (VariableName ".")? VariableName ("[" _ (VariableName/[0-9]+) _ "]")? ("." VariableName)?

ForInterval
 = _ ("any"/"all"/"none"/Integer) _ VariableName _ ("," _ VariableName)* _ "in" _ "(" ConditionVariableInterval ".." ConditionVariableInterval ")" _ { return text().trim() }

ArraySub
	= "["[0-9]+"]"

NumericOperator
	= _ ([\-\*\\%\+&^|]/"<<"/">>") _ { return text().trim() }

Variable
	= _ key:("$"VariableName) _ "=" _ val:VariableBody _n { return [key.join('')+" = ", val] }
    
VariableBody
	= HexString / TextString / Regex

ImportFunction
	= ("pe"/"cuckoo")"."VariableName

TextString
	= "\"" str:(Escape / [^\"\\])* "\"" [ ]* mod:StringModifier? { return ["\""+str.join('')+"\"",mod]}

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
	= key:[a-zA-Z0-9]+ _ "=" _ val:(Integer / String / "true" / "false") _ { return key.join('')+" = "+val }
    
String
	= "\"" str:[^\"]* "\"" { return "\""+str.join('')+"\""}
    
Integer "integer"
  	=( _ ("(" _ (ConditionVariableNumeric/Integer/ [0-9]+) _ (_ NumericOperator _ Integer)* _ ")" _ 
    / _ (ConditionVariableNumeric/[0-9]+) (_ NumericOperator _ Integer)* _ )) { return text().trim(); }
 
CondInteger
	= _ [0-9]+("KB"/"MB")?
  
NumberLower256
	= num:([2][5][0-6] / [2][0-4][0-9] / [1][0-9][0-9] / [1-9][0-9] / [0-9])
    { if( typeof num === 'string' ) return num; else return num.join('') }

//TODO controllare che ogni modificatore sia presente una sola volta
StringModifier
	= mod:"nocase" mod1:(__ !("xor")!("base64")!("base64wide") m:AllModifier {return m} )* { return [mod].concat(mod1) } 
    / mod:"wide" mod1:(__ m:AllModifier {return m} )* { return [mod].concat(mod1) } / mod:"ascii" mod1:(__  m:AllModifier {return m} )* { return [mod].concat(mod1) }
    / mod:"xor" mod1:(__ !("nocase")!("base64")!("base64wide") m:AllModifier {return m} )* { return [mod].concat(mod1) }
    / mod:"base64" al:CustomAlphabet? mod1:(__ !("xor")!("nocase")!("fullword") m:AllModifier {return m} )* { return [mod, al].concat(mod1) }
    / mod:"base64wide" al:CustomAlphabet? mod1:(__ !("xor")!("nocase")!("fullword") m:AllModifier {return m} )* { return [mod, al].concat(mod1) }
    / mod:"fullword" mod1:(__ !("base64")!("base64wide") m:AllModifier {return m} )* { return [mod].concat(mod1) }
	/ mod:"private" mod1:(__  m:AllModifier {return m} )* { return [mod].concat(mod1) }

RegexModifier
	= "nocase" (__ ReModifier)*
    / "wide" (__ ReModifier)* / "ascii" (__ ReModifier)*
    / "fullword" (__ ReModifier)*
	/ "private" (__ ReModifier)*

CustomAlphabet
	= "(\"" alphabet:( Escape / HexChar / [a-zA-Z0-9!@#$%^&*\(\)\{\}\[\]\.\-|] )+ "\")"
    { if(alphabet.length != 64) error("invalid alphabet size, it must be 64 bytes long"); else return "(\""+alphabet.join('')+"\")" }

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
	= [_a-zA-Z][_\-$a-zA-Z0-9]* { return text().trim() }
   
HexChar
	= "\\x"[0-9a-fA-F].{2}

_ "whitespace"
  = [ \t\n\r]*
  
__ "atLeastOneWhitespace"
	= [ ]+
    
_n "newline"
	= ([ ]*[\n]+[ ]*)+
`