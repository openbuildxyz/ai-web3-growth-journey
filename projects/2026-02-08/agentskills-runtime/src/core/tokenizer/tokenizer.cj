/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2024. All rights reserved.
 */
package magic.core.tokenizer

public interface Tokenizer {

    func encode(input: String): Array<UInt32>

    func decode(tokens: Array<UInt32>): String
    
    func countToken(input: String): Int64
}