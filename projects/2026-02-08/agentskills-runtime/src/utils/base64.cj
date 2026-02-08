/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.utils

import std.fs.Path
import stdx.encoding.base64.toBase64String

public func imageFileToBase64(path: String, head!: Bool = true): String {
    let bytesBuf = readFile(Path(path)).toArray()
    let image = toBase64String(bytesBuf)
    if (head) {
        let idx = path.lastIndexOf(".")
        let fileType: String = match (idx){
            case Some(val) => path[val+1..].toAsciiLower()
            case None => "jpeg"
        }
        return "data:image/${fileType};base64,${image}"
    }
    return image
}
