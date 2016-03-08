Enable
===
[![NPM version][npm-image]][npm-url] [![Build Status][build-image]][build-url] [![Coverage Status][coverage-image]][coverage-url] [![Dependencies][dependencies-image]][dependencies-url]

> [Enable][travis-hooks] Travis CI builds for one or more repositories.


## Installation

``` bash
$ npm install travis-ci-enable
```


## Usage

``` javascript
var enable = require( 'travis-ci-enable' );
```

<a name="enable"></a>
#### enable( repos, options, clbk )

[Enable][travis-hooks] Travis CI builds for one or more repositories. Each provided repository `slug` should obey the format `:owner/:repo`.

``` javascript
var repos = [
    'math-io/polygamma',
    'math-io/gammaln',
    'kgryte/utils-deep-set',
    'unknown/repo'
];

var opts = {
    'token': 'tkjorjk34ek3nj4!'
};

enable( repos, opts, clbk )

function clbk( error, results ) {
    if ( error ) {
        throw new Error( error.message );
    }
    console.dir( results );
    /* returns
        {
            "meta": {
                "total": 4,
                "success": 3,
                "failure": 1
            },
            "data": {
                "math-io/polygamma": {
                    "result": true
                },
                "math-io/gammaln": {
                    "result": true
                },
                "kgryte/utils-deep-set": {
                    "result": true
                }
            },
            "failures": {
                "unknown/repo": "Not Found"
            }
        }
    */
}
```

The `function` accepts the following `options`:
*   __token__: Travis CI [access token][travis-token] (*required*).
*   __hostname__: endpoint hostname. Default: `'api.travis-ci.org'`.
*   __sync__: `boolean` indicating whether to [sync][travis-sync] Travis CI with Github before attempting to enable builds. Default: `false`.

To [authenticate][travis-token] with Travis CI, set the [`token`][travis-token] option.

``` javascript
var opts = {
    'token': 'tkjorjk34ek3nj4!'
};

enable( repos, opts, clbk );
```

By default, the `function` contacts the [Travis CI API][travis-api] for open source. To use a different [Travis CI API][travis-api] endpoint, set the `hostname` option.

``` javascript
var opts = {
    'token': 'tkjorjk34ek3nj4!',
    'hostname': 'api.travis-ci.com'
};

enable( repos, opts, clbk );
```

Travis CI requires a manual [sync][travis-sync] in order to have the most up-to-date repository information for an authenticated user. Hence, unless a [sync][travis-sync] is triggered, Travis CI is not aware of repositories created since the last [sync][travis-sync]. To trigger a [sync][travis-sync] before attempting to enable, set the `sync` option to `true`.

``` javascript
var opts = {
    'token': 'tkjorjk34ek3nj4!',
    'hostname': 'api.travis-ci.com',
    'sync': true
};

enable( repos, opts, clbk );
```


#### enable.factory( options, clbk )

Creates a reusable `function`.

``` javascript
var opts = {
    'token': 'tkjorjk34ek3nj4!',
    'hostname': 'api.travis-ci.com',
    'sync': true
};

var run = enable.factory( opts, clbk );

var repos = [ 'math-io/erf', 'math-io/erfc' ];
run( repos );

// Some time later...
repos = [ 'kgryte/utils-copy', 'kgryte/utils-merge' ];
run( repos );

// Some time later...
repos = [ 'dstructs/matrix', 'math-io/evalpoly' ];
run( repos );

// ...
```

The factory method accepts the same `options` as [`enable()`](#enable).


## Notes

*   If the module encounters an application-level `error` while __initially__ querying an endpoint (e.g., no network connection, malformed request, etc), that `error` is returned immediately to the provided `callback`.
*   If the module encounters a downstream `error` (e.g., timeout, reset connection, etc), that `error` is included in the returned results under the `failures` field.
*   If possible, avoid repeatedly triggering a [sync][travis-sync] in close succession, as each [sync][travis-sync] may entail multiple Github API requests, thus affecting a user's Github [rate limit][github-user-rate-limit]. Hence, if an application requires multiple `enable` invocations, separately trigger a [sync][travis-sync] once, rather than setting the `sync` option to `true`.
    
    ``` javascript
    var sync = require( 'travis-ci-sync' );
    var factory = require( 'travis-ci-enable' ).factory;

    var opts = {
        'token': 'tkjorjk34ek3nj4!',
        'sync': false
    };

    sync( opts, onSync );

    function onSync( error ) {
        var enable;
        var repos;
        if ( error ) {
            throw new Error( error.message );
        }
        enable = factory( opts, onEnable );
    
        repos = [ 'math-io/erf', 'math-io/erfc' ];
        enable( repos );

        // Next invocation does not trigger a sync...
        repos = [ 'kgryte/utils-copy', 'kgryte/utils-merge' ];
        enable( repos );
    }

    function onEnable( error, results ) {
        if ( error ) {
            return console.error( error.message );
        }
        console.dir( results );
    }
    ```

---
## Examples

``` javascript
var enable = require( 'travis-ci-enable' );

var repos = [
    'math-io/erf',
    'math-io/erfc',
    'math-io/erfinv'
];

var opts = {
    'token': 'tkjorjk34ek3nj4!'
};

enable( repos, opts, clbk );

function clbk( error, results ) {
    if ( error ) {
        throw new Error( error.message );
    }
    console.dir( results );
}
```

To run the example code from the top-level application directory,

``` bash
$ node ./examples/index.js
```

__Note__: in order to run the example, you will need to obtain an access [token][travis-token] and modify the `token` option accordingly.


---
## CLI

### Installation

To use the module as a general utility, install the module globally

``` bash
$ npm install -g travis-ci-enable
```


### Usage

``` bash
Usage: travisenable [options] slug1 slug2 ...

Options:

  -h,  --help               Print this message.
  -V,  --version            Print the package version.
       --hostname host      Hostname. Default: api.travis-ci.org.
       --token token        Travis CI access token.
       --sync               Sync Travis CI with Github.
```


### Notes

*   If a `slug` is __not__ provided, the implementation will attempt to infer a `slug` by executing

    ```
    git config remote.origin.url
    ```
    
    in the current working directory.
*   In addition to the [`token`][travis-token] option, the [token][travis-token] may be specified by a [`TRAVISCI_TOKEN`][travis-token] environment variable. The command-line option __always__ takes precedence.
*   If builds for a repository are successfully enabled, results are written to `stdout`.
*   If builds for a repository cannot be enabled due to a downstream `error` (failure), the repository `slug` (and its associated `error`) is written to `sterr`.
*   Output order is __not__ guaranteed to match input order.


### Examples

Setting the access [token][travis-token] using the command-line option:

``` bash
$ DEBUG=* travisenable --token <token> math-io/erfinv
# => {...}
```

Setting the access [token][travis-token] using an environment variable:

``` bash
$ DEBUG=* TRAVISCI_TOKEN=<token> travisenable math-io/erfinv
# => {...}
```

For local installations, modify the command to point to the local installation directory; e.g., 

``` bash
$ DEBUG=* ./node_modules/.bin/travisenable --token <token> math-io/erfinv
# => {...}
```

Or, if you have cloned this repository and run `npm install`, modify the command to point to the executable; e.g., 

``` bash
$ DEBUG=* node ./bin/cli --token <token> math-io/erfinv
# => {...}
```


---
## Tests

### Unit

This repository uses [tape][tape] for unit tests. To run the tests, execute the following command in the top-level application directory:

``` bash
$ make test
```

All new feature development should have corresponding unit tests to validate correct functionality.


### Test Coverage

This repository uses [Istanbul][istanbul] as its code coverage tool. To generate a test coverage report, execute the following command in the top-level application directory:

``` bash
$ make test-cov
```

Istanbul creates a `./reports/coverage` directory. To access an HTML version of the report,

``` bash
$ make view-cov
```


### Browser Support

This repository uses [Testling][testling] for browser testing. To run the tests in a (headless) local web browser, execute the following command in the top-level application directory:

``` bash
$ make test-browsers
```

To view the tests in a local web browser,

``` bash
$ make view-browser-tests
```

<!-- [![browser support][browsers-image]][browsers-url] -->


---
## License

[MIT license](http://opensource.org/licenses/MIT).


## Copyright

Copyright &copy; 2016. Athan Reines.


[npm-image]: http://img.shields.io/npm/v/travis-ci-enable.svg
[npm-url]: https://npmjs.org/package/travis-ci-enable

[build-image]: http://img.shields.io/travis/kgryte/travis-ci-enable/master.svg
[build-url]: https://travis-ci.org/kgryte/travis-ci-enable

[coverage-image]: https://img.shields.io/codecov/c/github/kgryte/travis-ci-enable/master.svg
[coverage-url]: https://codecov.io/github/kgryte/travis-ci-enable?branch=master

[dependencies-image]: http://img.shields.io/david/kgryte/travis-ci-enable.svg
[dependencies-url]: https://david-dm.org/kgryte/travis-ci-enable

[dev-dependencies-image]: http://img.shields.io/david/dev/kgryte/travis-ci-enable.svg
[dev-dependencies-url]: https://david-dm.org/dev/kgryte/travis-ci-enable

[github-issues-image]: http://img.shields.io/github/issues/kgryte/travis-ci-enable.svg
[github-issues-url]: https://github.com/kgryte/travis-ci-enable/issues

[tape]: https://github.com/substack/tape
[istanbul]: https://github.com/gotwarlost/istanbul
[testling]: https://ci.testling.com

[github-user-rate-limit]: https://github.com/kgryte/github-user-rate-limit

[travis-sync]: https://github.com/kgryte/travis-ci-sync
[travis-token]: https://github.com/kgryte/travis-ci-access-token

[travis-api]: https://docs.travis-ci.com/api
[travis-hooks]: https://docs.travis-ci.com/api?http#hooks
