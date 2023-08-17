export const metaInfo = `
Metadata
Besides the string definition and condition sections, rules can also have a metadata section where you can put additional information about your rule. The metadata section is defined with the keyword meta and contains identifier/value pairs like in the following example:

<code>
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
</code>

As can be seen in the example, metadata identifiers are always followed by an equals sign and the value assigned to them. The assigned values can be strings (valid UTF8 only), integers, or one of the boolean values true or false. Note that identifier/value pairs defined in the metadata section cannot be used in the condition section, their only purpose is to store additional information about the rule.

The metadata section is optional and can be omitted if no additional information is needed. If present, the metadata section must be placed before the strings section.

<div style="font-size:13pt;">
Source: https://yara.readthedocs.io/
</div>
`