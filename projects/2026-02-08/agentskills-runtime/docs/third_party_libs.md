## Third-party Libraries

Following the instructions to build dynamic libs and put all these libs to the dir `libs`。

### Sqlite

```bash
git clone https://github.com/sqlite/sqlite.git
cd sqlite
bash configure
make sqlite3.c
gcc sqlite3.c -fPIC -shared -DSQLITE_ENABLE_JSON1 -o libsqlite.so
```

### Faiss

```bash
git clone https://github.com/facebookresearch/faiss.git
cmake -B build . -DBUILD_SHARED_LIBS=ON -DFAISS_ENABLE_C_API=ON
make -C build -j faiss
```

On Windows, we may change the source code to add `__declspec(dllimport)` for C APIs. See [link](https://github.com/facebookresearch/faiss/issues/2909)

And add the following options to Cmake
```bash
MKL_PATH=<path>/Intel/oneAPI/mkl/latest
-DMKL_ROOT="$MKL_PATH" \
-DBLAS_LIBRARIES="$MKL_PATH/lib/intel64/mkl_intel_lp64.lib;$MKL_PATH/lib/intel64/mkl_sequential.lib;$MKL_PATH/lib/intel64/mkl_core.lib" \
-DLAPACK_LIBRARIES="$MKL_PATH/lib/intel64/mkl_intel_lp64.lib;$MKL_PATH/lib/intel64/mkl_sequential.lib;$MLK_PATH/lib/intel64/mkl_core.lib" \
-DBLAS_INCLUDE_DIR="$MKL_PATH/include" \
-DLAPACK_INCLUDE_DIR="$MKL_PATH/include"
```

### Llama.cpp (Optional)

```bash
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
cmake -B build -DBUILD_SHARED_LIBS=1
cmake --build build --config Release
```

```bash
cd libs
gcc tokenize.c -fPIC -shared -L. -lllama -o libtokenize.so
```
