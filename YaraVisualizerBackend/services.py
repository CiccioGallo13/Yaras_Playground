import yara
import os
from models import RequestModel, CustomMatch, CustomStringMatch, CustomStringMatchInstance, ResponseModel
from json import dumps


# configure the yara module and check the data
def match(obj: RequestModel):
    response: list[CustomMatch] = []
    if obj.complete_scan:
        rule = yara.compile(filepaths=scan_files())
        matches = rule.match(data=obj.data)
        create_iterable_object(matches, response)

    if obj.rules:
        rule = yara.compile(source=obj.rules)
        matches = rule.match(data=obj.data)
        create_iterable_object(matches, response)

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


def create_iterable_object(matches_: any, response_: list[CustomMatch]):
    for x in matches_:
        custom_string_matches = []
        for y in x.strings:
            custom_string_match_instances = []
            for z in y.instances:
                custom_string_match_instances.append(CustomStringMatchInstance(matched_data=z.matched_data,
                                                                               matched_length=z.matched_length,
                                                                               offset=z.offset, xor_key=z.xor_key,
                                                                               plaintext=z.plaintext()))
            custom_string_matches.append(CustomStringMatch(identifier=y.identifier, is_xor=bool(y.is_xor),
                                                           instances=custom_string_match_instances))
        custom_match = CustomMatch(rule=x.rule, meta=str(x.meta), string_match=custom_string_matches)

        response_.append(custom_match)
