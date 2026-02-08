/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2024. All rights reserved.
 */
package magic.rag.graph

import std.regex.*
import std.collection.*

func splitByMarkers(content: String, markers: Array<String>): Array<String> {
    if (markers.isEmpty()) {
        return [content]
    }
    let re = Regex(String.join(markers |> map({marker => escape(marker)})|> collectArray, delimiter: "|"))
    let matches = re.matcher(content).findAll() ?? Array<MatchData>()
    let splits = ArrayList<String>()
    var index = 0
    for (md in matches) {
        let position = md.matchPosition()
        splits.add(content[index..position.start])
        index = position.end
    }
    let lastSplit = content[index..content.size]
    if (lastSplit.size > 0) {
        splits.add(lastSplit)
    }
    splits.toArray()
}

private func escape(input: String): String {
    var specialCharacters = ##"[\.\^\$\|\?\*\+\(\)\[\]\{\}]"##
    var regex = Regex(specialCharacters)
    var matcher = regex.matcher(input)
    let matchDatas = matcher.findAll().getOrDefault({=> Array<MatchData>()})
    var output = ArrayList<Byte>(input.toArray())
    for (i in matchDatas.size - 1..=0 : -1) {
        var matchData = matchDatas[i]
        var matchString = matchData.matchString()
        output.add(b'\\', at: matchData.matchPosition().start)
    }
    return String.fromUtf8(output.toArray())
}

func regSearch(content: String, pattern: String, group!: Int64 = 0): Option<String> {
    var re = Regex(pattern)
    match (re.matcher(content).find()) {
        case Some(r) => r.matchString(group)
        case None => None
    }
}