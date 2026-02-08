/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.utils

import std.database.sql.SqlException

@When[sqlite == "enable"]
foreign {
    func malloc(size: UIntNative): CPointer<Unit>
    func free(p: CPointer<Unit>): Unit
    func sqlite3_open(path: CString, ppDb: CPointer<CPointer<Unit>>): Int32
    func sqlite3_prepare_v2(pDb: CPointer<Unit>, zSql: CString, nBytes: Int32,
                            ppStmt: CPointer<CPointer<Unit>>, pzTail: CPointer<Unit>): Int32
    func sqlite3_step(pStmt: CPointer<Unit>): Int32
    func sqlite3_column_bytes(pStmt: CPointer<Unit>, i: Int32): Int32
    func sqlite3_column_text(pStmt: CPointer<Unit>, i: Int32): CString
    func sqlite3_column_type(pStmt: CPointer<Unit>, i: Int32): Int32
    func sqlite3_column_int64(pStmt: CPointer<Unit>, i: Int32): Int64
    func sqlite3_column_blob(pStmt: CPointer<Unit>, i: Int32): CPointer<Unit>
    func sqlite3_column_count(pStmt: CPointer<Unit>): Int32
    func sqlite3_column_name(pStmt: CPointer<Unit>, n: Int32): CString
    func sqlite3_column_decltype(pStmt: CPointer<Unit>, i: Int32): CString
    func sqlite3_column_double(pStmt: CPointer<Unit>, i: Int32): Float64
    func sqlite3_reset(pStmt: CPointer<Unit>): Int32
    func sqlite3_busy_timeout(pDb: CPointer<Unit>, ms: Int32): Int32
    func sqlite3_changes(pDb: CPointer<Unit>): Int32
    func sqlite3_last_insert_rowid(pDb: CPointer<Unit>): Int64
    func sqlite3_soft_heap_limit(n: Int32): Unit
    func sqlite3_bind_parameter_count(pStmt: CPointer<Unit>): Int32
    func sqlite3_bind_null(pStmt: CPointer<Unit>, i: Int32): Int32
    func sqlite3_bind_int(pStmt: CPointer<Unit>, i: Int32, iValue: Int32): Int32
    func sqlite3_bind_int64(pStmt: CPointer<Unit>, i: Int32, iValue: Int64): Int32
    func sqlite3_bind_double(pStmt: CPointer<Unit>, i: Int32, rValue: Float64): Int32
    func sqlite3_bind_text(pStmt: CPointer<Unit>, i: Int32, zData: CString,
    nData: Int32, xDel: CPointer<Unit>): Int32
    func sqlite3_clear_bindings(pStmt: CPointer<Unit>): Int32
    func sqlite3_exec(pDb: CPointer<Unit>, zSql: CString,
    xCallback: CPointer<Unit>, pArg: CPointer<Unit>, pzErrMsg: CPointer<CString>): Int32
    func sqlite3_close(pDb: CPointer<Unit>): Int32
    func sqlite3_finalize(pStmt: CPointer<Unit>): Int32
}

/* 指针类型占内存字节数 */
private let POINTER_SIZE: UIntNative = 8

@When[sqlite == "enable"]
protected struct SqliteUtils {

    /* sqlite3_step() 还未完成执行 */
    public static let SQLITE_ROW: Int32 = 100

    /* sqlite3_step() 已执行完成 */
    public static let SQLITE_DONE: Int32 = 101

    /*
    * Description: 打开数据库db文件
    */
    public static func sqlOpen(path: String): CPointer<CPointer<Unit>> {
        let ppDb: CPointer<CPointer<Unit>>
        unsafe {
            let ptr = malloc(POINTER_SIZE)
            ppDb = CPointer<CPointer<Unit>>(ptr)
            let cPath : CString= LibC.mallocCString(path)
            let ret = sqlite3_open(cPath, ppDb)
            LibC.free(cPath)
            if (ret != 0) {
                throw SqlException("Failed to open database.")
            }
        }
        return ppDb
    }

    /*
    * Description: 预处理sql语句
    */
    public static func sqlPrepare(ppDb: CPointer<CPointer<Unit>>, sql: String): CPointer<CPointer<Unit>> {
        let ppStmt: CPointer<CPointer<Unit>>
        unsafe {
            let ptr = malloc(POINTER_SIZE)
            ppStmt = CPointer<CPointer<Unit>>(ptr)
            let zSql  : CString= LibC.mallocCString(sql)
            let nullptr = CPointer<Unit>()
            let ret = sqlite3_prepare_v2(ppDb.read(), zSql, Int32(sql.size), ppStmt, nullptr)
            LibC.free(zSql)
            if (ret != 0) {
                throw SqlException("Failed to prepare statement.")
            }
        }
        return ppStmt
    }

    /**
    * Description: 执行sql语句
    */
    public static func sqlStep(ppStmt: CPointer<CPointer<Unit>>): Int32 {
        return unsafe { sqlite3_step(ppStmt.read()) }
    }

    /**
    * Description: 获取sql结果指定列的数据类型
    */
    public static func sqlColumnType(ppStmt: CPointer<CPointer<Unit>>, i: Int32): Int32 {
        return unsafe { sqlite3_column_type(ppStmt.read(), i) }
    }

    /**
    * Description: 获取sql结果指定文本类型列的值
    */
    public static func sqlColumnText(ppStmt: CPointer<CPointer<Unit>>, i: Int32): String {
        let ret = unsafe { sqlite3_column_text(ppStmt.read(), i) }
        return ret.toString()
    }

    /**
    * Description: 获取sql结果指定列值的字节数
    */
    public static func sqlColumnBytes(ppStmt: CPointer<CPointer<Unit>>, i: Int32): Int32 {
        return unsafe { sqlite3_column_bytes(ppStmt.read(), i) }
    }

    /**
    * Description: 获取sql结果指定Int64类型列的值
    */
    public static func sqlColumnInt64(ppStmt: CPointer<CPointer<Unit>>, i: Int32): Int64 {
        return unsafe { sqlite3_column_int64(ppStmt.read(), i) }
    }

    /**
    * Description: 获取sql结果指定Float64类型列的值
    */
    public static func sqlColumnDouble(ppStmt: CPointer<CPointer<Unit>>, i: Int32): Float64 {
        return unsafe { sqlite3_column_double(ppStmt.read(), i) }
    }

    /**
    * Description: 获取sql结果blob类型列的值
    */
    public static func sqlColumnBlob(ppStmt: CPointer<CPointer<Unit>>, i: Int32): CPointer<Unit> {
        return unsafe { sqlite3_column_blob(ppStmt.read(), i) }
    }

    /**
    * Description: 获取sql结果列数
    */
    public static func sqlColumnCount(ppStmt: CPointer<CPointer<Unit>>): Int32 {
        return unsafe { sqlite3_column_count(ppStmt.read()) }
    }

    /**
    * Description: 获取sql结果指定列名
    */
    public static func sqlColumnName(ppStmt: CPointer<CPointer<Unit>>, n: Int32): String {
        let ret = unsafe { sqlite3_column_name(ppStmt.read(), n) }
        return ret.toString()
    }

    /**
    * Description: 获取sql结果指定列声明的数据类型
    */
    public static func sqlColumnDecltype(ppStmt: CPointer<CPointer<Unit>>, i: Int32): String {
        let ret = unsafe { sqlite3_column_decltype(ppStmt.read(), i) }
        return ret.toString()
    }

    /**
    * Description: 重置sql语句
    */
    public static func sqlReset(ppStmt: CPointer<CPointer<Unit>>): Int32 {
        return unsafe { sqlite3_reset(ppStmt.read()) }
    }

    /**
    * Description: 设置超时毫秒数
    */
    public static func sqlBusyTimeout(ppDb: CPointer<CPointer<Unit>>, ms: Int32): Int32 {
        return unsafe { sqlite3_busy_timeout(ppDb.read(), ms) }
    }

    /*
    * Description: 获取最近执行的sql语句的修改数量
    */
    public static func sqlChanges(ppDb: CPointer<CPointer<Unit>>): Int32 {
        return unsafe { sqlite3_changes(ppDb.read()) }
    }

    /**
    * Description: 获取最近插入行的ID
    */
    public static func sqlLastInsertRowid(ppDb: CPointer<CPointer<Unit>>): Int64 {
        return unsafe { sqlite3_last_insert_rowid(ppDb.read()) }
    }

    /**
    * Description: 设置堆内存上限
    */
    public static func sqlSoftHeapLimit(n: Int32): Unit {
        unsafe { sqlite3_soft_heap_limit(n) }
    }

    /**
    * Description: 获取sql语句绑定参数数量
    */
    public static func sqlBindParameterCount(ppStmt: CPointer<CPointer<Unit>>): Int32 {
        return unsafe { sqlite3_bind_parameter_count(ppStmt.read()) }
    }

    /**
    * Description: 绑定空值到sql语句指定参数
    */
    public static func sqlBindNull(ppStmt: CPointer<CPointer<Unit>>, i: Int32): Int32 {
        return unsafe { sqlite3_bind_null(ppStmt.read(), i) }
    }

    /**
    * Description: 绑定Int32值到sql语句指定参数
    */
    public static func sqlBindInt(ppStmt: CPointer<CPointer<Unit>>, i: Int32, iValue: Int32): Int32 {
        return unsafe { sqlite3_bind_int(ppStmt.read(), i, iValue) }
    }

    /**
    * Description: 绑定Int64值到sql语句指定参数
    */
    public static func sqlBindInt64(ppStmt: CPointer<CPointer<Unit>>, i: Int32, iValue: Int64): Int32 {
        return unsafe { sqlite3_bind_int64(ppStmt.read(), i, iValue) }
    }

    /**
    * Description: 绑定Float64值到sql语句指定参数
    */
    public static func sqlBindDouble(ppStmt: CPointer<CPointer<Unit>>, i: Int32, rValue: Float64): Int32 {
        return unsafe { sqlite3_bind_double(ppStmt.read(), i, rValue) }
    }

    /**
    * Description: 绑定文本值到sql语句指定参数
    */
    public static func sqlBindText(ppStmt: CPointer<CPointer<Unit>>, i: Int32, data: String) {
        let ret: Int32
        unsafe {
            let zData : CString= LibC.mallocCString(data)
            let nullptr = CPointer<Unit>()
            ret = sqlite3_bind_text(ppStmt.read(), i, zData, Int32(data.size), nullptr)
            LibC.free(zData)
        }
        return ret
    }

    /**
    * Description: 解除sql语句绑定参数
    */
    public static func sqlClearBindings(ppStmt: CPointer<CPointer<Unit>>): Int32 {
        return unsafe { sqlite3_clear_bindings(ppStmt.read()) }
    }

    /**
    * Description: 指定数据库执行sql命令
    */
    public static func sqlExec(ppDb: CPointer<CPointer<Unit>>, sql: String) {
        unsafe {
            let zSql : CString= LibC.mallocCString(sql)
            let nullptr = CPointer<Unit>()
            let ptr = malloc(POINTER_SIZE)
            let pzErrMsg = CPointer<CString>(ptr)
            let ret = sqlite3_exec(ppDb.read(), zSql, nullptr, nullptr, pzErrMsg)
            let errMsg = pzErrMsg.read().toString()
            free(ptr)
            LibC.free(zSql)
            if (ret != 0) {
                throw SqlException(errMsg)
            }
        }
    }

    /**
    * Description: 关闭数据库连接
    */
    public static func sqlClose(ppDb: CPointer<CPointer<Unit>>): Int32 {
        let ret: Int32
        unsafe {
            ret = sqlite3_close(ppDb.read())
            free(CPointer<Unit>(ppDb))
        }
        return ret
    }

    /**
    * Description: 销毁sql语句对象，释放内存
    */
    public static func sqlFinalize(ppStmt: CPointer<CPointer<Unit>>): Int32 {
        let ret: Int32
        unsafe {
            ret = sqlite3_finalize(ppStmt.read())
            free(CPointer<Unit>(ppStmt))
        }
        return ret
    }
}

@When[sqlite != "enable"]
protected struct SqliteUtils {

    /* sqlite3_step() 还未完成执行 */
    public static let SQLITE_ROW: Int32 = 100

    /* sqlite3_step() 已执行完成 */
    public static let SQLITE_DONE: Int32 = 101

    public static func sqlOpen(path: String): CPointer<CPointer<Unit>> {
        throw UnsupportedException()
    }

    public static func sqlPrepare(ppDb: CPointer<CPointer<Unit>>, sql: String): CPointer<CPointer<Unit>> {
        throw UnsupportedException()
    }

    public static func sqlStep(ppStmt: CPointer<CPointer<Unit>>): Int32 {
        throw UnsupportedException()
    }

    public static func sqlColumnType(ppStmt: CPointer<CPointer<Unit>>, i: Int32): Int32 {
        throw UnsupportedException()
    }

    public static func sqlColumnText(ppStmt: CPointer<CPointer<Unit>>, i: Int32): String {
        throw UnsupportedException()
    }

    public static func sqlColumnBytes(ppStmt: CPointer<CPointer<Unit>>, i: Int32): Int32 {
        throw UnsupportedException()
    }

    public static func sqlColumnInt64(ppStmt: CPointer<CPointer<Unit>>, i: Int32): Int64 {
        throw UnsupportedException()
    }

    public static func sqlColumnDouble(ppStmt: CPointer<CPointer<Unit>>, i: Int32): Float64 {
        throw UnsupportedException()
    }

    public static func sqlColumnBlob(ppStmt: CPointer<CPointer<Unit>>, i: Int32): CPointer<Unit> {
        throw UnsupportedException()
    }

    public static func sqlColumnCount(ppStmt: CPointer<CPointer<Unit>>): Int32 {
        throw UnsupportedException()
    }

    public static func sqlColumnName(ppStmt: CPointer<CPointer<Unit>>, n: Int32): String {
        throw UnsupportedException()
    }

    public static func sqlColumnDecltype(ppStmt: CPointer<CPointer<Unit>>, i: Int32): String {
        throw UnsupportedException()
    }

    public static func sqlReset(ppStmt: CPointer<CPointer<Unit>>): Int32 {
        throw UnsupportedException()
    }

    public static func sqlBusyTimeout(ppDb: CPointer<CPointer<Unit>>, ms: Int32): Int32 {
        throw UnsupportedException()
    }

    public static func sqlChanges(ppDb: CPointer<CPointer<Unit>>): Int32 {
        throw UnsupportedException()
    }

    public static func sqlLastInsertRowid(ppDb: CPointer<CPointer<Unit>>): Int64 {
        throw UnsupportedException()
    }

    public static func sqlSoftHeapLimit(n: Int32): Unit {
        throw UnsupportedException()
    }

    public static func sqlBindParameterCount(ppStmt: CPointer<CPointer<Unit>>): Int32 {
        throw UnsupportedException()
    }

    public static func sqlBindNull(ppStmt: CPointer<CPointer<Unit>>, i: Int32): Int32 {
        throw UnsupportedException()
    }

    public static func sqlBindInt(ppStmt: CPointer<CPointer<Unit>>, i: Int32, iValue: Int32): Int32 {
        throw UnsupportedException()
    }

    public static func sqlBindInt64(ppStmt: CPointer<CPointer<Unit>>, i: Int32, iValue: Int64): Int32 {
        throw UnsupportedException()
    }

    public static func sqlBindDouble(ppStmt: CPointer<CPointer<Unit>>, i: Int32, rValue: Float64): Int32 {
        throw UnsupportedException()
    }

    public static func sqlBindText(ppStmt: CPointer<CPointer<Unit>>, i: Int32, data: String) {
        throw UnsupportedException()
    }

    public static func sqlClearBindings(ppStmt: CPointer<CPointer<Unit>>): Int32 {
        throw UnsupportedException()
    }

    public static func sqlExec(ppDb: CPointer<CPointer<Unit>>, sql: String) {
        throw UnsupportedException()
    }

    public static func sqlClose(ppDb: CPointer<CPointer<Unit>>): Int32 {
        throw UnsupportedException()
    }

    public static func sqlFinalize(ppStmt: CPointer<CPointer<Unit>>): Int32 {
        throw UnsupportedException()
    }
}