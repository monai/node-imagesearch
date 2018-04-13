{
    "targets": [{
        "target_name": "search",
        "sources": [ "src/search.cc" ],
        "include_dirs": [
            "deps/eigen",
            "<!(node -e \"require('nan')\")",
        ]
    }]
}
