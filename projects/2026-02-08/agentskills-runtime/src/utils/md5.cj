/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2024. All rights reserved.
 */

package magic.utils

import std.collection.*
import std.convert.*
import std.math.*
import std.io.*
import std.crypto.digest.*

import stdx.encoding.hex.*

public class Md5 {
    private let SHIFT: Array<Int64> = [0, 8, 16, 24]
    private let EXTRA: Array<Int64> = [128, 32768, 8388608, -2147483648]
    private let HEX_CHARS: Array<Rune> = "0123456789abcdef".toRuneArray()

    private var blocks: Array<Int64>
    private var h0: Int64
    private var h1: Int64
    private var h2: Int64
    private var h3: Int64
    private var start: Int64
    private var bytes: Int64
    private var hBytes: Int64
    private var finalized: Bool
    private var hashed: Bool
    private var first: Bool
    private var lastByteIndex: Int64

    public init() {
        this.blocks = Array<Int64>(17, {i => 0})
        this.h0 = 0
        this.h1 = 0
        this.h2 = 0
        this.h3 = 0
        this.start = 0
        this.bytes = 0
        this.hBytes = 0
        this.finalized = false
        this.hashed = false
        this.first = true
        this.lastByteIndex = 0
    }

    public func update(message: String): Md5 {
        if (finalized) {
            throw Exception("MD5 has been finalized.")
        }

        let messageBytes = message.toArray()
        let length = messageBytes.size
        var index: Int64 = 0
        while (index < length) {
            if (hashed) {
                hashed = false
                this.blocks[0] = this.blocks[16]
                for (i in 1..17) {
                    blocks[i] = 0
                }
            }

            var i = this.start
            while (index < length && i < 64) {
                var code = Int64(messageBytes[index]);

                if (code < 0x80) {
                    blocks[unsignedRightShift(i, 2)] |= code << SHIFT[i & 3]
                    i++;
                } else if (code < 0x800) {
                    blocks[unsignedRightShift(i, 2)] |= (0xc0 | unsignedRightShift(code, 6)) << SHIFT[i & 3]
                    i++;
                    blocks[unsignedRightShift(i, 2)] |= (0x80 | (code & 0x3f)) << SHIFT[i & 3]
                    i++;
                } else if (code < 0xd800 || code >= 0xe000) {
                    blocks[unsignedRightShift(i, 2)] |= (0xe0 | unsignedRightShift(code, 12)) << SHIFT[i & 3]
                    i++;
                    blocks[unsignedRightShift(i, 2)] |= (0x80 | (unsignedRightShift(code, 6) & 0x3f)) << SHIFT[i & 3]
                    i++;
                    blocks[unsignedRightShift(i, 2)] |= (0x80 | (code & 0x3f)) << SHIFT[i & 3]
                    i++;
                } else {
                    index++
                    code = (0x10000 + (((code & 0x3ff) << 10) | (Int64(messageBytes[index])) & 0x3ff))
                    blocks[unsignedRightShift(i, 2)] |= (0xf0 | unsignedRightShift(code, 18)) << SHIFT[i & 3]
                    i++;
                    blocks[unsignedRightShift(i, 2)] |= (0x80 | (unsignedRightShift(code, 12) & 0x3f)) << SHIFT[i & 3]
                    i++;
                    blocks[unsignedRightShift(i, 2)] |= (0x80 | (unsignedRightShift(code, 6) & 0x3f)) << SHIFT[i & 3]
                    i++;
                    blocks[unsignedRightShift(i, 2)] |= (0x80 | (code & 0x3f)) << SHIFT[i & 3]
                    i++;
                }
                index++;
            }

            this.lastByteIndex = i
            this.bytes += i - this.start
            if (i >= 64) {
                this.start = i - 64
                this.hash()
                this.hashed = true
            } else {
                this.start = i
            }
        }

        if (this.bytes > 4294967295) {
            this.hBytes += this.bytes / (4294967296 << 0)
            this.bytes = this.bytes % 4294967296
        }
        return this
    }

    public open func finalize() {
        if (finalized) {
            return
        }
        finalized = true

        let i = this.lastByteIndex
        var blocks = this.blocks
        blocks[unsignedRightShift(i, 2)] |= EXTRA[i & 3]

        if (i >= 56) {
            if (!this.hashed) {
                hash()
            }
            blocks[0] = blocks[16]
            for (j in 1..17) {
                blocks[j] = 0
            }
        }

        blocks[14] = this.bytes << 3
        blocks[15] = (this.hBytes << 3) | unsignedRightShift(this.bytes, 29)

        this.hash()
    }

    private func safe_add(a: Int64, b: Int64): Int64 {
        let lsw = (a & 0xFFFF) + (b & 0xFFFF)
        let msw = ((a >> 16) & 0xFFFF) + ((b >> 16) & 0xFFFF) + (lsw >> 16)
        return ((msw << 16) | (lsw & 0xFFFF)) & 0xFFFFFFFF
    }

    private func custom_add(value1: Int64, value2: Int64, value3: Int64, value4: Int64): Int64 {
        let temp1 = safe_add(value1, value2)
        let temp2 = safe_add(temp1, value3)
        let temp3 = safe_add(temp2, value4)
        return temp3
    }

    private func unsignedRightShift(value: Int64, shift: Int64): Int64 {
        if (shift == 0) {
            return value
        }
        // 对于正数，普通右移等同于无符号右移
        if (value >= 0) {
            return value >> shift
        }
        // 对于负数，需要特殊处理
        // 先右移，然后加上最高位的补偿
        return (value >> shift) & (0x7FFFFFFF >> (shift - 1))
    }

    private func hash() {
        var a: Int64
        var b: Int64
        var c: Int64
        var d: Int64
        var bc: Int64
        var da: Int64
        if (first) {
            a = safe_add(blocks[0], -680876937)
            a = safe_add((a << 7 | unsignedRightShift(a, 25)), -(271733879 << 0))
            d = safe_add(safe_add((-1732584194 ^ a & 2004318071), blocks[1]), -117830708)
            d = safe_add((d << 12 | unsignedRightShift(d, 20)), a << 0)
            c = safe_add(safe_add((-271733879 ^ (d & (a ^ -271733879))), blocks[2]), -1126478375)
            c = safe_add((c << 17 | unsignedRightShift(c, 15)), d << 0)
            b = safe_add(safe_add((a ^ (c & (d ^ a))), blocks[3]), -1316259209)
            b = safe_add((b << 22 | unsignedRightShift(b, 10)), c << 0)
        } else {
            a = this.h0
            b = this.h1
            c = this.h2
            d = this.h3

            a = custom_add(a, (d ^ (b & (c ^ d))), blocks[0], -680876936)
            a = safe_add((a << 7 | unsignedRightShift(a, 25)), b << 0)
            d = custom_add(d, (c ^ (a & (b ^ c))), blocks[1], 389564586)
            d = safe_add((d << 12 | unsignedRightShift(d, 20)), a << 0)
            c = custom_add(c, (b ^ (d & (a ^ b))), blocks[2], 606105819)
            c = safe_add((c << 17 | unsignedRightShift(c, 15)), d << 0)
            b = custom_add(b, (a ^ (c & (d ^ a))), blocks[3], -1044525330)
            b = safe_add((b << 22 | unsignedRightShift(b, 10)), c << 0)
        }
        a = custom_add(a, (d ^ (b & (c ^ d))), blocks[4], -176418897)
        a = safe_add((a << 7 | unsignedRightShift(a, 25)), b << 0)
        d = custom_add(d, (c ^ (a & (b ^ c))), blocks[5], 1200080426)
        d = safe_add((d << 12 | unsignedRightShift(d, 20)), a << 0)
        c = custom_add(c, (b ^ (d & (a ^ b))), blocks[6], -1473231341)
        c = safe_add((c << 17 | unsignedRightShift(c, 15)), d << 0)
        b = custom_add(b, (a ^ (c & (d ^ a))), blocks[7], -45705983)
        b = safe_add((b << 22 | unsignedRightShift(b, 10)), c << 0)

        a = custom_add(a, (d ^ (b & (c ^ d))), blocks[8], 1770035416)
        a = safe_add((a << 7 | unsignedRightShift(a, 25)), b << 0)
        d = custom_add(d, (c ^ (a & (b ^ c))), blocks[9], -1958414417)
        d = safe_add((d << 12 | unsignedRightShift(d, 20)), a << 0)
        c = custom_add(c, (b ^ (d & (a ^ b))), blocks[10], -42063)
        c = safe_add((c << 17 | unsignedRightShift(c, 15)), d << 0)
        b = custom_add(b, (a ^ (c & (d ^ a))), blocks[11], -1990404162)
        b = safe_add((b << 22 | unsignedRightShift(b, 10)), c << 0)

        a = custom_add(a, (d ^ (b & (c ^ d))), blocks[12], 1804603682)
        a = safe_add((a << 7 | unsignedRightShift(a, 25)), b << 0)
        d = custom_add(d, (c ^ (a & (b ^ c))), blocks[13], -40341101)
        d = safe_add((d << 12 | unsignedRightShift(d, 20)), a << 0)
        c = custom_add(c, (b ^ (d & (a ^ b))), blocks[14], -1502002290)
        c = safe_add((c << 17 | unsignedRightShift(c, 15)), d << 0)
        b = custom_add(b, (a ^ (c & (d ^ a))), blocks[15], 1236535329)
        b = safe_add((b << 22 | unsignedRightShift(b, 10)), c << 0)

        a = custom_add(a, (c ^ (d & (b ^ c))), blocks[1], -165796510)
        a = safe_add((a << 5 | unsignedRightShift(a, 27)), b << 0)
        d = custom_add(d, (b ^ (c & (a ^ b))), blocks[6], -1069501632)
        d = safe_add((d << 9 | unsignedRightShift(d, 23)), a << 0)
        c = custom_add(c, (a ^ (b & (d ^ a))), blocks[11], 643717713)
        c = safe_add((c << 14 | unsignedRightShift(c, 18)), d << 0)
        b = custom_add(b, (d ^ (a & (c ^ d))), blocks[0], -373897302)
        b = safe_add((b << 20 | unsignedRightShift(b, 12)), c << 0)

        a = custom_add(a, (c ^ (d & (b ^ c))), blocks[5], -701558691)
        a = safe_add((a << 5 | unsignedRightShift(a, 27)), b << 0)
        d = custom_add(d, (b ^ (c & (a ^ b))), blocks[10], 38016083)
        d = safe_add((d << 9 | unsignedRightShift(d, 23)), a << 0)
        c = custom_add(c, (a ^ (b & (d ^ a))), blocks[15], -660478335)
        c = safe_add((c << 14 | unsignedRightShift(c, 18)), d << 0)
        b = custom_add(b, (d ^ (a & (c ^ d))), blocks[4], -405537848)
        b = safe_add((b << 20 | unsignedRightShift(b, 12)), c << 0)

        a = custom_add(a, (c ^ (d & (b ^ c))), blocks[9], 568446438)
        a = safe_add((a << 5 | unsignedRightShift(a, 27)), b << 0)
        d = custom_add(d, (b ^ (c & (a ^ b))), blocks[14], -1019803690)
        d = safe_add((d << 9 | unsignedRightShift(d, 23)), a << 0)
        c = custom_add(c, (a ^ (b & (d ^ a))), blocks[3], -187363961)
        c = safe_add((c << 14 | unsignedRightShift(c, 18)), d << 0)
        b = custom_add(b, (d ^ (a & (c ^ d))), blocks[8], 1163531501)
        b = safe_add((b << 20 | unsignedRightShift(b, 12)), c << 0)

        a = custom_add(a, (c ^ (d & (b ^ c))), blocks[13], -1444681467)
        a = safe_add((a << 5 | unsignedRightShift(a, 27)), b << 0)
        d = custom_add(d, (b ^ (c & (a ^ b))), blocks[2], -51403784)
        d = safe_add((d << 9 | unsignedRightShift(d, 23)), a << 0)
        c = custom_add(c, (a ^ (b & (d ^ a))), blocks[7], 1735328473)
        c = safe_add((c << 14 | unsignedRightShift(c, 18)), d << 0)
        b = custom_add(b, (d ^ (a & (c ^ d))), blocks[12], -1926607734)
        b = safe_add((b << 20 | unsignedRightShift(b, 12)), c << 0)

        bc = b ^ c
        a = custom_add(a, bc ^ d, blocks[5], -378558)
        a = safe_add((a << 4 | unsignedRightShift(a, 28)), b << 0)
        d = custom_add(d, bc ^ a, blocks[8], -2022574463)
        d = safe_add((d << 11 | unsignedRightShift(d, 21)), a << 0)
        da = d ^ a
        c = custom_add(c, da ^ b, blocks[11], 1839030562)
        c = safe_add((c << 16 | unsignedRightShift(c, 16)), d << 0)
        b = custom_add(b, da ^ c, blocks[14], -35309556)
        b = safe_add((b << 23 | unsignedRightShift(b, 9)), c << 0)

        bc = b ^ c
        a = custom_add(a, bc ^ d, blocks[1], -1530992060)
        a = safe_add((a << 4 | unsignedRightShift(a, 28)), b << 0)
        d = custom_add(d, bc ^ a, blocks[4], 1272893353)
        d = safe_add((d << 11 | unsignedRightShift(d, 21)), a << 0)
        da = d ^ a
        c = custom_add(c, da ^ b, blocks[7], -155497632)
        c = safe_add((c << 16 | unsignedRightShift(c, 16)), d << 0)
        b = custom_add(b, da ^ c, blocks[10], -1094730640)
        b = safe_add((b << 23 | unsignedRightShift(b, 9)), c << 0)

        bc = b ^ c
        a = custom_add(a, bc ^ d, blocks[13], 681279174)
        a = safe_add((a << 4 | unsignedRightShift(a, 28)), b << 0)
        d = custom_add(d, bc ^ a, blocks[0], -358537222)
        d = safe_add((d << 11 | unsignedRightShift(d, 21)), a << 0)
        da = d ^ a
        c = custom_add(c, da ^ b, blocks[3], -722521979)
        c = safe_add((c << 16 | unsignedRightShift(c, 16)), d << 0)
        b = custom_add(b, da ^ c, blocks[6], 76029189)
        b = safe_add((b << 23 | unsignedRightShift(b, 9)), c << 0)

        bc = b ^ c
        a = custom_add(a, bc ^ d, blocks[9], -640364487)
        a = safe_add((a << 4 | unsignedRightShift(a, 28)), b << 0)
        d = custom_add(d, bc ^ a, blocks[12], -421815835)
        d = safe_add((d << 11 | unsignedRightShift(d, 21)), a << 0)
        da = d ^ a
        c = custom_add(c, da ^ b, blocks[15], 530742520)
        c = safe_add((c << 16 | unsignedRightShift(c, 16)), d << 0)
        b = custom_add(b, da ^ c, blocks[2], -995338651)
        b = safe_add((b << 23 | unsignedRightShift(b, 9)), c << 0)

        a = custom_add(a, (c ^ (b | !d)), blocks[0], -198630844)
        a = safe_add((a << 6 | unsignedRightShift(a, 26)), b << 0)
        d = custom_add(d, (b ^ (a | !c)), blocks[7], 1126891415)
        d = safe_add((d << 10 | unsignedRightShift(d, 22)), a << 0)
        c = custom_add(c, (a ^ (d | !b)), blocks[14], -1416354905)
        c = safe_add((c << 15 | unsignedRightShift(c, 17)), d << 0)
        b = custom_add(b, (d ^ (c | !a)), blocks[5], -57434055)
        b = safe_add((b << 21 | unsignedRightShift(b, 11)), c << 0)

        a = custom_add(a, (c ^ (b | !d)), blocks[12], 1700485571)
        a = safe_add((a << 6 | unsignedRightShift(a, 26)), b << 0)
        d = custom_add(d, (b ^ (a | !c)), blocks[3], -1894986606)
        d = safe_add((d << 10 | unsignedRightShift(d, 22)), a << 0)
        c = custom_add(c, (a ^ (d | !b)), blocks[10], -1051523)
        c = safe_add((c << 15 | unsignedRightShift(c, 17)), d << 0)
        b = custom_add(b, (d ^ (c | !a)), blocks[1], -2054922799)
        b = safe_add((b << 21 | unsignedRightShift(b, 11)), c << 0)

        a = custom_add(a, (c ^ (b | !d)), blocks[8], 1873313359)
        a = safe_add((a << 6 | unsignedRightShift(a, 26)), b << 0)
        d = custom_add(d, (b ^ (a | !c)), blocks[15], -30611744)
        d = safe_add((d << 10 | unsignedRightShift(d, 22)), a << 0)
        c = custom_add(c, (a ^ (d | !b)), blocks[6], -1560198380)
        c = safe_add((c << 15 | unsignedRightShift(c, 17)), d << 0)
        b = custom_add(b, (d ^ (c | !a)), blocks[13], 1309151649)
        b = safe_add((b << 21 | unsignedRightShift(b, 11)), c << 0)

        a = custom_add(a, (c ^ (b | !d)), blocks[4], -145523070)
        a = safe_add((a << 6 | unsignedRightShift(a, 26)), b << 0)
        d = custom_add(d, (b ^ (a | !c)), blocks[11], -1120210379)
        d = safe_add((d << 10 | unsignedRightShift(d, 22)), a << 0)
        c = custom_add(c, (a ^ (d | !b)), blocks[2], 718787259)
        c = safe_add((c << 15 | unsignedRightShift(c, 17)), d << 0)
        b = custom_add(b, (d ^ (c | !a)), blocks[9], -343485551)
        b = safe_add((b << 21 | unsignedRightShift(b, 11)), c << 0)

        if (first) {
            h0 = safe_add(a, 1732584193 << 0)
            h1 = safe_add(b, -(271733879 << 0))
            h2 = safe_add(c, -(1732584194 << 0))
            h3 = safe_add(d, 271733878 << 0)
            first = false
        } else {
            h0 = safe_add(h0, a << 0)
            h1 = safe_add(h1, b << 0)
            h2 = safe_add(h2, c << 0)
            h3 = safe_add(h3, d << 0)
        }
    }

    public func hex(): String {
        finalize()
        var hexString = StringBuilder()
        let h0_val = this.h0
        let h1_val = this.h1
        let h2_val = this.h2
        let h3_val = this.h3
        let values = [h0_val, h1_val, h2_val, h3_val]
        for (value in values) {
            for (shift in SHIFT) {
                // Get the lower and upper 4 bits of each byte
                hexString.append(HEX_CHARS[unsignedRightShift(value, (shift + 4)) & 0x0F])
                hexString.append(HEX_CHARS[unsignedRightShift(value, shift) & 0x0F])
            }
        }
        return hexString.toString()
    }

    public func toString(): String {
        return this.hex()
    }

    public func digest(): Array<Byte> {
        this.finalize()
        return [UInt8(h0 & 0xFF), UInt8(unsignedRightShift(h0, 8) & 0xFF), UInt8(unsignedRightShift(h0, 16) & 0xFF),
            UInt8(unsignedRightShift(h0, 24)) & 0xFF, UInt8(h1 & 0xFF), UInt8(unsignedRightShift(h1, 8) & 0xFF),
            UInt8(unsignedRightShift(h1, 16) & 0xFF), UInt8(unsignedRightShift(h1, 24)) & 0xFF, UInt8(h2 & 0xFF),
            UInt8(unsignedRightShift(h2, 8) & 0xFF), UInt8(unsignedRightShift(h2, 16) & 0xFF),
            UInt8(unsignedRightShift(h2, 24)) & 0xFF, UInt8(h3 & 0xFF), UInt8(unsignedRightShift(h3, 8) & 0xFF),
            UInt8(unsignedRightShift(h3, 16) & 0xFF), UInt8(unsignedRightShift(h3, 24)) & 0xFF]
    }

    public func array(): Array<Byte> {
        return this.digest()
    }

    public func arrayBuffer(): Array<Byte> {
        this.finalize()

        let buffer = Array<Byte>(16, {i => 0})
        buffer[0] = UInt8(h0 & 0xFF)
        buffer[1] = UInt8((h0 >> 8) & 0xFF)
        buffer[2] = UInt8((h0 >> 16) & 0xFF)
        buffer[3] = UInt8((h0 >> 24) & 0xFF)
        buffer[4] = UInt8(h1 & 0xFF)
        buffer[5] = UInt8((h1 >> 8) & 0xFF)
        buffer[6] = UInt8((h1 >> 16) & 0xFF)
        buffer[7] = UInt8((h1 >> 24) & 0xFF)
        buffer[8] = UInt8(h2 & 0xFF)
        buffer[9] = UInt8((h2 >> 8) & 0xFF)
        buffer[10] = UInt8((h2 >> 16) & 0xFF)
        buffer[11] = UInt8((h2 >> 24) & 0xFF)
        buffer[12] = UInt8(h3 & 0xFF)
        buffer[13] = UInt8((h3 >> 8) & 0xFF)
        buffer[14] = UInt8((h3 >> 16) & 0xFF)
        buffer[15] = UInt8((h3 >> 24) & 0xFF)
        return buffer
    }
}


public func calMd5(str: String): String {
    var md5Instance = Md5()
    md5Instance.update(str)
    md5Instance.hex()
}
