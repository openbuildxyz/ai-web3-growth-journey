/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2024. All rights reserved.
 */
package magic.rag.splitter

import magic.core.rag.Document

public interface Splitter {
    func split(text: String): Array<Document>
}