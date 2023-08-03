/**
 * 自动引入模板，在原有 sw-precache 插件默认模板基础上做的二次开发
 *
 * 因为是自定导入的模板，项目一旦生成，不支持随 sw-precache 的版本自动升级。
 * 可以到 Lavas 官网下载 basic 模板内获取最新模板进行替换
 *
 */

/* eslint-disable */

'use strict';

var precacheConfig = [["/2023/07/13/算法导论第二章/index.html","78194cef6244a5464e83c9d0449b21ad"],["/2023/07/17/深度优先搜索/index.html","ebda86c46daf4fe4ed22ed852ce26f53"],["/2023/07/17/深度优先搜索/微信图片_20230722121913.jpg","653bf31156fb2c8e205c34f6e3e76d13"],["/2023/07/17/深度优先搜索/微信图片_20230722121923.jpg","a1e00933427f2a0b77a17f3e0de666b4"],["/2023/07/17/深度优先搜索/微信图片_20230722121928.jpg","5765356a7654f9de583f17ddd9c960a0"],["/2023/07/26/树形DP/1.jpg","a1e00933427f2a0b77a17f3e0de666b4"],["/2023/07/26/树形DP/index.html","7fcee467c72266fddbc3ab973c75f7df"],["/2023/07/31/并查集/index.html","fb590cb44c5342899eccdba66b1c49db"],["/2023/08/02/树状数组/index.html","c949a318240864c23967bb3a5fb146bf"],["/2023/08/02/树状数组/树状数组.jpg","96c12aafa540b0ef60f94f955153334b"],["/about/index.html","f230c9a8af19a0c21134632dc95881b7"],["/archives/2023/07/index.html","f8775d5218a4d91fd85b207926eb6a13"],["/archives/2023/08/index.html","37635e57dfb3147815f611df2dc82dd2"],["/archives/2023/index.html","0567e36b51c904cf1a5b7021bf5e1bcb"],["/archives/index.html","a71249ad3b8de6977e6dec0b649d5316"],["/css/fonts.min.css","a76c83571268ee9144084d2abca25513"],["/css/main.css","6aa81e807a4dfb441370f7884468cff7"],["/images/avatar.jpg","8b1fb064119cba182c946e0c79eff9f8"],["/images/background.jpg","cebc2cc7ca7654d4a72ffa5f1d80ddce"],["/images/favicon-32x32.png","c6b015fbb1dcaa6c031553e360eb62a6"],["/images/favicon.png","b496e394e07527595326ed0092dab4ad"],["/images/loading.gif","446100f374e93811b2ddf58ecd807d9a"],["/images/头像.jpg","5d130c0b44faedabbb4bde2ef341d51d"],["/images/微信图片_20230504212500.jpg","263e65623e35c6272cfebdbe400dec1b"],["/images/微信图片_20230504212505.jpg","a20e2ac98b1fd0f6f04a34705be75b0d"],["/images/微信图片_20230722121913.jpg","653bf31156fb2c8e205c34f6e3e76d13"],["/images/微信图片_20230722121918.jpg","0485733e6b2b59dd6bd9266a0fcc8b9d"],["/images/微信图片_20230722121923.jpg","a1e00933427f2a0b77a17f3e0de666b4"],["/images/微信图片_20230722121928.jpg","5765356a7654f9de583f17ddd9c960a0"],["/index.html","f56d19caa783071627e457d37e416407"],["/js/lib/crypto.js","6c92f7ea1e8beb660ce850f5942461cc"],["/js/lib/highlight.js","bf6a80d7b15a2faf137a2780e497ef4a"],["/js/lib/home.js","623b2117c6240728af9c9cb27d0386d0"],["/js/lib/math.js","654a1cefafce9da26ecc8be70a0f1399"],["/js/lib/preview.js","1faad7a4e7bc1de1e51758e484b3b68a"],["/js/lib/search.js","a9a6e98bf4ae4e429d5830f86e404817"],["/js/main.js","b1e7e3bf041c30e96844de1c776ee299"],["/sw-register.js","0d93e9715f7583c1998fadecce83f436"],["/tags/algorithm/index.html","84d32d993e17babe6dd6e9f78b13be67"],["/tags/data-structure/index.html","a021f820704a14b2929512bf52283bf6"],["/yourdiy/index.html","d16d7ff677f0763f700ac0f2486d401e"]];
var cacheName = 'sw-precache-v3--' + (self.registration ? self.registration.scope : '');
var firstRegister = 1; // 默认1是首次安装SW， 0是SW更新


var ignoreUrlParametersMatching = [/^utm_/];


var addDirectoryIndex = function (originalUrl, index) {
    var url = new URL(originalUrl);
    if (url.pathname.slice(-1) === '/') {
        url.pathname += index;
    }
    return url.toString();
};

var cleanResponse = function (originalResponse) {
    // 如果没有重定向响应，不需干啥
    if (!originalResponse.redirected) {
        return Promise.resolve(originalResponse);
    }

    // Firefox 50 及以下不知处 Response.body 流, 所以我们需要读取整个body以blob形式返回。
    var bodyPromise = 'body' in originalResponse ?
        Promise.resolve(originalResponse.body) :
        originalResponse.blob();

    return bodyPromise.then(function (body) {
        // new Response() 可同时支持 stream or Blob.
        return new Response(body, {
            headers: originalResponse.headers,
            status: originalResponse.status,
            statusText: originalResponse.statusText
        });
    });
};

var createCacheKey = function (originalUrl, paramName, paramValue,
    dontCacheBustUrlsMatching) {

    // 创建一个新的URL对象，避免影响原始URL
    var url = new URL(originalUrl);

    // 如果 dontCacheBustUrlsMatching 值没有设置，或是没有匹配到，将值拼接到url.serach后
    if (!dontCacheBustUrlsMatching ||
        !(url.pathname.match(dontCacheBustUrlsMatching))) {
        url.search += (url.search ? '&' : '') +
            encodeURIComponent(paramName) + '=' + encodeURIComponent(paramValue);
    }

    return url.toString();
};

var isPathWhitelisted = function (whitelist, absoluteUrlString) {
    // 如果 whitelist 是空数组，则认为全部都在白名单内
    if (whitelist.length === 0) {
        return true;
    }

    // 否则逐个匹配正则匹配并返回
    var path = (new URL(absoluteUrlString)).pathname;
    return whitelist.some(function (whitelistedPathRegex) {
        return path.match(whitelistedPathRegex);
    });
};

var stripIgnoredUrlParameters = function (originalUrl,
    ignoreUrlParametersMatching) {
    var url = new URL(originalUrl);
    // 移除 hash; 查看 https://github.com/GoogleChrome/sw-precache/issues/290
    url.hash = '';

    url.search = url.search.slice(1) // 是否包含 '?'
        .split('&') // 分割成数组 'key=value' 的形式
        .map(function (kv) {
            return kv.split('='); // 分割每个 'key=value' 字符串成 [key, value] 形式
        })
        .filter(function (kv) {
            return ignoreUrlParametersMatching.every(function (ignoredRegex) {
                return !ignoredRegex.test(kv[0]); // 如果 key 没有匹配到任何忽略参数正则，就 Return true
            });
        })
        .map(function (kv) {
            return kv.join('='); // 重新把 [key, value] 格式转换为 'key=value' 字符串
        })
        .join('&'); // 将所有参数 'key=value' 以 '&' 拼接

    return url.toString();
};


var addDirectoryIndex = function (originalUrl, index) {
    var url = new URL(originalUrl);
    if (url.pathname.slice(-1) === '/') {
        url.pathname += index;
    }
    return url.toString();
};

var hashParamName = '_sw-precache';
var urlsToCacheKeys = new Map(
    precacheConfig.map(function (item) {
        var relativeUrl = item[0];
        var hash = item[1];
        var absoluteUrl = new URL(relativeUrl, self.location);
        var cacheKey = createCacheKey(absoluteUrl, hashParamName, hash, false);
        return [absoluteUrl.toString(), cacheKey];
    })
);

function setOfCachedUrls(cache) {
    return cache.keys().then(function (requests) {
        // 如果原cacheName中没有缓存任何收，就默认是首次安装，否则认为是SW更新
        if (requests && requests.length > 0) {
            firstRegister = 0; // SW更新
        }
        return requests.map(function (request) {
            return request.url;
        });
    }).then(function (urls) {
        return new Set(urls);
    });
}

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return setOfCachedUrls(cache).then(function (cachedUrls) {
                return Promise.all(
                    Array.from(urlsToCacheKeys.values()).map(function (cacheKey) {
                        // 如果缓存中没有匹配到cacheKey，添加进去
                        if (!cachedUrls.has(cacheKey)) {
                            var request = new Request(cacheKey, { credentials: 'same-origin' });
                            return fetch(request).then(function (response) {
                                // 只要返回200才能继续，否则直接抛错
                                if (!response.ok) {
                                    throw new Error('Request for ' + cacheKey + ' returned a ' +
                                        'response with status ' + response.status);
                                }

                                return cleanResponse(response).then(function (responseToCache) {
                                    return cache.put(cacheKey, responseToCache);
                                });
                            });
                        }
                    })
                );
            });
        })
            .then(function () {
            
            // 强制 SW 状态 installing -> activate
            return self.skipWaiting();
            
        })
    );
});

self.addEventListener('activate', function (event) {
    var setOfExpectedUrls = new Set(urlsToCacheKeys.values());

    event.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.keys().then(function (existingRequests) {
                return Promise.all(
                    existingRequests.map(function (existingRequest) {
                        // 删除原缓存中相同键值内容
                        if (!setOfExpectedUrls.has(existingRequest.url)) {
                            return cache.delete(existingRequest);
                        }
                    })
                );
            });
        }).then(function () {
            
            return self.clients.claim();
            
        }).then(function () {
                // 如果是首次安装 SW 时, 不发送更新消息（是否是首次安装，通过指定cacheName 中是否有缓存信息判断）
                // 如果不是首次安装，则是内容有更新，需要通知页面重载更新
                if (!firstRegister) {
                    return self.clients.matchAll()
                        .then(function (clients) {
                            if (clients && clients.length) {
                                clients.forEach(function (client) {
                                    client.postMessage('sw.update');
                                })
                            }
                        })
                }
            })
    );
});



    self.addEventListener('fetch', function (event) {
        if (event.request.method === 'GET') {

            // 是否应该 event.respondWith()，需要我们逐步的判断
            // 而且也方便了后期做特殊的特殊
            var shouldRespond;


            // 首先去除已配置的忽略参数及hash
            // 查看缓存简直中是否包含该请求，包含就将shouldRespond 设为true
            var url = stripIgnoredUrlParameters(event.request.url, ignoreUrlParametersMatching);
            shouldRespond = urlsToCacheKeys.has(url);

            // 如果 shouldRespond 是 false, 我们在url后默认增加 'index.html'
            // (或者是你在配置文件中自行配置的 directoryIndex 参数值)，继续查找缓存列表
            var directoryIndex = 'index.html';
            if (!shouldRespond && directoryIndex) {
                url = addDirectoryIndex(url, directoryIndex);
                shouldRespond = urlsToCacheKeys.has(url);
            }

            // 如果 shouldRespond 仍是 false，检查是否是navigation
            // request， 如果是的话，判断是否能与 navigateFallbackWhitelist 正则列表匹配
            var navigateFallback = '';
            if (!shouldRespond &&
                navigateFallback &&
                (event.request.mode === 'navigate') &&
                isPathWhitelisted([], event.request.url)
            ) {
                url = new URL(navigateFallback, self.location).toString();
                shouldRespond = urlsToCacheKeys.has(url);
            }

            // 如果 shouldRespond 被置为 true
            // 则 event.respondWith()匹配缓存返回结果，匹配不成就直接请求.
            if (shouldRespond) {
                event.respondWith(
                    caches.open(cacheName).then(function (cache) {
                        return cache.match(urlsToCacheKeys.get(url)).then(function (response) {
                            if (response) {
                                return response;
                            }
                            throw Error('The cached response that was expected is missing.');
                        });
                    }).catch(function (e) {
                        // 如果捕获到异常错误，直接返回 fetch() 请求资源
                        console.warn('Couldn\'t serve response for "%s" from cache: %O', event.request.url, e);
                        return fetch(event.request);
                    })
                );
            }
        }
    });









/* eslint-enable */
