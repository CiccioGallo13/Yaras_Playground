export const metaInfo = `
<p>Besides the string definition and condition sections, rules can also have a metadata section where you can put additional information about your rule.
The metadata section is defined with the keyword meta and contains identifier/value pairs like in the following example: </p>

<pre>
rule MetadataExample
{
    meta:
        my_identifier_1 = "Some string data"
        my_identifier_2 = 24
        my_identifier_3 = true

    strings:
        $my_text_string = "text here"
        $my_hex_string = { E2 34 A1 C8 23 FB }

    condition:
        $my_text_string or $my_hex_string
}
</pre>

<p>As can be seen in the example, metadata identifiers are always followed by an equals sign and the value assigned to them.
The assigned values can be strings (valid UTF8 only), integers, or one of the boolean values true or false.
Note that identifier/value pairs defined in the metadata section cannot be used in the condition section, their only purpose is to store additional information about the rule.</p>

<p>The metadata section is optional and can be omitted if no additional information is needed. If present, the metadata section must be placed before the strings section. </p>


<p>Full documentation at: <a style="color: var(--color-active); text-align: center; display: inline-block;" href="https://yara.readthedocs.io/">https://yara.readthedocs.io/</a>  </p>
`

export const stringsInfo = `
<p>There are three types of strings in YARA: hexadecimal strings, text strings and regular expressions. Hexadecimal strings are used for defining raw sequences of bytes,
while text strings and regular expressions are useful for defining portions of legible text. However text strings and regular expressions can be also used for representing raw bytes by mean of escape sequences. </p>

<p>
<h6>Hexadecimal Strings:</h6> These represent raw sequences of bytes. There are special constructions to make them more flexible:
<ul>
<li> Wild-cards: Placeholder for unknown bytes, denoted by the question mark (?). </li>
<li> Not operators: Indicate that a byte cannot be a specific value, represented by the tilde (~). </li>
<li> Jumps: For defining chunks of variable content and length using brackets with numbers, like [4-6]. </li>
<li> Alternatives: Represent different alternatives for a portion of the hex string, similar to regular expressions. </li>
</ul>
</p>

<p>
<h6>Text Strings:</h6> These are legible strings, generally ASCII-encoded, and can have modifiers:
<li> nocase: Makes the string case-insensitive. </li>
<li> wide: Used for strings encoded with two bytes per character (e.g., UTF-16). </li> 
<li> fullword: Matches only when the string is delimited by non-alphanumeric characters. </li>
<li> xor: Matches strings with a single-byte XOR applied. </li>
<li> base64: Matches strings that have been base64 encoded. </li>
</p>

<p><h6>Regular Expressions:</h6> Defined between forward slashes, similar to Perl regular expressions. They can have modifiers such as nocase, wide, and fullword.
YARA's regular expression engine supports various metacharacters and quantifiers.</p>

<p>Modifiers can be combined and applied to specific types of strings to refine the matching behavior. Additionally, there is a modifier to mark strings as private, making them invisible in YARA's output. </p>

<pre>
rule JumpExample
{
    strings:
        $hex_string = { F4 23 [4-6] 6? B4 }
        $text_string = "Hello world" wide nocase
        $regex_string = /Hello.*world/ nocase

    condition:
        $hex_string
}
</pre>


<p>Full documentation at: <a style="color: var(--color-active); text-align: center; display: inline-block;" href="https://yara.readthedocs.io/">https://yara.readthedocs.io/</a>  </p>
`

export const conditionInfo = `
<p>In this basic editor you can only build simple expressions. For more complex expressions, you can use the advanced editor and here a brief overview of what you could do there. </p>
<h6>Conditions and Operators:</h6>
<p>YARA uses Boolean expressions similar to those found in programming languages, containing Boolean operators (<code>and</code>, <code>or</code>, <code>not</code>) and relational operators (<code>&gt;=</code>, <code>&lt;=</code>, <code>&lt;</code>, <code>&gt;</code>, <code>==</code>, <code>!=</code>).
<p>Arithmetic and bitwise operators can be used on numerical expressions. String identifiers can act as Boolean variables based on the presence of the associated string in the file.</p>

<h6>String Matching:</h6>
<p>YARA allows matching strings and counting occurrences using the <code>#</code> symbol in the condition. Counting occurrences is represented as <code>#a</code>, where <code>a</code> is a string identifier. Matching a string within a specific range of offsets or addresses is possible using the <code>at</code> and <code>in</code> operators.</p>

<h6>File Size and Entrypoint:</h6>
<p>The <code>filesize</code> variable represents the size of the file being scanned. <code>entrypoint</code> refers to the raw offset of an executable's entry point in a file or virtual address in a running process.</p>

<h6>Iterating Over Strings:</h6>
<p>The <code>of</code> operator checks for a specific number of strings from a set to be present in the file. The <code>for..of</code> operator is similar and allows iterating over a set of strings to apply a condition.</p>

<h6>Iterating Over Occurrences:</h6>
<p>Using <code>@a[i]</code> notation, you can access the offset of the i-th occurrence of a string. The <code>for..in</code> operator allows iteration over ranges, enumerations, arrays, and dictionaries.</p>

<h6>Referencing Other Rules:</h6>
<p>Rules can reference other rules in their conditions. Rule sets can include multiple rules and automatically expand to include new rules.</p>

<h6>Modules and Hash Comparison:</h6>
<p>Modules can be used to access functions like <code>pe.imphash()</code> for comparing hashes.</p>


<p>Full documentation at: <a style="color: var(--color-active); text-align: center; display: inline-block;" href="https://yara.readthedocs.io/">https://yara.readthedocs.io/</a> </p>
`