import yara
import os
from request_model import Model


# configure the yara module and check the data
def match(obj: Model):
    rule: any
    if obj.complete_scan:
        rule = yara.compile(filepaths=scan_files())
    else:
        rule = yara.compile(source=obj.rules)

    matches = rule.match(data=obj.data)
    response = []
    for x in matches:
        response.append(x.rule)

    return response


# create a dictionary with all the 'filename': 'filepath' of the rules used from ReversingLabs (
# https://github.com/reversinglabs/reversinglabs-yara-rules.git)
def scan_files():
    path = 'ReversingLabs-Yara-Rules/yara'
    rules_files: dict = {}
    for dir in os.listdir(path):
        for file in os.listdir(path + '/' + dir):
            rules_files.update({os.path.splitext(file)[0]: path + '/' + dir + '/' + file})
    return rules_files
