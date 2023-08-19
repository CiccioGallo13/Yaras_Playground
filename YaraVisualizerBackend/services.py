import yara
import os
from models import RequestModel, CustomMatch, CustomStringMatch, CustomStringMatchInstance, \
    ResponseModel, Encodings
import utils


def analyze_data(obj: RequestModel):
    return ResponseModel(matches=match(obj.rules, obj.data, obj.complete_scan))


# configure the yara-rules module and check the data
def match(rules: str, data: str, complete_scan: bool):
    response: list[CustomMatch] = []
    # scan using rules in the directory 'ReversingLabs-Yara-Rules'
    if complete_scan:
        rule = yara.compile(filepaths=scan_files())
        matches = rule.match(data=data)
        response += create_iterable_object(matches)

    # scan using custom rules sent in the json request
    if rules:
        #return an exception if the rules are not valid
        rule = yara.compile(source=rules)
        matches = rule.match(data=data)
        response += create_iterable_object(matches)

    return response


# create a dictionary with all the 'filename': 'filepath' of the rules used from ReversingLabs (
# https://github.com/reversinglabs/reversinglabs-yara-rules.git)
def scan_files():
    path = 'ReversingLabs-Yara-Rules/yara-rules'
    rules_files: dict = {}
    for dir in os.listdir(path):
        for file in os.listdir(path + '/' + dir):
            rules_files.update({os.path.splitext(file)[0]: path + '/' + dir + '/' + file})
    return rules_files


def encode_data(obj: RequestModel, encoding: Encodings):
    match encoding:
        case Encodings.HEX:
            return utils.string_to_hex(obj.data)
        case Encodings.BINARY:
            return utils.string_to_binary(obj.data)
        case Encodings.ASCII:
            return utils.string_to_ascii(obj.data)
        case Encodings.UTF8:
            return utils.string_to_utf8(obj.data)
        case Encodings.UTF16:
            return utils.string_to_utf16(obj.data)
        case Encodings.UTF32:
            return utils.string_to_utf32(obj.data)
        case Encodings.RAW:
            return obj.data


def create_iterable_object(matches_: list[yara.Match]):
    # since the nested object inside yara-rules's response are not serializable, here is the conversion in custom objects
    # the class declarations of these custom objs are in models.py file
    # the original yara-rules objs structure is at https://yara.readthedocs.io/en/stable/yarapython.html
    custom_matches = []
    for x in matches_:
        custom_string_matches = []
        for y in x.strings:
            custom_string_match_instances = []

            for z in y.instances:
                custom_string_match_instances.append(
                    CustomStringMatchInstance(matched_data=z.matched_data,
                                              matched_length=z.matched_length,
                                              offset=z.offset, xor_key=z.xor_key,
                                              plaintext=utils.yara_string_match_instance_plaintext(z.matched_data,
                                                                                                   z.xor_key)))

            custom_string_matches.append(CustomStringMatch(identifier=y.identifier, is_xor=bool(y.is_xor),
                                                           instances=custom_string_match_instances))
        custom_match = CustomMatch(rule=x.rule, meta=str(x.meta), string_match=custom_string_matches)
        custom_matches.append(custom_match)

    return custom_matches
