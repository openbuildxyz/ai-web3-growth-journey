/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.utils

@When[cjc_version < "1.0.0"]
import std.time.Duration
@When[cjc_version < "1.0.0"]
import std.sync.sleep

@When[cjc_version < "1.0.0"]
import std.os.process.{Process, ProcessRedirect, SubProcess}
//--------------------------------------------------------
@When[cjc_version >= "1.0.0"]
import std.process.{launch, ProcessRedirect, SubProcess}

import std.env.{getVariable, setVariable, getVariables}
//======================================================

@When[cjc_version < "1.0.0"]
import std.os.getEnv as stdGetEnv
@When[cjc_version < "1.0.0"]
import std.os.setEnv as stdSetEnv

import std.collection.HashMap

@When[cjc_version < "1.0.0"]
protected func getEnv(envVarName: String): Option<String> {
    stdGetEnv(envVarName)
}
@When[cjc_version >= "1.0.0"]
protected func getEnv(envVarName: String): Option<String> {
    getVariable(envVarName)
}

@When[cjc_version < "1.0.0"]
protected func setEnv(envVarName: String, value: String): Unit {
    stdSetEnv(envVarName, value)
}
@When[cjc_version >= "1.0.0"]
protected func setEnv(envVarName: String, value: String): Unit {
    setVariable(envVarName, value)
}

protected func newProcess(name: String, args: Array<String>, env!: Array<(String, String)> = [], redirectErr!: Bool = true): SubProcess {
    let allEnv = HashMap(getVariables())
    allEnv.add(all: env)
    if (redirectErr) {
        return launch(
            name, args,
            environment: allEnv,
            stdIn: ProcessRedirect.Pipe,
            stdOut: ProcessRedirect.Pipe,
            stdErr: ProcessRedirect.Pipe
        )
    } else {
        return launch(
            name, args,
            environment: allEnv,
            stdIn: ProcessRedirect.Pipe,
            stdOut: ProcessRedirect.Pipe
        )
    }
}

protected func sleep2(ms: Int64): Unit {
    sleep(Duration.millisecond * ms)
}

@When[os == "Windows"]
foreign {
    func GetCommandLineW(): CPointer<UInt16>

    func CommandLineToArgvW(
        lpCmdLine: CPointer<UInt16>,
        pNumArgs: CPointer<IntNative>
    ): CPointer<CPointer<UInt16>>

    func LocalFree(ptr: CPointer<CPointer<UInt16>>): Unit

    func WideCharToMultiByte(
        CodePage: UIntNative,
        dwFlags: UInt32,
        lpWideCharStr: CPointer<UInt16>,
        cchWideChar: IntNative,
        lpMultiByteStr: CPointer<Byte>,
        cbMultiByte: IntNative,
        lpDefaultChar: CPointer<Unit>,
        lpUsedDefaultChar: CPointer<Unit>
    ): IntNative
}

@When[os == "Windows"]
unsafe func convertToUtf8(wideStr: CPointer<UInt16>): String {
    let NULL = CPointer<Unit>()
    let CP_UTF8: UIntNative = 65001
    // Compute the length of UTF8 bytes (including null terminator)
    let lenWithNull = WideCharToMultiByte(CP_UTF8, 0, wideStr, -1, CPointer<Byte>(), 0, NULL, NULL)
    // The actual string length without null terminator
    let len = lenWithNull - 1

    if (len <= 0) {
        return ""
    }

    // Allocate memory
    let utf8bytes = LibC.malloc<Byte>(count: Int64(lenWithNull))
    try {
        // Convert to UTF8 bytes
        WideCharToMultiByte(CP_UTF8, 0, wideStr, -1, utf8bytes, lenWithNull, NULL, NULL)
        // Convert to String, excluding the null terminator
        return String.fromUtf8(
            Array<Byte>(Int64(len), { i => utf8bytes.read(i) })
        )
    } finally {
        LibC.free(utf8bytes)
    }
}

@When[os == "Windows"]
public func winGetArgs(): Array<String> {
    var numArgs: IntNative = 0
    let argv: CPointer<CPointer<UInt16>>
    // Get arguments via Windows APIs
    unsafe {
        let cmdLine = GetCommandLineW()
        argv = CommandLineToArgvW(cmdLine, inout numArgs)
    }
    // Convert arguments to UTF8 strings
    // The first argument is the commandline, skip it
    return Array<String>(Int64(numArgs) - 1, { i =>
        let index = i + 1
        let wCharPtr = unsafe { argv.read(Int64(index)) }
        unsafe { convertToUtf8(wCharPtr) }
    })
}