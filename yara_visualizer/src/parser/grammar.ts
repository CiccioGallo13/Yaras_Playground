
const GRAMMAR = `

Expression
  = "rule" _ [_a-zA-Z][_\-$a-zA-Z0-9]* _ "{" _
  	Meta? _ Strings? _ Condition _ "}"
    
Meta
	= "meta:" _ KeyValuePair+ _
    
Strings
	= "strings:" _ Variable+ _
    
Condition
	= "condition:" _ 
  	

Variable
	= "$"[_a-zA-Z][_\-$a-zA-Z0-9]* _ "=" _ VariableBody
    
VariableBody
	= HexString // TextString / Regex
    
HexString
	= "{" _ (HexByte __ / Jump __/ OrHex __)+ _ "}"

HexByte
	= _ "~"?[?0-9ABCDEF].{2}
    
//TODO Il numero a destra dovrebbe essere sempre >= di quello a sinistra

Jump
	= _ "["_ ( (NumberLower256 "-" NumberLower256?) / NumberLower256 / "-") _ "]"
    
OrHex
	= _ "("_ OrHex+ _ "|" _ OrHex+ _ ")" / HexByte __
   

KeyValuePair
	= [a-zA-Z0-9]+ _ "=" _ (Integer / String / "true" / "false") _
    
String
	= "\"" [^\"]* "\""
    
Integer "integer"
  = _ [0-9]+ { return parseInt(text(), 10); }
  
NumberLower256
	= ([2][5][0-6]) / ([2][0-4][0-9]) / ([1][0-9][0-9]) / [1-9][0-9] / [0-9]

_ "whitespace"
  = [ \t\n\r]*
  
__ "atLeastOneWhitespace"
	= [ ]+

`