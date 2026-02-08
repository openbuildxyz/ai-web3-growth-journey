/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.utils.ohos

@When[ohos == "true"]
import ohos.ark_interop.*

@When[ohos == "true"]
public func call<A1>(context: JSContext, object: JSObject, method: String, arg1: A1): JSValue where A1 <: CJ2JS {
    return object.callMethod(method, [arg1.toJS(context)])
}

@When[ohos == "true"]
public func call<A1, A2>(context: JSContext, object: JSObject, method: String, arg1: A1, arg2: A2): JSValue where A1 <: CJ2JS, A2 <: CJ2JS {
    return object.callMethod(method, [arg1.toJS(context), arg2.toJS(context)])
}