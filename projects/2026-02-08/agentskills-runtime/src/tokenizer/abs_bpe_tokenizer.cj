/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2024. All rights reserved.
 */
package magic.tokenizer

internal import magic.core.tokenizer.Tokenizer
internal import magic.utils.{readFile, exists}
internal import magic.core.tokenizer.*
internal import std.collection.*
internal import std.regex.*
internal import std.fs.*
internal import stdx.encoding.json.*
internal import std.collection.*
internal import std.fs.*
internal import std.io.*
internal import std.regex.*
internal import stdx.serialization.serialization.*
internal import std.math.pow

public let UINT32_MAX = UInt32(4294967295)

public interface JsonDeserializable<T> <: Serializable<T> {
    func serialize(): DataModel {
        throw UnsupportedException()
    }
    static func fromJson(str: String) {
        let jv = JsonValue.fromStr(str)
        return deserialize(DataModel.fromJson(jv))
    }
}

struct Token <: JsonDeserializable<Token> {
    let _id: UInt32
    let _content: String
    let _singleWord: Bool
    let _lstrip: Bool
    let _rstrip: Bool
    let _normalized: Bool
    let _special: Bool

    private init(
        id: UInt32,
        content: String,
        singleWord: Bool,
        lstrip: Bool,
        rstrip: Bool,
        normalized: Bool,
        special: Bool
    ) {
        this._id = id
        this._content = content
        this._singleWord = singleWord
        this._lstrip = lstrip
        this._rstrip = rstrip
        this._normalized = normalized
        this._special = special
    }

    public static func deserialize(dm: DataModel): Token {
        var dms = match (dm) {
            case data: DataModelStruct => data
            case _ => throw Exception("this data is not DataModelStruct")
        }
        let id = UInt32.deserialize(dms.get("id"))
        let content = String.deserialize(dms.get("content"))
        let singleWord = Bool.deserialize(dms.get("single_word"))
        let lstrip = Bool.deserialize(dms.get("lstrip"))
        let rstrip = Bool.deserialize(dms.get("rstrip"))
        let normalized = Bool.deserialize(dms.get("normalized"))
        let special = Bool.deserialize(dms.get("special"))
        return Token(id, content, singleWord, lstrip, rstrip, normalized, special)
    }
}

struct Normalizer <: JsonDeserializable<Normalizer> {
    let _type: String

    private init(nType: String) {
        this._type = nType
    }

    public static func deserialize(dm: DataModel): Normalizer {
        var dms = match (dm) {
            case data: DataModelStruct => data
            case _ => throw Exception("this data is not DataModelStruct")
        }
        let nType = String.deserialize(dms.get("type"))
        return Normalizer(nType)
    }
}

struct Pattern <: JsonDeserializable<Pattern> {
    let _regex: String

    private init(pRegex: String) {
        this._regex = pRegex
    }

    public static func deserialize(dm: DataModel): Pattern {
        var dms = match (dm) {
            case data: DataModelStruct => data
            case _ => throw Exception("this data is not DataModelStruct")
        }
        let regex = String.deserialize(dms.get("Regex"))
        return Pattern(regex)
    }
}

struct Process <: JsonDeserializable<Process> {
    // Union ByteLevel and SplitTokenizer
    let _type: String
    // use for ByteLevel: decoder/post_processor
    let _addPrefixSpace: Option<Bool>
    let _trimOffsets: Option<Bool>
    let _useRegex: Option<Bool>
    // actived when split tokenizer
    let _pattern: Option<Pattern>
    let _behavior: Option<String>
    let _invert: Option<Bool>

    // construct for decode/post_preprossor
    private init(
        pType: String,
        addPrefixSpace: Bool,
        trimOffsets: Bool,
        useRegex: Bool
    ) {
        this._type = pType
        if (this._type != "ByteLevel") {
            throw Exception("this construction function only suppport ByteLevel type");
        }
        this._addPrefixSpace = Some(addPrefixSpace)
        this._trimOffsets = Some(trimOffsets)
        this._useRegex = Some(useRegex)
        this._pattern = None
        this._behavior = None
        this._invert = None
    }

    private init(
        pType: String,
        pattern: Pattern,
        behavior: String,
        invert: Bool
    ) {
        this._type = pType
        if (pType != "Split") {
            throw Exception("this construction function only support Split type")
        }
        this._addPrefixSpace = None
        this._trimOffsets = None
        this._useRegex = None
        this._pattern = Some(pattern)
        this._behavior = Some(behavior)
        this._invert = Some(invert)
    }

    public static func deserialize(dm: DataModel): Process {
        var dms = match (dm) {
            case data: DataModelStruct => data
            case _ => throw Exception("this data is not DataModelStruct")
        }
        let _type = String.deserialize(dms.get("type"))
        match (_type) {
            case "ByteLevel" =>
                let addPrefixSpace = Bool.deserialize(dms.get("add_prefix_space"))
                let trimOffsets = Bool.deserialize(dms.get("trim_offsets"))
                let useRegex = Bool.deserialize(dms.get("use_regex"))
                Process(
                    _type,
                    addPrefixSpace,
                    trimOffsets,
                    useRegex,
                );
            case "Split" =>
                let pattern = Pattern.deserialize(dms.get("pattern"))
                let behavior = String.deserialize(dms.get("behavior"))
                let invert = Bool.deserialize(dms.get("invert"))
                Process(
                    _type,
                    pattern,
                    behavior,
                    invert
                )
            case _ => throw Exception("unkonw process type ${_type}}")
        }
    }
}

struct PreTokenizer <: JsonDeserializable<PreTokenizer> {
    let _type: String
    let _pretokenizers: ArrayList<Process>
    private init(pType: String, pretokenizers: ArrayList<Process>) {
        this._type = pType
        this._pretokenizers = pretokenizers
    }

    private init() {
        this._type = ""
        this._pretokenizers = ArrayList<Process>()
    }

    public static func deserialize(dm: DataModel): PreTokenizer {
        var dms = match (dm) {
            case data: DataModelStruct => data
            case _ => throw Exception("this data is not DataModelStruct")
        }
        let _type = String.deserialize(dms.get("type"))
        let _pretokenizers = ArrayList<Process>.deserialize(dms.get("pretokenizers"))
        return PreTokenizer(_type, _pretokenizers)
    }
}

struct Model <: JsonDeserializable<Model> {
    let _type: String
    // perform no merges, so the result will just be characters.
    let _dropout: Option<Float32>
    // The unknown token to be used when we encounter an unknown char
    let _unkToken: Option<String>
    // An optional prefix to use on any subword that exist only behind another one
    let _continuingSubwordPrefix: String
    // An optional suffix to caracterize and end-of-word subword
    let _endOfWordSuffix: String
    // Do multiple unk tokens get fused
    let _fuseUnk: Bool
    // Byte fallback from sentence pieces, instead of UNK, uses `"<0x00>"`
    // for each byte in the unk token
    let _byteFallback: Bool
    let _vocab: HashMap<String, UInt32>
    let _merges: ArrayList<String>

    private init(
        _type: String,
        dropout: Option<Float32>,
        vocab: HashMap<String, UInt32>,
        merges: ArrayList<String>,
        unkToken!: Option<String> = None,
        continuingSubwordPrefix!: String = "",
        endOfWordSuffix!: String = "",
        fuseUnk!: Bool = false,
        byteFallback!: Bool = false
    ) {
        this._type = _type
        if (dropout.isSome()) {
            let dropout_value = dropout.getOrThrow();
            if (dropout_value < 0.0 || dropout_value > 1.0) {
                throw Exception("dropout can only between 0~1")
            }
        }
        this._dropout = dropout
        this._unkToken = unkToken
        this._continuingSubwordPrefix = continuingSubwordPrefix
        this._endOfWordSuffix = endOfWordSuffix
        this._fuseUnk = fuseUnk
        this._byteFallback = byteFallback
        this._vocab = vocab
        this._merges = merges
    }

    public static func deserialize(dm: DataModel): Model {
        var dms = match (dm) {
            case data: DataModelStruct => data
            case _ => throw Exception("this data is not DataModelStruct")
        }
        let _type = String.deserialize(dms.get("type"))
        let dropout = Option<Float32>.deserialize(dms.get("dropout"))
        let vocab = HashMap<String, UInt32>.deserialize(dms.get("vocab"))
        let merges = ArrayList<String>.deserialize(dms.get("merges"))
        let unkToken = Option<String>.deserialize(dms.get("unk_token"))
        let continuingSubwordPrefix = Option<String>.deserialize(dms.get("continuing_subword_prefix"))
        let endOfWordSuffix = Option<String>.deserialize(dms.get("end_of_word_suffix"))
        let fuseUnk = Bool.deserialize(dms.get("fuse_unk"))
        let byteFallback = Bool.deserialize(dms.get("byte_fallback"))
        return Model(_type, dropout, vocab, merges, unkToken: unkToken,
            continuingSubwordPrefix: continuingSubwordPrefix.getOrDefault({=> ""}),
            endOfWordSuffix: endOfWordSuffix.getOrDefault({=> ""}), byteFallback: byteFallback)
    }
}

public struct TokenizerJson <: JsonDeserializable<TokenizerJson> {
    let _version: String
    let _truncation: Option<String>
    let _padding: Option<String>
    let _addedTokens: ArrayList<Token>
    let _normalizer: Normalizer
    let _pre_tokenizer: PreTokenizer
    let _post_processor: Process
    let _decoder: Process
    let _model: Model

    init(
        version: String,
        truncation: Option<String>,
        padding: Option<String>,
        addedTokens: ArrayList<Token>,
        normalizer: Normalizer,
        pre_tokenizer: PreTokenizer,
        post_processor: Process,
        decoder: Process,
        model: Model
    ) {
        this._version = version
        this._truncation = truncation
        this._padding = padding
        this._addedTokens = addedTokens
        this._normalizer = normalizer
        this._pre_tokenizer = pre_tokenizer
        this._post_processor = post_processor
        this._decoder = decoder
        this._model = model
    }

    public static func deserialize(dm: DataModel): TokenizerJson {
        var dms = match (dm) {
            case data: DataModelStruct => data
            case _ => throw Exception("this data is not DataModelStruct")
        }
        let version = String.deserialize(dms.get("version"))
        let truncation = Option<String>.deserialize(dms.get("truncation"))
        let padding = Option<String>.deserialize(dms.get("padding"))
        let addedTokens = ArrayList<Token>.deserialize(dms.get("added_tokens"))
        let normalizer = Normalizer.deserialize(dms.get("normalizer"))
        let preTokenizer = PreTokenizer.deserialize(dms.get("pre_tokenizer"))
        let postProcessor = Option<Process>.deserialize(dms.get("post_processor"))
        let decoder = Option<Process>.deserialize(dms.get("decoder"))
        let model = Option<Model>.deserialize(dms.get("model"))

        return TokenizerJson(version, truncation, padding, addedTokens, normalizer, preTokenizer,
            postProcessor.getOrThrow(), decoder.getOrThrow(), model.getOrThrow())
    }
}

public struct BPETokenizerConfig <: JsonDeserializable<BPETokenizerConfig> {
    let _addBosToken: Bool
    let _addEosToken: Bool
    let _bosToken: Option<String>
    let _eosToken: Option<String>
    let _padToken: Option<String>
    let _unkToken: Option<String>
    let _modelMaxLength: UInt32
    let _tokenizerClass: String

    private init(
        addBosToken: Bool,
        addEosToken: Bool,
        bosToken: Option<String>,
        eosToken: Option<String>,
        padToken: Option<String>,
        unkToken: Option<String>,
        modelMaxLength: UInt32,
        tokenizerClass: String
    ) {
        this._addBosToken = addBosToken
        this._addEosToken = addEosToken
        this._bosToken = bosToken
        this._eosToken = eosToken
        this._padToken = padToken
        this._unkToken = unkToken
        this._modelMaxLength = modelMaxLength
        this._tokenizerClass = tokenizerClass
    }

    public static func deserialize(dm: DataModel): BPETokenizerConfig {
        var dms = match (dm) {
            case data: DataModelStruct => data
            case _ => throw Exception("this data is not DataModelStruct")
        }
        let addBosToken = Option<Bool>.deserialize(dms.get("add_bos_token"))
        let addEosToken = Option<Bool>.deserialize(dms.get("add_eos_token"))
        let _ = Option<Bool>.deserialize(dms.get("_"))
        let bosToken: Option<String> = match (dms.get("bos_token")) {
            case data: DataModelString => Option<String>.deserialize(data)
            case data: DataModelStruct => match (data.get("content")) {
                case innerData: DataModelString => Option<String>.deserialize(innerData)
                case _ => None
            }
            case _ => None
        }
        let eosToken: Option<String> = match (dms.get("eos_token")) {
            case data: DataModelString => Option<String>.deserialize(data)
            case data: DataModelStruct => match (data.get("content")) {
                case innerData: DataModelString => Option<String>.deserialize(innerData)
                case _ => None
            }
            case _ => None
        }
        let padToken: Option<String> = match (dms.get("pad_token")) {
            case data: DataModelString => Option<String>.deserialize(data)
            case data: DataModelStruct => match (data.get("content")) {
                case innerData: DataModelString => Option<String>.deserialize(innerData)
                case _ => None
            }
            case _ => None
        }
        let unkToken: Option<String> = match (dms.get("unk_token")) {
            case data: DataModelString => Option<String>.deserialize(data)
            case data: DataModelStruct => match (data.get("content")) {
                case innerData: DataModelString => Option<String>.deserialize(innerData)
                case _ => None
            }
            case _ => None
        }
        let modelMaxLength = UInt32.deserialize(dms.get("model_max_length"))
        let tokenizerClass = String.deserialize(dms.get("tokenizer_class"))

        return BPETokenizerConfig(addBosToken.getOrDefault({=> false}), addEosToken.getOrDefault({=> false}),
            bosToken, eosToken, padToken, unkToken, modelMaxLength, tokenizerClass)
    }
}

public class Pair<T> <: Hashable & Equatable<Pair<T>> where T <: Hashable & Equatable<T> {
    let _left: T
    let _right: T

    public init(left: T, right: T) {
        this._left = left
        this._right = right
    }

    public prop left: T {
        get() {
            this._left
        }
    }

    public prop right: T {
        get() {
            this._right
        }
    }

    public func hashCode(): Int64 {
        let hash1: Int64 = this._left.hashCode()
        let hash2: Int64 = this._right.hashCode()
        // If hash1 == hash2, their XOR is zero.
        if (hash1 != hash2) {
            return hash1 ^ hash2
        } else {
            return hash1
        }
    }

    public operator func ==(other: Pair<T>): Bool {
        if (this._left == other._left && this._right == other._right) {
            return true;
        } else {
            return false;
        }
    }

    @When[cjc_version < "1.0.0"]
    public operator func !=(other: Pair<T>): Bool {
        !(this == other)
    }
}

type BPERanks = HashMap<String, UInt32>

public type MergeMap = HashMap<Pair<UInt32>, (UInt32, UInt32)>

public abstract class AbstractBPETokenizer <: Tokenizer {
    // The _vocabulary assigns a number to each token.
    var _vocab: HashMap<String, UInt32> = HashMap()
    // Reversed _vocabulary, to rebuild sentences.
    var _vocabR: HashMap<UInt32, String> = HashMap()
    // Contains the mapping between Pairs and their (rank, new_id).
    var _merges: MergeMap = MergeMap()
    var _bpeRanks: BPERanks = BPERanks()
    var _unkTokenId: Option<UInt32> = None
    /// Whether or not to direct output words if they are part of the _vocab.
    var _ignoreMerges: Bool = false;
    // cache
    var _cache: HashMap<String, Array<String>> = HashMap()
    // the key is uniformed special token, and value is the origin token
    // See - func unexpectedNormalize and unexpectedRestore
    var _specialTokens: HashMap<String, String> = HashMap()
    var _specialIds: HashSet<UInt32> = HashSet()
    var _byte2rune: HashMap<UInt8, Rune> = HashMap()
    var _rune2byte: HashMap<Rune, UInt8> = HashMap()
    var _specialRegex: Regex = Regex("")
    // use fix preSplitRegex as default
    // same reason as func unexpectedNormalize and unexpectedRestore
    var _preSplitRegex: Regex = Regex(
        "('s|'t|'re|'ve|'m|'ll|'d| ?[[:punct:]]?[[:alpha:]]+| ?[[:punct:]]?[[:digit:]]+| ?[[:punct:]]?[^\\s\\w]+|\\s+)")
    var _addBosToken: Bool = false
    var _addEosToken: Bool = false
    var _bosToken: Option<String> = None
    var _eosToken: Option<String> = None

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

    /**
     * Due to the weak support for Regex in the current version, replace the common word segmentation symbols.
     * Sometimes it makes the encoded result a little different when there are special UTF - 8 characters in the input.
     * This function should be removed in future versions.
     */
    func unexpectedNormalize(token: String): String {
        return token.replace("▁", "_").replace("｜", "|")
    }

    /**
     * Due to the weak support for Regex in the current version, replace the common word segmentation symbols.
     * This function is opposed to the  function "unexpectedNormalize". it makes tokens go back to unnormalized.
     * This function should be removed in the future.
     */
    func unexpectedRestore(token: String): String {
        return this._specialTokens.get(token).getOrDefault({=> token})
    }

    func buildSpecialRegex() {
        var sb: StringBuilder = StringBuilder()
        sb.append("(")
        for ((i, spToken) in enumerate(this._specialTokens.keys())) {
            if (i < this._specialTokens.size - 1) {
                sb.append(spToken.replace("|", "\\|") + "|")
            } else {
                sb.append(spToken.replace("|", "\\|") + ")")
            }
        }
        this._specialRegex = Regex(sb.toString())
    }

    public func decode(tokens: Array<UInt32>): String {
        let strList = ArrayList<String>()
        for ((i, tokenId) in enumerate(tokens)) {
            strList.add(this._vocabR.get(tokenId).getOrThrow())
        }
        let datas = ArrayList<UInt8>()
        for (str in strList) {
            for (rune in str.toRuneArray()) {
                let byte: UInt8 = this._rune2byte[rune];
                datas.add(byte)
            }
        }
        return String.fromUtf8(datas.toArray())
    }

    public func encode(input: String): Array<UInt32> {
        // find special tokens
        var uniformed = unexpectedNormalize(input)
        let specialTokenMap = HashMap<Int64, UInt32>()
        let specialTokenIndexes = HashSet<Pair<Int64>>()
        let specMathDatas = this._specialRegex.matcher(uniformed).findAll() ?? Array<MatchData>()
        var text = uniformed
        // replace special tokens with empty blank
        for (specMd in specMathDatas) {
            let specialToken = specMd.matchString()
            specialTokenMap.add(
                specMd.matchPosition().start,
                this._vocab.get(specialToken).getOrThrow()
            )
            specialTokenIndexes.add(Pair(
                specMd.matchPosition().start,
                specMd.matchPosition().end
            ))
            var space = ""
            var i = 0;
            while (i < specialToken.size) {
                space += " "
                i++
            }
            text = text.replace(specialToken, space)
        }

        let matchDatas = this._preSplitRegex.matcher(text).findAll() ?? Array<MatchData>()
        var ids = ArrayList<UInt32>()
        if (this._addBosToken) {
            if (let Some(bosToken) <- this._bosToken) {
                if (let Some(bosId) <- this._vocab.get(bosToken)) {
                    ids.add(bosId)
                }
            }
        }
        for (matchData in matchDatas) {
            let ms = matchData.matchPosition().start
            let me = matchData.matchPosition().end
            let orgStr = uniformed[ms..me]
            // find special token
            if (this._specialTokens.contains(orgStr)) {
                ids.add(this._vocab[orgStr])
                continue
            }
            let matchedStr = matchData.matchString()
            var runeLevelStr: String
            var runeList = ArrayList<String>()
            if (this._vocab.contains(matchedStr)) {
                runeList.add(matchedStr)
                runeLevelStr = matchedStr
            } else {
                for (b in matchedStr.toArray()) {
                    let rune = this._byte2rune[b]
                    runeList.add(rune.toString())
                }
                runeLevelStr = String.join(runeList.toArray())
            }

            if (this._cache.contains(runeLevelStr)) {
                let cacheLst = this._cache[runeLevelStr]
                for (cache in cacheLst) {
                    ids.add(this._vocab[cache])
                }
                continue;
            }
            let mergeVocabs = this.bpe(runeList.toArray())
            // update cache
            this._cache.add(runeLevelStr, mergeVocabs)
            for (mv in mergeVocabs) {
                try {
                    let id = this._vocab.get(mv).getOrDefault({=> this._unkTokenId.getOrThrow()})
                    ids.add(id)
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
        }
        if (this._addEosToken) {
            if (let Some(eosToken) <- this._eosToken) {
                if (let Some(eosId) <- this._vocab.get(eosToken)) {
                    ids.add(eosId)
                }
            }
        }
        return ids.toArray()
    }

    public func countToken(input: String): Int64 {
        return encode(input).size
    }
     /**
     *  merge tokens and find the best tokens to get
     */
    private func bpe(tokens: Array<String>): Array<String> {
        if (tokens.size == 0) {
            return []
        }
        var finalTokens = ArrayList<String>(tokens)
        // records indices in pairs that were merged.
        while (finalTokens.size > 1) {
            let pairs: ArrayList<Pair<String>> = this.buildAdjacentConcatenations(finalTokens)
            var minScore: UInt32 = UINT32_MAX
            var toMerge: Int64 = -1
            for ((i, pair) in enumerate(pairs)) {
                // if pair i is not merged.
                let score = this._bpeRanks.get(pair.left + pair.right).getOrDefault({=> UINT32_MAX})
                if (score < minScore) {
                    minScore = score
                    toMerge = i
                }
            }
            if (toMerge == -1) {
                break
            }
            let bestTokens: ArrayList<String> = ArrayList<String>()
            let left = pairs[toMerge].left
            let right = pairs[toMerge].right
            // find all meged tokens and merge
            var i = 0
            while (i < finalTokens.size) {
                let j = find<String>(finalTokens, i, pairs[toMerge])
                if (j >= 0) {
                    bestTokens.add(all: finalTokens[i..j])
                    bestTokens.add(left + right)
                    i = j + 2
                } else {
                    bestTokens.add(all: finalTokens[i..])
                    break
                }
            }
            finalTokens = bestTokens
        }
        return finalTokens.toArray()
    }

    private func find<T>(arr: ArrayList<T>, index: Int64, target: Pair<T>): Int64 where T <: Hashable & Equatable<T> {
        for (i in index..arr.size - 1) {
            if (arr[i] == target.left && arr[i + 1] == target.right) {
                return i
            }
        }
        return -1
    }

    /**
     *  ['a','b','c'] -> [('a','b'),('b','c')]
     */
    private func buildAdjacentConcatenations(tokens: ArrayList<String>): ArrayList<Pair<String>> {
        var pairs: ArrayList<Pair<String>> = ArrayList<Pair<String>>()
        if (tokens.size <= 1) {
            return pairs
        }
        for (i in 0..tokens.size - 1) {
            pairs.add(Pair<String>(tokens[i].toString(), tokens[i + 1].toString()))
        }
        return pairs
    }
}
