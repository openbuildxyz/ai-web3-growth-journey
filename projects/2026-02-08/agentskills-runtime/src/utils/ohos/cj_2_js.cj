/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.utils.ohos

@When[ohos == "true"]
import ohos.ark_interop.*

@When[ohos == "true"]
public interface CJ2JS {
    func toJS(context: JSContext): JSValue
}

@When[ohos == "true"]
extend Int64 <: CJ2JS {
    public func toJS(context: JSContext): JSValue {
        return context.number(Float64(this)).toJSValue()
    }
}

@When[ohos == "true"]
extend Int32 <: CJ2JS {
    public func toJS(context: JSContext): JSValue {
        return context.number(Float64(this)).toJSValue()
    }
}

@When[ohos == "true"]
extend Float64 <: CJ2JS {
    public func toJS(context: JSContext): JSValue {
        return context.number(this).toJSValue()
    }
}

@When[ohos == "true"]
extend String <: CJ2JS {
    public func toJS(context: JSContext): JSValue {
        return context.string(this).toJSValue()
    }
}

@When[ohos == "true"]
extend<T> Array<T> <: CJ2JS where T <: CJ2JS {
    public func toJS(context: JSContext): JSValue {
        return context.array(
            Array<JSValue>(this.size, { i: Int64 =>
                this[i].toJS(context)
            })
        ).toJSValue()
    }
}

@When[ohos == "true"]
extend JSObject <: CJ2JS {
    public func toJS(context: JSContext): JSValue {
        return this.toJSValue()
    }
}
