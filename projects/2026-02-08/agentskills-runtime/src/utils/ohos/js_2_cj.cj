/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.utils.ohos

@When[ohos == "true"]
import ohos.ark_interop.*

@When[ohos == "true"]
public interface JS2CJ<T> {
    static func fromJS(jsValue: JSValue): T
}

@When[ohos == "true"]
extend Int64 <: JS2CJ<Int64> {
    public static func fromJS(jsValue: JSValue): Int64 {
        return Int64(jsValue.asNumber().toFloat64())
    }
}

@When[ohos == "true"]
extend Int32 <: JS2CJ<Int32> {
    public static func fromJS(jsValue: JSValue): Int32 {
        return Int32(jsValue.asNumber().toFloat64())
    }
}

@When[ohos == "true"]
extend Float64 <: JS2CJ<Float64> {
    public static func fromJS(jsValue: JSValue): Float64 {
        return jsValue.asNumber().toFloat64()
    }
}

@When[ohos == "true"]
extend String <: JS2CJ<String> {
    public static func fromJS(jsValue: JSValue): String {
        return jsValue.asString().toString()
    }
}

@When[ohos == "true"]
extend<T> Array<T> <: JS2CJ<Array<T>> where T <: JS2CJ<T> {
    public static func fromJS(jsValue: JSValue): Array<T> {
        let jsArr = jsValue.asArray()
        return Array<T>(jsArr.size, { i: Int64 =>
            T.fromJS(jsArr[i])
        })
    }
}

@When[ohos == "true"]
extend JSObject <: JS2CJ<JSObject> {
    public static func fromJS(jsValue: JSValue): JSObject {
        return jsValue.asObject()
    }
}
