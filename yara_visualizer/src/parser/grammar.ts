
const GRAMMAR = `
Rules
	= (imp:Import* _ {return imp}) ( RuleType? Rule)+

RuleType
	= (p:"private" __ g:"global" __ { return [p,g] }  
    / g:"global" __ p:"private" __ { return [p,g] }
    / ("global"/"private") __) { return text().trim() }
    

Rule
  	= _ rule:"rule" RuleName tag:(":" RuleNameImport+)? body:("{" _ meta:("meta:"Meta)? _ str:("strings:"Strings)? _ cond:("condition:"Condition) _ "}" {return [meta, str, cond] }) _
	{ return [rule, tag, body] }

//TODO: Implment Anonymous strings

Import
	=  _ i:"import" _ name:("\"" VariableName "\"") _n { return i+" "+name.join('') }

RuleName
	= __ [_a-zA-Z][_\-$a-zA-Z0-9]* _ { return text().trim() }
    
RuleNameImport
	= _ [_a-zA-Z][_\-$a-zA-Z0-9]* _ { return text().trim() }

Meta
	= _ val:KeyValuePair+ _ { return val}
    
Strings
	= Variable+ 
    
Condition
	= _ def:("not defined"/"not")? _ exp:(BooleanExpression / BooleanExpression1 )  _ 
    { if(def!=null) return [def,exp]; else return exp }

ConditionExpression
	=   def:("not defined"/"not")? _ exp:(ConditionVariableOperation / For / BooleanExpression1 / BooleanExpression / InInterval / StringSet / ConditionVariable)
    { if(def!=null) return [def,exp]; else return exp }
    
BooleanExpression
	= "(" _ b:ConditionExpression _ ")" _ b1:( _ log:("and"/"or") _ exp:ConditionExpression { return [log,exp]} )*
    { return ["(",b,")"].concat(b1) }

BooleanExpression1
	= _ b:(ConditionVariableOperation / For / BooleanExpression / InInterval / StringSet / ConditionVariable) _ b1:( _ log:("and"/"or") _ exp:ConditionExpression { return [log, exp] })*
    { return [b].concat(b1) }


    
ConditionVariable
	=("not defined"/"not")? _ not:"~"? _ type:[#$@!] name:VariableName sub:ArraySub? 
    { if(((type === '#' || type === '$') && sub) || (type === '$' && not)) error("syntax error"); else return text().trim() }

ConditionVariableOperation
	= _ c1:("filesize"/DataAccess/ImportFunction/ConditionVariableNumeric/VirtualAddress/CondInteger) _ op:ConditionOperatorNumeric _ 
    c2:("filesize"/DataAccess/ImportFunction/ConditionVariableNumeric / VirtualAddress /CondInteger / "("ConditionVariableOperation+")") 
    c3:(_ op1:ConditionOperatorNumeric _ c:("filesize"/DataAccess/ImportFunction/ConditionVariableNumeric / VirtualAddress / CondInteger / "("ConditionVariableOperation+")") {return op1+c})?    
    { if(c3!=null) return [c1,op,c2,c3]; else return [c1,op,c2] }
    
ConditionVariableNumeric
	= _ "~"? _ type:[#@!] name:VariableName sub:ArraySub? _ {if((type === '#') && sub) error("syntax error"); else return text().trim()}

InInterval
	= _ def:("not defined"/"not")? _ arg:("$" VariableName {return text().trim()}/StringSet) _ "at" _ int:(CondInteger / "(" _ c:CondInteger _ ")" { return ["(",c,")"]})
    { let def1 = (def != null) ? [def ]: []; return def1.concat([arg,"at",int])}
    / val:IntervalVariable _ "in" _ "(" int1:ConditionVariableInterval ".." int2:ConditionVariableInterval ")"
    { return [val].concat(["in",["("].concat(int1).concat([".."].concat(int2).concat([")"]))]) }

IntervalVariable
	= not:"~"? type:[$#] VariableName { if(not && type === '$') error("syntax error"); else return text().trim() }  / StringSet 

ConditionVariableInterval
	= _ def:("not defined"/"not")? _ tl:"~"? _ int1:(_ def1:("not defined"/"not")? _ tl1:"~"? 
    _ c:("(" _ c1:(ConditionVariableNumeric/CondInteger/"filesize"/ImportFunction) _ ")" {return ["(",c1,")"]}/c1:(ConditionVariableNumeric/CondInteger/"filesize"/ImportFunction) {return [c1] })
    { let _def1 = (def1 != null) ? def1 : []; let _tl1 = (tl1 != null) ? tl1 : []; return _def1.concat(_tl1).concat(c) })
    _ int2:(op:NumericOperator _ tl2:"~"? _ int:(ConditionVariableNumeric / CondInteger /"filesize"/ImportFunction/"(" _ c:ConditionVariableInterval+ _ ")" {return ["(",c,")"]})
    	{let _tl2 = (tl2 != null) ? tl2 : []; return [op].concat(_tl2).concat(int)})?
    _ int3:(op:NumericOperator _ tl2:"~"? _ int:(ConditionVariableNumeric / CondInteger /"filesize"/ImportFunction/"(" _ c:ConditionVariableInterval+ _ ")" {return ["(",c,")"]})
    	{let _tl2 = (tl2 != null) ? tl2 : []; return [op].concat(_tl2).concat(int)})?
    { let _def = (def != null) ? def : []; let _tl = (tl != null) ? tl : [];
      let _int2 = (int2 != null) ? int2 : []; let _int3 = (int3 != null) ? int3 : [];
    	return _def.concat(_tl).concat(int1).concat(_int2).concat(_int3)
    }

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
	= "["[0-9]+"]" {return text().trim() }

NumericOperator
	= _ ([\-\*\\%\+&^|]/"<<"/">>") _ { return text().trim() }

Variable
	= _ key:("$"VariableName) _ "=" _ val:VariableBody _n { return [key.join('')+" = ", val] }
    
VariableBody
	= HexString / TextString / Regex

ImportFunction
	= ("pe"/"cuckoo")"."VariableName {return text().trim() }

TextString
	= "\"" str:(Escape / [^\"\\])* "\"" [ ]* mod:StringModifier? { return ["\""+str.join('')+"\"",mod]}

Regex
	= reg:(("/^"/"/") RegularExpression ("/"/"$/")) tag:(t:("is"/"i"/"s")? {if(t!=null) return t; else return []}) [ ]* mod:RegexModifier?
    { if(mod!=null) return reg.concat(tag).concat(mod); else return reg.concat(tag) }

HexString
	= "{" _ arg:( q:(HexByte / Jump / OrHex) __ {return q})+ _ "}" [ ]* p:"private"?
    { if(p) return ["{",arg,"}",p]; else return ["{",arg,"}"] }


RegularExpression
	= (Grouping / Bracketed / RegexChar)+
    
Grouping
	= "(" reg:RegularExpression+ ")" q:Quantifier? { if(q!=null) return ["("].concat(reg).concat([")"]).concat(q); else return ["("].concat(reg).concat([")"]) }
    
Bracketed
	= "["r1:(RegexChar "^" RegexChar / "^" RegexChar)? r2:RegularExpression* "]" q:(q1:Quantifier? {if(q1 != null) return q1; else return []})
    { if(r1 != null || r2.length > 0)
    	if(r1 != null)
        	return ["["].concat(r1).concat(r2).concat("]").concat(q);
        else
    		return ["["].concat(r2).concat("]").concat(q);
        else 
        	error("invalid regex interval") 
    }

RegexChar
	= ("\\t"/"\\n"/"\\r"/"\\f"/"\\a"/"\\xNN"
    /"\\w"/"\\W"/"\\s"/"\\S"/"\\d"/"\\D"/"\\b"/"\\B"
    /"\\\\"/"\\("/"\\)"/"\\["/"\\]"/"\\{"/"\\}"/"\\-"
    /"\\."/"\\+"/"\\*"/"\\|"/"\\?"/"\\$"/"\\^"/"\\/"
    /[^/\\\(\)\[\]\{\}\.\*\+?$^])+ { return text() }

Quantifier
	= val:([*+?] / "{"( RegexOccurrenceInterval / [0-9]+","? {return text()}/ ","?[0-9]+ {return text() })"}")mark:"?"? 
    	{if( mark!= null) return val.concat(mark); else return val}
    
RegexOccurrenceInterval
	= lb:[0-9]+","ub:[0-9]+ { if(parseInt(lb.join(''),10) > parseInt(ub.join(''),10)) error("invalid interval"); else return [lb.join(''),ub.join('')]}

HexByte
	= _ "~"?[?0-9A-Fa-f][?0-9A-Fa-f] { return text().trim() }
    
Jump
	= _ "["_ val:( Interval256 / NumberLower256 / "-") _ "]" { return ["[",val,"]"] }
    
Interval256
	= lb:NumberLower256 "-" ub:NumberLower256?
    { if( ub && parseInt(lb,10) > parseInt(ub,10)) error("invalid interval"); else return text() }
    
OrHex
	= _ "("_ l:( l1:OrHex l2:( __ o:OrHex {return o })* {return [l1].concat(l2)}) _ "|"
    _ r:( r1:OrHex r2:( __ o:OrHex {return o })* {return [r1].concat(r2)}) _ ")" {return ["(",l,"|",r,")"]}
    / h:HexByte { return h }
   

KeyValuePair
	= key:[a-zA-Z0-9]+ _ "=" _ val:(Integer / String / "true" / "false") _ { return key.join('')+" = "+val }
    
String
	= "\"" str:[^\"]* "\"" { return "\""+str.join('')+"\""}
    
Integer "integer"
  	=( _ ("(" _ (ConditionVariableNumeric/Integer/ [0-9]+) _ (_ NumericOperator _ Integer)* _ ")" _ 
    / _ (ConditionVariableNumeric/[0-9]+) (_ NumericOperator _ Integer)* _ )) { return text().trim(); }
 
CondInteger
	= _ num:[0-9]+ dim:("KB"/"MB")? { if(dim) return [num.join(''), dim]; else return num.join('') }
  
NumberLower256
	= num:([2][5][0-6] / [2][0-4][0-9] / [1][0-9][0-9] / [1-9][0-9] / [0-9])
    { if( typeof num === 'string' ) return num; else return num.join('') }

//TODO controllare che ogni modificatore sia presente una sola volta
StringModifier
	= mod:"nocase" mod1:(__ !("xor")!("base64")!("base64wide") m:AllModifier {return m} )* { return [mod].concat(mod1) } 
    / mod:"wide" mod1:(__ m:AllModifier {return m} )* { return [mod].concat(mod1) } / mod:"ascii" mod1:(__  m:AllModifier {return m} )* { return [mod].concat(mod1) }
    / mod:"xor" mod1:(__ !("nocase")!("base64")!("base64wide") m:AllModifier {return m} )* { return [mod].concat(mod1) }
    / mod:"base64" al:CustomAlphabet? mod1:(__ !("xor")!("nocase")!("fullword") m:AllModifier {return m} )* { return [mod, [al]].concat(mod1) }
    / mod:"base64wide" al:CustomAlphabet? mod1:(__ !("xor")!("nocase")!("fullword") m:AllModifier {return m} )* { return [mod, [al]].concat(mod1) }
    / mod:"fullword" mod1:(__ !("base64")!("base64wide") m:AllModifier {return m} )* { return [mod].concat(mod1) }
	/ mod:"private" mod1:(__  m:AllModifier {return m} )* { return [mod].concat(mod1) }

RegexModifier
	= arg:("nocase" (__ r:ReModifier {return r})*
    / "wide" (__ r:ReModifier {return r})* / "ascii" (__ r:ReModifier {return r})*
    / "fullword" (__ r:ReModifier {return r})*
	/ "private" (__ r:ReModifier {return r})*) { return [arg[0]].concat(arg[1]) }

CustomAlphabet
	= "(\"" alphabet:( Escape / HexChar / [a-zA-Z0-9!@#$%^&*\(\)\{\}\[\]\.\-,|] )+ "\")"
    { if(alphabet.length != 64) error("invalid alphabet size, it must be 64 bytes long"); else return "(\""+alphabet.join('')+"\")" }

DataAccess
	= u:"u"? i:"int" num:("8"/"16"/"32") be:"be"? "(" _ arg:(VirtualAddress/CondInteger/DataAccess)_ ")"
    {
    	let u1 = ""
        let be1 = ""
        if(u != null)
        	u1 = u;
        if(be != null)
        	be1 = be;
        return [u1+i+num+be1,["(",arg,")"]];
    }

VirtualAddress
	= "0x"[0-9a-fA-F]+ { return text().trim() }

ReModifier
	= ("nocase" / "ascii" / "wide" / "fullword" / "private")

AllModifier
	= ("nocase" / "ascii" / "wide" / "fullword" / "base64" / "base64wide" / "xor" / "private")

ConditionOperatorNumeric
	= ("<<" / ">>" / "<=" / ">=" / "==" / "!=" 
    /[\-\*\\%\+&^|<>]) {return text().trim() }

ConditionOperatorStrings
	= ("i"? ("contains"/"startswith"/"endswith") / "iequals" / "matches") { return text().trim() }

Escape
	= "\\\"" / "\\\\" / "\\t" / "\\n" / "\\xdd"

VariableName
	= [_a-zA-Z][_\-$a-zA-Z0-9]* { return text().trim() }
   
HexChar
	= ("\\x"[0-9a-fA-F].{2}) { return text().trim()}

_ "whitespace"
  = [ \t\n\r]*
  
__ "atLeastOneWhitespace"
	= [ ]+
    
_n "newline"
	= ([ ]*[\n]+[ ]*)+
`