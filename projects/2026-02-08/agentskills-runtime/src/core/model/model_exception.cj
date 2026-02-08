/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.model

public class ModelException <: Exception {
    public ModelException(
        public let error: String
    ) { super(error) }
}
