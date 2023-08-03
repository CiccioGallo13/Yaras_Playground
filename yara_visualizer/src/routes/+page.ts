import type { JsonResponse, HighlightedMatches, MatchingOccurrence } from "../model/model";
import { Encoding } from "../model/model";
import { dataTextArea } from "$lib/stores";
import { _highlightInstances } from "$lib/utils";
import { get } from "svelte/store";


export const _encodings: Encoding[] = [Encoding.HEX, Encoding.ASCII, Encoding.PLAIN, Encoding.UTF8, Encoding.UTF16, Encoding.UTF32, Encoding.BINARY, Encoding.RAW];


//this function is used to pre-process the matches in order to highlight the matched data
export function _preProcessMatch(matches: JsonResponse): Map<string, HighlightedMatches > {
  let matchOccurences: MatchingOccurrence[] = [];
  let rules: string[] = [];
  
  let highlightedTextMap: Map<string, HighlightedMatches> = new Map<string, HighlightedMatches >();
  matches.matches.forEach((match) => {
      rules.push(match.rule);
      match.string_match.forEach((stringMatch) => {
          stringMatch.instances.forEach((instance) => {
              matchOccurences.push({
                  offset: instance.offset,
                  length: instance.matched_length
              });
          });
      });
  });
  for(let encoding in _encodings) {

      if( rules.length != 0 ){
          highlightedTextMap.set(_encodings[encoding], {rules: rules, highlighted_string: _highlightInstances(get(dataTextArea), matchOccurences, _encodings[encoding])});
      }else
      {
          highlightedTextMap.set(_encodings[encoding], {rules: undefined , highlighted_string: "No matched data" });
      }
  };

  return highlightedTextMap;
}