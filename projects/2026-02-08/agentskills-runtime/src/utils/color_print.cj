/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.utils

import std.collection.{map, collectArray}

const BEGIN = "\u{1b}["
const RESET = "\u{1b}[0m"

protected enum Color <: ToString {
    | Red
    | Green
    | Yellow
    | Blue
    | Magenta
    | Cyan
    | Bold

    override public func toString(): String {
        match (this) {
            case Red     => "31"
            case Green   => "32"
            case Yellow  => "33"
            case Blue    => "34"
            case Magenta => "35"
            case Cyan    => "36"
            case Bold    => "1"
        }
    }
}

protected interface Colorful {
    func withColor(color: Color): String
}

extend String <: Colorful {
    public func withColor(color: Color): String {
        return "${BEGIN}${color}m${this}${RESET}"
    }

    public func withColors(colors: Array<Color>): String {
        let color = String.join(
            colors |> map { c => c.toString() } |> collectArray,
            delimiter: ";"
        )
        return "${BEGIN}${color}m${this}${RESET}"
    }

    public func bold(): String {
        return this.withColor(Color.Bold)
    }
}