import yara
import os
from models import RequestModel, CustomMatch, CustomStringMatch, CustomStringMatchInstance, ResponseModel
import utils


# configure the yara module and check the data
def match(obj: RequestModel):
    response: list[CustomMatch] = []

    # scan using rules in the directory 'ReversingLabs-Yara-Rules'
    if obj.complete_scan:
        rule = yara.compile(filepaths=scan_files())
        matches = rule.match(data=obj.data)
        response += create_iterable_object(matches)  ## if multiple matching are found it stucks here

    # scan using custom rules sent in the json request
    if obj.rules:
        rule = yara.compile(source=obj.rules)
        matches = rule.match(data=obj.data)
        response += create_iterable_object(matches)  ## if multiple matching are found it stucks here

    return ResponseModel(matches=response)


# create a dictionary with all the 'filename': 'filepath' of the rules used from ReversingLabs (
# https://github.com/reversinglabs/reversinglabs-yara-rules.git)
def scan_files():
    path = 'ReversingLabs-Yara-Rules/yara'
    rules_files: dict = {}
    for dir in os.listdir(path):
        for file in os.listdir(path + '/' + dir):
            rules_files.update({os.path.splitext(file)[0]: path + '/' + dir + '/' + file})
    return rules_files


def create_iterable_object(matches_: list[yara.Match]):
    # since the nested object inside yara's response are not serializable, here is the conversion in custom objects
    # the class declarations of these custom objs are in models.py file
    # the original yara objs structure is at https://yara.readthedocs.io/en/stable/yarapython.html
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
