/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2024. All rights reserved.
 */
package magic.tokenizer

import magic.utils.readFile
import std.fs.Path

public class BPETokenizer <: AbstractBPETokenizer {
    let _tokenizer_json: TokenizerJson
    let _tokenizer_config: BPETokenizerConfig

    public init(modelPath: Path) {
        // load config from tokenizer.json
        if (!exists(modelPath)) {
            throw Exception("modelPath file:${modelPath} dos not exists")
        }
        this._tokenizer_json = TokenizerJson.fromJson(
            readFile(modelPath.join("tokenizer.json"))
        )
        this._tokenizer_config = BPETokenizerConfig.fromJson(
            readFile(modelPath.join("tokenizer_config.json"))
        )
        this._addBosToken = this._tokenizer_config._addBosToken
        this._addEosToken = this._tokenizer_config._addEosToken
        this._bosToken = this._tokenizer_config._bosToken
        this._eosToken= this._tokenizer_config._eosToken
        this.popRuneBiMapping()
        this.popVocab()
        this.popMergesAndBpeRanks()
        this.buildSpecialRegex()
    }

    /**
     *  get Byte <=> Rune bidirectional mapping
     */
    func popRuneBiMapping(): Unit {
        var bs: ArrayList<UInt8> = ArrayList<UInt8>()
        var cs: ArrayList<UInt32> = ArrayList<UInt32>()
        var ts: Rune = '!';
        var te: Rune = '~';
        for (x in UInt32(ts)..=UInt32(te)) {
            bs.add(UInt8(x))
            cs.add(x)
        }
        ts = '\u{A1}'
        te = '\u{AC}'
        for (x in UInt32(ts)..=UInt32(te)) {
            bs.add(UInt8(x))
            cs.add(x)
        }
        ts = '\u{AE}'
        te = '\u{FF}'
        for (x in UInt32(ts)..=UInt32(te)) {
            bs.add(UInt8(x))
            cs.add(x)
        }
        var n: UInt32 = 0;
        for (b in 0_u8..=255_u8) {
            if (!bs.contains(b)) {
                bs.add(b)
                cs.add(UInt32(pow(2.0, 8)) + n)
                n += 1
            }
        }
        var result: HashMap<UInt8, Rune> = HashMap<UInt8, Rune>()
        var resultR: HashMap<Rune, UInt8> = HashMap<Rune, UInt8>()
        for ((k, v) in bs.iterator().zip(cs.iterator())) {
            result.add(k, Rune(v))
            resultR.add(Rune(v), k)
        }
        this._byte2rune = result
        this._rune2byte = resultR
    }

    private func popVocab(): Unit {
        this._vocab = this._tokenizer_json._model._vocab
        for (add_token in this._tokenizer_json._addedTokens) {
            this._vocab.add(uniformSpecial(add_token), add_token._id)
            // All add tokens are seemed as special in current version
            this._specialTokens.add(uniformSpecial(add_token), add_token._content)
            this._specialIds.add(add_token._id)
        }
        if (let Some(unkToken) <- this._tokenizer_json._model._unkToken) {
            this._unkTokenId = this._vocab.get(unkToken)
        }

        for ((token, id) in this._tokenizer_json._model._vocab) {
            this._vocabR.add(id, token)
        }
    }

    private func popMergesAndBpeRanks(): Unit {
        let mergeList: ArrayList<(String, String)> = ArrayList<(String, String)>()
        for (line in this._tokenizer_json._model._merges) {
            let tokenPair = line.split(" ")
            if (tokenPair.size != 2) {
                throw Exception("merge line size must be two")
            }
            mergeList.add((tokenPair[0], tokenPair[1]))
        }
        let prefixLen = this._tokenizer_json._model._continuingSubwordPrefix.size;
        for ((i, (left, right)) in enumerate(mergeList)) {
            let iU = UInt32(i)
            let lId: UInt32 = this._vocab.get(left).getOrThrow()
            let rId: UInt32 = this._vocab.get(right).getOrThrow()
            let mergedToken: String = "${left}${right[prefixLen..]}";
            let mergedId: UInt32 = this._vocab.get(mergedToken).getOrThrow()
            this._merges.add(Pair<UInt32>(lId, rId), (iU, mergedId))
            this._bpeRanks.add(left + right, iU)
        }
    }

    private func uniformSpecial(token: Token): String {
        var content = unexpectedNormalize(token._content)
        if (token._lstrip) {
            content = content.trimAsciiStart()
        }
        if (token._rstrip) {
            content = content.trimAsciiEnd()
        }
        return content
    }
}
