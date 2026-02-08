/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.vdb

import std.core.LibC
import std.collection.ArrayList

@When[faiss == "enable"]
foreign {
    func faiss_IndexFlatL2_new_with(indexPtrPtr: CPointer<CPointer<Unit>>, d: Int64): Int32
    func faiss_Index_add(indexPtr: CPointer<Unit>, n: Int64, x: CPointer<Float32>): Int32
    func faiss_write_index_fname(idxPtr: CPointer<Unit>, fname: CString): Int32
    func faiss_read_index_fname(fname: CString, io_flags: Int32, p_out: CPointer<CPointer<Unit>>): Int32
    func faiss_Index_free(indexPtr: CPointer<Unit>): Unit
    func faiss_Index_search(indexPtr: CPointer<Unit>, n: Int64, x: CPointer<Float32>, k: Int64, distances: CPointer<Float32>, labels: CPointer<Int64>): Int32
    // func faiss_Index_ntotal(indexPtr: CPointer<Unit>): Int64
}

@When[faiss == "enable"]
public class FaissVectorDatabase <: VectorDatabase<FaissVectorDatabase> {
    private let faissIndexPtr: CPointer<CPointer<Unit>>

    private init(faissIndexPtr: CPointer<CPointer<Unit>>) {
        this.faissIndexPtr = faissIndexPtr
    }

    public init(dimension!: Int64 = 1536) {
        unsafe {
            faissIndexPtr = LibC.malloc<CPointer<Unit>>(count: 1)
            let status = faiss_IndexFlatL2_new_with(faissIndexPtr, dimension)
            if (status != 0) {
                throw VectorDatabaseException("Failed to open database.")
            }
        }
    }

    public func close(): Unit {
        unsafe {
            faiss_Index_free(faissIndexPtr.read())
            LibC.free(faissIndexPtr)
        }
    }

    public override func save(filePath: String): Unit {
        unsafe {
            let cPath: CString = LibC.mallocCString(filePath)
            let status = faiss_write_index_fname(faissIndexPtr.read(), cPath)
            LibC.free(cPath)
            if (status != 0) {
                throw VectorDatabaseException("Failed to write faiss database.")
            }
        }
    }

    public static redef func load(filePath: String): FaissVectorDatabase {
        let faissIndexPtr: CPointer<CPointer<Unit>>
        unsafe {
            faissIndexPtr = LibC.malloc<CPointer<Unit>>(count: 1)
            let cPath: CString = LibC.mallocCString(filePath)
            let ret = faiss_read_index_fname(cPath, 1, faissIndexPtr)
            LibC.free(cPath)
            if (ret != 0) {
                throw Exception("Failed to open faiss database.")
            }
            // let ntotal = faiss_Index_ntotal(faissIndexPtr.read())
        }
        return FaissVectorDatabase(faissIndexPtr)
    }

    private func toFaissVector(source: Vector): VArray<Float32, $1536> {
        var v = VArray<Float32, $1536>({_: Int64 => 0.0})
        for (i in 0..source.vector.size) {
            v[i] = Float32(source.vector[i])
        }
        return v
    }

    public override func addVector(vector: Vector): Unit {
        var vec: VArray<Float32, $1536> = toFaissVector(vector)
        let ret = unsafe {
            faiss_Index_add(faissIndexPtr.read(), 1, inout vec)
        }
        // return Int64(ret)
    }

    public override func search(queryVec: Vector, number!: Int64 = 5, minDistance!: Float64 = 0.6): Array<SearchResult> {
        var queryFaissVec = toFaissVector(queryVec)
        let result = ArrayList<SearchResult>()
        let N = 1 // number of querys
        unsafe {
            // Allocate memory
            let distancePtr = LibC.malloc<Float32>(count: N * number)
            let indexPtr = LibC.malloc<Int64>(count: N * number)
            // Call the API
            let status = faiss_Index_search(faissIndexPtr.read(), N, inout queryFaissVec, number, distancePtr, indexPtr)
            if (status != 0) {
                throw VectorDatabaseException("Failed to search faiss database.")
            }
            for (i in 0..number) {
                let dist = distancePtr.read(i)
                if (Float64(dist) < minDistance) {
                    break
                }
                let index = indexPtr.read(i)
                result.add(SearchResult(index, Float64(dist)))
            }
            LibC.free(distancePtr)
            LibC.free(indexPtr)
        }
        return result.toArray()
    }
}