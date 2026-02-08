/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.rag

import magic.dsl.*
import magic.core.*
import magic.jsonable.*
import magic.agent.*
import magic.agent.base.*
import magic.agent_executor.AgentExecutorManager
import magic.prompt.*
import magic.model.*
import magic.utils.*
import magic.memory.*
import magic.tool.*
import magic.log.LogUtils

import stdx.encoding.json.JsonValue
import std.collection.{ArrayList, HashMap}

private func doSqliteQuery(ppDb: CPointer<CPointer<Unit>>, query: String): String {
    let ppStmt = SqliteUtils.sqlPrepare(ppDb, query)
    try {
        let result = ArrayList<String>()
        let columnCount = SqliteUtils.sqlColumnCount(ppStmt)
        while (SqliteUtils.sqlStep(ppStmt) != SqliteUtils.SQLITE_DONE) {
            for (i in 0..columnCount) {
                result.add(SqliteUtils.sqlColumnText(ppStmt, i))
            }
        }
        return result.toString()
    } finally {
        SqliteUtils.sqlFinalize(ppStmt)
    }
}

@agent[
    tools: [executeQuery],
    memory: false
]
class SqliteAgent {
    var schema = ""

    SqliteAgent(
        let dbPath: String,
        let table!: String = ""
    ) { }

    @prompt[pattern: RISE](
        role: "你是 SQLite 专家，根据用户问题从数据库中查找内容。",
        input: "用户想要查找的问题",
        steps: """
            从数据库中获取想要查找的表的 schema 信息和对应的样本数据，
            然后根据 schema 信息和对应的样本数据，生成正确的 SQLite 查询语句，执行查询语句，并返回查询结果。
            如果查询失败，可以再次生成新的查询语句进行尝试；最多尝试次数5次。
            如果用户没有指定查询个数，默认查找十个。
            禁止直接回答用户问题，禁止修改用户查询结果。
            """,
        expectation: "生成正确的 SQLite 查询语句，执行查询语句，并直接返回 JSON 格式的查询结果，结果必须要包含 column 名。禁止修改用户查询结果。"
    )

    @tool[
        description: "从数据库中获取表的 schema 信息和样本数据",
    ]
    func getSchemaAndSampleData(): String {
        if (this.schema != "") {
            return this.schema
        }
        let sql = "SELECT name, sql FROM sqlite_master WHERE type ='table'"
        let ppDb: CPointer<CPointer<Unit>> = SqliteUtils.sqlOpen(this.dbPath)
        let ppStmt = SqliteUtils.sqlPrepare(ppDb, sql)

        let result: ArrayList<String> = ArrayList<String>()
        // If the table is specified, sample data from the table
        // Otherwise, fetch all table schema
        try {
            if (this.table.isEmpty()) {
                while (SqliteUtils.sqlStep(ppStmt) != SqliteUtils.SQLITE_DONE) {
                    result.add(SqliteUtils.sqlColumnText(ppStmt, 1))
                }
            } else {
                let tables = this.table.split(",")
                // Iterate all tables
                while (SqliteUtils.sqlStep(ppStmt) != SqliteUtils.SQLITE_DONE) {
                    let currTable = SqliteUtils.sqlColumnText(ppStmt, 0)
                    if (tables.contains(currTable)) {
                        result.add(SqliteUtils.sqlColumnText(ppStmt, 1))
                        // LogUtils.info(currTable)
                        // Sample the first 5 rows
                        let data = doSqliteQuery(ppDb, "SELECT * FROM ${currTable} LIMIT 5")
                        result.add(data)
                        // LogUtils.info(data)
                    }
                }
            }
        } finally {
            SqliteUtils.sqlFinalize(ppStmt)
            SqliteUtils.sqlClose(ppDb)
        }
        this.schema = result.toString()
        // LogUtils.info(schema)
        return this.schema
    }

    @tool[
        description: "在数据库中执行对应的sql查询语句，然后返回查询结果",
        parameters: {
            query: "要执行的sql语句"
        }
    ]
    private func executeQuery(query: String): String {
        let ppDb: CPointer<CPointer<Unit>> = SqliteUtils.sqlOpen(this.dbPath)
        try {
            return doSqliteQuery(ppDb, query)
        } finally {
            SqliteUtils.sqlClose(ppDb)
        }
    }
}
