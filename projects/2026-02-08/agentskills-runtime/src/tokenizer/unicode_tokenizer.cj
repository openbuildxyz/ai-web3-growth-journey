/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2024. All rights reserved.
 */
package magic.tokenizer
import std.math.ceil
/**
* Only can be used as the default token size counter
* Cl100kTokenizer is recommended
*/
public class UnicodeTokenizer <: Tokenizer {
    //empirical value
    private static let CN_MODIFY_FACTOR: Float64 = 1.6
    //empirical value
    private static let EN_MODIFY_FACTOR: Float64 = 1.1

    public func decode(tokens: Array<UInt32>): String {
       throw UnsupportedException()
    }

    public func encode(input: String): Array<UInt32> {
       throw UnsupportedException()
    }

    public func countToken(input: String): Int64 {
        var cnCnt = 0
        var enCnt = 0
        var otherCnt = 0
        let runArr = input.toRuneArray()
        var enFlag = false
        for (i in 0..runArr.size) {
            let char = runArr[i]
            if (isChineseCharacter(char)) {
                cnCnt ++
                enFlag = false
            } else if (isEnglishLetter(char)) {
                if (!enFlag) {
                    enCnt ++
                    enFlag = true
                }
            } else if(char.isAsciiWhiteSpace()) {
                enFlag = false
            } else {
                otherCnt ++ 
                enFlag = false
            }
        }
        return Int64(ceil(Float64(cnCnt) * CN_MODIFY_FACTOR + Float64(enCnt) * EN_MODIFY_FACTOR + Float64(otherCnt)))
    }

    private func isChineseCharacter(rune: Rune): Bool {
        return (rune >= r'\u{4E00}' && rune <= r'\u{9FFF}')
    }
    
    private func isEnglishLetter(rune: Rune) {
        return ((rune >= r'A' && rune <= r'Z') ||
                (rune >= r'a' && rune <= r'z'));
    }
}