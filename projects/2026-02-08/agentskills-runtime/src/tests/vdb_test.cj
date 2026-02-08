/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.tests

import magic.vdb.*
import magic.model.{ModelUtils, ModelManager}
import magic.utils.removeIfExists

import std.fs.Directory
import std.unittest.testmacro.Assert

@When[faiss == "enable"]
@Test
class TestVDB {
    let tempDir = Directory.createTemp(".")
    let vdbPath = tempDir.join("test_vdb.db")
    let indexPath = tempDir.join("test_vdb.index")
    let model = ModelManager.createEmbeddingModel(OLLAMA_EMBEDDING_MODEL)
                // ModelManager.createEmbeddingModel("openai:text-embedding-ada-002")

    @TestCase
    func testFaiss(): Unit {
        let a = "第一条向量"
        let b = "第二条向量"
        let c = "第三条向量"

        let faissDB = FaissVectorDatabase()
        let indexMap = SimpleIndexMap()
        let vecBuilder = VectorBuilder(model: model)
        faissDB.addVector(vecBuilder.createEmbeddingVector(a))
        indexMap.add(a)
        faissDB.addVector(vecBuilder.createEmbeddingVector(b))
        indexMap.add(b)

        faissDB.save(vdbPath.toString())
        faissDB.close()
        indexMap.save(indexPath.toString())

        let faissDB2 = FaissVectorDatabase.load(vdbPath.toString())
        let indexMap2 = SimpleIndexMap.load(indexPath.toString())

        faissDB2.addVector(vecBuilder.createEmbeddingVector(c))
        indexMap2.add(c)

        let query = "帮我寻找第二条向量和第三条向量"

        let result = faissDB2.search(vecBuilder.createEmbeddingVector(query), number: 2, minDistance: 0.0)
        @Assert(result.size == 2)
        @Assert(result[0].index + result[1].index == 3)

        faissDB2.save(vdbPath.toString())
        indexMap2.save(indexPath.toString())
        faissDB2.close()
    }

    @AfterAll
    func cleanup(): Unit {
        removeIfExists(vdbPath)
        removeIfExists(indexPath)
    }

    @TestCase
    func testSemanticMap(): Unit {
        let smap = SemanticMap(vectorDB: InMemoryVectorDatabase(),
                               indexMap: SimpleIndexMap(),
                               embeddingModel: model)
        smap.put("前往上海", "Plan A")
        smap.put("吃饭", "Plan B")
        smap.put("前往北京", "Plan C")
        smap.put("睡觉", "Plan D")

        let c = smap.search("前往上海", number: 2)
        @Assert(c, ["Plan A", "Plan C"])
    }
}