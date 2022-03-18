module.exports = function override(config) {
    config.resolve.fallback = {
        util: require.resolve("util/"),
        zlib: require.resolve("browserify-zlib"),
        assert: require.resolve("assert/"),
        querystring: require.resolve("querystring-es3"),
        url: require.resolve("url/"),
        https: require.resolve("https-browserify"),
        http: require.resolve("stream-http"),
        path: require.resolve("path-browserify"),
        //path: false,
        tty: require.resolve("tty-browserify"),
        stream: require.resolve("stream-browserify"),
        fs: false,
    };
    return config;
};