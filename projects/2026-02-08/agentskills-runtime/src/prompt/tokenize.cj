/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.prompt

@When[llamacpp == "enable"]
foreign {
    /**
     * Load the vocab model
     */
    func doInit(modelPath: CString): Unit

    /**
     * Free the vocab model
     */
    func doFini(): Unit

    /**
     * Compute the number of tokens in the prompt
     */
    func tokenize(prompt: CString): Int64
}

@When[llamacpp == "enable"]
protected struct TokenizeUtils {
    protected static func doInit(modelPath: String): Unit {
        unsafe {
            let p = LibC.mallocCString(modelPath)
            doInit(p)
            LibC.free(p)
        }
    }

    protected static func doFini(): Unit {
        unsafe { doFini() }
    }

    protected static func computeTokenSize(prompt: String): Int64 {
        var result = 0
        unsafe {
            let p = LibC.mallocCString(prompt)
            result = tokenize(p)
            LibC.free(p)
        }
        return result
    }
}