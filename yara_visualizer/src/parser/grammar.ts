
export const grammar = `
{var stringsVar = []; var condVar = [];}

Rules
= $1:(imp:Import* _ {return imp}) $2:( type:RuleType? r:Rule {return {ruleType: type, rule:r}})+ { return {imports: $1, rules: $2} }

Comment
= "//" (![\\n] .)* / "/*" (!"*/" .)* "*/"

RuleType
= p:"private" __ g:"global" __ { return { global: true, private: true} }  
    / g:"global" __ p:"private" __ { return { global: true, private: true} }
    / v:("global"/"private") __ { let g = (v === 'global') ? true : false; let p = (v === 'private') ? true : false; return { global: g, private: p} }
    

Rule
= _ "rule" name:RuleName tag:(":" r:RuleNameImport+ {return r;})? body:("{" _ meta:("meta:" m:Meta {return m})? _ str:("strings:" s:Strings {return s})? _ cond:("condition:" c:Condition {return c}) _ "}" 
	{return { meta: meta, strings: str, condition: cond} }) _
	{ 
        if(condVar.indexOf("*") === -1)
        {
            for(let i = 0; i < stringsVar.length; i++)
            {
                let found = false;
                for(let j = 0; j < condVar.length; j++)
                {
                    const regexPattern = condVar[j].replace(/\\*/g, '.*');
                    if(stringsVar[i].match(regexPattern) != null)
                    {
                        found = true;
                        break;
                    }
                }
                if(!found)
                    error("Variable $"+stringsVar[i]+" not referenced in condition");
            }
        }
        return {name: name, tags: tag, body: body}
    }

//TODO: Implment Anonymous strings

Import
=  _ i:"import" _ name:("\\"" ([_a-zA-Z][_\\-$a-zA-Z0-9]*) "\\"") _n { return i+" "+name.join('') }

RuleName
= __ [_a-zA-Z][_\\-a-zA-Z0-9$]* _ { return text().trim() }
    
RuleNameImport
= _ [_a-zA-Z][_\\-a-zA-Z0-9$]* _ { return text().trim() }

Meta
= _ val:KeyValuePair+ _ { return val}
    
Strings
= Variable+ 
    
Condition
= _ def:("not defined"/"not")? _ exp:(BooleanExpression / BooleanExpression1 )  _ 
    { return { prefix: def, expression: exp} }

ConditionExpression
=   def:("not defined"/"not")? _ exp:(InInterval/StringSet/ ConditionVariableOperation / For / BooleanExpression1 / BooleanExpression / ConditionVariable)
    { return { prefix: def, expression: exp} }
    
BooleanExpression
= "(" _ b1:ConditionExpression _ ")" _ op:("and"/"or") _ b2:ConditionExpression { return { left: b1, operator: op , right: b2} }
	/  "(" _ b1:ConditionExpression _ ")" {return b1}

BooleanExpression1
= _ b1:(InInterval/ StringSet / ConditionVariableOperation / For / BooleanExpression / ConditionVariable) _ op:("and"/"or") _ b2:ConditionExpression { return { left: b1, operator: op , right: b2} }
	/  _ b1:(InInterval/ StringSet / ConditionVariableOperation / For / BooleanExpression / ConditionVariable) {return b1}



    
ConditionVariable
=("not defined"/"not")? _ not:"~"? _ type:[#$@!] name:VariableName sub:ArraySub? 
    { if(((type === '#' || type === '$') && sub) || (type === '$' && not)) error("syntax error"); else return {variable:text().trim(), var_name: name} }

ConditionVariableOperation
= _ lb:"("? c1:(DataAccess/ImportFunction/ConditionVariableNumeric/VirtualAddress/CondInteger/Integer) rb:")"? _ op:ConditionOperatorNumeric _ 
    c2:("(" _ c:(DataAccess/ImportFunction/ConditionVariableNumeric / VirtualAddress /CondInteger/Integer) _ ")" {return c}/ (DataAccess/ImportFunction/ConditionVariableNumeric / VirtualAddress /CondInteger/Integer)) 
    { if((lb != null && rb != null) || (lb == null && rb == null) )return {left: c1, operator: op, right: c2}; else error("syntax error") }
    
ConditionVariableNumeric
= _ "~"? _ type:[#@!] name:VariableName sub:ArraySub? _ {if((type === '#') && sub) error("syntax error"); else return {variable:text().trim(), var_name: name}}

InInterval
= _ def:("not defined"/"not")? _ arg:("$" VariableName {return text().trim()}/StringSet) _ op:"at" _ int:(CondInteger / "(" _ c:CondInteger _ ")" { return ["(",c,")"]})
    { return { prefix: def, left: arg, operator:op, right: int} }
    / _ def:("not defined"/"not")? arg:IntervalVariable _ op:"in" _ int:("(" int1:ConditionVariableInterval op1:".." int2:ConditionVariableInterval ")" { return {left: int1, operator: op1, right: int2}} )
    { return { prefix: def, left: arg, operator:op, right: int} }

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
= val:("any"/ "all" / "none" / Integer) _ op:"of" __ 
    range:(a:"them" {return [a]} /"(" _ arg:("$*"/"$" name:VariableName wild:"*"? other:(_ "," _ "$" n:VariableName w:"*"? {let _w = (w != null) ? w : ""; condVar.push(n+_w); return "$"+n+_w })*
    	{ let _wild = (wild != null) ? wild : ""; condVar.push(name+_wild); return ["$"+name+_wild].concat(other) }) _ ")"
        { if(arg === "$*") condVar.push("*"); return arg} ) { return {left: val, operator: op, right: range} }

//TODO Check that the variable used for accessing the data is referenced in 'ForInterval'
For
= op:"for" __ int:(StringSet/ForInterval) _ ":" _ "(" arg:ForContext ")"  { return { left: int, operator: op, right: arg} }
    
ForContext
= _  def:("not defined"/"not")? _ exp:(BooleanForContext/BooleanForContext1/SpecialForVariable) _ { return { prefix: def, expression: exp} }

ConditionExpressionFor
=   def:("not defined"/"not")? _ exp:(InIntervalFor / StringSet /ForVariableOperation / BooleanForContext1 / BooleanForContext / ConditionVariable)
    	{ return { prefix: def, expression: exp} }

BooleanForContext
= "(" _ b1:ConditionExpressionFor _ ")" _ op:("and"/"or") _ b2:ConditionExpressionFor _ { return { left: b1, operator: op , right: b2} }
	/ "(" _ b1:ConditionExpressionFor _ ")" {return b1}
	
BooleanForContext1
= _ b1:(InIntervalFor / StringSet /ForVariableOperation / BooleanForContext / ConditionVariable) _ op:("and"/"or") _ exp:ConditionExpressionFor _ { return { left: b1, operator: op , right: b2} }
	/ _ b1:(InIntervalFor / StringSet /ForVariableOperation / BooleanForContext / ConditionVariable) {return b1}


InIntervalFor
= _ def:("not defined"/"not")? _ arg:("$" VariableName {return text().trim()}/StringSet/SpecialForVariable) _ op:"at" _ int:(CondInteger / "(" _ c:CondInteger _ ")" { return c})
    { return { prefix: def, left: arg, operator:op, right: int} }
    / _ def:("not defined"/"not")? _ arg:(IntervalVariable/SpecialForVariable) _ op:"in" _ "(" int1:(i1:ConditionVariableInterval ".." i2:ConditionVariableInterval {return {left: i1, operator: "..", right:i2}}) ")"
    { return {prefix: def, left: arg, operator:op, right: int1} }

ForVariableOperation
= _ lb:"("? _ c1:(ForVariable/DataAccess/ImportFunction/ConditionVariableNumeric/VirtualAddress/CondInteger/String/Integer/SpecialForVariable) _ rb:")"? _ op:ConditionOperatorNumeric _ 
     c2:("(" _ c:(ForVariable/DataAccess/ImportFunction/ConditionVariableNumeric / VirtualAddress /CondInteger / String / Integer/ SpecialForVariable) _ ")" {return c}/(ForVariable/DataAccess/ImportFunction/ConditionVariableNumeric / VirtualAddress /CondInteger / String / Integer/ SpecialForVariable))
	{ if((lb != null && rb != null) || (lb == null && rb == null) )
    	return {left: c1, operator: op, right: c2};
      else
       	error("syntax error") }

    
ForVariable
= ([@!]? (VariableName ".")? VariableName ("[" _ (VariableName/[0-9]+) _ "]")?/SpecialForVariable) ("." VariableName)?  {return text().trim()}

ForInterval
 = _ val:("any"/"all"/"none"/Integer) _ name1:VariableName _ name2:("," _ v:VariableName {return v})* _ "in" _ 
 "(" _ int1:(i1:ConditionVariableInterval ".." i2:ConditionVariableInterval {return [i1,"..",i2]} / 
 	     n1:Integer _ n2:("," _ _n:Integer {return _n;})* {return [n1].concat(n2)} /
     	 n1:String _ n2:("," _ _n:String {return _n;})* {return [n1].concat(n2)} /
         n1:("$" VariableName {return text().trim()}) _ n2:("," _ _n:("$" VariableName {return text().trim()}) {return _n;})* {return [n1].concat(n2)}) _ ")" _
 	{ return [val].concat([name1].concat(name2)).concat(["in",["("].concat(int1).concat([")"])]) }

ArraySub
= "["[0-9]+"]" {return text().trim() }

NumericOperator
= _ ([\\-\\*\\\\%\\+&^|]/"<<"/">>") _ { return text().trim() }

Variable
= _ key:("$"VariableNameStrings) _ op:"=" _ val:VariableBody _n { return { left: key.join(''), operator: op, right: val} } 

VariableBody
= v:HexString {return { type: "hex", ...v}}/ v:TextString {return {type: "str", ...v}}/ v:Regex {return {type: "regex", ...v}}

ImportFunction
= ("pe"/"cuckoo")"."VariableName {return text().trim() }

TextString
= "\\"" str:(Escape / [^\\\\\\"])* "\\"" [ ]* mod:StringModifier? 
{
    let _mod = []; 
    if(mod != null)
    {
        for(let i = 0; i < mod.length; i++)
            _mod.push(mod[i].modifier);

        //check if there are duplicate modifiers
        let _mod1 = _mod.slice();
        _mod1.sort();
        for(let i = 0; i < _mod1.length - 1; i++)
            if(_mod1[i + 1] === _mod1[i])
                error("duplicate modifier");
        
    }
    return { string: str.join(''), modifier:mod}
}

Regex
= "/" reg:("^"? RegularExpression "$"? {return text()}) "/" tag:("is"/"i"/"s")? [ ]* mod:RegexModifier?
    { 	
        if(mod != null)
        {
            let _mod = mod.slice();
            _mod.sort();
            for(let i = 0; i < _mod.length - 1; i++)
                if(_mod[i + 1] === _mod[i])
                    error("duplicate modifier");
        }
        let insensitive = (tag === 'i' || tag === 'is') ? true : false;
    	let newLine = (tag === 's' || tag === 'is') ? true : false;
        return { regex: reg, case_insensitive: insensitive, match_newLine: newLine, modifier: mod }
    }

HexString
= "{" _ arg:( q:(HexByte / Jump / OrHex) __ {return q})+ _ "}" [ ]* p:"private"?
    { let _p = (p != null) ? true : false; return { args: arg, private: _p } }

SpecialForVariable
= "@"/"#"/"$"

RegularExpression
= (Grouping / Bracketed / RegexChar)+ {return text()}
    
Grouping
= "(" reg:RegularExpression+ ")" q:Quantifier? { return text() }
    
Bracketed
= "["r1:(RegexChar "^" RegexChar / "^" RegexChar)? r2:RegularExpression* "]" q:(q1:Quantifier? {if(q1 != null) return q1; else return []})
    { if(r1 != null || r2.length > 0)
    	return text();
       else 
        error("invalid regex interval") 
    }

RegexChar
= ("\\\\t"/"\\\\n"/"\\\\r"/"\\\\f"/"\\\\a"/"\\\\xNN"
    /"\\\\w"/"\\\\W"/"\\\\s"/"\\\\S"/"\\\\d"/"\\\\D"/"\\\\b"/"\\\\B"
    /"\\\\\\\\" / "\\\\("/"\\\\)"/"\\\\["/"\\\\]"/"\\\\{"/"\\\\}"/"\\\\-"
    /"\\\\."/"\\\\+"/"\\\\*"/"\\\\|"/"\\\\?"/"\\\\$"/"\\\\^"/"\\\\/"
    /[^/\\\\\\(\\)\\[\\]\\{\\}\\.\\*\\+?$^])+ { return text() }

Quantifier
= val:([*+?] / "{"( RegexOccurrenceInterval / [0-9]+","? {return text()}/ ","?[0-9]+ {return text() })"}")mark:"?"? 
    	{if( mark!= null) return val.concat(mark); else return val}
    
RegexOccurrenceInterval
= lb:[0-9]+","ub:[0-9]+ { if(parseInt(lb.join(''),10) > parseInt(ub.join(''),10)) error("invalid interval"); else return [lb.join(''),ub.join('')]}

HexByte
= _ "~"?[?0-9A-Fa-f][?0-9A-Fa-f] { return text().trim() }
    
Jump
= _ "["_ val:( Interval256 / NumberLower256 / "-") _ "]" { return "["+val+"]" }
    
Interval256
= lb:NumberLower256 "-" ub:NumberLower256?
    { if( ub && parseInt(lb,10) > parseInt(ub,10)) error("invalid interval"); else return text().trim() }    

OrHex
= _ "("_ l:( l1:OrHex l2:( __ o:OrHex {return o })* {return [l1].concat(l2)}) r:(_ "|"
    _ _r:( r1:OrHex r2:( __ o:OrHex {return o })* {return [r1].concat(r2)}) {return _r} )+ _ ")" {return {left: l, right: r} }
    / Jump/ h:HexByte { return h }
   

KeyValuePair
= key:([_a-zA-Z][a-zA-Z0-9_]+) _ op:"=" _ val:([0-9]+ / String / "true" / "false") _ { return { left:key.join(''), operator:op, right:val }}
    
String
= "\\"" str:[^\\"]* "\\"" { return "\\""+str.join('')+"\\""}
    
Integer "integer"
=( _ ("(" _ ("filesize"/ConditionVariableNumeric/Integer/ [0-9]+) _ (_ NumericOperator _ Integer)* _ ")" _ 
    / _ ("filesize"/ConditionVariableNumeric/[0-9]+) (_ NumericOperator _ Integer)* _ )) { return text().trim(); }
    
CondInteger
= _ num:[0-9]+ dim:("KB"/"MB")? { if(dim) return [num.join(''), dim]; else return num.join('') }
  
NumberLower256
= num:([2][5][0-6] / [2][0-4][0-9] / [1][0-9][0-9] / [1-9][0-9] / [0-9])
    { if( typeof num === 'string' ) return num; else return num.join('') }

StringModifier
= mod:"nocase" mod1:(__ !("xor")!("base64")!("base64wide") m:AllModifier {return m} )* { return [{modifier: mod, customAlphabet: null}].concat(mod1) } 
    / mod:"wide" mod1:(__ m:AllModifier {return m} )* { return [{modifier: mod, customAlphabet: null}].concat(mod1) } / mod:"ascii" mod1:(__  m:AllModifier {return m} )* { return [{modifier: mod, customAlphabet: null}].concat(mod1) }
    / mod:"xor" mod1:(__ !("nocase")!("base64")!("base64wide") m:AllModifier {return m} )* { return [{modifier: mod, customAlphabet: null}].concat(mod1) }
    / mod:Base64Mod mod1:(__ !("xor")!("nocase")!("fullword") m:AllModifier {return m} )* { return [mod].concat(mod1) }
    / mod:"fullword" mod1:(__ !("base64")!("base64wide") m:AllModifier {return m} )* { return [{modifier: mod, customAlphabet: null}].concat(mod1) }
	/ mod:"private" mod1:(__  m:AllModifier {return m} )* { return [{modifier: mod, customAlphabet: null}].concat(mod1) }

RegexModifier
= arg:("nocase" (__ r:ReModifier {return r})*
    / "wide" (__ r:ReModifier {return r})* / "ascii" (__ r:ReModifier {return r})*
    / "fullword" (__ r:ReModifier {return r})*
	/ "private" (__ r:ReModifier {return r})*) { return [arg[0]].concat(arg[1]) }

CustomAlphabet
= "(\\"" alphabet:( Escape / HexChar / [a-zA-Z0-9!@#$%\\^&\\*\\(\\)\\{\\}\\[\\]\\.\\-,|] )+ "\\")"
    { if(alphabet.length != 64) error("invalid alphabet size, it must be 64 bytes long"); else return "(\\""+alphabet.join('')+"\\")" }

DataAccess
= u:"u"? i:"int" num:("8"/"16"/"32") be:"be"? "(" _ arg:(VirtualAddress/Integer/CondInteger/DataAccess)_ ")"
    {
    	let u1 = ""
        let be1 = ""
        if(u != null)
        	u1 = u;
        if(be != null)
        	be1 = be;
        return {operator:u1+i+num+be1, arg: arg};
    }

VirtualAddress
= "0x"[0-9a-fA-F]+ { return text().trim() }

ReModifier
= ("nocase" / "ascii" / "wide" / "fullword" / "private")

AllModifier
= m:("nocase" / "ascii" / "wide" / "fullword" / "xor" / "private") { return {modifier: m, customAlphabet: null}} 

Base64Mod
= mod:("base64wide"/"base64") al:CustomAlphabet? { return {modifier: mod, customAlphabet: al}} 

ConditionOperatorNumeric
= ("<<" / ">>" / "<=" / ">=" / "==" / "!=" 
    /[\\-\\*\\\\%\\+&^|<>]) {return text().trim() }

ConditionOperatorStrings
= ("i"? ("contains"/"startswith"/"endswith") / "iequals" / "matches") { return text().trim() }

Escape
= "\\\\\\"" / "\\\\\\\\" / "\\\\t" / "\\\\n" / "\\\\xdd"

VariableName
= [_a-zA-Z][_\\-$a-zA-Z0-9]* { condVar.push(text().trim()); return text().trim() }


VariableNameStrings
= [_a-zA-Z][_\\-$a-zA-Z0-9]* { stringsVar.push(text().trim()); return text().trim() }
   
HexChar
= ("\\\\x"[0-9a-fA-F].{2}) { return text().trim()}

_ "whitespace"
  = [ \\t\\n\\r]* Comment?
  
__ "atLeastOneWhitespace"
= [ ]+ Comment?
    
_n "newline"
= ([ ]*[\\n]+[ ]*)+ Comment?
`;