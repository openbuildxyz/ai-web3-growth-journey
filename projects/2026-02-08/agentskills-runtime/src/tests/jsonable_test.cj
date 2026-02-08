/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.tests

import magic.dsl.*
import magic.prelude.*
import std.collection.{ArrayList, HashMap}
import std.unittest.testmacro.PowerAssert
import std.unittest.testmacro.BeforeAll

@jsonable
private class NestedData {
    let f1: String
    let f2: Int64
    let f3: Float64
}

@jsonable
private class Data {
    let f4: Option<String>
    let f5: Array<NestedData>
    let f6: ArrayList<String>
    let f7: HashMap<String, NestedData>
}

@Test
class TestJsonable {
    @TestCase
    func test() {
        let nest = NestedData(f1: "f1", f2: 2, f3: 0.0)
        let data = Data(
            f4: "f4",
            f5: [nest],
            f6: ArrayList<String>(["f6"]),
            f7: HashMap<String, NestedData>([("f7", nest)])
        )
        let js = data.toJsonValue().toJsonString()
        let jv = JsonValue.fromStr(js)
        let data2 = Data.fromJsonValue(jv)
        @Assert(data2.f7["f7"].f1, data.f7["f7"].f1)
        @Assert(data2.f7["f7"].f2, data.f7["f7"].f2)
        @Assert(data2.f7["f7"].f3, data.f7["f7"].f3)
    }
}