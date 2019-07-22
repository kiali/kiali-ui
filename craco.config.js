// This a workaround to avoid to be annoyed with webcomponent intergration during testing. 
// "etag" is just a random package that doesn't interfere with the rest of the tests
module.exports = {
    jest: {
        configure: {
            moduleNameMapper: {
                ".*rapidoc.*": "etag"
            }
        }
    }
}
