/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2024. All rights reserved.
 */
package magic.tokenizer

import magic.utils.readLines
import std.convert.Parsable
import stdx.encoding.base64.*
import std.sort.*

class TikTokenConfig {
    let _pre_split_regex: Regex = Regex(
        "('([sdmt]|ll|ve|re)| ?[[:punct:]]?[[:alpha:]]+| ?[[:punct:]]?[[:digit:]]+| ?[[:punct:]]?[^\\s\\w]+|\\s+)")

    let _added_tokens: Array<(String, UInt32)> = [("<|endoftext|>", 100257), ("<|fim_prefix|>", 100258),
        ("<|fim_middle|>", 100259), ("<|fim_suffix|>", 100260), ("<|endofprompt|>", 100276)]

    let _vocab: ArrayList<(Array<Byte>, UInt32)>

    init(vocab: ArrayList<(Array<Byte>, UInt32)>) {
        this._vocab = vocab
    }

    public static func load(path: Path): TikTokenConfig {
        let content = readFile(path)
        return parse(content)
    }

    public static func parse(content: String): TikTokenConfig {
        let vocab = ArrayList<(Array<Byte>, UInt32)>()
        for (line in content.split('\n')) {
            let arr = line.trimAscii().split(" ")
            if (arr.size != 2) {
                continue
            }
            let bs64 = arr[0]
            if (let Some(bytes) <- fromBase64String(bs64)) {
                vocab.add((bytes, UInt32.parse(arr[1])))
            }
        }
        return TikTokenConfig(vocab)
    }
}

public class Cl100kTokenizer <: AbstractBPETokenizer {
    let _config: TikTokenConfig

    public init(tikTokenPath: Path) {
        this._config = TikTokenConfig.load(tikTokenPath)
        this.doInit()
    }

    public init(tikTokenContent: String) {
        this._config = TikTokenConfig.parse(tikTokenContent)
        this.doInit()
    }

    private func doInit() {
        this.popRuneBiMapping()

        let ranks = ArrayList<String>()
        for ((bytesArr, idx) in this._config._vocab) {
            let runes = ArrayList<String>()
            for (b in bytesArr) {
                runes.add(Rune(b).toString())
            }
            this._vocab.add(String.join(runes.toArray()), idx)
            ranks.add(String.join(runes.toArray()))
        }
        for (add_token in this._config._added_tokens) {
            this._vocab.add(add_token[0], add_token[1])
            // All add tokens are seemed as special in current version
            this._specialTokens.add(add_token[0], add_token[0])
            this._specialIds.add(add_token[1])
        }
        for ((token, id) in this._vocab) {
            this._vocabR.add(id, token)
        }
        let rankArr = ranks.toArray()
        stableSort<String>(rankArr)
        for ((i, token) in enumerate(rankArr)) {
            this._bpeRanks.add(token, UInt32(i))
        }
        this.buildSpecialRegex()
    }

    private func popRuneBiMapping(): Unit {
        var result = HashMap<UInt8, Rune>()
        var resultR = HashMap<Rune, UInt8>()
        for (i in 0..256) {
            result.add(UInt8(i), Rune(UInt8(i)))
            resultR.add(Rune(UInt8(i)), UInt8(i))
        }
        this._byte2rune = result
        this._rune2byte = resultR
    }
}
