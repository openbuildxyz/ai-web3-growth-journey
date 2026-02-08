/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */

package magic.utils

import std.random.Random

protected func randomString(size!: Int64): String {
    let chars: Array<Rune> = [
        r'A', r'B', r'C', r'D', r'E', r'F', r'G', r'H', r'I',
        r'J', r'K', r'L', r'M', r'N', r'O', r'P', r'Q', r'R',
        r'S', r'T', r'U', r'V', r'W', r'X', r'Y', r'Z', r'a',
        r'b', r'c', r'd', r'e', r'f', r'g', r'h', r'i', r'j',
        r'k', r'l', r'm', r'n', r'o', r'p', r'q', r's', r't',
        r'u', r'v', r'w', r'x', r'y', r'z', r'0', r'1', r'2',
        r'3', r'4', r'5', r'6', r'7', r'8', r'9'
    ]

    let random = Random()
    let buffer = StringBuilder()

    for (_ in 0..size) {
        let index = random.nextInt64(chars.size)
        buffer.append(chars[index])
    }

    return buffer.toString()
}
