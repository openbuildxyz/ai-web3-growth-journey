/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.utils.ohos

import std.collection.concurrent.BlockingQueue
@When[ohos == "true"]
import ohos.ark_interop.*

@When[ohos == "true"]
public func await<T>(context: JSContext, promise: JSPromise): T where T <: JS2CJ<T> {
    let queue = BlockingQueue<Option<T>>()
    context.postJSTask {
        promise.then(
            context.function { context, callInfo =>
                let result = T.fromJS(callInfo[0])
                queue.enqueue(result)
                return context.undefined().toJSValue()
            },
            onRejected: context.function { context, callInfo =>
                queue.enqueue(None)
                return context.undefined().toJSValue()
            }
        )
    }
    return queue.dequeue().getOrThrow()
}