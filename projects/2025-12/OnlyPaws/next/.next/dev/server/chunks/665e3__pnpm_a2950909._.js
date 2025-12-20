module.exports = [
"[project]/examples/typescript/node_modules/.pnpm/fast-deep-equal@3.1.3/node_modules/fast-deep-equal/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// do not edit .js files directly - edit src/index.jst
module.exports = function equal(a, b) {
    if (a === b) return true;
    if (a && b && typeof a == 'object' && typeof b == 'object') {
        if (a.constructor !== b.constructor) return false;
        var length, i, keys;
        if (Array.isArray(a)) {
            length = a.length;
            if (length != b.length) return false;
            for(i = length; i-- !== 0;)if (!equal(a[i], b[i])) return false;
            return true;
        }
        if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
        if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
        if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
        keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length) return false;
        for(i = length; i-- !== 0;)if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
        for(i = length; i-- !== 0;){
            var key = keys[i];
            if (!equal(a[key], b[key])) return false;
        }
        return true;
    }
    // true if both NaN, false otherwise
    return a !== a && b !== b;
};
}),
"[project]/examples/typescript/node_modules/.pnpm/json-schema-traverse@1.0.0/node_modules/json-schema-traverse/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var traverse = module.exports = function(schema, opts, cb) {
    // Legacy support for v0.3.1 and earlier.
    if (typeof opts == 'function') {
        cb = opts;
        opts = {};
    }
    cb = opts.cb || cb;
    var pre = typeof cb == 'function' ? cb : cb.pre || function() {};
    var post = cb.post || function() {};
    _traverse(opts, pre, post, schema, '', schema);
};
traverse.keywords = {
    additionalItems: true,
    items: true,
    contains: true,
    additionalProperties: true,
    propertyNames: true,
    not: true,
    if: true,
    then: true,
    else: true
};
traverse.arrayKeywords = {
    items: true,
    allOf: true,
    anyOf: true,
    oneOf: true
};
traverse.propsKeywords = {
    $defs: true,
    definitions: true,
    properties: true,
    patternProperties: true,
    dependencies: true
};
traverse.skipKeywords = {
    default: true,
    enum: true,
    const: true,
    required: true,
    maximum: true,
    minimum: true,
    exclusiveMaximum: true,
    exclusiveMinimum: true,
    multipleOf: true,
    maxLength: true,
    minLength: true,
    pattern: true,
    format: true,
    maxItems: true,
    minItems: true,
    uniqueItems: true,
    maxProperties: true,
    minProperties: true
};
function _traverse(opts, pre, post, schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
    if (schema && typeof schema == 'object' && !Array.isArray(schema)) {
        pre(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
        for(var key in schema){
            var sch = schema[key];
            if (Array.isArray(sch)) {
                if (key in traverse.arrayKeywords) {
                    for(var i = 0; i < sch.length; i++)_traverse(opts, pre, post, sch[i], jsonPtr + '/' + key + '/' + i, rootSchema, jsonPtr, key, schema, i);
                }
            } else if (key in traverse.propsKeywords) {
                if (sch && typeof sch == 'object') {
                    for(var prop in sch)_traverse(opts, pre, post, sch[prop], jsonPtr + '/' + key + '/' + escapeJsonPtr(prop), rootSchema, jsonPtr, key, schema, prop);
                }
            } else if (key in traverse.keywords || opts.allKeys && !(key in traverse.skipKeywords)) {
                _traverse(opts, pre, post, sch, jsonPtr + '/' + key, rootSchema, jsonPtr, key, schema);
            }
        }
        post(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
    }
}
function escapeJsonPtr(str) {
    return str.replace(/~/g, '~0').replace(/\//g, '~1');
}
}),
"[project]/examples/typescript/node_modules/.pnpm/fast-uri@3.0.6/node_modules/fast-uri/lib/scopedChars.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const HEX = {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    a: 10,
    A: 10,
    b: 11,
    B: 11,
    c: 12,
    C: 12,
    d: 13,
    D: 13,
    e: 14,
    E: 14,
    f: 15,
    F: 15
};
module.exports = {
    HEX
};
}),
"[project]/examples/typescript/node_modules/.pnpm/fast-uri@3.0.6/node_modules/fast-uri/lib/utils.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const { HEX } = __turbopack_context__.r("[project]/examples/typescript/node_modules/.pnpm/fast-uri@3.0.6/node_modules/fast-uri/lib/scopedChars.js [app-route] (ecmascript)");
const IPV4_REG = /^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u;
function normalizeIPv4(host) {
    if (findToken(host, '.') < 3) {
        return {
            host,
            isIPV4: false
        };
    }
    const matches = host.match(IPV4_REG) || [];
    const [address] = matches;
    if (address) {
        return {
            host: stripLeadingZeros(address, '.'),
            isIPV4: true
        };
    } else {
        return {
            host,
            isIPV4: false
        };
    }
}
/**
 * @param {string[]} input
 * @param {boolean} [keepZero=false]
 * @returns {string|undefined}
 */ function stringArrayToHexStripped(input, keepZero = false) {
    let acc = '';
    let strip = true;
    for (const c of input){
        if (HEX[c] === undefined) return undefined;
        if (c !== '0' && strip === true) strip = false;
        if (!strip) acc += c;
    }
    if (keepZero && acc.length === 0) acc = '0';
    return acc;
}
function getIPV6(input) {
    let tokenCount = 0;
    const output = {
        error: false,
        address: '',
        zone: ''
    };
    const address = [];
    const buffer = [];
    let isZone = false;
    let endipv6Encountered = false;
    let endIpv6 = false;
    function consume() {
        if (buffer.length) {
            if (isZone === false) {
                const hex = stringArrayToHexStripped(buffer);
                if (hex !== undefined) {
                    address.push(hex);
                } else {
                    output.error = true;
                    return false;
                }
            }
            buffer.length = 0;
        }
        return true;
    }
    for(let i = 0; i < input.length; i++){
        const cursor = input[i];
        if (cursor === '[' || cursor === ']') {
            continue;
        }
        if (cursor === ':') {
            if (endipv6Encountered === true) {
                endIpv6 = true;
            }
            if (!consume()) {
                break;
            }
            tokenCount++;
            address.push(':');
            if (tokenCount > 7) {
                // not valid
                output.error = true;
                break;
            }
            if (i - 1 >= 0 && input[i - 1] === ':') {
                endipv6Encountered = true;
            }
            continue;
        } else if (cursor === '%') {
            if (!consume()) {
                break;
            }
            // switch to zone detection
            isZone = true;
        } else {
            buffer.push(cursor);
            continue;
        }
    }
    if (buffer.length) {
        if (isZone) {
            output.zone = buffer.join('');
        } else if (endIpv6) {
            address.push(buffer.join(''));
        } else {
            address.push(stringArrayToHexStripped(buffer));
        }
    }
    output.address = address.join('');
    return output;
}
function normalizeIPv6(host) {
    if (findToken(host, ':') < 2) {
        return {
            host,
            isIPV6: false
        };
    }
    const ipv6 = getIPV6(host);
    if (!ipv6.error) {
        let newHost = ipv6.address;
        let escapedHost = ipv6.address;
        if (ipv6.zone) {
            newHost += '%' + ipv6.zone;
            escapedHost += '%25' + ipv6.zone;
        }
        return {
            host: newHost,
            escapedHost,
            isIPV6: true
        };
    } else {
        return {
            host,
            isIPV6: false
        };
    }
}
function stripLeadingZeros(str, token) {
    let out = '';
    let skip = true;
    const l = str.length;
    for(let i = 0; i < l; i++){
        const c = str[i];
        if (c === '0' && skip) {
            if (i + 1 <= l && str[i + 1] === token || i + 1 === l) {
                out += c;
                skip = false;
            }
        } else {
            if (c === token) {
                skip = true;
            } else {
                skip = false;
            }
            out += c;
        }
    }
    return out;
}
function findToken(str, token) {
    let ind = 0;
    for(let i = 0; i < str.length; i++){
        if (str[i] === token) ind++;
    }
    return ind;
}
const RDS1 = /^\.\.?\//u;
const RDS2 = /^\/\.(?:\/|$)/u;
const RDS3 = /^\/\.\.(?:\/|$)/u;
const RDS5 = /^\/?(?:.|\n)*?(?=\/|$)/u;
function removeDotSegments(input) {
    const output = [];
    while(input.length){
        if (input.match(RDS1)) {
            input = input.replace(RDS1, '');
        } else if (input.match(RDS2)) {
            input = input.replace(RDS2, '/');
        } else if (input.match(RDS3)) {
            input = input.replace(RDS3, '/');
            output.pop();
        } else if (input === '.' || input === '..') {
            input = '';
        } else {
            const im = input.match(RDS5);
            if (im) {
                const s = im[0];
                input = input.slice(s.length);
                output.push(s);
            } else {
                throw new Error('Unexpected dot segment condition');
            }
        }
    }
    return output.join('');
}
function normalizeComponentEncoding(components, esc) {
    const func = esc !== true ? escape : unescape;
    if (components.scheme !== undefined) {
        components.scheme = func(components.scheme);
    }
    if (components.userinfo !== undefined) {
        components.userinfo = func(components.userinfo);
    }
    if (components.host !== undefined) {
        components.host = func(components.host);
    }
    if (components.path !== undefined) {
        components.path = func(components.path);
    }
    if (components.query !== undefined) {
        components.query = func(components.query);
    }
    if (components.fragment !== undefined) {
        components.fragment = func(components.fragment);
    }
    return components;
}
function recomposeAuthority(components) {
    const uriTokens = [];
    if (components.userinfo !== undefined) {
        uriTokens.push(components.userinfo);
        uriTokens.push('@');
    }
    if (components.host !== undefined) {
        let host = unescape(components.host);
        const ipV4res = normalizeIPv4(host);
        if (ipV4res.isIPV4) {
            host = ipV4res.host;
        } else {
            const ipV6res = normalizeIPv6(ipV4res.host);
            if (ipV6res.isIPV6 === true) {
                host = `[${ipV6res.escapedHost}]`;
            } else {
                host = components.host;
            }
        }
        uriTokens.push(host);
    }
    if (typeof components.port === 'number' || typeof components.port === 'string') {
        uriTokens.push(':');
        uriTokens.push(String(components.port));
    }
    return uriTokens.length ? uriTokens.join('') : undefined;
}
;
module.exports = {
    recomposeAuthority,
    normalizeComponentEncoding,
    removeDotSegments,
    normalizeIPv4,
    normalizeIPv6,
    stringArrayToHexStripped
};
}),
"[project]/examples/typescript/node_modules/.pnpm/fast-uri@3.0.6/node_modules/fast-uri/lib/schemes.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const UUID_REG = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu;
const URN_REG = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
function isSecure(wsComponents) {
    return typeof wsComponents.secure === 'boolean' ? wsComponents.secure : String(wsComponents.scheme).toLowerCase() === 'wss';
}
function httpParse(components) {
    if (!components.host) {
        components.error = components.error || 'HTTP URIs must have a host.';
    }
    return components;
}
function httpSerialize(components) {
    const secure = String(components.scheme).toLowerCase() === 'https';
    // normalize the default port
    if (components.port === (secure ? 443 : 80) || components.port === '') {
        components.port = undefined;
    }
    // normalize the empty path
    if (!components.path) {
        components.path = '/';
    }
    // NOTE: We do not parse query strings for HTTP URIs
    // as WWW Form Url Encoded query strings are part of the HTML4+ spec,
    // and not the HTTP spec.
    return components;
}
function wsParse(wsComponents) {
    // indicate if the secure flag is set
    wsComponents.secure = isSecure(wsComponents);
    // construct resouce name
    wsComponents.resourceName = (wsComponents.path || '/') + (wsComponents.query ? '?' + wsComponents.query : '');
    wsComponents.path = undefined;
    wsComponents.query = undefined;
    return wsComponents;
}
function wsSerialize(wsComponents) {
    // normalize the default port
    if (wsComponents.port === (isSecure(wsComponents) ? 443 : 80) || wsComponents.port === '') {
        wsComponents.port = undefined;
    }
    // ensure scheme matches secure flag
    if (typeof wsComponents.secure === 'boolean') {
        wsComponents.scheme = wsComponents.secure ? 'wss' : 'ws';
        wsComponents.secure = undefined;
    }
    // reconstruct path from resource name
    if (wsComponents.resourceName) {
        const [path, query] = wsComponents.resourceName.split('?');
        wsComponents.path = path && path !== '/' ? path : undefined;
        wsComponents.query = query;
        wsComponents.resourceName = undefined;
    }
    // forbid fragment component
    wsComponents.fragment = undefined;
    return wsComponents;
}
function urnParse(urnComponents, options) {
    if (!urnComponents.path) {
        urnComponents.error = 'URN can not be parsed';
        return urnComponents;
    }
    const matches = urnComponents.path.match(URN_REG);
    if (matches) {
        const scheme = options.scheme || urnComponents.scheme || 'urn';
        urnComponents.nid = matches[1].toLowerCase();
        urnComponents.nss = matches[2];
        const urnScheme = `${scheme}:${options.nid || urnComponents.nid}`;
        const schemeHandler = SCHEMES[urnScheme];
        urnComponents.path = undefined;
        if (schemeHandler) {
            urnComponents = schemeHandler.parse(urnComponents, options);
        }
    } else {
        urnComponents.error = urnComponents.error || 'URN can not be parsed.';
    }
    return urnComponents;
}
function urnSerialize(urnComponents, options) {
    const scheme = options.scheme || urnComponents.scheme || 'urn';
    const nid = urnComponents.nid.toLowerCase();
    const urnScheme = `${scheme}:${options.nid || nid}`;
    const schemeHandler = SCHEMES[urnScheme];
    if (schemeHandler) {
        urnComponents = schemeHandler.serialize(urnComponents, options);
    }
    const uriComponents = urnComponents;
    const nss = urnComponents.nss;
    uriComponents.path = `${nid || options.nid}:${nss}`;
    options.skipEscape = true;
    return uriComponents;
}
function urnuuidParse(urnComponents, options) {
    const uuidComponents = urnComponents;
    uuidComponents.uuid = uuidComponents.nss;
    uuidComponents.nss = undefined;
    if (!options.tolerant && (!uuidComponents.uuid || !UUID_REG.test(uuidComponents.uuid))) {
        uuidComponents.error = uuidComponents.error || 'UUID is not valid.';
    }
    return uuidComponents;
}
function urnuuidSerialize(uuidComponents) {
    const urnComponents = uuidComponents;
    // normalize UUID
    urnComponents.nss = (uuidComponents.uuid || '').toLowerCase();
    return urnComponents;
}
const http = {
    scheme: 'http',
    domainHost: true,
    parse: httpParse,
    serialize: httpSerialize
};
const https = {
    scheme: 'https',
    domainHost: http.domainHost,
    parse: httpParse,
    serialize: httpSerialize
};
const ws = {
    scheme: 'ws',
    domainHost: true,
    parse: wsParse,
    serialize: wsSerialize
};
const wss = {
    scheme: 'wss',
    domainHost: ws.domainHost,
    parse: ws.parse,
    serialize: ws.serialize
};
const urn = {
    scheme: 'urn',
    parse: urnParse,
    serialize: urnSerialize,
    skipNormalize: true
};
const urnuuid = {
    scheme: 'urn:uuid',
    parse: urnuuidParse,
    serialize: urnuuidSerialize,
    skipNormalize: true
};
const SCHEMES = {
    http,
    https,
    ws,
    wss,
    urn,
    'urn:uuid': urnuuid
};
module.exports = SCHEMES;
}),
"[project]/examples/typescript/node_modules/.pnpm/fast-uri@3.0.6/node_modules/fast-uri/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const { normalizeIPv6, normalizeIPv4, removeDotSegments, recomposeAuthority, normalizeComponentEncoding } = __turbopack_context__.r("[project]/examples/typescript/node_modules/.pnpm/fast-uri@3.0.6/node_modules/fast-uri/lib/utils.js [app-route] (ecmascript)");
const SCHEMES = __turbopack_context__.r("[project]/examples/typescript/node_modules/.pnpm/fast-uri@3.0.6/node_modules/fast-uri/lib/schemes.js [app-route] (ecmascript)");
function normalize(uri, options) {
    if (typeof uri === 'string') {
        uri = serialize(parse(uri, options), options);
    } else if (typeof uri === 'object') {
        uri = parse(serialize(uri, options), options);
    }
    return uri;
}
function resolve(baseURI, relativeURI, options) {
    const schemelessOptions = Object.assign({
        scheme: 'null'
    }, options);
    const resolved = resolveComponents(parse(baseURI, schemelessOptions), parse(relativeURI, schemelessOptions), schemelessOptions, true);
    return serialize(resolved, {
        ...schemelessOptions,
        skipEscape: true
    });
}
function resolveComponents(base, relative, options, skipNormalization) {
    const target = {};
    if (!skipNormalization) {
        base = parse(serialize(base, options), options); // normalize base components
        relative = parse(serialize(relative, options), options); // normalize relative components
    }
    options = options || {};
    if (!options.tolerant && relative.scheme) {
        target.scheme = relative.scheme;
        // target.authority = relative.authority;
        target.userinfo = relative.userinfo;
        target.host = relative.host;
        target.port = relative.port;
        target.path = removeDotSegments(relative.path || '');
        target.query = relative.query;
    } else {
        if (relative.userinfo !== undefined || relative.host !== undefined || relative.port !== undefined) {
            // target.authority = relative.authority;
            target.userinfo = relative.userinfo;
            target.host = relative.host;
            target.port = relative.port;
            target.path = removeDotSegments(relative.path || '');
            target.query = relative.query;
        } else {
            if (!relative.path) {
                target.path = base.path;
                if (relative.query !== undefined) {
                    target.query = relative.query;
                } else {
                    target.query = base.query;
                }
            } else {
                if (relative.path.charAt(0) === '/') {
                    target.path = removeDotSegments(relative.path);
                } else {
                    if ((base.userinfo !== undefined || base.host !== undefined || base.port !== undefined) && !base.path) {
                        target.path = '/' + relative.path;
                    } else if (!base.path) {
                        target.path = relative.path;
                    } else {
                        target.path = base.path.slice(0, base.path.lastIndexOf('/') + 1) + relative.path;
                    }
                    target.path = removeDotSegments(target.path);
                }
                target.query = relative.query;
            }
            // target.authority = base.authority;
            target.userinfo = base.userinfo;
            target.host = base.host;
            target.port = base.port;
        }
        target.scheme = base.scheme;
    }
    target.fragment = relative.fragment;
    return target;
}
function equal(uriA, uriB, options) {
    if (typeof uriA === 'string') {
        uriA = unescape(uriA);
        uriA = serialize(normalizeComponentEncoding(parse(uriA, options), true), {
            ...options,
            skipEscape: true
        });
    } else if (typeof uriA === 'object') {
        uriA = serialize(normalizeComponentEncoding(uriA, true), {
            ...options,
            skipEscape: true
        });
    }
    if (typeof uriB === 'string') {
        uriB = unescape(uriB);
        uriB = serialize(normalizeComponentEncoding(parse(uriB, options), true), {
            ...options,
            skipEscape: true
        });
    } else if (typeof uriB === 'object') {
        uriB = serialize(normalizeComponentEncoding(uriB, true), {
            ...options,
            skipEscape: true
        });
    }
    return uriA.toLowerCase() === uriB.toLowerCase();
}
function serialize(cmpts, opts) {
    const components = {
        host: cmpts.host,
        scheme: cmpts.scheme,
        userinfo: cmpts.userinfo,
        port: cmpts.port,
        path: cmpts.path,
        query: cmpts.query,
        nid: cmpts.nid,
        nss: cmpts.nss,
        uuid: cmpts.uuid,
        fragment: cmpts.fragment,
        reference: cmpts.reference,
        resourceName: cmpts.resourceName,
        secure: cmpts.secure,
        error: ''
    };
    const options = Object.assign({}, opts);
    const uriTokens = [];
    // find scheme handler
    const schemeHandler = SCHEMES[(options.scheme || components.scheme || '').toLowerCase()];
    // perform scheme specific serialization
    if (schemeHandler && schemeHandler.serialize) schemeHandler.serialize(components, options);
    if (components.path !== undefined) {
        if (!options.skipEscape) {
            components.path = escape(components.path);
            if (components.scheme !== undefined) {
                components.path = components.path.split('%3A').join(':');
            }
        } else {
            components.path = unescape(components.path);
        }
    }
    if (options.reference !== 'suffix' && components.scheme) {
        uriTokens.push(components.scheme, ':');
    }
    const authority = recomposeAuthority(components);
    if (authority !== undefined) {
        if (options.reference !== 'suffix') {
            uriTokens.push('//');
        }
        uriTokens.push(authority);
        if (components.path && components.path.charAt(0) !== '/') {
            uriTokens.push('/');
        }
    }
    if (components.path !== undefined) {
        let s = components.path;
        if (!options.absolutePath && (!schemeHandler || !schemeHandler.absolutePath)) {
            s = removeDotSegments(s);
        }
        if (authority === undefined) {
            s = s.replace(/^\/\//u, '/%2F'); // don't allow the path to start with "//"
        }
        uriTokens.push(s);
    }
    if (components.query !== undefined) {
        uriTokens.push('?', components.query);
    }
    if (components.fragment !== undefined) {
        uriTokens.push('#', components.fragment);
    }
    return uriTokens.join('');
}
const hexLookUp = Array.from({
    length: 127
}, (_v, k)=>/[^!"$&'()*+,\-.;=_`a-z{}~]/u.test(String.fromCharCode(k)));
function nonSimpleDomain(value) {
    let code = 0;
    for(let i = 0, len = value.length; i < len; ++i){
        code = value.charCodeAt(i);
        if (code > 126 || hexLookUp[code]) {
            return true;
        }
    }
    return false;
}
const URI_PARSE = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
function parse(uri, opts) {
    const options = Object.assign({}, opts);
    const parsed = {
        scheme: undefined,
        userinfo: undefined,
        host: '',
        port: undefined,
        path: '',
        query: undefined,
        fragment: undefined
    };
    const gotEncoding = uri.indexOf('%') !== -1;
    let isIP = false;
    if (options.reference === 'suffix') uri = (options.scheme ? options.scheme + ':' : '') + '//' + uri;
    const matches = uri.match(URI_PARSE);
    if (matches) {
        // store each component
        parsed.scheme = matches[1];
        parsed.userinfo = matches[3];
        parsed.host = matches[4];
        parsed.port = parseInt(matches[5], 10);
        parsed.path = matches[6] || '';
        parsed.query = matches[7];
        parsed.fragment = matches[8];
        // fix port number
        if (isNaN(parsed.port)) {
            parsed.port = matches[5];
        }
        if (parsed.host) {
            const ipv4result = normalizeIPv4(parsed.host);
            if (ipv4result.isIPV4 === false) {
                const ipv6result = normalizeIPv6(ipv4result.host);
                parsed.host = ipv6result.host.toLowerCase();
                isIP = ipv6result.isIPV6;
            } else {
                parsed.host = ipv4result.host;
                isIP = true;
            }
        }
        if (parsed.scheme === undefined && parsed.userinfo === undefined && parsed.host === undefined && parsed.port === undefined && parsed.query === undefined && !parsed.path) {
            parsed.reference = 'same-document';
        } else if (parsed.scheme === undefined) {
            parsed.reference = 'relative';
        } else if (parsed.fragment === undefined) {
            parsed.reference = 'absolute';
        } else {
            parsed.reference = 'uri';
        }
        // check for reference errors
        if (options.reference && options.reference !== 'suffix' && options.reference !== parsed.reference) {
            parsed.error = parsed.error || 'URI is not a ' + options.reference + ' reference.';
        }
        // find scheme handler
        const schemeHandler = SCHEMES[(options.scheme || parsed.scheme || '').toLowerCase()];
        // check if scheme can't handle IRIs
        if (!options.unicodeSupport && (!schemeHandler || !schemeHandler.unicodeSupport)) {
            // if host component is a domain name
            if (parsed.host && (options.domainHost || schemeHandler && schemeHandler.domainHost) && isIP === false && nonSimpleDomain(parsed.host)) {
                // convert Unicode IDN -> ASCII IDN
                try {
                    parsed.host = URL.domainToASCII(parsed.host.toLowerCase());
                } catch (e) {
                    parsed.error = parsed.error || "Host's domain name can not be converted to ASCII: " + e;
                }
            }
        // convert IRI -> URI
        }
        if (!schemeHandler || schemeHandler && !schemeHandler.skipNormalize) {
            if (gotEncoding && parsed.scheme !== undefined) {
                parsed.scheme = unescape(parsed.scheme);
            }
            if (gotEncoding && parsed.host !== undefined) {
                parsed.host = unescape(parsed.host);
            }
            if (parsed.path) {
                parsed.path = escape(unescape(parsed.path));
            }
            if (parsed.fragment) {
                parsed.fragment = encodeURI(decodeURIComponent(parsed.fragment));
            }
        }
        // perform scheme specific parsing
        if (schemeHandler && schemeHandler.parse) {
            schemeHandler.parse(parsed, options);
        }
    } else {
        parsed.error = parsed.error || 'URI can not be parsed.';
    }
    return parsed;
}
const fastUri = {
    SCHEMES,
    normalize,
    resolve,
    resolveComponents,
    equal,
    serialize,
    parse
};
module.exports = fastUri;
module.exports.default = fastUri;
module.exports.fastUri = fastUri;
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-core@2.3.0_typescript@5.9.2/node_modules/@solana/codecs-core/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addCodecSentinel",
    ()=>addCodecSentinel,
    "addCodecSizePrefix",
    ()=>addCodecSizePrefix,
    "addDecoderSentinel",
    ()=>addDecoderSentinel,
    "addDecoderSizePrefix",
    ()=>addDecoderSizePrefix,
    "addEncoderSentinel",
    ()=>addEncoderSentinel,
    "addEncoderSizePrefix",
    ()=>addEncoderSizePrefix,
    "assertByteArrayHasEnoughBytesForCodec",
    ()=>assertByteArrayHasEnoughBytesForCodec,
    "assertByteArrayIsNotEmptyForCodec",
    ()=>assertByteArrayIsNotEmptyForCodec,
    "assertByteArrayOffsetIsNotOutOfRange",
    ()=>assertByteArrayOffsetIsNotOutOfRange,
    "assertIsFixedSize",
    ()=>assertIsFixedSize,
    "assertIsVariableSize",
    ()=>assertIsVariableSize,
    "combineCodec",
    ()=>combineCodec,
    "containsBytes",
    ()=>containsBytes,
    "createCodec",
    ()=>createCodec,
    "createDecoder",
    ()=>createDecoder,
    "createEncoder",
    ()=>createEncoder,
    "fixBytes",
    ()=>fixBytes,
    "fixCodecSize",
    ()=>fixCodecSize,
    "fixDecoderSize",
    ()=>fixDecoderSize,
    "fixEncoderSize",
    ()=>fixEncoderSize,
    "getEncodedSize",
    ()=>getEncodedSize,
    "isFixedSize",
    ()=>isFixedSize,
    "isVariableSize",
    ()=>isVariableSize,
    "mergeBytes",
    ()=>mergeBytes,
    "offsetCodec",
    ()=>offsetCodec,
    "offsetDecoder",
    ()=>offsetDecoder,
    "offsetEncoder",
    ()=>offsetEncoder,
    "padBytes",
    ()=>padBytes,
    "padLeftCodec",
    ()=>padLeftCodec,
    "padLeftDecoder",
    ()=>padLeftDecoder,
    "padLeftEncoder",
    ()=>padLeftEncoder,
    "padRightCodec",
    ()=>padRightCodec,
    "padRightDecoder",
    ()=>padRightDecoder,
    "padRightEncoder",
    ()=>padRightEncoder,
    "resizeCodec",
    ()=>resizeCodec,
    "resizeDecoder",
    ()=>resizeDecoder,
    "resizeEncoder",
    ()=>resizeEncoder,
    "reverseCodec",
    ()=>reverseCodec,
    "reverseDecoder",
    ()=>reverseDecoder,
    "reverseEncoder",
    ()=>reverseEncoder,
    "transformCodec",
    ()=>transformCodec,
    "transformDecoder",
    ()=>transformDecoder,
    "transformEncoder",
    ()=>transformEncoder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+errors@2.3.0_typescript@5.9.2/node_modules/@solana/errors/dist/index.node.mjs [app-route] (ecmascript)");
;
// src/add-codec-sentinel.ts
// src/bytes.ts
var mergeBytes = (byteArrays)=>{
    const nonEmptyByteArrays = byteArrays.filter((arr)=>arr.length);
    if (nonEmptyByteArrays.length === 0) {
        return byteArrays.length ? byteArrays[0] : new Uint8Array();
    }
    if (nonEmptyByteArrays.length === 1) {
        return nonEmptyByteArrays[0];
    }
    const totalLength = nonEmptyByteArrays.reduce((total, arr)=>total + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    nonEmptyByteArrays.forEach((arr)=>{
        result.set(arr, offset);
        offset += arr.length;
    });
    return result;
};
var padBytes = (bytes, length)=>{
    if (bytes.length >= length) return bytes;
    const paddedBytes = new Uint8Array(length).fill(0);
    paddedBytes.set(bytes);
    return paddedBytes;
};
var fixBytes = (bytes, length)=>padBytes(bytes.length <= length ? bytes : bytes.slice(0, length), length);
function containsBytes(data, bytes, offset) {
    const slice = offset === 0 && data.length === bytes.length ? data : data.slice(offset, offset + bytes.length);
    if (slice.length !== bytes.length) return false;
    return bytes.every((b, i)=>b === slice[i]);
}
function getEncodedSize(value, encoder) {
    return "fixedSize" in encoder ? encoder.fixedSize : encoder.getSizeFromValue(value);
}
function createEncoder(encoder) {
    return Object.freeze({
        ...encoder,
        encode: (value)=>{
            const bytes = new Uint8Array(getEncodedSize(value, encoder));
            encoder.write(value, bytes, 0);
            return bytes;
        }
    });
}
function createDecoder(decoder) {
    return Object.freeze({
        ...decoder,
        decode: (bytes, offset = 0)=>decoder.read(bytes, offset)[0]
    });
}
function createCodec(codec) {
    return Object.freeze({
        ...codec,
        decode: (bytes, offset = 0)=>codec.read(bytes, offset)[0],
        encode: (value)=>{
            const bytes = new Uint8Array(getEncodedSize(value, codec));
            codec.write(value, bytes, 0);
            return bytes;
        }
    });
}
function isFixedSize(codec) {
    return "fixedSize" in codec && typeof codec.fixedSize === "number";
}
function assertIsFixedSize(codec) {
    if (!isFixedSize(codec)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__EXPECTED_FIXED_LENGTH"]);
    }
}
function isVariableSize(codec) {
    return !isFixedSize(codec);
}
function assertIsVariableSize(codec) {
    if (!isVariableSize(codec)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__EXPECTED_VARIABLE_LENGTH"]);
    }
}
function combineCodec(encoder, decoder) {
    if (isFixedSize(encoder) !== isFixedSize(decoder)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__ENCODER_DECODER_SIZE_COMPATIBILITY_MISMATCH"]);
    }
    if (isFixedSize(encoder) && isFixedSize(decoder) && encoder.fixedSize !== decoder.fixedSize) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__ENCODER_DECODER_FIXED_SIZE_MISMATCH"], {
            decoderFixedSize: decoder.fixedSize,
            encoderFixedSize: encoder.fixedSize
        });
    }
    if (!isFixedSize(encoder) && !isFixedSize(decoder) && encoder.maxSize !== decoder.maxSize) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__ENCODER_DECODER_MAX_SIZE_MISMATCH"], {
            decoderMaxSize: decoder.maxSize,
            encoderMaxSize: encoder.maxSize
        });
    }
    return {
        ...decoder,
        ...encoder,
        decode: decoder.decode,
        encode: encoder.encode,
        read: decoder.read,
        write: encoder.write
    };
}
// src/add-codec-sentinel.ts
function addEncoderSentinel(encoder, sentinel) {
    const write = (value, bytes, offset)=>{
        const encoderBytes = encoder.encode(value);
        if (findSentinelIndex(encoderBytes, sentinel) >= 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__ENCODED_BYTES_MUST_NOT_INCLUDE_SENTINEL"], {
                encodedBytes: encoderBytes,
                hexEncodedBytes: hexBytes(encoderBytes),
                hexSentinel: hexBytes(sentinel),
                sentinel
            });
        }
        bytes.set(encoderBytes, offset);
        offset += encoderBytes.length;
        bytes.set(sentinel, offset);
        offset += sentinel.length;
        return offset;
    };
    if (isFixedSize(encoder)) {
        return createEncoder({
            ...encoder,
            fixedSize: encoder.fixedSize + sentinel.length,
            write
        });
    }
    return createEncoder({
        ...encoder,
        ...encoder.maxSize != null ? {
            maxSize: encoder.maxSize + sentinel.length
        } : {},
        getSizeFromValue: (value)=>encoder.getSizeFromValue(value) + sentinel.length,
        write
    });
}
function addDecoderSentinel(decoder, sentinel) {
    const read = (bytes, offset)=>{
        const candidateBytes = offset === 0 ? bytes : bytes.slice(offset);
        const sentinelIndex = findSentinelIndex(candidateBytes, sentinel);
        if (sentinelIndex === -1) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__SENTINEL_MISSING_IN_DECODED_BYTES"], {
                decodedBytes: candidateBytes,
                hexDecodedBytes: hexBytes(candidateBytes),
                hexSentinel: hexBytes(sentinel),
                sentinel
            });
        }
        const preSentinelBytes = candidateBytes.slice(0, sentinelIndex);
        return [
            decoder.decode(preSentinelBytes),
            offset + preSentinelBytes.length + sentinel.length
        ];
    };
    if (isFixedSize(decoder)) {
        return createDecoder({
            ...decoder,
            fixedSize: decoder.fixedSize + sentinel.length,
            read
        });
    }
    return createDecoder({
        ...decoder,
        ...decoder.maxSize != null ? {
            maxSize: decoder.maxSize + sentinel.length
        } : {},
        read
    });
}
function addCodecSentinel(codec, sentinel) {
    return combineCodec(addEncoderSentinel(codec, sentinel), addDecoderSentinel(codec, sentinel));
}
function findSentinelIndex(bytes, sentinel) {
    return bytes.findIndex((byte, index, arr)=>{
        if (sentinel.length === 1) return byte === sentinel[0];
        return containsBytes(arr, sentinel, index);
    });
}
function hexBytes(bytes) {
    return bytes.reduce((str, byte)=>str + byte.toString(16).padStart(2, "0"), "");
}
function assertByteArrayIsNotEmptyForCodec(codecDescription, bytes, offset = 0) {
    if (bytes.length - offset <= 0) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__CANNOT_DECODE_EMPTY_BYTE_ARRAY"], {
            codecDescription
        });
    }
}
function assertByteArrayHasEnoughBytesForCodec(codecDescription, expected, bytes, offset = 0) {
    const bytesLength = bytes.length - offset;
    if (bytesLength < expected) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__INVALID_BYTE_LENGTH"], {
            bytesLength,
            codecDescription,
            expected
        });
    }
}
function assertByteArrayOffsetIsNotOutOfRange(codecDescription, offset, bytesLength) {
    if (offset < 0 || offset > bytesLength) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__OFFSET_OUT_OF_RANGE"], {
            bytesLength,
            codecDescription,
            offset
        });
    }
}
// src/add-codec-size-prefix.ts
function addEncoderSizePrefix(encoder, prefix) {
    const write = (value, bytes, offset)=>{
        const encoderBytes = encoder.encode(value);
        offset = prefix.write(encoderBytes.length, bytes, offset);
        bytes.set(encoderBytes, offset);
        return offset + encoderBytes.length;
    };
    if (isFixedSize(prefix) && isFixedSize(encoder)) {
        return createEncoder({
            ...encoder,
            fixedSize: prefix.fixedSize + encoder.fixedSize,
            write
        });
    }
    const prefixMaxSize = isFixedSize(prefix) ? prefix.fixedSize : prefix.maxSize ?? null;
    const encoderMaxSize = isFixedSize(encoder) ? encoder.fixedSize : encoder.maxSize ?? null;
    const maxSize = prefixMaxSize !== null && encoderMaxSize !== null ? prefixMaxSize + encoderMaxSize : null;
    return createEncoder({
        ...encoder,
        ...maxSize !== null ? {
            maxSize
        } : {},
        getSizeFromValue: (value)=>{
            const encoderSize = getEncodedSize(value, encoder);
            return getEncodedSize(encoderSize, prefix) + encoderSize;
        },
        write
    });
}
function addDecoderSizePrefix(decoder, prefix) {
    const read = (bytes, offset)=>{
        const [bigintSize, decoderOffset] = prefix.read(bytes, offset);
        const size = Number(bigintSize);
        offset = decoderOffset;
        if (offset > 0 || bytes.length > size) {
            bytes = bytes.slice(offset, offset + size);
        }
        assertByteArrayHasEnoughBytesForCodec("addDecoderSizePrefix", size, bytes);
        return [
            decoder.decode(bytes),
            offset + size
        ];
    };
    if (isFixedSize(prefix) && isFixedSize(decoder)) {
        return createDecoder({
            ...decoder,
            fixedSize: prefix.fixedSize + decoder.fixedSize,
            read
        });
    }
    const prefixMaxSize = isFixedSize(prefix) ? prefix.fixedSize : prefix.maxSize ?? null;
    const decoderMaxSize = isFixedSize(decoder) ? decoder.fixedSize : decoder.maxSize ?? null;
    const maxSize = prefixMaxSize !== null && decoderMaxSize !== null ? prefixMaxSize + decoderMaxSize : null;
    return createDecoder({
        ...decoder,
        ...maxSize !== null ? {
            maxSize
        } : {},
        read
    });
}
function addCodecSizePrefix(codec, prefix) {
    return combineCodec(addEncoderSizePrefix(codec, prefix), addDecoderSizePrefix(codec, prefix));
}
// src/fix-codec-size.ts
function fixEncoderSize(encoder, fixedBytes) {
    return createEncoder({
        fixedSize: fixedBytes,
        write: (value, bytes, offset)=>{
            const variableByteArray = encoder.encode(value);
            const fixedByteArray = variableByteArray.length > fixedBytes ? variableByteArray.slice(0, fixedBytes) : variableByteArray;
            bytes.set(fixedByteArray, offset);
            return offset + fixedBytes;
        }
    });
}
function fixDecoderSize(decoder, fixedBytes) {
    return createDecoder({
        fixedSize: fixedBytes,
        read: (bytes, offset)=>{
            assertByteArrayHasEnoughBytesForCodec("fixCodecSize", fixedBytes, bytes, offset);
            if (offset > 0 || bytes.length > fixedBytes) {
                bytes = bytes.slice(offset, offset + fixedBytes);
            }
            if (isFixedSize(decoder)) {
                bytes = fixBytes(bytes, decoder.fixedSize);
            }
            const [value] = decoder.read(bytes, 0);
            return [
                value,
                offset + fixedBytes
            ];
        }
    });
}
function fixCodecSize(codec, fixedBytes) {
    return combineCodec(fixEncoderSize(codec, fixedBytes), fixDecoderSize(codec, fixedBytes));
}
// src/offset-codec.ts
function offsetEncoder(encoder, config) {
    return createEncoder({
        ...encoder,
        write: (value, bytes, preOffset)=>{
            const wrapBytes = (offset)=>modulo(offset, bytes.length);
            const newPreOffset = config.preOffset ? config.preOffset({
                bytes,
                preOffset,
                wrapBytes
            }) : preOffset;
            assertByteArrayOffsetIsNotOutOfRange("offsetEncoder", newPreOffset, bytes.length);
            const postOffset = encoder.write(value, bytes, newPreOffset);
            const newPostOffset = config.postOffset ? config.postOffset({
                bytes,
                newPreOffset,
                postOffset,
                preOffset,
                wrapBytes
            }) : postOffset;
            assertByteArrayOffsetIsNotOutOfRange("offsetEncoder", newPostOffset, bytes.length);
            return newPostOffset;
        }
    });
}
function offsetDecoder(decoder, config) {
    return createDecoder({
        ...decoder,
        read: (bytes, preOffset)=>{
            const wrapBytes = (offset)=>modulo(offset, bytes.length);
            const newPreOffset = config.preOffset ? config.preOffset({
                bytes,
                preOffset,
                wrapBytes
            }) : preOffset;
            assertByteArrayOffsetIsNotOutOfRange("offsetDecoder", newPreOffset, bytes.length);
            const [value, postOffset] = decoder.read(bytes, newPreOffset);
            const newPostOffset = config.postOffset ? config.postOffset({
                bytes,
                newPreOffset,
                postOffset,
                preOffset,
                wrapBytes
            }) : postOffset;
            assertByteArrayOffsetIsNotOutOfRange("offsetDecoder", newPostOffset, bytes.length);
            return [
                value,
                newPostOffset
            ];
        }
    });
}
function offsetCodec(codec, config) {
    return combineCodec(offsetEncoder(codec, config), offsetDecoder(codec, config));
}
function modulo(dividend, divisor) {
    if (divisor === 0) return 0;
    return (dividend % divisor + divisor) % divisor;
}
function resizeEncoder(encoder, resize) {
    if (isFixedSize(encoder)) {
        const fixedSize = resize(encoder.fixedSize);
        if (fixedSize < 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__EXPECTED_POSITIVE_BYTE_LENGTH"], {
                bytesLength: fixedSize,
                codecDescription: "resizeEncoder"
            });
        }
        return createEncoder({
            ...encoder,
            fixedSize
        });
    }
    return createEncoder({
        ...encoder,
        getSizeFromValue: (value)=>{
            const newSize = resize(encoder.getSizeFromValue(value));
            if (newSize < 0) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__EXPECTED_POSITIVE_BYTE_LENGTH"], {
                    bytesLength: newSize,
                    codecDescription: "resizeEncoder"
                });
            }
            return newSize;
        }
    });
}
function resizeDecoder(decoder, resize) {
    if (isFixedSize(decoder)) {
        const fixedSize = resize(decoder.fixedSize);
        if (fixedSize < 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__EXPECTED_POSITIVE_BYTE_LENGTH"], {
                bytesLength: fixedSize,
                codecDescription: "resizeDecoder"
            });
        }
        return createDecoder({
            ...decoder,
            fixedSize
        });
    }
    return decoder;
}
function resizeCodec(codec, resize) {
    return combineCodec(resizeEncoder(codec, resize), resizeDecoder(codec, resize));
}
// src/pad-codec.ts
function padLeftEncoder(encoder, offset) {
    return offsetEncoder(resizeEncoder(encoder, (size)=>size + offset), {
        preOffset: ({ preOffset })=>preOffset + offset
    });
}
function padRightEncoder(encoder, offset) {
    return offsetEncoder(resizeEncoder(encoder, (size)=>size + offset), {
        postOffset: ({ postOffset })=>postOffset + offset
    });
}
function padLeftDecoder(decoder, offset) {
    return offsetDecoder(resizeDecoder(decoder, (size)=>size + offset), {
        preOffset: ({ preOffset })=>preOffset + offset
    });
}
function padRightDecoder(decoder, offset) {
    return offsetDecoder(resizeDecoder(decoder, (size)=>size + offset), {
        postOffset: ({ postOffset })=>postOffset + offset
    });
}
function padLeftCodec(codec, offset) {
    return combineCodec(padLeftEncoder(codec, offset), padLeftDecoder(codec, offset));
}
function padRightCodec(codec, offset) {
    return combineCodec(padRightEncoder(codec, offset), padRightDecoder(codec, offset));
}
// src/reverse-codec.ts
function copySourceToTargetInReverse(source, target_WILL_MUTATE, sourceOffset, sourceLength, targetOffset = 0) {
    while(sourceOffset < --sourceLength){
        const leftValue = source[sourceOffset];
        target_WILL_MUTATE[sourceOffset + targetOffset] = source[sourceLength];
        target_WILL_MUTATE[sourceLength + targetOffset] = leftValue;
        sourceOffset++;
    }
    if (sourceOffset === sourceLength) {
        target_WILL_MUTATE[sourceOffset + targetOffset] = source[sourceOffset];
    }
}
function reverseEncoder(encoder) {
    assertIsFixedSize(encoder);
    return createEncoder({
        ...encoder,
        write: (value, bytes, offset)=>{
            const newOffset = encoder.write(value, bytes, offset);
            copySourceToTargetInReverse(bytes, bytes, offset, offset + encoder.fixedSize);
            return newOffset;
        }
    });
}
function reverseDecoder(decoder) {
    assertIsFixedSize(decoder);
    return createDecoder({
        ...decoder,
        read: (bytes, offset)=>{
            const reversedBytes = bytes.slice();
            copySourceToTargetInReverse(bytes, reversedBytes, offset, offset + decoder.fixedSize);
            return decoder.read(reversedBytes, offset);
        }
    });
}
function reverseCodec(codec) {
    return combineCodec(reverseEncoder(codec), reverseDecoder(codec));
}
// src/transform-codec.ts
function transformEncoder(encoder, unmap) {
    return createEncoder({
        ...isVariableSize(encoder) ? {
            ...encoder,
            getSizeFromValue: (value)=>encoder.getSizeFromValue(unmap(value))
        } : encoder,
        write: (value, bytes, offset)=>encoder.write(unmap(value), bytes, offset)
    });
}
function transformDecoder(decoder, map) {
    return createDecoder({
        ...decoder,
        read: (bytes, offset)=>{
            const [value, newOffset] = decoder.read(bytes, offset);
            return [
                map(value, bytes, offset),
                newOffset
            ];
        }
    });
}
function transformCodec(codec, unmap, map) {
    return createCodec({
        ...transformEncoder(codec, unmap),
        read: map ? transformDecoder(codec, map).read : codec.read
    });
}
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-core@5.0.0_typescript@5.9.2/node_modules/@solana/codecs-core/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addCodecSentinel",
    ()=>addCodecSentinel,
    "addCodecSizePrefix",
    ()=>addCodecSizePrefix,
    "addDecoderSentinel",
    ()=>addDecoderSentinel,
    "addDecoderSizePrefix",
    ()=>addDecoderSizePrefix,
    "addEncoderSentinel",
    ()=>addEncoderSentinel,
    "addEncoderSizePrefix",
    ()=>addEncoderSizePrefix,
    "assertByteArrayHasEnoughBytesForCodec",
    ()=>assertByteArrayHasEnoughBytesForCodec,
    "assertByteArrayIsNotEmptyForCodec",
    ()=>assertByteArrayIsNotEmptyForCodec,
    "assertByteArrayOffsetIsNotOutOfRange",
    ()=>assertByteArrayOffsetIsNotOutOfRange,
    "assertIsFixedSize",
    ()=>assertIsFixedSize,
    "assertIsVariableSize",
    ()=>assertIsVariableSize,
    "combineCodec",
    ()=>combineCodec,
    "containsBytes",
    ()=>containsBytes,
    "createCodec",
    ()=>createCodec,
    "createDecoder",
    ()=>createDecoder,
    "createDecoderThatConsumesEntireByteArray",
    ()=>createDecoderThatConsumesEntireByteArray,
    "createEncoder",
    ()=>createEncoder,
    "fixBytes",
    ()=>fixBytes,
    "fixCodecSize",
    ()=>fixCodecSize,
    "fixDecoderSize",
    ()=>fixDecoderSize,
    "fixEncoderSize",
    ()=>fixEncoderSize,
    "getEncodedSize",
    ()=>getEncodedSize,
    "isFixedSize",
    ()=>isFixedSize,
    "isVariableSize",
    ()=>isVariableSize,
    "mergeBytes",
    ()=>mergeBytes,
    "offsetCodec",
    ()=>offsetCodec,
    "offsetDecoder",
    ()=>offsetDecoder,
    "offsetEncoder",
    ()=>offsetEncoder,
    "padBytes",
    ()=>padBytes,
    "padLeftCodec",
    ()=>padLeftCodec,
    "padLeftDecoder",
    ()=>padLeftDecoder,
    "padLeftEncoder",
    ()=>padLeftEncoder,
    "padRightCodec",
    ()=>padRightCodec,
    "padRightDecoder",
    ()=>padRightDecoder,
    "padRightEncoder",
    ()=>padRightEncoder,
    "resizeCodec",
    ()=>resizeCodec,
    "resizeDecoder",
    ()=>resizeDecoder,
    "resizeEncoder",
    ()=>resizeEncoder,
    "reverseCodec",
    ()=>reverseCodec,
    "reverseDecoder",
    ()=>reverseDecoder,
    "reverseEncoder",
    ()=>reverseEncoder,
    "transformCodec",
    ()=>transformCodec,
    "transformDecoder",
    ()=>transformDecoder,
    "transformEncoder",
    ()=>transformEncoder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+errors@5.0.0_typescript@5.9.2/node_modules/@solana/errors/dist/index.node.mjs [app-route] (ecmascript)");
;
// src/add-codec-sentinel.ts
// src/bytes.ts
var mergeBytes = (byteArrays)=>{
    const nonEmptyByteArrays = byteArrays.filter((arr)=>arr.length);
    if (nonEmptyByteArrays.length === 0) {
        return byteArrays.length ? byteArrays[0] : new Uint8Array();
    }
    if (nonEmptyByteArrays.length === 1) {
        return nonEmptyByteArrays[0];
    }
    const totalLength = nonEmptyByteArrays.reduce((total, arr)=>total + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    nonEmptyByteArrays.forEach((arr)=>{
        result.set(arr, offset);
        offset += arr.length;
    });
    return result;
};
function padBytes(bytes, length) {
    if (bytes.length >= length) return bytes;
    const paddedBytes = new Uint8Array(length).fill(0);
    paddedBytes.set(bytes);
    return paddedBytes;
}
var fixBytes = (bytes, length)=>padBytes(bytes.length <= length ? bytes : bytes.slice(0, length), length);
function containsBytes(data, bytes, offset) {
    const slice = offset === 0 && data.length === bytes.length ? data : data.slice(offset, offset + bytes.length);
    if (slice.length !== bytes.length) return false;
    return bytes.every((b, i)=>b === slice[i]);
}
function getEncodedSize(value, encoder) {
    return "fixedSize" in encoder ? encoder.fixedSize : encoder.getSizeFromValue(value);
}
function createEncoder(encoder) {
    return Object.freeze({
        ...encoder,
        encode: (value)=>{
            const bytes = new Uint8Array(getEncodedSize(value, encoder));
            encoder.write(value, bytes, 0);
            return bytes;
        }
    });
}
function createDecoder(decoder) {
    return Object.freeze({
        ...decoder,
        decode: (bytes, offset = 0)=>decoder.read(bytes, offset)[0]
    });
}
function createCodec(codec) {
    return Object.freeze({
        ...codec,
        decode: (bytes, offset = 0)=>codec.read(bytes, offset)[0],
        encode: (value)=>{
            const bytes = new Uint8Array(getEncodedSize(value, codec));
            codec.write(value, bytes, 0);
            return bytes;
        }
    });
}
function isFixedSize(codec) {
    return "fixedSize" in codec && typeof codec.fixedSize === "number";
}
function assertIsFixedSize(codec) {
    if (!isFixedSize(codec)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__EXPECTED_FIXED_LENGTH"]);
    }
}
function isVariableSize(codec) {
    return !isFixedSize(codec);
}
function assertIsVariableSize(codec) {
    if (!isVariableSize(codec)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__EXPECTED_VARIABLE_LENGTH"]);
    }
}
function combineCodec(encoder, decoder) {
    if (isFixedSize(encoder) !== isFixedSize(decoder)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__ENCODER_DECODER_SIZE_COMPATIBILITY_MISMATCH"]);
    }
    if (isFixedSize(encoder) && isFixedSize(decoder) && encoder.fixedSize !== decoder.fixedSize) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__ENCODER_DECODER_FIXED_SIZE_MISMATCH"], {
            decoderFixedSize: decoder.fixedSize,
            encoderFixedSize: encoder.fixedSize
        });
    }
    if (!isFixedSize(encoder) && !isFixedSize(decoder) && encoder.maxSize !== decoder.maxSize) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__ENCODER_DECODER_MAX_SIZE_MISMATCH"], {
            decoderMaxSize: decoder.maxSize,
            encoderMaxSize: encoder.maxSize
        });
    }
    return {
        ...decoder,
        ...encoder,
        decode: decoder.decode,
        encode: encoder.encode,
        read: decoder.read,
        write: encoder.write
    };
}
// src/add-codec-sentinel.ts
function addEncoderSentinel(encoder, sentinel) {
    const write = (value, bytes, offset)=>{
        const encoderBytes = encoder.encode(value);
        if (findSentinelIndex(encoderBytes, sentinel) >= 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__ENCODED_BYTES_MUST_NOT_INCLUDE_SENTINEL"], {
                encodedBytes: encoderBytes,
                hexEncodedBytes: hexBytes(encoderBytes),
                hexSentinel: hexBytes(sentinel),
                sentinel
            });
        }
        bytes.set(encoderBytes, offset);
        offset += encoderBytes.length;
        bytes.set(sentinel, offset);
        offset += sentinel.length;
        return offset;
    };
    if (isFixedSize(encoder)) {
        return createEncoder({
            ...encoder,
            fixedSize: encoder.fixedSize + sentinel.length,
            write
        });
    }
    return createEncoder({
        ...encoder,
        ...encoder.maxSize != null ? {
            maxSize: encoder.maxSize + sentinel.length
        } : {},
        getSizeFromValue: (value)=>encoder.getSizeFromValue(value) + sentinel.length,
        write
    });
}
function addDecoderSentinel(decoder, sentinel) {
    const read = (bytes, offset)=>{
        const candidateBytes = offset === 0 ? bytes : bytes.slice(offset);
        const sentinelIndex = findSentinelIndex(candidateBytes, sentinel);
        if (sentinelIndex === -1) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__SENTINEL_MISSING_IN_DECODED_BYTES"], {
                decodedBytes: candidateBytes,
                hexDecodedBytes: hexBytes(candidateBytes),
                hexSentinel: hexBytes(sentinel),
                sentinel
            });
        }
        const preSentinelBytes = candidateBytes.slice(0, sentinelIndex);
        return [
            decoder.decode(preSentinelBytes),
            offset + preSentinelBytes.length + sentinel.length
        ];
    };
    if (isFixedSize(decoder)) {
        return createDecoder({
            ...decoder,
            fixedSize: decoder.fixedSize + sentinel.length,
            read
        });
    }
    return createDecoder({
        ...decoder,
        ...decoder.maxSize != null ? {
            maxSize: decoder.maxSize + sentinel.length
        } : {},
        read
    });
}
function addCodecSentinel(codec, sentinel) {
    return combineCodec(addEncoderSentinel(codec, sentinel), addDecoderSentinel(codec, sentinel));
}
function findSentinelIndex(bytes, sentinel) {
    return bytes.findIndex((byte, index, arr)=>{
        if (sentinel.length === 1) return byte === sentinel[0];
        return containsBytes(arr, sentinel, index);
    });
}
function hexBytes(bytes) {
    return bytes.reduce((str, byte)=>str + byte.toString(16).padStart(2, "0"), "");
}
function assertByteArrayIsNotEmptyForCodec(codecDescription, bytes, offset = 0) {
    if (bytes.length - offset <= 0) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__CANNOT_DECODE_EMPTY_BYTE_ARRAY"], {
            codecDescription
        });
    }
}
function assertByteArrayHasEnoughBytesForCodec(codecDescription, expected, bytes, offset = 0) {
    const bytesLength = bytes.length - offset;
    if (bytesLength < expected) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__INVALID_BYTE_LENGTH"], {
            bytesLength,
            codecDescription,
            expected
        });
    }
}
function assertByteArrayOffsetIsNotOutOfRange(codecDescription, offset, bytesLength) {
    if (offset < 0 || offset > bytesLength) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__OFFSET_OUT_OF_RANGE"], {
            bytesLength,
            codecDescription,
            offset
        });
    }
}
// src/add-codec-size-prefix.ts
function addEncoderSizePrefix(encoder, prefix) {
    const write = (value, bytes, offset)=>{
        const encoderBytes = encoder.encode(value);
        offset = prefix.write(encoderBytes.length, bytes, offset);
        bytes.set(encoderBytes, offset);
        return offset + encoderBytes.length;
    };
    if (isFixedSize(prefix) && isFixedSize(encoder)) {
        return createEncoder({
            ...encoder,
            fixedSize: prefix.fixedSize + encoder.fixedSize,
            write
        });
    }
    const prefixMaxSize = isFixedSize(prefix) ? prefix.fixedSize : prefix.maxSize ?? null;
    const encoderMaxSize = isFixedSize(encoder) ? encoder.fixedSize : encoder.maxSize ?? null;
    const maxSize = prefixMaxSize !== null && encoderMaxSize !== null ? prefixMaxSize + encoderMaxSize : null;
    return createEncoder({
        ...encoder,
        ...maxSize !== null ? {
            maxSize
        } : {},
        getSizeFromValue: (value)=>{
            const encoderSize = getEncodedSize(value, encoder);
            return getEncodedSize(encoderSize, prefix) + encoderSize;
        },
        write
    });
}
function addDecoderSizePrefix(decoder, prefix) {
    const read = (bytes, offset)=>{
        const [bigintSize, decoderOffset] = prefix.read(bytes, offset);
        const size = Number(bigintSize);
        offset = decoderOffset;
        if (offset > 0 || bytes.length > size) {
            bytes = bytes.slice(offset, offset + size);
        }
        assertByteArrayHasEnoughBytesForCodec("addDecoderSizePrefix", size, bytes);
        return [
            decoder.decode(bytes),
            offset + size
        ];
    };
    if (isFixedSize(prefix) && isFixedSize(decoder)) {
        return createDecoder({
            ...decoder,
            fixedSize: prefix.fixedSize + decoder.fixedSize,
            read
        });
    }
    const prefixMaxSize = isFixedSize(prefix) ? prefix.fixedSize : prefix.maxSize ?? null;
    const decoderMaxSize = isFixedSize(decoder) ? decoder.fixedSize : decoder.maxSize ?? null;
    const maxSize = prefixMaxSize !== null && decoderMaxSize !== null ? prefixMaxSize + decoderMaxSize : null;
    return createDecoder({
        ...decoder,
        ...maxSize !== null ? {
            maxSize
        } : {},
        read
    });
}
function addCodecSizePrefix(codec, prefix) {
    return combineCodec(addEncoderSizePrefix(codec, prefix), addDecoderSizePrefix(codec, prefix));
}
function createDecoderThatConsumesEntireByteArray(decoder) {
    return createDecoder({
        ...decoder,
        read (bytes, offset) {
            const [value, newOffset] = decoder.read(bytes, offset);
            if (bytes.length > newOffset) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__EXPECTED_DECODER_TO_CONSUME_ENTIRE_BYTE_ARRAY"], {
                    expectedLength: newOffset,
                    numExcessBytes: bytes.length - newOffset
                });
            }
            return [
                value,
                newOffset
            ];
        }
    });
}
// src/fix-codec-size.ts
function fixEncoderSize(encoder, fixedBytes) {
    return createEncoder({
        fixedSize: fixedBytes,
        write: (value, bytes, offset)=>{
            const variableByteArray = encoder.encode(value);
            const fixedByteArray = variableByteArray.length > fixedBytes ? variableByteArray.slice(0, fixedBytes) : variableByteArray;
            bytes.set(fixedByteArray, offset);
            return offset + fixedBytes;
        }
    });
}
function fixDecoderSize(decoder, fixedBytes) {
    return createDecoder({
        fixedSize: fixedBytes,
        read: (bytes, offset)=>{
            assertByteArrayHasEnoughBytesForCodec("fixCodecSize", fixedBytes, bytes, offset);
            if (offset > 0 || bytes.length > fixedBytes) {
                bytes = bytes.slice(offset, offset + fixedBytes);
            }
            if (isFixedSize(decoder)) {
                bytes = fixBytes(bytes, decoder.fixedSize);
            }
            const [value] = decoder.read(bytes, 0);
            return [
                value,
                offset + fixedBytes
            ];
        }
    });
}
function fixCodecSize(codec, fixedBytes) {
    return combineCodec(fixEncoderSize(codec, fixedBytes), fixDecoderSize(codec, fixedBytes));
}
// src/offset-codec.ts
function offsetEncoder(encoder, config) {
    return createEncoder({
        ...encoder,
        write: (value, bytes, preOffset)=>{
            const wrapBytes = (offset)=>modulo(offset, bytes.length);
            const newPreOffset = config.preOffset ? config.preOffset({
                bytes,
                preOffset,
                wrapBytes
            }) : preOffset;
            assertByteArrayOffsetIsNotOutOfRange("offsetEncoder", newPreOffset, bytes.length);
            const postOffset = encoder.write(value, bytes, newPreOffset);
            const newPostOffset = config.postOffset ? config.postOffset({
                bytes,
                newPreOffset,
                postOffset,
                preOffset,
                wrapBytes
            }) : postOffset;
            assertByteArrayOffsetIsNotOutOfRange("offsetEncoder", newPostOffset, bytes.length);
            return newPostOffset;
        }
    });
}
function offsetDecoder(decoder, config) {
    return createDecoder({
        ...decoder,
        read: (bytes, preOffset)=>{
            const wrapBytes = (offset)=>modulo(offset, bytes.length);
            const newPreOffset = config.preOffset ? config.preOffset({
                bytes,
                preOffset,
                wrapBytes
            }) : preOffset;
            assertByteArrayOffsetIsNotOutOfRange("offsetDecoder", newPreOffset, bytes.length);
            const [value, postOffset] = decoder.read(bytes, newPreOffset);
            const newPostOffset = config.postOffset ? config.postOffset({
                bytes,
                newPreOffset,
                postOffset,
                preOffset,
                wrapBytes
            }) : postOffset;
            assertByteArrayOffsetIsNotOutOfRange("offsetDecoder", newPostOffset, bytes.length);
            return [
                value,
                newPostOffset
            ];
        }
    });
}
function offsetCodec(codec, config) {
    return combineCodec(offsetEncoder(codec, config), offsetDecoder(codec, config));
}
function modulo(dividend, divisor) {
    if (divisor === 0) return 0;
    return (dividend % divisor + divisor) % divisor;
}
function resizeEncoder(encoder, resize) {
    if (isFixedSize(encoder)) {
        const fixedSize = resize(encoder.fixedSize);
        if (fixedSize < 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__EXPECTED_POSITIVE_BYTE_LENGTH"], {
                bytesLength: fixedSize,
                codecDescription: "resizeEncoder"
            });
        }
        return createEncoder({
            ...encoder,
            fixedSize
        });
    }
    return createEncoder({
        ...encoder,
        getSizeFromValue: (value)=>{
            const newSize = resize(encoder.getSizeFromValue(value));
            if (newSize < 0) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__EXPECTED_POSITIVE_BYTE_LENGTH"], {
                    bytesLength: newSize,
                    codecDescription: "resizeEncoder"
                });
            }
            return newSize;
        }
    });
}
function resizeDecoder(decoder, resize) {
    if (isFixedSize(decoder)) {
        const fixedSize = resize(decoder.fixedSize);
        if (fixedSize < 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__EXPECTED_POSITIVE_BYTE_LENGTH"], {
                bytesLength: fixedSize,
                codecDescription: "resizeDecoder"
            });
        }
        return createDecoder({
            ...decoder,
            fixedSize
        });
    }
    return decoder;
}
function resizeCodec(codec, resize) {
    return combineCodec(resizeEncoder(codec, resize), resizeDecoder(codec, resize));
}
// src/pad-codec.ts
function padLeftEncoder(encoder, offset) {
    return offsetEncoder(resizeEncoder(encoder, (size)=>size + offset), {
        preOffset: ({ preOffset })=>preOffset + offset
    });
}
function padRightEncoder(encoder, offset) {
    return offsetEncoder(resizeEncoder(encoder, (size)=>size + offset), {
        postOffset: ({ postOffset })=>postOffset + offset
    });
}
function padLeftDecoder(decoder, offset) {
    return offsetDecoder(resizeDecoder(decoder, (size)=>size + offset), {
        preOffset: ({ preOffset })=>preOffset + offset
    });
}
function padRightDecoder(decoder, offset) {
    return offsetDecoder(resizeDecoder(decoder, (size)=>size + offset), {
        postOffset: ({ postOffset })=>postOffset + offset
    });
}
function padLeftCodec(codec, offset) {
    return combineCodec(padLeftEncoder(codec, offset), padLeftDecoder(codec, offset));
}
function padRightCodec(codec, offset) {
    return combineCodec(padRightEncoder(codec, offset), padRightDecoder(codec, offset));
}
// src/reverse-codec.ts
function copySourceToTargetInReverse(source, target_WILL_MUTATE, sourceOffset, sourceLength, targetOffset = 0) {
    while(sourceOffset < --sourceLength){
        const leftValue = source[sourceOffset];
        target_WILL_MUTATE[sourceOffset + targetOffset] = source[sourceLength];
        target_WILL_MUTATE[sourceLength + targetOffset] = leftValue;
        sourceOffset++;
    }
    if (sourceOffset === sourceLength) {
        target_WILL_MUTATE[sourceOffset + targetOffset] = source[sourceOffset];
    }
}
function reverseEncoder(encoder) {
    assertIsFixedSize(encoder);
    return createEncoder({
        ...encoder,
        write: (value, bytes, offset)=>{
            const newOffset = encoder.write(value, bytes, offset);
            copySourceToTargetInReverse(bytes, bytes, offset, offset + encoder.fixedSize);
            return newOffset;
        }
    });
}
function reverseDecoder(decoder) {
    assertIsFixedSize(decoder);
    return createDecoder({
        ...decoder,
        read: (bytes, offset)=>{
            const reversedBytes = bytes.slice();
            copySourceToTargetInReverse(bytes, reversedBytes, offset, offset + decoder.fixedSize);
            return decoder.read(reversedBytes, offset);
        }
    });
}
function reverseCodec(codec) {
    return combineCodec(reverseEncoder(codec), reverseDecoder(codec));
}
// src/transform-codec.ts
function transformEncoder(encoder, unmap) {
    return createEncoder({
        ...isVariableSize(encoder) ? {
            ...encoder,
            getSizeFromValue: (value)=>encoder.getSizeFromValue(unmap(value))
        } : encoder,
        write: (value, bytes, offset)=>encoder.write(unmap(value), bytes, offset)
    });
}
function transformDecoder(decoder, map) {
    return createDecoder({
        ...decoder,
        read: (bytes, offset)=>{
            const [value, newOffset] = decoder.read(bytes, offset);
            return [
                map(value, bytes, offset),
                newOffset
            ];
        }
    });
}
function transformCodec(codec, unmap, map) {
    return createCodec({
        ...transformEncoder(codec, unmap),
        read: map ? transformDecoder(codec, map).read : codec.read
    });
}
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-strings@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/codecs-strings/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assertValidBaseString",
    ()=>assertValidBaseString,
    "getBase10Codec",
    ()=>getBase10Codec,
    "getBase10Decoder",
    ()=>getBase10Decoder,
    "getBase10Encoder",
    ()=>getBase10Encoder,
    "getBase16Codec",
    ()=>getBase16Codec,
    "getBase16Decoder",
    ()=>getBase16Decoder,
    "getBase16Encoder",
    ()=>getBase16Encoder,
    "getBase58Codec",
    ()=>getBase58Codec,
    "getBase58Decoder",
    ()=>getBase58Decoder,
    "getBase58Encoder",
    ()=>getBase58Encoder,
    "getBase64Codec",
    ()=>getBase64Codec,
    "getBase64Decoder",
    ()=>getBase64Decoder,
    "getBase64Encoder",
    ()=>getBase64Encoder,
    "getBaseXCodec",
    ()=>getBaseXCodec,
    "getBaseXDecoder",
    ()=>getBaseXDecoder,
    "getBaseXEncoder",
    ()=>getBaseXEncoder,
    "getBaseXResliceCodec",
    ()=>getBaseXResliceCodec,
    "getBaseXResliceDecoder",
    ()=>getBaseXResliceDecoder,
    "getBaseXResliceEncoder",
    ()=>getBaseXResliceEncoder,
    "getUtf8Codec",
    ()=>getUtf8Codec,
    "getUtf8Decoder",
    ()=>getUtf8Decoder,
    "getUtf8Encoder",
    ()=>getUtf8Encoder,
    "padNullCharacters",
    ()=>padNullCharacters,
    "removeNullCharacters",
    ()=>removeNullCharacters
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+errors@2.3.0_typescript@5.9.2/node_modules/@solana/errors/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-core@2.3.0_typescript@5.9.2/node_modules/@solana/codecs-core/dist/index.node.mjs [app-route] (ecmascript)");
;
;
// src/assertions.ts
function assertValidBaseString(alphabet4, testValue, givenValue = testValue) {
    if (!testValue.match(new RegExp(`^[${alphabet4}]*$`))) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__INVALID_STRING_FOR_BASE"], {
            alphabet: alphabet4,
            base: alphabet4.length,
            value: givenValue
        });
    }
}
var getBaseXEncoder = (alphabet4)=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        getSizeFromValue: (value)=>{
            const [leadingZeroes, tailChars] = partitionLeadingZeroes(value, alphabet4[0]);
            if (!tailChars) return value.length;
            const base10Number = getBigIntFromBaseX(tailChars, alphabet4);
            return leadingZeroes.length + Math.ceil(base10Number.toString(16).length / 2);
        },
        write (value, bytes, offset) {
            assertValidBaseString(alphabet4, value);
            if (value === "") return offset;
            const [leadingZeroes, tailChars] = partitionLeadingZeroes(value, alphabet4[0]);
            if (!tailChars) {
                bytes.set(new Uint8Array(leadingZeroes.length).fill(0), offset);
                return offset + leadingZeroes.length;
            }
            let base10Number = getBigIntFromBaseX(tailChars, alphabet4);
            const tailBytes = [];
            while(base10Number > 0n){
                tailBytes.unshift(Number(base10Number % 256n));
                base10Number /= 256n;
            }
            const bytesToAdd = [
                ...Array(leadingZeroes.length).fill(0),
                ...tailBytes
            ];
            bytes.set(bytesToAdd, offset);
            return offset + bytesToAdd.length;
        }
    });
};
var getBaseXDecoder = (alphabet4)=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        read (rawBytes, offset) {
            const bytes = offset === 0 ? rawBytes : rawBytes.slice(offset);
            if (bytes.length === 0) return [
                "",
                0
            ];
            let trailIndex = bytes.findIndex((n)=>n !== 0);
            trailIndex = trailIndex === -1 ? bytes.length : trailIndex;
            const leadingZeroes = alphabet4[0].repeat(trailIndex);
            if (trailIndex === bytes.length) return [
                leadingZeroes,
                rawBytes.length
            ];
            const base10Number = bytes.slice(trailIndex).reduce((sum, byte)=>sum * 256n + BigInt(byte), 0n);
            const tailChars = getBaseXFromBigInt(base10Number, alphabet4);
            return [
                leadingZeroes + tailChars,
                rawBytes.length
            ];
        }
    });
};
var getBaseXCodec = (alphabet4)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getBaseXEncoder(alphabet4), getBaseXDecoder(alphabet4));
function partitionLeadingZeroes(value, zeroCharacter) {
    const [leadingZeros, tailChars] = value.split(new RegExp(`((?!${zeroCharacter}).*)`));
    return [
        leadingZeros,
        tailChars
    ];
}
function getBigIntFromBaseX(value, alphabet4) {
    const base = BigInt(alphabet4.length);
    let sum = 0n;
    for (const char of value){
        sum *= base;
        sum += BigInt(alphabet4.indexOf(char));
    }
    return sum;
}
function getBaseXFromBigInt(value, alphabet4) {
    const base = BigInt(alphabet4.length);
    const tailChars = [];
    while(value > 0n){
        tailChars.unshift(alphabet4[Number(value % base)]);
        value /= base;
    }
    return tailChars.join("");
}
// src/base10.ts
var alphabet = "0123456789";
var getBase10Encoder = ()=>getBaseXEncoder(alphabet);
var getBase10Decoder = ()=>getBaseXDecoder(alphabet);
var getBase10Codec = ()=>getBaseXCodec(alphabet);
var INVALID_STRING_ERROR_BASE_CONFIG = {
    alphabet: "0123456789abcdef",
    base: 16
};
function charCodeToBase16(char) {
    if (char >= 48 /* ZERO */  && char <= 57 /* NINE */ ) return char - 48 /* ZERO */ ;
    if (char >= 65 /* A_UP */  && char <= 70 /* F_UP */ ) return char - (65 /* A_UP */  - 10);
    if (char >= 97 /* A_LO */  && char <= 102 /* F_LO */ ) return char - (97 /* A_LO */  - 10);
}
var getBase16Encoder = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        getSizeFromValue: (value)=>Math.ceil(value.length / 2),
        write (value, bytes, offset) {
            const len = value.length;
            const al = len / 2;
            if (len === 1) {
                const c = value.charCodeAt(0);
                const n = charCodeToBase16(c);
                if (n === void 0) {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__INVALID_STRING_FOR_BASE"], {
                        ...INVALID_STRING_ERROR_BASE_CONFIG,
                        value
                    });
                }
                bytes.set([
                    n
                ], offset);
                return 1 + offset;
            }
            const hexBytes = new Uint8Array(al);
            for(let i = 0, j = 0; i < al; i++){
                const c1 = value.charCodeAt(j++);
                const c2 = value.charCodeAt(j++);
                const n1 = charCodeToBase16(c1);
                const n2 = charCodeToBase16(c2);
                if (n1 === void 0 || n2 === void 0 && !Number.isNaN(c2)) {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__INVALID_STRING_FOR_BASE"], {
                        ...INVALID_STRING_ERROR_BASE_CONFIG,
                        value
                    });
                }
                hexBytes[i] = !Number.isNaN(c2) ? n1 << 4 | (n2 ?? 0) : n1;
            }
            bytes.set(hexBytes, offset);
            return hexBytes.length + offset;
        }
    });
var getBase16Decoder = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        read (bytes, offset) {
            const value = bytes.slice(offset).reduce((str, byte)=>str + byte.toString(16).padStart(2, "0"), "");
            return [
                value,
                bytes.length
            ];
        }
    });
var getBase16Codec = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getBase16Encoder(), getBase16Decoder());
// src/base58.ts
var alphabet2 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
var getBase58Encoder = ()=>getBaseXEncoder(alphabet2);
var getBase58Decoder = ()=>getBaseXDecoder(alphabet2);
var getBase58Codec = ()=>getBaseXCodec(alphabet2);
var getBaseXResliceEncoder = (alphabet4, bits)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        getSizeFromValue: (value)=>Math.floor(value.length * bits / 8),
        write (value, bytes, offset) {
            assertValidBaseString(alphabet4, value);
            if (value === "") return offset;
            const charIndices = [
                ...value
            ].map((c)=>alphabet4.indexOf(c));
            const reslicedBytes = reslice(charIndices, bits, 8, false);
            bytes.set(reslicedBytes, offset);
            return reslicedBytes.length + offset;
        }
    });
var getBaseXResliceDecoder = (alphabet4, bits)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        read (rawBytes, offset = 0) {
            const bytes = offset === 0 ? rawBytes : rawBytes.slice(offset);
            if (bytes.length === 0) return [
                "",
                rawBytes.length
            ];
            const charIndices = reslice([
                ...bytes
            ], 8, bits, true);
            return [
                charIndices.map((i)=>alphabet4[i]).join(""),
                rawBytes.length
            ];
        }
    });
var getBaseXResliceCodec = (alphabet4, bits)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getBaseXResliceEncoder(alphabet4, bits), getBaseXResliceDecoder(alphabet4, bits));
function reslice(input, inputBits, outputBits, useRemainder) {
    const output = [];
    let accumulator = 0;
    let bitsInAccumulator = 0;
    const mask = (1 << outputBits) - 1;
    for (const value of input){
        accumulator = accumulator << inputBits | value;
        bitsInAccumulator += inputBits;
        while(bitsInAccumulator >= outputBits){
            bitsInAccumulator -= outputBits;
            output.push(accumulator >> bitsInAccumulator & mask);
        }
    }
    if (useRemainder && bitsInAccumulator > 0) {
        output.push(accumulator << outputBits - bitsInAccumulator & mask);
    }
    return output;
}
// src/base64.ts
var alphabet3 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var getBase64Encoder = ()=>{
    {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
            getSizeFromValue: (value)=>Buffer.from(value, "base64").length,
            write (value, bytes, offset) {
                assertValidBaseString(alphabet3, value.replace(/=/g, ""));
                const buffer = Buffer.from(value, "base64");
                bytes.set(buffer, offset);
                return buffer.length + offset;
            }
        });
    }
};
var getBase64Decoder = ()=>{
    {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
            read: (bytes, offset = 0)=>[
                    Buffer.from(bytes, offset).toString("base64"),
                    bytes.length
                ]
        });
    }
};
var getBase64Codec = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getBase64Encoder(), getBase64Decoder());
// src/null-characters.ts
var removeNullCharacters = (value)=>// eslint-disable-next-line no-control-regex
    value.replace(/\u0000/g, "");
var padNullCharacters = (value, chars)=>value.padEnd(chars, "\0");
// ../text-encoding-impl/dist/index.node.mjs
var e = globalThis.TextDecoder;
var o = globalThis.TextEncoder;
// src/utf8.ts
var getUtf8Encoder = ()=>{
    let textEncoder;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        getSizeFromValue: (value)=>(textEncoder ||= new o()).encode(value).length,
        write: (value, bytes, offset)=>{
            const bytesToAdd = (textEncoder ||= new o()).encode(value);
            bytes.set(bytesToAdd, offset);
            return offset + bytesToAdd.length;
        }
    });
};
var getUtf8Decoder = ()=>{
    let textDecoder;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        read (bytes, offset) {
            const value = (textDecoder ||= new e()).decode(bytes.slice(offset));
            return [
                removeNullCharacters(value),
                bytes.length
            ];
        }
    });
};
var getUtf8Codec = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getUtf8Encoder(), getUtf8Decoder());
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-strings@5.0.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/codecs-strings/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assertValidBaseString",
    ()=>assertValidBaseString,
    "getBase10Codec",
    ()=>getBase10Codec,
    "getBase10Decoder",
    ()=>getBase10Decoder,
    "getBase10Encoder",
    ()=>getBase10Encoder,
    "getBase16Codec",
    ()=>getBase16Codec,
    "getBase16Decoder",
    ()=>getBase16Decoder,
    "getBase16Encoder",
    ()=>getBase16Encoder,
    "getBase58Codec",
    ()=>getBase58Codec,
    "getBase58Decoder",
    ()=>getBase58Decoder,
    "getBase58Encoder",
    ()=>getBase58Encoder,
    "getBase64Codec",
    ()=>getBase64Codec,
    "getBase64Decoder",
    ()=>getBase64Decoder,
    "getBase64Encoder",
    ()=>getBase64Encoder,
    "getBaseXCodec",
    ()=>getBaseXCodec,
    "getBaseXDecoder",
    ()=>getBaseXDecoder,
    "getBaseXEncoder",
    ()=>getBaseXEncoder,
    "getBaseXResliceCodec",
    ()=>getBaseXResliceCodec,
    "getBaseXResliceDecoder",
    ()=>getBaseXResliceDecoder,
    "getBaseXResliceEncoder",
    ()=>getBaseXResliceEncoder,
    "getUtf8Codec",
    ()=>getUtf8Codec,
    "getUtf8Decoder",
    ()=>getUtf8Decoder,
    "getUtf8Encoder",
    ()=>getUtf8Encoder,
    "padNullCharacters",
    ()=>padNullCharacters,
    "removeNullCharacters",
    ()=>removeNullCharacters
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+errors@5.0.0_typescript@5.9.2/node_modules/@solana/errors/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-core@5.0.0_typescript@5.9.2/node_modules/@solana/codecs-core/dist/index.node.mjs [app-route] (ecmascript)");
;
;
// src/assertions.ts
function assertValidBaseString(alphabet4, testValue, givenValue = testValue) {
    if (!testValue.match(new RegExp(`^[${alphabet4}]*$`))) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__INVALID_STRING_FOR_BASE"], {
            alphabet: alphabet4,
            base: alphabet4.length,
            value: givenValue
        });
    }
}
var getBaseXEncoder = (alphabet4)=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        getSizeFromValue: (value)=>{
            const [leadingZeroes, tailChars] = partitionLeadingZeroes(value, alphabet4[0]);
            if (!tailChars) return value.length;
            const base10Number = getBigIntFromBaseX(tailChars, alphabet4);
            return leadingZeroes.length + Math.ceil(base10Number.toString(16).length / 2);
        },
        write (value, bytes, offset) {
            assertValidBaseString(alphabet4, value);
            if (value === "") return offset;
            const [leadingZeroes, tailChars] = partitionLeadingZeroes(value, alphabet4[0]);
            if (!tailChars) {
                bytes.set(new Uint8Array(leadingZeroes.length).fill(0), offset);
                return offset + leadingZeroes.length;
            }
            let base10Number = getBigIntFromBaseX(tailChars, alphabet4);
            const tailBytes = [];
            while(base10Number > 0n){
                tailBytes.unshift(Number(base10Number % 256n));
                base10Number /= 256n;
            }
            const bytesToAdd = [
                ...Array(leadingZeroes.length).fill(0),
                ...tailBytes
            ];
            bytes.set(bytesToAdd, offset);
            return offset + bytesToAdd.length;
        }
    });
};
var getBaseXDecoder = (alphabet4)=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        read (rawBytes, offset) {
            const bytes = offset === 0 ? rawBytes : rawBytes.slice(offset);
            if (bytes.length === 0) return [
                "",
                0
            ];
            let trailIndex = bytes.findIndex((n)=>n !== 0);
            trailIndex = trailIndex === -1 ? bytes.length : trailIndex;
            const leadingZeroes = alphabet4[0].repeat(trailIndex);
            if (trailIndex === bytes.length) return [
                leadingZeroes,
                rawBytes.length
            ];
            const base10Number = bytes.slice(trailIndex).reduce((sum, byte)=>sum * 256n + BigInt(byte), 0n);
            const tailChars = getBaseXFromBigInt(base10Number, alphabet4);
            return [
                leadingZeroes + tailChars,
                rawBytes.length
            ];
        }
    });
};
var getBaseXCodec = (alphabet4)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getBaseXEncoder(alphabet4), getBaseXDecoder(alphabet4));
function partitionLeadingZeroes(value, zeroCharacter) {
    const [leadingZeros, tailChars] = value.split(new RegExp(`((?!${zeroCharacter}).*)`));
    return [
        leadingZeros,
        tailChars
    ];
}
function getBigIntFromBaseX(value, alphabet4) {
    const base = BigInt(alphabet4.length);
    let sum = 0n;
    for (const char of value){
        sum *= base;
        sum += BigInt(alphabet4.indexOf(char));
    }
    return sum;
}
function getBaseXFromBigInt(value, alphabet4) {
    const base = BigInt(alphabet4.length);
    const tailChars = [];
    while(value > 0n){
        tailChars.unshift(alphabet4[Number(value % base)]);
        value /= base;
    }
    return tailChars.join("");
}
// src/base10.ts
var alphabet = "0123456789";
var getBase10Encoder = ()=>getBaseXEncoder(alphabet);
var getBase10Decoder = ()=>getBaseXDecoder(alphabet);
var getBase10Codec = ()=>getBaseXCodec(alphabet);
var INVALID_STRING_ERROR_BASE_CONFIG = {
    alphabet: "0123456789abcdef",
    base: 16
};
function charCodeToBase16(char) {
    if (char >= 48 /* ZERO */  && char <= 57 /* NINE */ ) return char - 48 /* ZERO */ ;
    if (char >= 65 /* A_UP */  && char <= 70 /* F_UP */ ) return char - (65 /* A_UP */  - 10);
    if (char >= 97 /* A_LO */  && char <= 102 /* F_LO */ ) return char - (97 /* A_LO */  - 10);
}
var getBase16Encoder = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        getSizeFromValue: (value)=>Math.ceil(value.length / 2),
        write (value, bytes, offset) {
            const len = value.length;
            const al = len / 2;
            if (len === 1) {
                const c = value.charCodeAt(0);
                const n = charCodeToBase16(c);
                if (n === void 0) {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__INVALID_STRING_FOR_BASE"], {
                        ...INVALID_STRING_ERROR_BASE_CONFIG,
                        value
                    });
                }
                bytes.set([
                    n
                ], offset);
                return 1 + offset;
            }
            const hexBytes = new Uint8Array(al);
            for(let i = 0, j = 0; i < al; i++){
                const c1 = value.charCodeAt(j++);
                const c2 = value.charCodeAt(j++);
                const n1 = charCodeToBase16(c1);
                const n2 = charCodeToBase16(c2);
                if (n1 === void 0 || n2 === void 0 && !Number.isNaN(c2)) {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__INVALID_STRING_FOR_BASE"], {
                        ...INVALID_STRING_ERROR_BASE_CONFIG,
                        value
                    });
                }
                hexBytes[i] = !Number.isNaN(c2) ? n1 << 4 | (n2 ?? 0) : n1;
            }
            bytes.set(hexBytes, offset);
            return hexBytes.length + offset;
        }
    });
var getBase16Decoder = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        read (bytes, offset) {
            const value = bytes.slice(offset).reduce((str, byte)=>str + byte.toString(16).padStart(2, "0"), "");
            return [
                value,
                bytes.length
            ];
        }
    });
var getBase16Codec = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getBase16Encoder(), getBase16Decoder());
// src/base58.ts
var alphabet2 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
var getBase58Encoder = ()=>getBaseXEncoder(alphabet2);
var getBase58Decoder = ()=>getBaseXDecoder(alphabet2);
var getBase58Codec = ()=>getBaseXCodec(alphabet2);
var getBaseXResliceEncoder = (alphabet4, bits)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        getSizeFromValue: (value)=>Math.floor(value.length * bits / 8),
        write (value, bytes, offset) {
            assertValidBaseString(alphabet4, value);
            if (value === "") return offset;
            const charIndices = [
                ...value
            ].map((c)=>alphabet4.indexOf(c));
            const reslicedBytes = reslice(charIndices, bits, 8, false);
            bytes.set(reslicedBytes, offset);
            return reslicedBytes.length + offset;
        }
    });
var getBaseXResliceDecoder = (alphabet4, bits)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        read (rawBytes, offset = 0) {
            const bytes = offset === 0 ? rawBytes : rawBytes.slice(offset);
            if (bytes.length === 0) return [
                "",
                rawBytes.length
            ];
            const charIndices = reslice([
                ...bytes
            ], 8, bits, true);
            return [
                charIndices.map((i)=>alphabet4[i]).join(""),
                rawBytes.length
            ];
        }
    });
var getBaseXResliceCodec = (alphabet4, bits)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getBaseXResliceEncoder(alphabet4, bits), getBaseXResliceDecoder(alphabet4, bits));
function reslice(input, inputBits, outputBits, useRemainder) {
    const output = [];
    let accumulator = 0;
    let bitsInAccumulator = 0;
    const mask = (1 << outputBits) - 1;
    for (const value of input){
        accumulator = accumulator << inputBits | value;
        bitsInAccumulator += inputBits;
        while(bitsInAccumulator >= outputBits){
            bitsInAccumulator -= outputBits;
            output.push(accumulator >> bitsInAccumulator & mask);
        }
    }
    if (useRemainder && bitsInAccumulator > 0) {
        output.push(accumulator << outputBits - bitsInAccumulator & mask);
    }
    return output;
}
// src/base64.ts
var alphabet3 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var getBase64Encoder = ()=>{
    {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
            getSizeFromValue: (value)=>Buffer.from(value, "base64").length,
            write (value, bytes, offset) {
                assertValidBaseString(alphabet3, value.replace(/=/g, ""));
                const buffer = Buffer.from(value, "base64");
                bytes.set(buffer, offset);
                return buffer.length + offset;
            }
        });
    }
};
var getBase64Decoder = ()=>{
    {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
            read: (bytes, offset = 0)=>[
                    Buffer.from(bytes, offset).toString("base64"),
                    bytes.length
                ]
        });
    }
};
var getBase64Codec = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getBase64Encoder(), getBase64Decoder());
// src/null-characters.ts
var removeNullCharacters = (value)=>// eslint-disable-next-line no-control-regex
    value.replace(/\u0000/g, "");
var padNullCharacters = (value, chars)=>value.padEnd(chars, "\0");
// ../text-encoding-impl/dist/index.node.mjs
var e = globalThis.TextDecoder;
var o = globalThis.TextEncoder;
// src/utf8.ts
var getUtf8Encoder = ()=>{
    let textEncoder;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        getSizeFromValue: (value)=>(textEncoder ||= new o()).encode(value).length,
        write: (value, bytes, offset)=>{
            const bytesToAdd = (textEncoder ||= new o()).encode(value);
            bytes.set(bytesToAdd, offset);
            return offset + bytesToAdd.length;
        }
    });
};
var getUtf8Decoder = ()=>{
    let textDecoder;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        read (bytes, offset) {
            const value = (textDecoder ||= new e()).decode(bytes.slice(offset));
            return [
                removeNullCharacters(value),
                bytes.length
            ];
        }
    });
};
var getUtf8Codec = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getUtf8Encoder(), getUtf8Decoder());
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+assertions@2.3.0_typescript@5.9.2/node_modules/@solana/assertions/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assertDigestCapabilityIsAvailable",
    ()=>assertDigestCapabilityIsAvailable,
    "assertKeyExporterIsAvailable",
    ()=>assertKeyExporterIsAvailable,
    "assertKeyGenerationIsAvailable",
    ()=>assertKeyGenerationIsAvailable,
    "assertPRNGIsAvailable",
    ()=>assertPRNGIsAvailable,
    "assertSigningCapabilityIsAvailable",
    ()=>assertSigningCapabilityIsAvailable,
    "assertVerificationCapabilityIsAvailable",
    ()=>assertVerificationCapabilityIsAvailable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+errors@2.3.0_typescript@5.9.2/node_modules/@solana/errors/dist/index.node.mjs [app-route] (ecmascript)");
;
// src/crypto.ts
function assertPRNGIsAvailable() {
    if (typeof globalThis.crypto === "undefined" || typeof globalThis.crypto.getRandomValues !== "function") {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CRYPTO__RANDOM_VALUES_FUNCTION_UNIMPLEMENTED"]);
    }
}
var cachedEd25519Decision;
async function isEd25519CurveSupported(subtle) {
    if (cachedEd25519Decision === void 0) {
        cachedEd25519Decision = new Promise((resolve)=>{
            subtle.generateKey("Ed25519", /* extractable */ false, [
                "sign",
                "verify"
            ]).then(()=>{
                resolve(cachedEd25519Decision = true);
            }).catch(()=>{
                resolve(cachedEd25519Decision = false);
            });
        });
    }
    if (typeof cachedEd25519Decision === "boolean") {
        return cachedEd25519Decision;
    } else {
        return await cachedEd25519Decision;
    }
}
function assertDigestCapabilityIsAvailable() {
    if (typeof globalThis.crypto === "undefined" || typeof globalThis.crypto.subtle?.digest !== "function") {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__SUBTLE_CRYPTO__DIGEST_UNIMPLEMENTED"]);
    }
}
async function assertKeyGenerationIsAvailable() {
    if (typeof globalThis.crypto === "undefined" || typeof globalThis.crypto.subtle?.generateKey !== "function") {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__SUBTLE_CRYPTO__GENERATE_FUNCTION_UNIMPLEMENTED"]);
    }
    if (!await isEd25519CurveSupported(globalThis.crypto.subtle)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__SUBTLE_CRYPTO__ED25519_ALGORITHM_UNIMPLEMENTED"]);
    }
}
function assertKeyExporterIsAvailable() {
    if (typeof globalThis.crypto === "undefined" || typeof globalThis.crypto.subtle?.exportKey !== "function") {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__SUBTLE_CRYPTO__EXPORT_FUNCTION_UNIMPLEMENTED"]);
    }
}
function assertSigningCapabilityIsAvailable() {
    if (typeof globalThis.crypto === "undefined" || typeof globalThis.crypto.subtle?.sign !== "function") {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__SUBTLE_CRYPTO__SIGN_FUNCTION_UNIMPLEMENTED"]);
    }
}
function assertVerificationCapabilityIsAvailable() {
    if (typeof globalThis.crypto === "undefined" || typeof globalThis.crypto.subtle?.verify !== "function") {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__SUBTLE_CRYPTO__VERIFY_FUNCTION_UNIMPLEMENTED"]);
    }
}
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+assertions@5.0.0_typescript@5.9.2/node_modules/@solana/assertions/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assertDigestCapabilityIsAvailable",
    ()=>assertDigestCapabilityIsAvailable,
    "assertKeyExporterIsAvailable",
    ()=>assertKeyExporterIsAvailable,
    "assertKeyGenerationIsAvailable",
    ()=>assertKeyGenerationIsAvailable,
    "assertPRNGIsAvailable",
    ()=>assertPRNGIsAvailable,
    "assertSigningCapabilityIsAvailable",
    ()=>assertSigningCapabilityIsAvailable,
    "assertVerificationCapabilityIsAvailable",
    ()=>assertVerificationCapabilityIsAvailable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+errors@5.0.0_typescript@5.9.2/node_modules/@solana/errors/dist/index.node.mjs [app-route] (ecmascript)");
;
// src/crypto.ts
function assertPRNGIsAvailable() {
    if (typeof globalThis.crypto === "undefined" || typeof globalThis.crypto.getRandomValues !== "function") {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CRYPTO__RANDOM_VALUES_FUNCTION_UNIMPLEMENTED"]);
    }
}
var cachedEd25519Decision;
async function isEd25519CurveSupported(subtle) {
    if (cachedEd25519Decision === void 0) {
        cachedEd25519Decision = new Promise((resolve)=>{
            subtle.generateKey("Ed25519", /* extractable */ false, [
                "sign",
                "verify"
            ]).then(()=>{
                resolve(cachedEd25519Decision = true);
            }).catch(()=>{
                resolve(cachedEd25519Decision = false);
            });
        });
    }
    if (typeof cachedEd25519Decision === "boolean") {
        return cachedEd25519Decision;
    } else {
        return await cachedEd25519Decision;
    }
}
function assertDigestCapabilityIsAvailable() {
    if (typeof globalThis.crypto === "undefined" || typeof globalThis.crypto.subtle?.digest !== "function") {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__SUBTLE_CRYPTO__DIGEST_UNIMPLEMENTED"]);
    }
}
async function assertKeyGenerationIsAvailable() {
    if (typeof globalThis.crypto === "undefined" || typeof globalThis.crypto.subtle?.generateKey !== "function") {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__SUBTLE_CRYPTO__GENERATE_FUNCTION_UNIMPLEMENTED"]);
    }
    if (!await isEd25519CurveSupported(globalThis.crypto.subtle)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__SUBTLE_CRYPTO__ED25519_ALGORITHM_UNIMPLEMENTED"]);
    }
}
function assertKeyExporterIsAvailable() {
    if (typeof globalThis.crypto === "undefined" || typeof globalThis.crypto.subtle?.exportKey !== "function") {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__SUBTLE_CRYPTO__EXPORT_FUNCTION_UNIMPLEMENTED"]);
    }
}
function assertSigningCapabilityIsAvailable() {
    if (typeof globalThis.crypto === "undefined" || typeof globalThis.crypto.subtle?.sign !== "function") {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__SUBTLE_CRYPTO__SIGN_FUNCTION_UNIMPLEMENTED"]);
    }
}
function assertVerificationCapabilityIsAvailable() {
    if (typeof globalThis.crypto === "undefined" || typeof globalThis.crypto.subtle?.verify !== "function") {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__SUBTLE_CRYPTO__VERIFY_FUNCTION_UNIMPLEMENTED"]);
    }
}
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+addresses@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/addresses/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "address",
    ()=>address,
    "assertIsAddress",
    ()=>assertIsAddress,
    "assertIsOffCurveAddress",
    ()=>assertIsOffCurveAddress,
    "assertIsProgramDerivedAddress",
    ()=>assertIsProgramDerivedAddress,
    "createAddressWithSeed",
    ()=>createAddressWithSeed,
    "getAddressCodec",
    ()=>getAddressCodec,
    "getAddressComparator",
    ()=>getAddressComparator,
    "getAddressDecoder",
    ()=>getAddressDecoder,
    "getAddressEncoder",
    ()=>getAddressEncoder,
    "getAddressFromPublicKey",
    ()=>getAddressFromPublicKey,
    "getProgramDerivedAddress",
    ()=>getProgramDerivedAddress,
    "getPublicKeyFromAddress",
    ()=>getPublicKeyFromAddress,
    "isAddress",
    ()=>isAddress,
    "isOffCurveAddress",
    ()=>isOffCurveAddress,
    "isProgramDerivedAddress",
    ()=>isProgramDerivedAddress,
    "offCurveAddress",
    ()=>offCurveAddress
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-core@2.3.0_typescript@5.9.2/node_modules/@solana/codecs-core/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$strings$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$strings$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-strings@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/codecs-strings/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+errors@2.3.0_typescript@5.9.2/node_modules/@solana/errors/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$assertions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$assertions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+assertions@2.3.0_typescript@5.9.2/node_modules/@solana/assertions/dist/index.node.mjs [app-route] (ecmascript)");
;
;
;
;
// src/address.ts
var memoizedBase58Encoder;
var memoizedBase58Decoder;
function getMemoizedBase58Encoder() {
    if (!memoizedBase58Encoder) memoizedBase58Encoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$strings$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$strings$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBase58Encoder"])();
    return memoizedBase58Encoder;
}
function getMemoizedBase58Decoder() {
    if (!memoizedBase58Decoder) memoizedBase58Decoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$strings$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$strings$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBase58Decoder"])();
    return memoizedBase58Decoder;
}
function isAddress(putativeAddress) {
    if (// Lowest address (32 bytes of zeroes)
    putativeAddress.length < 32 || // Highest address (32 bytes of 255)
    putativeAddress.length > 44) {
        return false;
    }
    const base58Encoder = getMemoizedBase58Encoder();
    try {
        return base58Encoder.encode(putativeAddress).byteLength === 32;
    } catch  {
        return false;
    }
}
function assertIsAddress(putativeAddress) {
    if (// Lowest address (32 bytes of zeroes)
    putativeAddress.length < 32 || // Highest address (32 bytes of 255)
    putativeAddress.length > 44) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__STRING_LENGTH_OUT_OF_RANGE"], {
            actualLength: putativeAddress.length
        });
    }
    const base58Encoder = getMemoizedBase58Encoder();
    const bytes = base58Encoder.encode(putativeAddress);
    const numBytes = bytes.byteLength;
    if (numBytes !== 32) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__INVALID_BYTE_LENGTH"], {
            actualLength: numBytes
        });
    }
}
function address(putativeAddress) {
    assertIsAddress(putativeAddress);
    return putativeAddress;
}
function getAddressEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fixEncoderSize"])(getMemoizedBase58Encoder(), 32), (putativeAddress)=>address(putativeAddress));
}
function getAddressDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fixDecoderSize"])(getMemoizedBase58Decoder(), 32);
}
function getAddressCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getAddressEncoder(), getAddressDecoder());
}
function getAddressComparator() {
    return new Intl.Collator("en", {
        caseFirst: "lower",
        ignorePunctuation: false,
        localeMatcher: "best fit",
        numeric: false,
        sensitivity: "variant",
        usage: "sort"
    }).compare;
}
// src/vendor/noble/ed25519.ts
var D = 37095705934669439343138083508754565189542113879843219016388785533085940283555n;
var P = 57896044618658097711785492504343953926634992332820282019728792003956564819949n;
var RM1 = 19681161376707505956807079304988542015446066515923890162744021073123829784752n;
function mod(a) {
    const r = a % P;
    return r >= 0n ? r : P + r;
}
function pow2(x, power) {
    let r = x;
    while(power-- > 0n){
        r *= r;
        r %= P;
    }
    return r;
}
function pow_2_252_3(x) {
    const x2 = x * x % P;
    const b2 = x2 * x % P;
    const b4 = pow2(b2, 2n) * b2 % P;
    const b5 = pow2(b4, 1n) * x % P;
    const b10 = pow2(b5, 5n) * b5 % P;
    const b20 = pow2(b10, 10n) * b10 % P;
    const b40 = pow2(b20, 20n) * b20 % P;
    const b80 = pow2(b40, 40n) * b40 % P;
    const b160 = pow2(b80, 80n) * b80 % P;
    const b240 = pow2(b160, 80n) * b80 % P;
    const b250 = pow2(b240, 10n) * b10 % P;
    const pow_p_5_8 = pow2(b250, 2n) * x % P;
    return pow_p_5_8;
}
function uvRatio(u, v) {
    const v3 = mod(v * v * v);
    const v7 = mod(v3 * v3 * v);
    const pow = pow_2_252_3(u * v7);
    let x = mod(u * v3 * pow);
    const vx2 = mod(v * x * x);
    const root1 = x;
    const root2 = mod(x * RM1);
    const useRoot1 = vx2 === u;
    const useRoot2 = vx2 === mod(-u);
    const noRoot = vx2 === mod(-u * RM1);
    if (useRoot1) x = root1;
    if (useRoot2 || noRoot) x = root2;
    if ((mod(x) & 1n) === 1n) x = mod(-x);
    if (!useRoot1 && !useRoot2) {
        return null;
    }
    return x;
}
function pointIsOnCurve(y, lastByte) {
    const y2 = mod(y * y);
    const u = mod(y2 - 1n);
    const v = mod(D * y2 + 1n);
    const x = uvRatio(u, v);
    if (x === null) {
        return false;
    }
    const isLastByteOdd = (lastByte & 128) !== 0;
    if (x === 0n && isLastByteOdd) {
        return false;
    }
    return true;
}
// src/curve-internal.ts
function byteToHex(byte) {
    const hexString = byte.toString(16);
    if (hexString.length === 1) {
        return `0${hexString}`;
    } else {
        return hexString;
    }
}
function decompressPointBytes(bytes) {
    const hexString = bytes.reduce((acc, byte, ii)=>`${byteToHex(ii === 31 ? byte & -129 : byte)}${acc}`, "");
    const integerLiteralString = `0x${hexString}`;
    return BigInt(integerLiteralString);
}
function compressedPointBytesAreOnCurve(bytes) {
    if (bytes.byteLength !== 32) {
        return false;
    }
    const y = decompressPointBytes(bytes);
    return pointIsOnCurve(y, bytes[31]);
}
// src/curve.ts
function isOffCurveAddress(putativeOffCurveAddress) {
    const addressBytes = getAddressCodec().encode(putativeOffCurveAddress);
    return compressedPointBytesAreOnCurve(addressBytes) === false;
}
function assertIsOffCurveAddress(putativeOffCurveAddress) {
    if (!isOffCurveAddress(putativeOffCurveAddress)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__INVALID_OFF_CURVE_ADDRESS"]);
    }
}
function offCurveAddress(putativeOffCurveAddress) {
    assertIsOffCurveAddress(putativeOffCurveAddress);
    return putativeOffCurveAddress;
}
function isProgramDerivedAddress(value) {
    return Array.isArray(value) && value.length === 2 && typeof value[0] === "string" && typeof value[1] === "number" && value[1] >= 0 && value[1] <= 255 && isAddress(value[0]);
}
function assertIsProgramDerivedAddress(value) {
    const validFormat = Array.isArray(value) && value.length === 2 && typeof value[0] === "string" && typeof value[1] === "number";
    if (!validFormat) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__MALFORMED_PDA"]);
    }
    if (value[1] < 0 || value[1] > 255) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__PDA_BUMP_SEED_OUT_OF_RANGE"], {
            bump: value[1]
        });
    }
    assertIsAddress(value[0]);
}
var MAX_SEED_LENGTH = 32;
var MAX_SEEDS = 16;
var PDA_MARKER_BYTES = [
    // The string 'ProgramDerivedAddress'
    80,
    114,
    111,
    103,
    114,
    97,
    109,
    68,
    101,
    114,
    105,
    118,
    101,
    100,
    65,
    100,
    100,
    114,
    101,
    115,
    115
];
async function createProgramDerivedAddress({ programAddress, seeds }) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$assertions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$assertions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertDigestCapabilityIsAvailable"])();
    if (seeds.length > MAX_SEEDS) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__MAX_NUMBER_OF_PDA_SEEDS_EXCEEDED"], {
            actual: seeds.length,
            maxSeeds: MAX_SEEDS
        });
    }
    let textEncoder;
    const seedBytes = seeds.reduce((acc, seed, ii)=>{
        const bytes = typeof seed === "string" ? (textEncoder ||= new TextEncoder()).encode(seed) : seed;
        if (bytes.byteLength > MAX_SEED_LENGTH) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__MAX_PDA_SEED_LENGTH_EXCEEDED"], {
                actual: bytes.byteLength,
                index: ii,
                maxSeedLength: MAX_SEED_LENGTH
            });
        }
        acc.push(...bytes);
        return acc;
    }, []);
    const base58EncodedAddressCodec = getAddressCodec();
    const programAddressBytes = base58EncodedAddressCodec.encode(programAddress);
    const addressBytesBuffer = await crypto.subtle.digest("SHA-256", new Uint8Array([
        ...seedBytes,
        ...programAddressBytes,
        ...PDA_MARKER_BYTES
    ]));
    const addressBytes = new Uint8Array(addressBytesBuffer);
    if (compressedPointBytesAreOnCurve(addressBytes)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__INVALID_SEEDS_POINT_ON_CURVE"]);
    }
    return base58EncodedAddressCodec.decode(addressBytes);
}
async function getProgramDerivedAddress({ programAddress, seeds }) {
    let bumpSeed = 255;
    while(bumpSeed > 0){
        try {
            const address2 = await createProgramDerivedAddress({
                programAddress,
                seeds: [
                    ...seeds,
                    new Uint8Array([
                        bumpSeed
                    ])
                ]
            });
            return [
                address2,
                bumpSeed
            ];
        } catch (e) {
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSolanaError"])(e, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__INVALID_SEEDS_POINT_ON_CURVE"])) {
                bumpSeed--;
            } else {
                throw e;
            }
        }
    }
    throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__FAILED_TO_FIND_VIABLE_PDA_BUMP_SEED"]);
}
async function createAddressWithSeed({ baseAddress, programAddress, seed }) {
    const { encode, decode } = getAddressCodec();
    const seedBytes = typeof seed === "string" ? new TextEncoder().encode(seed) : seed;
    if (seedBytes.byteLength > MAX_SEED_LENGTH) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__MAX_PDA_SEED_LENGTH_EXCEEDED"], {
            actual: seedBytes.byteLength,
            index: 0,
            maxSeedLength: MAX_SEED_LENGTH
        });
    }
    const programAddressBytes = encode(programAddress);
    if (programAddressBytes.length >= PDA_MARKER_BYTES.length && programAddressBytes.slice(-PDA_MARKER_BYTES.length).every((byte, index)=>byte === PDA_MARKER_BYTES[index])) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__PDA_ENDS_WITH_PDA_MARKER"]);
    }
    const addressBytesBuffer = await crypto.subtle.digest("SHA-256", new Uint8Array([
        ...encode(baseAddress),
        ...seedBytes,
        ...programAddressBytes
    ]));
    const addressBytes = new Uint8Array(addressBytesBuffer);
    return decode(addressBytes);
}
async function getAddressFromPublicKey(publicKey) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$assertions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$assertions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertKeyExporterIsAvailable"])();
    if (publicKey.type !== "public" || publicKey.algorithm.name !== "Ed25519") {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__INVALID_ED25519_PUBLIC_KEY"]);
    }
    const publicKeyBytes = await crypto.subtle.exportKey("raw", publicKey);
    return getAddressDecoder().decode(new Uint8Array(publicKeyBytes));
}
async function getPublicKeyFromAddress(address2) {
    const addressBytes = getAddressEncoder().encode(address2);
    return await crypto.subtle.importKey("raw", addressBytes, {
        name: "Ed25519"
    }, true, [
        "verify"
    ]);
}
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+addresses@5.0.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/addresses/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "address",
    ()=>address,
    "assertIsAddress",
    ()=>assertIsAddress,
    "assertIsOffCurveAddress",
    ()=>assertIsOffCurveAddress,
    "assertIsProgramDerivedAddress",
    ()=>assertIsProgramDerivedAddress,
    "createAddressWithSeed",
    ()=>createAddressWithSeed,
    "getAddressCodec",
    ()=>getAddressCodec,
    "getAddressComparator",
    ()=>getAddressComparator,
    "getAddressDecoder",
    ()=>getAddressDecoder,
    "getAddressEncoder",
    ()=>getAddressEncoder,
    "getAddressFromPublicKey",
    ()=>getAddressFromPublicKey,
    "getProgramDerivedAddress",
    ()=>getProgramDerivedAddress,
    "getPublicKeyFromAddress",
    ()=>getPublicKeyFromAddress,
    "isAddress",
    ()=>isAddress,
    "isOffCurveAddress",
    ()=>isOffCurveAddress,
    "isProgramDerivedAddress",
    ()=>isProgramDerivedAddress,
    "offCurveAddress",
    ()=>offCurveAddress
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-core@5.0.0_typescript@5.9.2/node_modules/@solana/codecs-core/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$strings$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$strings$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-strings@5.0.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/codecs-strings/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+errors@5.0.0_typescript@5.9.2/node_modules/@solana/errors/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$assertions$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$assertions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+assertions@5.0.0_typescript@5.9.2/node_modules/@solana/assertions/dist/index.node.mjs [app-route] (ecmascript)");
;
;
;
;
// src/address.ts
var memoizedBase58Encoder;
var memoizedBase58Decoder;
function getMemoizedBase58Encoder() {
    if (!memoizedBase58Encoder) memoizedBase58Encoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$strings$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$strings$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBase58Encoder"])();
    return memoizedBase58Encoder;
}
function getMemoizedBase58Decoder() {
    if (!memoizedBase58Decoder) memoizedBase58Decoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$strings$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$strings$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBase58Decoder"])();
    return memoizedBase58Decoder;
}
function isAddress(putativeAddress) {
    if (// Lowest address (32 bytes of zeroes)
    putativeAddress.length < 32 || // Highest address (32 bytes of 255)
    putativeAddress.length > 44) {
        return false;
    }
    const base58Encoder = getMemoizedBase58Encoder();
    try {
        return base58Encoder.encode(putativeAddress).byteLength === 32;
    } catch  {
        return false;
    }
}
function assertIsAddress(putativeAddress) {
    if (// Lowest address (32 bytes of zeroes)
    putativeAddress.length < 32 || // Highest address (32 bytes of 255)
    putativeAddress.length > 44) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__STRING_LENGTH_OUT_OF_RANGE"], {
            actualLength: putativeAddress.length
        });
    }
    const base58Encoder = getMemoizedBase58Encoder();
    const bytes = base58Encoder.encode(putativeAddress);
    const numBytes = bytes.byteLength;
    if (numBytes !== 32) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__INVALID_BYTE_LENGTH"], {
            actualLength: numBytes
        });
    }
}
function address(putativeAddress) {
    assertIsAddress(putativeAddress);
    return putativeAddress;
}
function getAddressEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fixEncoderSize"])(getMemoizedBase58Encoder(), 32), (putativeAddress)=>address(putativeAddress));
}
function getAddressDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fixDecoderSize"])(getMemoizedBase58Decoder(), 32);
}
function getAddressCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getAddressEncoder(), getAddressDecoder());
}
function getAddressComparator() {
    return new Intl.Collator("en", {
        caseFirst: "lower",
        ignorePunctuation: false,
        localeMatcher: "best fit",
        numeric: false,
        sensitivity: "variant",
        usage: "sort"
    }).compare;
}
// src/vendor/noble/ed25519.ts
var D = 37095705934669439343138083508754565189542113879843219016388785533085940283555n;
var P = 57896044618658097711785492504343953926634992332820282019728792003956564819949n;
var RM1 = 19681161376707505956807079304988542015446066515923890162744021073123829784752n;
function mod(a) {
    const r = a % P;
    return r >= 0n ? r : P + r;
}
function pow2(x, power) {
    let r = x;
    while(power-- > 0n){
        r *= r;
        r %= P;
    }
    return r;
}
function pow_2_252_3(x) {
    const x2 = x * x % P;
    const b2 = x2 * x % P;
    const b4 = pow2(b2, 2n) * b2 % P;
    const b5 = pow2(b4, 1n) * x % P;
    const b10 = pow2(b5, 5n) * b5 % P;
    const b20 = pow2(b10, 10n) * b10 % P;
    const b40 = pow2(b20, 20n) * b20 % P;
    const b80 = pow2(b40, 40n) * b40 % P;
    const b160 = pow2(b80, 80n) * b80 % P;
    const b240 = pow2(b160, 80n) * b80 % P;
    const b250 = pow2(b240, 10n) * b10 % P;
    const pow_p_5_8 = pow2(b250, 2n) * x % P;
    return pow_p_5_8;
}
function uvRatio(u, v) {
    const v3 = mod(v * v * v);
    const v7 = mod(v3 * v3 * v);
    const pow = pow_2_252_3(u * v7);
    let x = mod(u * v3 * pow);
    const vx2 = mod(v * x * x);
    const root1 = x;
    const root2 = mod(x * RM1);
    const useRoot1 = vx2 === u;
    const useRoot2 = vx2 === mod(-u);
    const noRoot = vx2 === mod(-u * RM1);
    if (useRoot1) x = root1;
    if (useRoot2 || noRoot) x = root2;
    if ((mod(x) & 1n) === 1n) x = mod(-x);
    if (!useRoot1 && !useRoot2) {
        return null;
    }
    return x;
}
function pointIsOnCurve(y, lastByte) {
    const y2 = mod(y * y);
    const u = mod(y2 - 1n);
    const v = mod(D * y2 + 1n);
    const x = uvRatio(u, v);
    if (x === null) {
        return false;
    }
    const isLastByteOdd = (lastByte & 128) !== 0;
    if (x === 0n && isLastByteOdd) {
        return false;
    }
    return true;
}
// src/curve-internal.ts
function byteToHex(byte) {
    const hexString = byte.toString(16);
    if (hexString.length === 1) {
        return `0${hexString}`;
    } else {
        return hexString;
    }
}
function decompressPointBytes(bytes) {
    const hexString = bytes.reduce((acc, byte, ii)=>`${byteToHex(ii === 31 ? byte & -129 : byte)}${acc}`, "");
    const integerLiteralString = `0x${hexString}`;
    return BigInt(integerLiteralString);
}
function compressedPointBytesAreOnCurve(bytes) {
    if (bytes.byteLength !== 32) {
        return false;
    }
    const y = decompressPointBytes(bytes);
    return pointIsOnCurve(y, bytes[31]);
}
// src/curve.ts
function isOffCurveAddress(putativeOffCurveAddress) {
    const addressBytes = getAddressCodec().encode(putativeOffCurveAddress);
    return compressedPointBytesAreOnCurve(addressBytes) === false;
}
function assertIsOffCurveAddress(putativeOffCurveAddress) {
    if (!isOffCurveAddress(putativeOffCurveAddress)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__INVALID_OFF_CURVE_ADDRESS"]);
    }
}
function offCurveAddress(putativeOffCurveAddress) {
    assertIsOffCurveAddress(putativeOffCurveAddress);
    return putativeOffCurveAddress;
}
function isProgramDerivedAddress(value) {
    return Array.isArray(value) && value.length === 2 && typeof value[0] === "string" && typeof value[1] === "number" && value[1] >= 0 && value[1] <= 255 && isAddress(value[0]);
}
function assertIsProgramDerivedAddress(value) {
    const validFormat = Array.isArray(value) && value.length === 2 && typeof value[0] === "string" && typeof value[1] === "number";
    if (!validFormat) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__MALFORMED_PDA"]);
    }
    if (value[1] < 0 || value[1] > 255) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__PDA_BUMP_SEED_OUT_OF_RANGE"], {
            bump: value[1]
        });
    }
    assertIsAddress(value[0]);
}
var MAX_SEED_LENGTH = 32;
var MAX_SEEDS = 16;
var PDA_MARKER_BYTES = [
    // The string 'ProgramDerivedAddress'
    80,
    114,
    111,
    103,
    114,
    97,
    109,
    68,
    101,
    114,
    105,
    118,
    101,
    100,
    65,
    100,
    100,
    114,
    101,
    115,
    115
];
async function createProgramDerivedAddress({ programAddress, seeds }) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$assertions$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$assertions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertDigestCapabilityIsAvailable"])();
    if (seeds.length > MAX_SEEDS) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__MAX_NUMBER_OF_PDA_SEEDS_EXCEEDED"], {
            actual: seeds.length,
            maxSeeds: MAX_SEEDS
        });
    }
    let textEncoder;
    const seedBytes = seeds.reduce((acc, seed, ii)=>{
        const bytes = typeof seed === "string" ? (textEncoder ||= new TextEncoder()).encode(seed) : seed;
        if (bytes.byteLength > MAX_SEED_LENGTH) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__MAX_PDA_SEED_LENGTH_EXCEEDED"], {
                actual: bytes.byteLength,
                index: ii,
                maxSeedLength: MAX_SEED_LENGTH
            });
        }
        acc.push(...bytes);
        return acc;
    }, []);
    const base58EncodedAddressCodec = getAddressCodec();
    const programAddressBytes = base58EncodedAddressCodec.encode(programAddress);
    const addressBytesBuffer = await crypto.subtle.digest("SHA-256", new Uint8Array([
        ...seedBytes,
        ...programAddressBytes,
        ...PDA_MARKER_BYTES
    ]));
    const addressBytes = new Uint8Array(addressBytesBuffer);
    if (compressedPointBytesAreOnCurve(addressBytes)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__INVALID_SEEDS_POINT_ON_CURVE"]);
    }
    return base58EncodedAddressCodec.decode(addressBytes);
}
async function getProgramDerivedAddress({ programAddress, seeds }) {
    let bumpSeed = 255;
    while(bumpSeed > 0){
        try {
            const address2 = await createProgramDerivedAddress({
                programAddress,
                seeds: [
                    ...seeds,
                    new Uint8Array([
                        bumpSeed
                    ])
                ]
            });
            return [
                address2,
                bumpSeed
            ];
        } catch (e) {
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSolanaError"])(e, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__INVALID_SEEDS_POINT_ON_CURVE"])) {
                bumpSeed--;
            } else {
                throw e;
            }
        }
    }
    throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__FAILED_TO_FIND_VIABLE_PDA_BUMP_SEED"]);
}
async function createAddressWithSeed({ baseAddress, programAddress, seed }) {
    const { encode, decode } = getAddressCodec();
    const seedBytes = typeof seed === "string" ? new TextEncoder().encode(seed) : seed;
    if (seedBytes.byteLength > MAX_SEED_LENGTH) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__MAX_PDA_SEED_LENGTH_EXCEEDED"], {
            actual: seedBytes.byteLength,
            index: 0,
            maxSeedLength: MAX_SEED_LENGTH
        });
    }
    const programAddressBytes = encode(programAddress);
    if (programAddressBytes.length >= PDA_MARKER_BYTES.length && programAddressBytes.slice(-PDA_MARKER_BYTES.length).every((byte, index)=>byte === PDA_MARKER_BYTES[index])) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__PDA_ENDS_WITH_PDA_MARKER"]);
    }
    const addressBytesBuffer = await crypto.subtle.digest("SHA-256", new Uint8Array([
        ...encode(baseAddress),
        ...seedBytes,
        ...programAddressBytes
    ]));
    const addressBytes = new Uint8Array(addressBytesBuffer);
    return decode(addressBytes);
}
async function getAddressFromPublicKey(publicKey) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$assertions$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$assertions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertKeyExporterIsAvailable"])();
    if (publicKey.type !== "public" || publicKey.algorithm.name !== "Ed25519") {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__INVALID_ED25519_PUBLIC_KEY"]);
    }
    const publicKeyBytes = await crypto.subtle.exportKey("raw", publicKey);
    return getAddressDecoder().decode(new Uint8Array(publicKeyBytes));
}
async function getPublicKeyFromAddress(address2) {
    const addressBytes = getAddressEncoder().encode(address2);
    return await crypto.subtle.importKey("raw", addressBytes, {
        name: "Ed25519"
    }, true, [
        "verify"
    ]);
}
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-numbers@2.3.0_typescript@5.9.2/node_modules/@solana/codecs-numbers/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Endian",
    ()=>Endian,
    "assertNumberIsBetweenForCodec",
    ()=>assertNumberIsBetweenForCodec,
    "getF32Codec",
    ()=>getF32Codec,
    "getF32Decoder",
    ()=>getF32Decoder,
    "getF32Encoder",
    ()=>getF32Encoder,
    "getF64Codec",
    ()=>getF64Codec,
    "getF64Decoder",
    ()=>getF64Decoder,
    "getF64Encoder",
    ()=>getF64Encoder,
    "getI128Codec",
    ()=>getI128Codec,
    "getI128Decoder",
    ()=>getI128Decoder,
    "getI128Encoder",
    ()=>getI128Encoder,
    "getI16Codec",
    ()=>getI16Codec,
    "getI16Decoder",
    ()=>getI16Decoder,
    "getI16Encoder",
    ()=>getI16Encoder,
    "getI32Codec",
    ()=>getI32Codec,
    "getI32Decoder",
    ()=>getI32Decoder,
    "getI32Encoder",
    ()=>getI32Encoder,
    "getI64Codec",
    ()=>getI64Codec,
    "getI64Decoder",
    ()=>getI64Decoder,
    "getI64Encoder",
    ()=>getI64Encoder,
    "getI8Codec",
    ()=>getI8Codec,
    "getI8Decoder",
    ()=>getI8Decoder,
    "getI8Encoder",
    ()=>getI8Encoder,
    "getShortU16Codec",
    ()=>getShortU16Codec,
    "getShortU16Decoder",
    ()=>getShortU16Decoder,
    "getShortU16Encoder",
    ()=>getShortU16Encoder,
    "getU128Codec",
    ()=>getU128Codec,
    "getU128Decoder",
    ()=>getU128Decoder,
    "getU128Encoder",
    ()=>getU128Encoder,
    "getU16Codec",
    ()=>getU16Codec,
    "getU16Decoder",
    ()=>getU16Decoder,
    "getU16Encoder",
    ()=>getU16Encoder,
    "getU32Codec",
    ()=>getU32Codec,
    "getU32Decoder",
    ()=>getU32Decoder,
    "getU32Encoder",
    ()=>getU32Encoder,
    "getU64Codec",
    ()=>getU64Codec,
    "getU64Decoder",
    ()=>getU64Decoder,
    "getU64Encoder",
    ()=>getU64Encoder,
    "getU8Codec",
    ()=>getU8Codec,
    "getU8Decoder",
    ()=>getU8Decoder,
    "getU8Encoder",
    ()=>getU8Encoder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+errors@2.3.0_typescript@5.9.2/node_modules/@solana/errors/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-core@2.3.0_typescript@5.9.2/node_modules/@solana/codecs-core/dist/index.node.mjs [app-route] (ecmascript)");
;
;
// src/assertions.ts
function assertNumberIsBetweenForCodec(codecDescription, min, max, value) {
    if (value < min || value > max) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__NUMBER_OUT_OF_RANGE"], {
            codecDescription,
            max,
            min,
            value
        });
    }
}
// src/common.ts
var Endian = /* @__PURE__ */ ((Endian2)=>{
    Endian2[Endian2["Little"] = 0] = "Little";
    Endian2[Endian2["Big"] = 1] = "Big";
    return Endian2;
})(Endian || {});
function isLittleEndian(config) {
    return config?.endian === 1 /* Big */  ? false : true;
}
function numberEncoderFactory(input) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        fixedSize: input.size,
        write (value, bytes, offset) {
            if (input.range) {
                assertNumberIsBetweenForCodec(input.name, input.range[0], input.range[1], value);
            }
            const arrayBuffer = new ArrayBuffer(input.size);
            input.set(new DataView(arrayBuffer), value, isLittleEndian(input.config));
            bytes.set(new Uint8Array(arrayBuffer), offset);
            return offset + input.size;
        }
    });
}
function numberDecoderFactory(input) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        fixedSize: input.size,
        read (bytes, offset = 0) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertByteArrayIsNotEmptyForCodec"])(input.name, bytes, offset);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertByteArrayHasEnoughBytesForCodec"])(input.name, input.size, bytes, offset);
            const view = new DataView(toArrayBuffer(bytes, offset, input.size));
            return [
                input.get(view, isLittleEndian(input.config)),
                offset + input.size
            ];
        }
    });
}
function toArrayBuffer(bytes, offset, length) {
    const bytesOffset = bytes.byteOffset + (offset ?? 0);
    const bytesLength = length ?? bytes.byteLength;
    return bytes.buffer.slice(bytesOffset, bytesOffset + bytesLength);
}
// src/f32.ts
var getF32Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "f32",
        set: (view, value, le)=>view.setFloat32(0, Number(value), le),
        size: 4
    });
var getF32Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>view.getFloat32(0, le),
        name: "f32",
        size: 4
    });
var getF32Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getF32Encoder(config), getF32Decoder(config));
var getF64Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "f64",
        set: (view, value, le)=>view.setFloat64(0, Number(value), le),
        size: 8
    });
var getF64Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>view.getFloat64(0, le),
        name: "f64",
        size: 8
    });
var getF64Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getF64Encoder(config), getF64Decoder(config));
var getI128Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "i128",
        range: [
            -BigInt("0x7fffffffffffffffffffffffffffffff") - 1n,
            BigInt("0x7fffffffffffffffffffffffffffffff")
        ],
        set: (view, value, le)=>{
            const leftOffset = le ? 8 : 0;
            const rightOffset = le ? 0 : 8;
            const rightMask = 0xffffffffffffffffn;
            view.setBigInt64(leftOffset, BigInt(value) >> 64n, le);
            view.setBigUint64(rightOffset, BigInt(value) & rightMask, le);
        },
        size: 16
    });
var getI128Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>{
            const leftOffset = le ? 8 : 0;
            const rightOffset = le ? 0 : 8;
            const left = view.getBigInt64(leftOffset, le);
            const right = view.getBigUint64(rightOffset, le);
            return (left << 64n) + right;
        },
        name: "i128",
        size: 16
    });
var getI128Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getI128Encoder(config), getI128Decoder(config));
var getI16Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "i16",
        range: [
            -Number("0x7fff") - 1,
            Number("0x7fff")
        ],
        set: (view, value, le)=>view.setInt16(0, Number(value), le),
        size: 2
    });
var getI16Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>view.getInt16(0, le),
        name: "i16",
        size: 2
    });
var getI16Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getI16Encoder(config), getI16Decoder(config));
var getI32Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "i32",
        range: [
            -Number("0x7fffffff") - 1,
            Number("0x7fffffff")
        ],
        set: (view, value, le)=>view.setInt32(0, Number(value), le),
        size: 4
    });
var getI32Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>view.getInt32(0, le),
        name: "i32",
        size: 4
    });
var getI32Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getI32Encoder(config), getI32Decoder(config));
var getI64Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "i64",
        range: [
            -BigInt("0x7fffffffffffffff") - 1n,
            BigInt("0x7fffffffffffffff")
        ],
        set: (view, value, le)=>view.setBigInt64(0, BigInt(value), le),
        size: 8
    });
var getI64Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>view.getBigInt64(0, le),
        name: "i64",
        size: 8
    });
var getI64Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getI64Encoder(config), getI64Decoder(config));
var getI8Encoder = ()=>numberEncoderFactory({
        name: "i8",
        range: [
            -Number("0x7f") - 1,
            Number("0x7f")
        ],
        set: (view, value)=>view.setInt8(0, Number(value)),
        size: 1
    });
var getI8Decoder = ()=>numberDecoderFactory({
        get: (view)=>view.getInt8(0),
        name: "i8",
        size: 1
    });
var getI8Codec = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getI8Encoder(), getI8Decoder());
var getShortU16Encoder = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        getSizeFromValue: (value)=>{
            if (value <= 127) return 1;
            if (value <= 16383) return 2;
            return 3;
        },
        maxSize: 3,
        write: (value, bytes, offset)=>{
            assertNumberIsBetweenForCodec("shortU16", 0, 65535, value);
            const shortU16Bytes = [
                0
            ];
            for(let ii = 0;; ii += 1){
                const alignedValue = Number(value) >> ii * 7;
                if (alignedValue === 0) {
                    break;
                }
                const nextSevenBits = 127 & alignedValue;
                shortU16Bytes[ii] = nextSevenBits;
                if (ii > 0) {
                    shortU16Bytes[ii - 1] |= 128;
                }
            }
            bytes.set(shortU16Bytes, offset);
            return offset + shortU16Bytes.length;
        }
    });
var getShortU16Decoder = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        maxSize: 3,
        read: (bytes, offset)=>{
            let value = 0;
            let byteCount = 0;
            while(++byteCount){
                const byteIndex = byteCount - 1;
                const currentByte = bytes[offset + byteIndex];
                const nextSevenBits = 127 & currentByte;
                value |= nextSevenBits << byteIndex * 7;
                if ((currentByte & 128) === 0) {
                    break;
                }
            }
            return [
                value,
                offset + byteCount
            ];
        }
    });
var getShortU16Codec = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getShortU16Encoder(), getShortU16Decoder());
var getU128Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "u128",
        range: [
            0n,
            BigInt("0xffffffffffffffffffffffffffffffff")
        ],
        set: (view, value, le)=>{
            const leftOffset = le ? 8 : 0;
            const rightOffset = le ? 0 : 8;
            const rightMask = 0xffffffffffffffffn;
            view.setBigUint64(leftOffset, BigInt(value) >> 64n, le);
            view.setBigUint64(rightOffset, BigInt(value) & rightMask, le);
        },
        size: 16
    });
var getU128Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>{
            const leftOffset = le ? 8 : 0;
            const rightOffset = le ? 0 : 8;
            const left = view.getBigUint64(leftOffset, le);
            const right = view.getBigUint64(rightOffset, le);
            return (left << 64n) + right;
        },
        name: "u128",
        size: 16
    });
var getU128Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getU128Encoder(config), getU128Decoder(config));
var getU16Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "u16",
        range: [
            0,
            Number("0xffff")
        ],
        set: (view, value, le)=>view.setUint16(0, Number(value), le),
        size: 2
    });
var getU16Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>view.getUint16(0, le),
        name: "u16",
        size: 2
    });
var getU16Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getU16Encoder(config), getU16Decoder(config));
var getU32Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "u32",
        range: [
            0,
            Number("0xffffffff")
        ],
        set: (view, value, le)=>view.setUint32(0, Number(value), le),
        size: 4
    });
var getU32Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>view.getUint32(0, le),
        name: "u32",
        size: 4
    });
var getU32Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getU32Encoder(config), getU32Decoder(config));
var getU64Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "u64",
        range: [
            0n,
            BigInt("0xffffffffffffffff")
        ],
        set: (view, value, le)=>view.setBigUint64(0, BigInt(value), le),
        size: 8
    });
var getU64Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>view.getBigUint64(0, le),
        name: "u64",
        size: 8
    });
var getU64Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getU64Encoder(config), getU64Decoder(config));
var getU8Encoder = ()=>numberEncoderFactory({
        name: "u8",
        range: [
            0,
            Number("0xff")
        ],
        set: (view, value)=>view.setUint8(0, Number(value)),
        size: 1
    });
var getU8Decoder = ()=>numberDecoderFactory({
        get: (view)=>view.getUint8(0),
        name: "u8",
        size: 1
    });
var getU8Codec = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getU8Encoder(), getU8Decoder());
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-numbers@5.0.0_typescript@5.9.2/node_modules/@solana/codecs-numbers/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Endian",
    ()=>Endian,
    "assertNumberIsBetweenForCodec",
    ()=>assertNumberIsBetweenForCodec,
    "getF32Codec",
    ()=>getF32Codec,
    "getF32Decoder",
    ()=>getF32Decoder,
    "getF32Encoder",
    ()=>getF32Encoder,
    "getF64Codec",
    ()=>getF64Codec,
    "getF64Decoder",
    ()=>getF64Decoder,
    "getF64Encoder",
    ()=>getF64Encoder,
    "getI128Codec",
    ()=>getI128Codec,
    "getI128Decoder",
    ()=>getI128Decoder,
    "getI128Encoder",
    ()=>getI128Encoder,
    "getI16Codec",
    ()=>getI16Codec,
    "getI16Decoder",
    ()=>getI16Decoder,
    "getI16Encoder",
    ()=>getI16Encoder,
    "getI32Codec",
    ()=>getI32Codec,
    "getI32Decoder",
    ()=>getI32Decoder,
    "getI32Encoder",
    ()=>getI32Encoder,
    "getI64Codec",
    ()=>getI64Codec,
    "getI64Decoder",
    ()=>getI64Decoder,
    "getI64Encoder",
    ()=>getI64Encoder,
    "getI8Codec",
    ()=>getI8Codec,
    "getI8Decoder",
    ()=>getI8Decoder,
    "getI8Encoder",
    ()=>getI8Encoder,
    "getShortU16Codec",
    ()=>getShortU16Codec,
    "getShortU16Decoder",
    ()=>getShortU16Decoder,
    "getShortU16Encoder",
    ()=>getShortU16Encoder,
    "getU128Codec",
    ()=>getU128Codec,
    "getU128Decoder",
    ()=>getU128Decoder,
    "getU128Encoder",
    ()=>getU128Encoder,
    "getU16Codec",
    ()=>getU16Codec,
    "getU16Decoder",
    ()=>getU16Decoder,
    "getU16Encoder",
    ()=>getU16Encoder,
    "getU32Codec",
    ()=>getU32Codec,
    "getU32Decoder",
    ()=>getU32Decoder,
    "getU32Encoder",
    ()=>getU32Encoder,
    "getU64Codec",
    ()=>getU64Codec,
    "getU64Decoder",
    ()=>getU64Decoder,
    "getU64Encoder",
    ()=>getU64Encoder,
    "getU8Codec",
    ()=>getU8Codec,
    "getU8Decoder",
    ()=>getU8Decoder,
    "getU8Encoder",
    ()=>getU8Encoder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+errors@5.0.0_typescript@5.9.2/node_modules/@solana/errors/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-core@5.0.0_typescript@5.9.2/node_modules/@solana/codecs-core/dist/index.node.mjs [app-route] (ecmascript)");
;
;
// src/assertions.ts
function assertNumberIsBetweenForCodec(codecDescription, min, max, value) {
    if (value < min || value > max) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__NUMBER_OUT_OF_RANGE"], {
            codecDescription,
            max,
            min,
            value
        });
    }
}
// src/common.ts
var Endian = /* @__PURE__ */ ((Endian2)=>{
    Endian2[Endian2["Little"] = 0] = "Little";
    Endian2[Endian2["Big"] = 1] = "Big";
    return Endian2;
})(Endian || {});
function isLittleEndian(config) {
    return config?.endian === 1 /* Big */  ? false : true;
}
function numberEncoderFactory(input) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        fixedSize: input.size,
        write (value, bytes, offset) {
            if (input.range) {
                assertNumberIsBetweenForCodec(input.name, input.range[0], input.range[1], value);
            }
            const arrayBuffer = new ArrayBuffer(input.size);
            input.set(new DataView(arrayBuffer), value, isLittleEndian(input.config));
            bytes.set(new Uint8Array(arrayBuffer), offset);
            return offset + input.size;
        }
    });
}
function numberDecoderFactory(input) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        fixedSize: input.size,
        read (bytes, offset = 0) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertByteArrayIsNotEmptyForCodec"])(input.name, bytes, offset);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertByteArrayHasEnoughBytesForCodec"])(input.name, input.size, bytes, offset);
            const view = new DataView(toArrayBuffer(bytes, offset, input.size));
            return [
                input.get(view, isLittleEndian(input.config)),
                offset + input.size
            ];
        }
    });
}
function toArrayBuffer(bytes, offset, length) {
    const bytesOffset = bytes.byteOffset + (offset ?? 0);
    const bytesLength = length ?? bytes.byteLength;
    return bytes.buffer.slice(bytesOffset, bytesOffset + bytesLength);
}
// src/f32.ts
var getF32Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "f32",
        set: (view, value, le)=>view.setFloat32(0, Number(value), le),
        size: 4
    });
var getF32Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>view.getFloat32(0, le),
        name: "f32",
        size: 4
    });
var getF32Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getF32Encoder(config), getF32Decoder(config));
var getF64Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "f64",
        set: (view, value, le)=>view.setFloat64(0, Number(value), le),
        size: 8
    });
var getF64Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>view.getFloat64(0, le),
        name: "f64",
        size: 8
    });
var getF64Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getF64Encoder(config), getF64Decoder(config));
var getI128Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "i128",
        range: [
            -BigInt("0x7fffffffffffffffffffffffffffffff") - 1n,
            BigInt("0x7fffffffffffffffffffffffffffffff")
        ],
        set: (view, value, le)=>{
            const leftOffset = le ? 8 : 0;
            const rightOffset = le ? 0 : 8;
            const rightMask = 0xffffffffffffffffn;
            view.setBigInt64(leftOffset, BigInt(value) >> 64n, le);
            view.setBigUint64(rightOffset, BigInt(value) & rightMask, le);
        },
        size: 16
    });
var getI128Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>{
            const leftOffset = le ? 8 : 0;
            const rightOffset = le ? 0 : 8;
            const left = view.getBigInt64(leftOffset, le);
            const right = view.getBigUint64(rightOffset, le);
            return (left << 64n) + right;
        },
        name: "i128",
        size: 16
    });
var getI128Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getI128Encoder(config), getI128Decoder(config));
var getI16Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "i16",
        range: [
            -Number("0x7fff") - 1,
            Number("0x7fff")
        ],
        set: (view, value, le)=>view.setInt16(0, Number(value), le),
        size: 2
    });
var getI16Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>view.getInt16(0, le),
        name: "i16",
        size: 2
    });
var getI16Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getI16Encoder(config), getI16Decoder(config));
var getI32Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "i32",
        range: [
            -Number("0x7fffffff") - 1,
            Number("0x7fffffff")
        ],
        set: (view, value, le)=>view.setInt32(0, Number(value), le),
        size: 4
    });
var getI32Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>view.getInt32(0, le),
        name: "i32",
        size: 4
    });
var getI32Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getI32Encoder(config), getI32Decoder(config));
var getI64Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "i64",
        range: [
            -BigInt("0x7fffffffffffffff") - 1n,
            BigInt("0x7fffffffffffffff")
        ],
        set: (view, value, le)=>view.setBigInt64(0, BigInt(value), le),
        size: 8
    });
var getI64Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>view.getBigInt64(0, le),
        name: "i64",
        size: 8
    });
var getI64Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getI64Encoder(config), getI64Decoder(config));
var getI8Encoder = ()=>numberEncoderFactory({
        name: "i8",
        range: [
            -Number("0x7f") - 1,
            Number("0x7f")
        ],
        set: (view, value)=>view.setInt8(0, Number(value)),
        size: 1
    });
var getI8Decoder = ()=>numberDecoderFactory({
        get: (view)=>view.getInt8(0),
        name: "i8",
        size: 1
    });
var getI8Codec = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getI8Encoder(), getI8Decoder());
var getShortU16Encoder = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        getSizeFromValue: (value)=>{
            if (value <= 127) return 1;
            if (value <= 16383) return 2;
            return 3;
        },
        maxSize: 3,
        write: (value, bytes, offset)=>{
            assertNumberIsBetweenForCodec("shortU16", 0, 65535, value);
            const shortU16Bytes = [
                0
            ];
            for(let ii = 0;; ii += 1){
                const alignedValue = Number(value) >> ii * 7;
                if (alignedValue === 0) {
                    break;
                }
                const nextSevenBits = 127 & alignedValue;
                shortU16Bytes[ii] = nextSevenBits;
                if (ii > 0) {
                    shortU16Bytes[ii - 1] |= 128;
                }
            }
            bytes.set(shortU16Bytes, offset);
            return offset + shortU16Bytes.length;
        }
    });
var getShortU16Decoder = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        maxSize: 3,
        read: (bytes, offset)=>{
            let value = 0;
            let byteCount = 0;
            while(++byteCount){
                const byteIndex = byteCount - 1;
                const currentByte = bytes[offset + byteIndex];
                const nextSevenBits = 127 & currentByte;
                value |= nextSevenBits << byteIndex * 7;
                if ((currentByte & 128) === 0) {
                    break;
                }
            }
            return [
                value,
                offset + byteCount
            ];
        }
    });
var getShortU16Codec = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getShortU16Encoder(), getShortU16Decoder());
var getU128Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "u128",
        range: [
            0n,
            BigInt("0xffffffffffffffffffffffffffffffff")
        ],
        set: (view, value, le)=>{
            const leftOffset = le ? 8 : 0;
            const rightOffset = le ? 0 : 8;
            const rightMask = 0xffffffffffffffffn;
            view.setBigUint64(leftOffset, BigInt(value) >> 64n, le);
            view.setBigUint64(rightOffset, BigInt(value) & rightMask, le);
        },
        size: 16
    });
var getU128Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>{
            const leftOffset = le ? 8 : 0;
            const rightOffset = le ? 0 : 8;
            const left = view.getBigUint64(leftOffset, le);
            const right = view.getBigUint64(rightOffset, le);
            return (left << 64n) + right;
        },
        name: "u128",
        size: 16
    });
var getU128Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getU128Encoder(config), getU128Decoder(config));
var getU16Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "u16",
        range: [
            0,
            Number("0xffff")
        ],
        set: (view, value, le)=>view.setUint16(0, Number(value), le),
        size: 2
    });
var getU16Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>view.getUint16(0, le),
        name: "u16",
        size: 2
    });
var getU16Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getU16Encoder(config), getU16Decoder(config));
var getU32Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "u32",
        range: [
            0,
            Number("0xffffffff")
        ],
        set: (view, value, le)=>view.setUint32(0, Number(value), le),
        size: 4
    });
var getU32Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>view.getUint32(0, le),
        name: "u32",
        size: 4
    });
var getU32Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getU32Encoder(config), getU32Decoder(config));
var getU64Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "u64",
        range: [
            0n,
            BigInt("0xffffffffffffffff")
        ],
        set: (view, value, le)=>view.setBigUint64(0, BigInt(value), le),
        size: 8
    });
var getU64Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>view.getBigUint64(0, le),
        name: "u64",
        size: 8
    });
var getU64Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getU64Encoder(config), getU64Decoder(config));
var getU8Encoder = ()=>numberEncoderFactory({
        name: "u8",
        range: [
            0,
            Number("0xff")
        ],
        set: (view, value)=>view.setUint8(0, Number(value)),
        size: 1
    });
var getU8Decoder = ()=>numberDecoderFactory({
        get: (view)=>view.getUint8(0),
        name: "u8",
        size: 1
    });
var getU8Codec = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getU8Encoder(), getU8Decoder());
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-data-structures@2.3.0_typescript@5.9.2/node_modules/@solana/codecs-data-structures/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assertValidNumberOfItemsForCodec",
    ()=>assertValidNumberOfItemsForCodec,
    "getArrayCodec",
    ()=>getArrayCodec,
    "getArrayDecoder",
    ()=>getArrayDecoder,
    "getArrayEncoder",
    ()=>getArrayEncoder,
    "getBitArrayCodec",
    ()=>getBitArrayCodec,
    "getBitArrayDecoder",
    ()=>getBitArrayDecoder,
    "getBitArrayEncoder",
    ()=>getBitArrayEncoder,
    "getBooleanCodec",
    ()=>getBooleanCodec,
    "getBooleanDecoder",
    ()=>getBooleanDecoder,
    "getBooleanEncoder",
    ()=>getBooleanEncoder,
    "getBytesCodec",
    ()=>getBytesCodec,
    "getBytesDecoder",
    ()=>getBytesDecoder,
    "getBytesEncoder",
    ()=>getBytesEncoder,
    "getConstantCodec",
    ()=>getConstantCodec,
    "getConstantDecoder",
    ()=>getConstantDecoder,
    "getConstantEncoder",
    ()=>getConstantEncoder,
    "getDataEnumCodec",
    ()=>getDataEnumCodec,
    "getDataEnumDecoder",
    ()=>getDataEnumDecoder,
    "getDataEnumEncoder",
    ()=>getDataEnumEncoder,
    "getDiscriminatedUnionCodec",
    ()=>getDiscriminatedUnionCodec,
    "getDiscriminatedUnionDecoder",
    ()=>getDiscriminatedUnionDecoder,
    "getDiscriminatedUnionEncoder",
    ()=>getDiscriminatedUnionEncoder,
    "getEnumCodec",
    ()=>getEnumCodec,
    "getEnumDecoder",
    ()=>getEnumDecoder,
    "getEnumEncoder",
    ()=>getEnumEncoder,
    "getHiddenPrefixCodec",
    ()=>getHiddenPrefixCodec,
    "getHiddenPrefixDecoder",
    ()=>getHiddenPrefixDecoder,
    "getHiddenPrefixEncoder",
    ()=>getHiddenPrefixEncoder,
    "getHiddenSuffixCodec",
    ()=>getHiddenSuffixCodec,
    "getHiddenSuffixDecoder",
    ()=>getHiddenSuffixDecoder,
    "getHiddenSuffixEncoder",
    ()=>getHiddenSuffixEncoder,
    "getLiteralUnionCodec",
    ()=>getLiteralUnionCodec,
    "getLiteralUnionDecoder",
    ()=>getLiteralUnionDecoder,
    "getLiteralUnionEncoder",
    ()=>getLiteralUnionEncoder,
    "getMapCodec",
    ()=>getMapCodec,
    "getMapDecoder",
    ()=>getMapDecoder,
    "getMapEncoder",
    ()=>getMapEncoder,
    "getNullableCodec",
    ()=>getNullableCodec,
    "getNullableDecoder",
    ()=>getNullableDecoder,
    "getNullableEncoder",
    ()=>getNullableEncoder,
    "getScalarEnumCodec",
    ()=>getScalarEnumCodec,
    "getScalarEnumDecoder",
    ()=>getScalarEnumDecoder,
    "getScalarEnumEncoder",
    ()=>getScalarEnumEncoder,
    "getSetCodec",
    ()=>getSetCodec,
    "getSetDecoder",
    ()=>getSetDecoder,
    "getSetEncoder",
    ()=>getSetEncoder,
    "getStructCodec",
    ()=>getStructCodec,
    "getStructDecoder",
    ()=>getStructDecoder,
    "getStructEncoder",
    ()=>getStructEncoder,
    "getTupleCodec",
    ()=>getTupleCodec,
    "getTupleDecoder",
    ()=>getTupleDecoder,
    "getTupleEncoder",
    ()=>getTupleEncoder,
    "getUnionCodec",
    ()=>getUnionCodec,
    "getUnionDecoder",
    ()=>getUnionDecoder,
    "getUnionEncoder",
    ()=>getUnionEncoder,
    "getUnitCodec",
    ()=>getUnitCodec,
    "getUnitDecoder",
    ()=>getUnitDecoder,
    "getUnitEncoder",
    ()=>getUnitEncoder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-core@2.3.0_typescript@5.9.2/node_modules/@solana/codecs-core/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-numbers@2.3.0_typescript@5.9.2/node_modules/@solana/codecs-numbers/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+errors@2.3.0_typescript@5.9.2/node_modules/@solana/errors/dist/index.node.mjs [app-route] (ecmascript)");
;
;
;
// src/array.ts
function assertValidNumberOfItemsForCodec(codecDescription, expected, actual) {
    if (expected !== actual) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__INVALID_NUMBER_OF_ITEMS"], {
            actual,
            codecDescription,
            expected
        });
    }
}
function maxCodecSizes(sizes) {
    return sizes.reduce((all, size)=>all === null || size === null ? null : Math.max(all, size), 0);
}
function sumCodecSizes(sizes) {
    return sizes.reduce((all, size)=>all === null || size === null ? null : all + size, 0);
}
function getFixedSize(codec) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isFixedSize"])(codec) ? codec.fixedSize : null;
}
function getMaxSize(codec) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isFixedSize"])(codec) ? codec.fixedSize : codec.maxSize ?? null;
}
// src/array.ts
function getArrayEncoder(item, config = {}) {
    const size = config.size ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU32Encoder"])();
    const fixedSize = computeArrayLikeCodecSize(size, getFixedSize(item));
    const maxSize = computeArrayLikeCodecSize(size, getMaxSize(item)) ?? void 0;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        ...fixedSize !== null ? {
            fixedSize
        } : {
            getSizeFromValue: (array)=>{
                const prefixSize = typeof size === "object" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEncodedSize"])(array.length, size) : 0;
                return prefixSize + [
                    ...array
                ].reduce((all, value)=>all + (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEncodedSize"])(value, item), 0);
            },
            maxSize
        },
        write: (array, bytes, offset)=>{
            if (typeof size === "number") {
                assertValidNumberOfItemsForCodec("array", size, array.length);
            }
            if (typeof size === "object") {
                offset = size.write(array.length, bytes, offset);
            }
            array.forEach((value)=>{
                offset = item.write(value, bytes, offset);
            });
            return offset;
        }
    });
}
function getArrayDecoder(item, config = {}) {
    const size = config.size ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU32Decoder"])();
    const itemSize = getFixedSize(item);
    const fixedSize = computeArrayLikeCodecSize(size, itemSize);
    const maxSize = computeArrayLikeCodecSize(size, getMaxSize(item)) ?? void 0;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        ...fixedSize !== null ? {
            fixedSize
        } : {
            maxSize
        },
        read: (bytes, offset)=>{
            const array = [];
            if (typeof size === "object" && bytes.slice(offset).length === 0) {
                return [
                    array,
                    offset
                ];
            }
            if (size === "remainder") {
                while(offset < bytes.length){
                    const [value, newOffset2] = item.read(bytes, offset);
                    offset = newOffset2;
                    array.push(value);
                }
                return [
                    array,
                    offset
                ];
            }
            const [resolvedSize, newOffset] = typeof size === "number" ? [
                size,
                offset
            ] : size.read(bytes, offset);
            offset = newOffset;
            for(let i = 0; i < resolvedSize; i += 1){
                const [value, newOffset2] = item.read(bytes, offset);
                offset = newOffset2;
                array.push(value);
            }
            return [
                array,
                offset
            ];
        }
    });
}
function getArrayCodec(item, config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getArrayEncoder(item, config), getArrayDecoder(item, config));
}
function computeArrayLikeCodecSize(size, itemSize) {
    if (typeof size !== "number") return null;
    if (size === 0) return 0;
    return itemSize === null ? null : itemSize * size;
}
function getBitArrayEncoder(size, config = {}) {
    const parsedConfig = typeof config === "boolean" ? {
        backward: config
    } : config;
    const backward = parsedConfig.backward ?? false;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        fixedSize: size,
        write (value, bytes, offset) {
            const bytesToAdd = [];
            for(let i = 0; i < size; i += 1){
                let byte = 0;
                for(let j = 0; j < 8; j += 1){
                    const feature = Number(value[i * 8 + j] ?? 0);
                    byte |= feature << (backward ? j : 7 - j);
                }
                if (backward) {
                    bytesToAdd.unshift(byte);
                } else {
                    bytesToAdd.push(byte);
                }
            }
            bytes.set(bytesToAdd, offset);
            return size;
        }
    });
}
function getBitArrayDecoder(size, config = {}) {
    const parsedConfig = typeof config === "boolean" ? {
        backward: config
    } : config;
    const backward = parsedConfig.backward ?? false;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        fixedSize: size,
        read (bytes, offset) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertByteArrayHasEnoughBytesForCodec"])("bitArray", size, bytes, offset);
            const booleans = [];
            let slice = bytes.slice(offset, offset + size);
            slice = backward ? slice.reverse() : slice;
            slice.forEach((byte)=>{
                for(let i = 0; i < 8; i += 1){
                    if (backward) {
                        booleans.push(Boolean(byte & 1));
                        byte >>= 1;
                    } else {
                        booleans.push(Boolean(byte & 128));
                        byte <<= 1;
                    }
                }
            });
            return [
                booleans,
                offset + size
            ];
        }
    });
}
function getBitArrayCodec(size, config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getBitArrayEncoder(size, config), getBitArrayDecoder(size, config));
}
function getBooleanEncoder(config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])(config.size ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Encoder"])(), (value)=>value ? 1 : 0);
}
function getBooleanDecoder(config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])(config.size ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Decoder"])(), (value)=>Number(value) === 1);
}
function getBooleanCodec(config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getBooleanEncoder(config), getBooleanDecoder(config));
}
function getBytesEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        getSizeFromValue: (value)=>value.length,
        write: (value, bytes, offset)=>{
            bytes.set(value, offset);
            return offset + value.length;
        }
    });
}
function getBytesDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        read: (bytes, offset)=>{
            const slice = bytes.slice(offset);
            return [
                slice,
                offset + slice.length
            ];
        }
    });
}
function getBytesCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getBytesEncoder(), getBytesDecoder());
}
var getBase16Decoder = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        read (bytes, offset) {
            const value = bytes.slice(offset).reduce((str, byte)=>str + byte.toString(16).padStart(2, "0"), "");
            return [
                value,
                bytes.length
            ];
        }
    });
function getConstantEncoder(constant) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        fixedSize: constant.length,
        write: (_, bytes, offset)=>{
            bytes.set(constant, offset);
            return offset + constant.length;
        }
    });
}
function getConstantDecoder(constant) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        fixedSize: constant.length,
        read: (bytes, offset)=>{
            const base16 = getBase16Decoder();
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["containsBytes"])(bytes, constant, offset)) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__INVALID_CONSTANT"], {
                    constant,
                    data: bytes,
                    hexConstant: base16.decode(constant),
                    hexData: base16.decode(bytes),
                    offset
                });
            }
            return [
                void 0,
                offset + constant.length
            ];
        }
    });
}
function getConstantCodec(constant) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getConstantEncoder(constant), getConstantDecoder(constant));
}
function getTupleEncoder(items) {
    const fixedSize = sumCodecSizes(items.map(getFixedSize));
    const maxSize = sumCodecSizes(items.map(getMaxSize)) ?? void 0;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        ...fixedSize === null ? {
            getSizeFromValue: (value)=>items.map((item, index)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEncodedSize"])(value[index], item)).reduce((all, one)=>all + one, 0),
            maxSize
        } : {
            fixedSize
        },
        write: (value, bytes, offset)=>{
            assertValidNumberOfItemsForCodec("tuple", items.length, value.length);
            items.forEach((item, index)=>{
                offset = item.write(value[index], bytes, offset);
            });
            return offset;
        }
    });
}
function getTupleDecoder(items) {
    const fixedSize = sumCodecSizes(items.map(getFixedSize));
    const maxSize = sumCodecSizes(items.map(getMaxSize)) ?? void 0;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        ...fixedSize === null ? {
            maxSize
        } : {
            fixedSize
        },
        read: (bytes, offset)=>{
            const values = [];
            items.forEach((item)=>{
                const [newValue, newOffset] = item.read(bytes, offset);
                values.push(newValue);
                offset = newOffset;
            });
            return [
                values,
                offset
            ];
        }
    });
}
function getTupleCodec(items) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getTupleEncoder(items), getTupleDecoder(items));
}
function getUnionEncoder(variants, getIndexFromValue) {
    const fixedSize = getUnionFixedSize(variants);
    const write = (variant, bytes, offset)=>{
        const index = getIndexFromValue(variant);
        assertValidVariantIndex(variants, index);
        return variants[index].write(variant, bytes, offset);
    };
    if (fixedSize !== null) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
            fixedSize,
            write
        });
    }
    const maxSize = getUnionMaxSize(variants);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        ...maxSize !== null ? {
            maxSize
        } : {},
        getSizeFromValue: (variant)=>{
            const index = getIndexFromValue(variant);
            assertValidVariantIndex(variants, index);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEncodedSize"])(variant, variants[index]);
        },
        write
    });
}
function getUnionDecoder(variants, getIndexFromBytes) {
    const fixedSize = getUnionFixedSize(variants);
    const read = (bytes, offset)=>{
        const index = getIndexFromBytes(bytes, offset);
        assertValidVariantIndex(variants, index);
        return variants[index].read(bytes, offset);
    };
    if (fixedSize !== null) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
            fixedSize,
            read
        });
    }
    const maxSize = getUnionMaxSize(variants);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        ...maxSize !== null ? {
            maxSize
        } : {},
        read
    });
}
function getUnionCodec(variants, getIndexFromValue, getIndexFromBytes) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getUnionEncoder(variants, getIndexFromValue), getUnionDecoder(variants, getIndexFromBytes));
}
function assertValidVariantIndex(variants, index) {
    if (typeof variants[index] === "undefined") {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__UNION_VARIANT_OUT_OF_RANGE"], {
            maxRange: variants.length - 1,
            minRange: 0,
            variant: index
        });
    }
}
function getUnionFixedSize(variants) {
    if (variants.length === 0) return 0;
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isFixedSize"])(variants[0])) return null;
    const variantSize = variants[0].fixedSize;
    const sameSizedVariants = variants.every((variant)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isFixedSize"])(variant) && variant.fixedSize === variantSize);
    return sameSizedVariants ? variantSize : null;
}
function getUnionMaxSize(variants) {
    return maxCodecSizes(variants.map((variant)=>getMaxSize(variant)));
}
// src/discriminated-union.ts
function getDiscriminatedUnionEncoder(variants, config = {}) {
    const discriminatorProperty = config.discriminator ?? "__kind";
    const prefix = config.size ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Encoder"])();
    return getUnionEncoder(variants.map(([, variant], index)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])(getTupleEncoder([
            prefix,
            variant
        ]), (value)=>[
                index,
                value
            ])), (value)=>getVariantDiscriminator(variants, value[discriminatorProperty]));
}
function getDiscriminatedUnionDecoder(variants, config = {}) {
    const discriminatorProperty = config.discriminator ?? "__kind";
    const prefix = config.size ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Decoder"])();
    return getUnionDecoder(variants.map(([discriminator, variant])=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])(getTupleDecoder([
            prefix,
            variant
        ]), ([, value])=>({
                [discriminatorProperty]: discriminator,
                ...value
            }))), (bytes, offset)=>Number(prefix.read(bytes, offset)[0]));
}
function getDiscriminatedUnionCodec(variants, config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getDiscriminatedUnionEncoder(variants, config), getDiscriminatedUnionDecoder(variants, config));
}
function getVariantDiscriminator(variants, discriminatorValue) {
    const discriminator = variants.findIndex(([key])=>discriminatorValue === key);
    if (discriminator < 0) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__INVALID_DISCRIMINATED_UNION_VARIANT"], {
            value: discriminatorValue,
            variants: variants.map(([key])=>key)
        });
    }
    return discriminator;
}
var getDataEnumEncoder = getDiscriminatedUnionEncoder;
var getDataEnumDecoder = getDiscriminatedUnionDecoder;
var getDataEnumCodec = getDiscriminatedUnionCodec;
// src/enum-helpers.ts
function getEnumStats(constructor) {
    const numericalValues = [
        ...new Set(Object.values(constructor).filter((v)=>typeof v === "number"))
    ].sort();
    const enumRecord = Object.fromEntries(Object.entries(constructor).slice(numericalValues.length));
    const enumKeys = Object.keys(enumRecord);
    const enumValues = Object.values(enumRecord);
    const stringValues = [
        .../* @__PURE__ */ new Set([
            ...enumKeys,
            ...enumValues.filter((v)=>typeof v === "string")
        ])
    ];
    return {
        enumKeys,
        enumRecord,
        enumValues,
        numericalValues,
        stringValues
    };
}
function getEnumIndexFromVariant({ enumKeys, enumValues, variant }) {
    const valueIndex = findLastIndex(enumValues, (value)=>value === variant);
    if (valueIndex >= 0) return valueIndex;
    return enumKeys.findIndex((key)=>key === variant);
}
function getEnumIndexFromDiscriminator({ discriminator, enumKeys, enumValues, useValuesAsDiscriminators }) {
    if (!useValuesAsDiscriminators) {
        return discriminator >= 0 && discriminator < enumKeys.length ? discriminator : -1;
    }
    return findLastIndex(enumValues, (value)=>value === discriminator);
}
function findLastIndex(array, predicate) {
    let l = array.length;
    while(l--){
        if (predicate(array[l], l, array)) return l;
    }
    return -1;
}
function formatNumericalValues(values) {
    if (values.length === 0) return "";
    let range = [
        values[0],
        values[0]
    ];
    const ranges = [];
    for(let index = 1; index < values.length; index++){
        const value = values[index];
        if (range[1] + 1 === value) {
            range[1] = value;
        } else {
            ranges.push(range[0] === range[1] ? `${range[0]}` : `${range[0]}-${range[1]}`);
            range = [
                value,
                value
            ];
        }
    }
    ranges.push(range[0] === range[1] ? `${range[0]}` : `${range[0]}-${range[1]}`);
    return ranges.join(", ");
}
// src/enum.ts
function getEnumEncoder(constructor, config = {}) {
    const prefix = config.size ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Encoder"])();
    const useValuesAsDiscriminators = config.useValuesAsDiscriminators ?? false;
    const { enumKeys, enumValues, numericalValues, stringValues } = getEnumStats(constructor);
    if (useValuesAsDiscriminators && enumValues.some((value)=>typeof value === "string")) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__CANNOT_USE_LEXICAL_VALUES_AS_ENUM_DISCRIMINATORS"], {
            stringValues: enumValues.filter((v)=>typeof v === "string")
        });
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])(prefix, (variant)=>{
        const index = getEnumIndexFromVariant({
            enumKeys,
            enumValues,
            variant
        });
        if (index < 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__INVALID_ENUM_VARIANT"], {
                formattedNumericalValues: formatNumericalValues(numericalValues),
                numericalValues,
                stringValues,
                variant
            });
        }
        return useValuesAsDiscriminators ? enumValues[index] : index;
    });
}
function getEnumDecoder(constructor, config = {}) {
    const prefix = config.size ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Decoder"])();
    const useValuesAsDiscriminators = config.useValuesAsDiscriminators ?? false;
    const { enumKeys, enumValues, numericalValues } = getEnumStats(constructor);
    if (useValuesAsDiscriminators && enumValues.some((value)=>typeof value === "string")) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__CANNOT_USE_LEXICAL_VALUES_AS_ENUM_DISCRIMINATORS"], {
            stringValues: enumValues.filter((v)=>typeof v === "string")
        });
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])(prefix, (value)=>{
        const discriminator = Number(value);
        const index = getEnumIndexFromDiscriminator({
            discriminator,
            enumKeys,
            enumValues,
            useValuesAsDiscriminators
        });
        if (index < 0) {
            const validDiscriminators = useValuesAsDiscriminators ? numericalValues : [
                ...Array(enumKeys.length).keys()
            ];
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE"], {
                discriminator,
                formattedValidDiscriminators: formatNumericalValues(validDiscriminators),
                validDiscriminators
            });
        }
        return enumValues[index];
    });
}
function getEnumCodec(constructor, config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getEnumEncoder(constructor, config), getEnumDecoder(constructor, config));
}
var getScalarEnumEncoder = getEnumEncoder;
var getScalarEnumDecoder = getEnumDecoder;
var getScalarEnumCodec = getEnumCodec;
function getHiddenPrefixEncoder(encoder, prefixedEncoders) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])(getTupleEncoder([
        ...prefixedEncoders,
        encoder
    ]), (value)=>[
            ...prefixedEncoders.map(()=>void 0),
            value
        ]);
}
function getHiddenPrefixDecoder(decoder, prefixedDecoders) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])(getTupleDecoder([
        ...prefixedDecoders,
        decoder
    ]), (tuple)=>tuple[tuple.length - 1]);
}
function getHiddenPrefixCodec(codec, prefixedCodecs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getHiddenPrefixEncoder(codec, prefixedCodecs), getHiddenPrefixDecoder(codec, prefixedCodecs));
}
function getHiddenSuffixEncoder(encoder, suffixedEncoders) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])(getTupleEncoder([
        encoder,
        ...suffixedEncoders
    ]), (value)=>[
            value,
            ...suffixedEncoders.map(()=>void 0)
        ]);
}
function getHiddenSuffixDecoder(decoder, suffixedDecoders) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])(getTupleDecoder([
        decoder,
        ...suffixedDecoders
    ]), (tuple)=>tuple[0]);
}
function getHiddenSuffixCodec(codec, suffixedCodecs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getHiddenSuffixEncoder(codec, suffixedCodecs), getHiddenSuffixDecoder(codec, suffixedCodecs));
}
function getLiteralUnionEncoder(variants, config = {}) {
    const discriminator = config.size ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Encoder"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])(discriminator, (variant)=>{
        const index = variants.indexOf(variant);
        if (index < 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__INVALID_LITERAL_UNION_VARIANT"], {
                value: variant,
                variants
            });
        }
        return index;
    });
}
function getLiteralUnionDecoder(variants, config = {}) {
    const discriminator = config.size ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Decoder"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])(discriminator, (index)=>{
        if (index < 0 || index >= variants.length) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__LITERAL_UNION_DISCRIMINATOR_OUT_OF_RANGE"], {
                discriminator: index,
                maxRange: variants.length - 1,
                minRange: 0
            });
        }
        return variants[Number(index)];
    });
}
function getLiteralUnionCodec(variants, config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getLiteralUnionEncoder(variants, config), getLiteralUnionDecoder(variants, config));
}
function getMapEncoder(key, value, config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])(getArrayEncoder(getTupleEncoder([
        key,
        value
    ]), config), (map)=>[
            ...map.entries()
        ]);
}
function getMapDecoder(key, value, config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])(getArrayDecoder(getTupleDecoder([
        key,
        value
    ]), config), (entries)=>new Map(entries));
}
function getMapCodec(key, value, config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getMapEncoder(key, value, config), getMapDecoder(key, value, config));
}
function getUnitEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        fixedSize: 0,
        write: (_value, _bytes, offset)=>offset
    });
}
function getUnitDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        fixedSize: 0,
        read: (_bytes, offset)=>[
                void 0,
                offset
            ]
    });
}
function getUnitCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getUnitEncoder(), getUnitDecoder());
}
// src/nullable.ts
function getNullableEncoder(item, config = {}) {
    const prefix = (()=>{
        if (config.prefix === null) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])(getUnitEncoder(), (_boolean)=>void 0);
        }
        return getBooleanEncoder({
            size: config.prefix ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Encoder"])()
        });
    })();
    const noneValue = (()=>{
        if (config.noneValue === "zeroes") {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertIsFixedSize"])(item);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fixEncoderSize"])(getUnitEncoder(), item.fixedSize);
        }
        if (!config.noneValue) {
            return getUnitEncoder();
        }
        return getConstantEncoder(config.noneValue);
    })();
    return getUnionEncoder([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])(getTupleEncoder([
            prefix,
            noneValue
        ]), (_value)=>[
                false,
                void 0
            ]),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])(getTupleEncoder([
            prefix,
            item
        ]), (value)=>[
                true,
                value
            ])
    ], (variant)=>Number(variant !== null));
}
function getNullableDecoder(item, config = {}) {
    const prefix = (()=>{
        if (config.prefix === null) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])(getUnitDecoder(), ()=>false);
        }
        return getBooleanDecoder({
            size: config.prefix ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Decoder"])()
        });
    })();
    const noneValue = (()=>{
        if (config.noneValue === "zeroes") {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertIsFixedSize"])(item);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fixDecoderSize"])(getUnitDecoder(), item.fixedSize);
        }
        if (!config.noneValue) {
            return getUnitDecoder();
        }
        return getConstantDecoder(config.noneValue);
    })();
    return getUnionDecoder([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])(getTupleDecoder([
            prefix,
            noneValue
        ]), ()=>null),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])(getTupleDecoder([
            prefix,
            item
        ]), ([, value])=>value)
    ], (bytes, offset)=>{
        if (config.prefix === null && !config.noneValue) {
            return Number(offset < bytes.length);
        }
        if (config.prefix === null && config.noneValue != null) {
            const zeroValue = config.noneValue === "zeroes" ? new Uint8Array(noneValue.fixedSize).fill(0) : config.noneValue;
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["containsBytes"])(bytes, zeroValue, offset) ? 0 : 1;
        }
        return Number(prefix.read(bytes, offset)[0]);
    });
}
function getNullableCodec(item, config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getNullableEncoder(item, config), getNullableDecoder(item, config));
}
function getSetEncoder(item, config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])(getArrayEncoder(item, config), (set)=>[
            ...set
        ]);
}
function getSetDecoder(item, config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])(getArrayDecoder(item, config), (entries)=>new Set(entries));
}
function getSetCodec(item, config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getSetEncoder(item, config), getSetDecoder(item, config));
}
function getStructEncoder(fields) {
    const fieldCodecs = fields.map(([, codec])=>codec);
    const fixedSize = sumCodecSizes(fieldCodecs.map(getFixedSize));
    const maxSize = sumCodecSizes(fieldCodecs.map(getMaxSize)) ?? void 0;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        ...fixedSize === null ? {
            getSizeFromValue: (value)=>fields.map(([key, codec])=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEncodedSize"])(value[key], codec)).reduce((all, one)=>all + one, 0),
            maxSize
        } : {
            fixedSize
        },
        write: (struct, bytes, offset)=>{
            fields.forEach(([key, codec])=>{
                offset = codec.write(struct[key], bytes, offset);
            });
            return offset;
        }
    });
}
function getStructDecoder(fields) {
    const fieldCodecs = fields.map(([, codec])=>codec);
    const fixedSize = sumCodecSizes(fieldCodecs.map(getFixedSize));
    const maxSize = sumCodecSizes(fieldCodecs.map(getMaxSize)) ?? void 0;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        ...fixedSize === null ? {
            maxSize
        } : {
            fixedSize
        },
        read: (bytes, offset)=>{
            const struct = {};
            fields.forEach(([key, codec])=>{
                const [value, newOffset] = codec.read(bytes, offset);
                offset = newOffset;
                struct[key] = value;
            });
            return [
                struct,
                offset
            ];
        }
    });
}
function getStructCodec(fields) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getStructEncoder(fields), getStructDecoder(fields));
}
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-data-structures@5.0.0_typescript@5.9.2/node_modules/@solana/codecs-data-structures/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assertValidNumberOfItemsForCodec",
    ()=>assertValidNumberOfItemsForCodec,
    "getArrayCodec",
    ()=>getArrayCodec,
    "getArrayDecoder",
    ()=>getArrayDecoder,
    "getArrayEncoder",
    ()=>getArrayEncoder,
    "getBitArrayCodec",
    ()=>getBitArrayCodec,
    "getBitArrayDecoder",
    ()=>getBitArrayDecoder,
    "getBitArrayEncoder",
    ()=>getBitArrayEncoder,
    "getBooleanCodec",
    ()=>getBooleanCodec,
    "getBooleanDecoder",
    ()=>getBooleanDecoder,
    "getBooleanEncoder",
    ()=>getBooleanEncoder,
    "getBytesCodec",
    ()=>getBytesCodec,
    "getBytesDecoder",
    ()=>getBytesDecoder,
    "getBytesEncoder",
    ()=>getBytesEncoder,
    "getConstantCodec",
    ()=>getConstantCodec,
    "getConstantDecoder",
    ()=>getConstantDecoder,
    "getConstantEncoder",
    ()=>getConstantEncoder,
    "getDiscriminatedUnionCodec",
    ()=>getDiscriminatedUnionCodec,
    "getDiscriminatedUnionDecoder",
    ()=>getDiscriminatedUnionDecoder,
    "getDiscriminatedUnionEncoder",
    ()=>getDiscriminatedUnionEncoder,
    "getEnumCodec",
    ()=>getEnumCodec,
    "getEnumDecoder",
    ()=>getEnumDecoder,
    "getEnumEncoder",
    ()=>getEnumEncoder,
    "getHiddenPrefixCodec",
    ()=>getHiddenPrefixCodec,
    "getHiddenPrefixDecoder",
    ()=>getHiddenPrefixDecoder,
    "getHiddenPrefixEncoder",
    ()=>getHiddenPrefixEncoder,
    "getHiddenSuffixCodec",
    ()=>getHiddenSuffixCodec,
    "getHiddenSuffixDecoder",
    ()=>getHiddenSuffixDecoder,
    "getHiddenSuffixEncoder",
    ()=>getHiddenSuffixEncoder,
    "getLiteralUnionCodec",
    ()=>getLiteralUnionCodec,
    "getLiteralUnionDecoder",
    ()=>getLiteralUnionDecoder,
    "getLiteralUnionEncoder",
    ()=>getLiteralUnionEncoder,
    "getMapCodec",
    ()=>getMapCodec,
    "getMapDecoder",
    ()=>getMapDecoder,
    "getMapEncoder",
    ()=>getMapEncoder,
    "getNullableCodec",
    ()=>getNullableCodec,
    "getNullableDecoder",
    ()=>getNullableDecoder,
    "getNullableEncoder",
    ()=>getNullableEncoder,
    "getSetCodec",
    ()=>getSetCodec,
    "getSetDecoder",
    ()=>getSetDecoder,
    "getSetEncoder",
    ()=>getSetEncoder,
    "getStructCodec",
    ()=>getStructCodec,
    "getStructDecoder",
    ()=>getStructDecoder,
    "getStructEncoder",
    ()=>getStructEncoder,
    "getTupleCodec",
    ()=>getTupleCodec,
    "getTupleDecoder",
    ()=>getTupleDecoder,
    "getTupleEncoder",
    ()=>getTupleEncoder,
    "getUnionCodec",
    ()=>getUnionCodec,
    "getUnionDecoder",
    ()=>getUnionDecoder,
    "getUnionEncoder",
    ()=>getUnionEncoder,
    "getUnitCodec",
    ()=>getUnitCodec,
    "getUnitDecoder",
    ()=>getUnitDecoder,
    "getUnitEncoder",
    ()=>getUnitEncoder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-core@5.0.0_typescript@5.9.2/node_modules/@solana/codecs-core/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-numbers@5.0.0_typescript@5.9.2/node_modules/@solana/codecs-numbers/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+errors@5.0.0_typescript@5.9.2/node_modules/@solana/errors/dist/index.node.mjs [app-route] (ecmascript)");
;
;
;
// src/array.ts
function assertValidNumberOfItemsForCodec(codecDescription, expected, actual) {
    if (expected !== actual) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__INVALID_NUMBER_OF_ITEMS"], {
            actual,
            codecDescription,
            expected
        });
    }
}
function maxCodecSizes(sizes) {
    return sizes.reduce((all, size)=>all === null || size === null ? null : Math.max(all, size), 0);
}
function sumCodecSizes(sizes) {
    return sizes.reduce((all, size)=>all === null || size === null ? null : all + size, 0);
}
function getFixedSize(codec) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isFixedSize"])(codec) ? codec.fixedSize : null;
}
function getMaxSize(codec) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isFixedSize"])(codec) ? codec.fixedSize : codec.maxSize ?? null;
}
// src/array.ts
function getArrayEncoder(item, config = {}) {
    const size = config.size ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU32Encoder"])();
    const fixedSize = computeArrayLikeCodecSize(size, getFixedSize(item));
    const maxSize = computeArrayLikeCodecSize(size, getMaxSize(item)) ?? void 0;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        ...fixedSize !== null ? {
            fixedSize
        } : {
            getSizeFromValue: (array)=>{
                const prefixSize = typeof size === "object" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEncodedSize"])(array.length, size) : 0;
                return prefixSize + [
                    ...array
                ].reduce((all, value)=>all + (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEncodedSize"])(value, item), 0);
            },
            maxSize
        },
        write: (array, bytes, offset)=>{
            if (typeof size === "number") {
                assertValidNumberOfItemsForCodec("array", size, array.length);
            }
            if (typeof size === "object") {
                offset = size.write(array.length, bytes, offset);
            }
            array.forEach((value)=>{
                offset = item.write(value, bytes, offset);
            });
            return offset;
        }
    });
}
function getArrayDecoder(item, config = {}) {
    const size = config.size ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU32Decoder"])();
    const itemSize = getFixedSize(item);
    const fixedSize = computeArrayLikeCodecSize(size, itemSize);
    const maxSize = computeArrayLikeCodecSize(size, getMaxSize(item)) ?? void 0;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        ...fixedSize !== null ? {
            fixedSize
        } : {
            maxSize
        },
        read: (bytes, offset)=>{
            const array = [];
            if (typeof size === "object" && bytes.slice(offset).length === 0) {
                return [
                    array,
                    offset
                ];
            }
            if (size === "remainder") {
                while(offset < bytes.length){
                    const [value, newOffset2] = item.read(bytes, offset);
                    offset = newOffset2;
                    array.push(value);
                }
                return [
                    array,
                    offset
                ];
            }
            const [resolvedSize, newOffset] = typeof size === "number" ? [
                size,
                offset
            ] : size.read(bytes, offset);
            offset = newOffset;
            for(let i = 0; i < resolvedSize; i += 1){
                const [value, newOffset2] = item.read(bytes, offset);
                offset = newOffset2;
                array.push(value);
            }
            return [
                array,
                offset
            ];
        }
    });
}
function getArrayCodec(item, config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getArrayEncoder(item, config), getArrayDecoder(item, config));
}
function computeArrayLikeCodecSize(size, itemSize) {
    if (typeof size !== "number") return null;
    if (size === 0) return 0;
    return itemSize === null ? null : itemSize * size;
}
function getBitArrayEncoder(size, config = {}) {
    const parsedConfig = typeof config === "boolean" ? {
        backward: config
    } : config;
    const backward = parsedConfig.backward ?? false;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        fixedSize: size,
        write (value, bytes, offset) {
            const bytesToAdd = [];
            for(let i = 0; i < size; i += 1){
                let byte = 0;
                for(let j = 0; j < 8; j += 1){
                    const feature = Number(value[i * 8 + j] ?? 0);
                    byte |= feature << (backward ? j : 7 - j);
                }
                if (backward) {
                    bytesToAdd.unshift(byte);
                } else {
                    bytesToAdd.push(byte);
                }
            }
            bytes.set(bytesToAdd, offset);
            return size;
        }
    });
}
function getBitArrayDecoder(size, config = {}) {
    const parsedConfig = typeof config === "boolean" ? {
        backward: config
    } : config;
    const backward = parsedConfig.backward ?? false;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        fixedSize: size,
        read (bytes, offset) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertByteArrayHasEnoughBytesForCodec"])("bitArray", size, bytes, offset);
            const booleans = [];
            let slice = bytes.slice(offset, offset + size);
            slice = backward ? slice.reverse() : slice;
            slice.forEach((byte)=>{
                for(let i = 0; i < 8; i += 1){
                    if (backward) {
                        booleans.push(Boolean(byte & 1));
                        byte >>= 1;
                    } else {
                        booleans.push(Boolean(byte & 128));
                        byte <<= 1;
                    }
                }
            });
            return [
                booleans,
                offset + size
            ];
        }
    });
}
function getBitArrayCodec(size, config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getBitArrayEncoder(size, config), getBitArrayDecoder(size, config));
}
function getBooleanEncoder(config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])(config.size ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Encoder"])(), (value)=>value ? 1 : 0);
}
function getBooleanDecoder(config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])(config.size ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Decoder"])(), (value)=>Number(value) === 1);
}
function getBooleanCodec(config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getBooleanEncoder(config), getBooleanDecoder(config));
}
function getBytesEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        getSizeFromValue: (value)=>value.length,
        write: (value, bytes, offset)=>{
            bytes.set(value, offset);
            return offset + value.length;
        }
    });
}
function getBytesDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        read: (bytes, offset)=>{
            const slice = bytes.slice(offset);
            return [
                slice,
                offset + slice.length
            ];
        }
    });
}
function getBytesCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getBytesEncoder(), getBytesDecoder());
}
var getBase16Decoder = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        read (bytes, offset) {
            const value = bytes.slice(offset).reduce((str, byte)=>str + byte.toString(16).padStart(2, "0"), "");
            return [
                value,
                bytes.length
            ];
        }
    });
function getConstantEncoder(constant) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        fixedSize: constant.length,
        write: (_, bytes, offset)=>{
            bytes.set(constant, offset);
            return offset + constant.length;
        }
    });
}
function getConstantDecoder(constant) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        fixedSize: constant.length,
        read: (bytes, offset)=>{
            const base16 = getBase16Decoder();
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["containsBytes"])(bytes, constant, offset)) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__INVALID_CONSTANT"], {
                    constant,
                    data: bytes,
                    hexConstant: base16.decode(constant),
                    hexData: base16.decode(bytes),
                    offset
                });
            }
            return [
                void 0,
                offset + constant.length
            ];
        }
    });
}
function getConstantCodec(constant) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getConstantEncoder(constant), getConstantDecoder(constant));
}
function getTupleEncoder(items) {
    const fixedSize = sumCodecSizes(items.map(getFixedSize));
    const maxSize = sumCodecSizes(items.map(getMaxSize)) ?? void 0;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        ...fixedSize === null ? {
            getSizeFromValue: (value)=>items.map((item, index)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEncodedSize"])(value[index], item)).reduce((all, one)=>all + one, 0),
            maxSize
        } : {
            fixedSize
        },
        write: (value, bytes, offset)=>{
            assertValidNumberOfItemsForCodec("tuple", items.length, value.length);
            items.forEach((item, index)=>{
                offset = item.write(value[index], bytes, offset);
            });
            return offset;
        }
    });
}
function getTupleDecoder(items) {
    const fixedSize = sumCodecSizes(items.map(getFixedSize));
    const maxSize = sumCodecSizes(items.map(getMaxSize)) ?? void 0;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        ...fixedSize === null ? {
            maxSize
        } : {
            fixedSize
        },
        read: (bytes, offset)=>{
            const values = [];
            items.forEach((item)=>{
                const [newValue, newOffset] = item.read(bytes, offset);
                values.push(newValue);
                offset = newOffset;
            });
            return [
                values,
                offset
            ];
        }
    });
}
function getTupleCodec(items) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getTupleEncoder(items), getTupleDecoder(items));
}
function getUnionEncoder(variants, getIndexFromValue) {
    const fixedSize = getUnionFixedSize(variants);
    const write = (variant, bytes, offset)=>{
        const index = getIndexFromValue(variant);
        assertValidVariantIndex(variants, index);
        return variants[index].write(variant, bytes, offset);
    };
    if (fixedSize !== null) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
            fixedSize,
            write
        });
    }
    const maxSize = getUnionMaxSize(variants);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        ...maxSize !== null ? {
            maxSize
        } : {},
        getSizeFromValue: (variant)=>{
            const index = getIndexFromValue(variant);
            assertValidVariantIndex(variants, index);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEncodedSize"])(variant, variants[index]);
        },
        write
    });
}
function getUnionDecoder(variants, getIndexFromBytes) {
    const fixedSize = getUnionFixedSize(variants);
    const read = (bytes, offset)=>{
        const index = getIndexFromBytes(bytes, offset);
        assertValidVariantIndex(variants, index);
        return variants[index].read(bytes, offset);
    };
    if (fixedSize !== null) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
            fixedSize,
            read
        });
    }
    const maxSize = getUnionMaxSize(variants);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        ...maxSize !== null ? {
            maxSize
        } : {},
        read
    });
}
function getUnionCodec(variants, getIndexFromValue, getIndexFromBytes) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getUnionEncoder(variants, getIndexFromValue), getUnionDecoder(variants, getIndexFromBytes));
}
function assertValidVariantIndex(variants, index) {
    if (typeof variants[index] === "undefined") {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__UNION_VARIANT_OUT_OF_RANGE"], {
            maxRange: variants.length - 1,
            minRange: 0,
            variant: index
        });
    }
}
function getUnionFixedSize(variants) {
    if (variants.length === 0) return 0;
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isFixedSize"])(variants[0])) return null;
    const variantSize = variants[0].fixedSize;
    const sameSizedVariants = variants.every((variant)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isFixedSize"])(variant) && variant.fixedSize === variantSize);
    return sameSizedVariants ? variantSize : null;
}
function getUnionMaxSize(variants) {
    return maxCodecSizes(variants.map((variant)=>getMaxSize(variant)));
}
// src/discriminated-union.ts
function getDiscriminatedUnionEncoder(variants, config = {}) {
    const discriminatorProperty = config.discriminator ?? "__kind";
    const prefix = config.size ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Encoder"])();
    return getUnionEncoder(variants.map(([, variant], index)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])(getTupleEncoder([
            prefix,
            variant
        ]), (value)=>[
                index,
                value
            ])), (value)=>getVariantDiscriminator(variants, value[discriminatorProperty]));
}
function getDiscriminatedUnionDecoder(variants, config = {}) {
    const discriminatorProperty = config.discriminator ?? "__kind";
    const prefix = config.size ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Decoder"])();
    return getUnionDecoder(variants.map(([discriminator, variant])=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])(getTupleDecoder([
            prefix,
            variant
        ]), ([, value])=>({
                [discriminatorProperty]: discriminator,
                ...value
            }))), (bytes, offset)=>Number(prefix.read(bytes, offset)[0]));
}
function getDiscriminatedUnionCodec(variants, config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getDiscriminatedUnionEncoder(variants, config), getDiscriminatedUnionDecoder(variants, config));
}
function getVariantDiscriminator(variants, discriminatorValue) {
    const discriminator = variants.findIndex(([key])=>discriminatorValue === key);
    if (discriminator < 0) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__INVALID_DISCRIMINATED_UNION_VARIANT"], {
            value: discriminatorValue,
            variants: variants.map(([key])=>key)
        });
    }
    return discriminator;
}
// src/enum-helpers.ts
function getEnumStats(constructor) {
    const numericalValues = [
        ...new Set(Object.values(constructor).filter((v)=>typeof v === "number"))
    ].sort();
    const enumRecord = Object.fromEntries(Object.entries(constructor).slice(numericalValues.length));
    const enumKeys = Object.keys(enumRecord);
    const enumValues = Object.values(enumRecord);
    const stringValues = [
        .../* @__PURE__ */ new Set([
            ...enumKeys,
            ...enumValues.filter((v)=>typeof v === "string")
        ])
    ];
    return {
        enumKeys,
        enumRecord,
        enumValues,
        numericalValues,
        stringValues
    };
}
function getEnumIndexFromVariant({ enumKeys, enumValues, variant }) {
    const valueIndex = findLastIndex(enumValues, (value)=>value === variant);
    if (valueIndex >= 0) return valueIndex;
    return enumKeys.findIndex((key)=>key === variant);
}
function getEnumIndexFromDiscriminator({ discriminator, enumKeys, enumValues, useValuesAsDiscriminators }) {
    if (!useValuesAsDiscriminators) {
        return discriminator >= 0 && discriminator < enumKeys.length ? discriminator : -1;
    }
    return findLastIndex(enumValues, (value)=>value === discriminator);
}
function findLastIndex(array, predicate) {
    let l = array.length;
    while(l--){
        if (predicate(array[l], l, array)) return l;
    }
    return -1;
}
function formatNumericalValues(values) {
    if (values.length === 0) return "";
    let range = [
        values[0],
        values[0]
    ];
    const ranges = [];
    for(let index = 1; index < values.length; index++){
        const value = values[index];
        if (range[1] + 1 === value) {
            range[1] = value;
        } else {
            ranges.push(range[0] === range[1] ? `${range[0]}` : `${range[0]}-${range[1]}`);
            range = [
                value,
                value
            ];
        }
    }
    ranges.push(range[0] === range[1] ? `${range[0]}` : `${range[0]}-${range[1]}`);
    return ranges.join(", ");
}
// src/enum.ts
function getEnumEncoder(constructor, config = {}) {
    const prefix = config.size ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Encoder"])();
    const useValuesAsDiscriminators = config.useValuesAsDiscriminators ?? false;
    const { enumKeys, enumValues, numericalValues, stringValues } = getEnumStats(constructor);
    if (useValuesAsDiscriminators && enumValues.some((value)=>typeof value === "string")) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__CANNOT_USE_LEXICAL_VALUES_AS_ENUM_DISCRIMINATORS"], {
            stringValues: enumValues.filter((v)=>typeof v === "string")
        });
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])(prefix, (variant)=>{
        const index = getEnumIndexFromVariant({
            enumKeys,
            enumValues,
            variant
        });
        if (index < 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__INVALID_ENUM_VARIANT"], {
                formattedNumericalValues: formatNumericalValues(numericalValues),
                numericalValues,
                stringValues,
                variant
            });
        }
        return useValuesAsDiscriminators ? enumValues[index] : index;
    });
}
function getEnumDecoder(constructor, config = {}) {
    const prefix = config.size ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Decoder"])();
    const useValuesAsDiscriminators = config.useValuesAsDiscriminators ?? false;
    const { enumKeys, enumValues, numericalValues } = getEnumStats(constructor);
    if (useValuesAsDiscriminators && enumValues.some((value)=>typeof value === "string")) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__CANNOT_USE_LEXICAL_VALUES_AS_ENUM_DISCRIMINATORS"], {
            stringValues: enumValues.filter((v)=>typeof v === "string")
        });
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])(prefix, (value)=>{
        const discriminator = Number(value);
        const index = getEnumIndexFromDiscriminator({
            discriminator,
            enumKeys,
            enumValues,
            useValuesAsDiscriminators
        });
        if (index < 0) {
            const validDiscriminators = useValuesAsDiscriminators ? numericalValues : [
                ...Array(enumKeys.length).keys()
            ];
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE"], {
                discriminator,
                formattedValidDiscriminators: formatNumericalValues(validDiscriminators),
                validDiscriminators
            });
        }
        return enumValues[index];
    });
}
function getEnumCodec(constructor, config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getEnumEncoder(constructor, config), getEnumDecoder(constructor, config));
}
function getHiddenPrefixEncoder(encoder, prefixedEncoders) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])(getTupleEncoder([
        ...prefixedEncoders,
        encoder
    ]), (value)=>[
            ...prefixedEncoders.map(()=>void 0),
            value
        ]);
}
function getHiddenPrefixDecoder(decoder, prefixedDecoders) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])(getTupleDecoder([
        ...prefixedDecoders,
        decoder
    ]), (tuple)=>tuple[tuple.length - 1]);
}
function getHiddenPrefixCodec(codec, prefixedCodecs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getHiddenPrefixEncoder(codec, prefixedCodecs), getHiddenPrefixDecoder(codec, prefixedCodecs));
}
function getHiddenSuffixEncoder(encoder, suffixedEncoders) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])(getTupleEncoder([
        encoder,
        ...suffixedEncoders
    ]), (value)=>[
            value,
            ...suffixedEncoders.map(()=>void 0)
        ]);
}
function getHiddenSuffixDecoder(decoder, suffixedDecoders) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])(getTupleDecoder([
        decoder,
        ...suffixedDecoders
    ]), (tuple)=>tuple[0]);
}
function getHiddenSuffixCodec(codec, suffixedCodecs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getHiddenSuffixEncoder(codec, suffixedCodecs), getHiddenSuffixDecoder(codec, suffixedCodecs));
}
function getLiteralUnionEncoder(variants, config = {}) {
    const discriminator = config.size ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Encoder"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])(discriminator, (variant)=>{
        const index = variants.indexOf(variant);
        if (index < 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__INVALID_LITERAL_UNION_VARIANT"], {
                value: variant,
                variants
            });
        }
        return index;
    });
}
function getLiteralUnionDecoder(variants, config = {}) {
    const discriminator = config.size ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Decoder"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])(discriminator, (index)=>{
        if (index < 0 || index >= variants.length) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__LITERAL_UNION_DISCRIMINATOR_OUT_OF_RANGE"], {
                discriminator: index,
                maxRange: variants.length - 1,
                minRange: 0
            });
        }
        return variants[Number(index)];
    });
}
function getLiteralUnionCodec(variants, config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getLiteralUnionEncoder(variants, config), getLiteralUnionDecoder(variants, config));
}
function getMapEncoder(key, value, config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])(getArrayEncoder(getTupleEncoder([
        key,
        value
    ]), config), (map)=>[
            ...map.entries()
        ]);
}
function getMapDecoder(key, value, config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])(getArrayDecoder(getTupleDecoder([
        key,
        value
    ]), config), (entries)=>new Map(entries));
}
function getMapCodec(key, value, config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getMapEncoder(key, value, config), getMapDecoder(key, value, config));
}
function getUnitEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        fixedSize: 0,
        write: (_value, _bytes, offset)=>offset
    });
}
function getUnitDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        fixedSize: 0,
        read: (_bytes, offset)=>[
                void 0,
                offset
            ]
    });
}
function getUnitCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getUnitEncoder(), getUnitDecoder());
}
// src/nullable.ts
function getNullableEncoder(item, config = {}) {
    const prefix = (()=>{
        if (config.prefix === null) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])(getUnitEncoder(), (_boolean)=>void 0);
        }
        return getBooleanEncoder({
            size: config.prefix ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Encoder"])()
        });
    })();
    const noneValue = (()=>{
        if (config.noneValue === "zeroes") {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertIsFixedSize"])(item);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fixEncoderSize"])(getUnitEncoder(), item.fixedSize);
        }
        if (!config.noneValue) {
            return getUnitEncoder();
        }
        return getConstantEncoder(config.noneValue);
    })();
    return getUnionEncoder([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])(getTupleEncoder([
            prefix,
            noneValue
        ]), (_value)=>[
                false,
                void 0
            ]),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])(getTupleEncoder([
            prefix,
            item
        ]), (value)=>[
                true,
                value
            ])
    ], (variant)=>Number(variant !== null));
}
function getNullableDecoder(item, config = {}) {
    const prefix = (()=>{
        if (config.prefix === null) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])(getUnitDecoder(), ()=>false);
        }
        return getBooleanDecoder({
            size: config.prefix ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Decoder"])()
        });
    })();
    const noneValue = (()=>{
        if (config.noneValue === "zeroes") {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertIsFixedSize"])(item);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fixDecoderSize"])(getUnitDecoder(), item.fixedSize);
        }
        if (!config.noneValue) {
            return getUnitDecoder();
        }
        return getConstantDecoder(config.noneValue);
    })();
    return getUnionDecoder([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])(getTupleDecoder([
            prefix,
            noneValue
        ]), ()=>null),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])(getTupleDecoder([
            prefix,
            item
        ]), ([, value])=>value)
    ], (bytes, offset)=>{
        if (config.prefix === null && !config.noneValue) {
            return Number(offset < bytes.length);
        }
        if (config.prefix === null && config.noneValue != null) {
            const zeroValue = config.noneValue === "zeroes" ? new Uint8Array(noneValue.fixedSize).fill(0) : config.noneValue;
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["containsBytes"])(bytes, zeroValue, offset) ? 0 : 1;
        }
        return Number(prefix.read(bytes, offset)[0]);
    });
}
function getNullableCodec(item, config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getNullableEncoder(item, config), getNullableDecoder(item, config));
}
function getSetEncoder(item, config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])(getArrayEncoder(item, config), (set)=>[
            ...set
        ]);
}
function getSetDecoder(item, config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])(getArrayDecoder(item, config), (entries)=>new Set(entries));
}
function getSetCodec(item, config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getSetEncoder(item, config), getSetDecoder(item, config));
}
function getStructEncoder(fields) {
    const fieldCodecs = fields.map(([, codec])=>codec);
    const fixedSize = sumCodecSizes(fieldCodecs.map(getFixedSize));
    const maxSize = sumCodecSizes(fieldCodecs.map(getMaxSize)) ?? void 0;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        ...fixedSize === null ? {
            getSizeFromValue: (value)=>fields.map(([key, codec])=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEncodedSize"])(value[key], codec)).reduce((all, one)=>all + one, 0),
            maxSize
        } : {
            fixedSize
        },
        write: (struct, bytes, offset)=>{
            fields.forEach(([key, codec])=>{
                offset = codec.write(struct[key], bytes, offset);
            });
            return offset;
        }
    });
}
function getStructDecoder(fields) {
    const fieldCodecs = fields.map(([, codec])=>codec);
    const fixedSize = sumCodecSizes(fieldCodecs.map(getFixedSize));
    const maxSize = sumCodecSizes(fieldCodecs.map(getMaxSize)) ?? void 0;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        ...fixedSize === null ? {
            maxSize
        } : {
            fixedSize
        },
        read: (bytes, offset)=>{
            const struct = {};
            fields.forEach(([key, codec])=>{
                const [value, newOffset] = codec.read(bytes, offset);
                offset = newOffset;
                struct[key] = value;
            });
            return [
                struct,
                offset
            ];
        }
    });
}
function getStructCodec(fields) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getStructEncoder(fields), getStructDecoder(fields));
}
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+rpc-types@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/rpc-types/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assertIsBlockhash",
    ()=>assertIsBlockhash,
    "assertIsLamports",
    ()=>assertIsLamports,
    "assertIsStringifiedBigInt",
    ()=>assertIsStringifiedBigInt,
    "assertIsStringifiedNumber",
    ()=>assertIsStringifiedNumber,
    "assertIsUnixTimestamp",
    ()=>assertIsUnixTimestamp,
    "blockhash",
    ()=>blockhash,
    "commitmentComparator",
    ()=>commitmentComparator,
    "devnet",
    ()=>devnet,
    "getBlockhashCodec",
    ()=>getBlockhashCodec,
    "getBlockhashComparator",
    ()=>getBlockhashComparator,
    "getBlockhashDecoder",
    ()=>getBlockhashDecoder,
    "getBlockhashEncoder",
    ()=>getBlockhashEncoder,
    "getDefaultLamportsCodec",
    ()=>getDefaultLamportsCodec,
    "getDefaultLamportsDecoder",
    ()=>getDefaultLamportsDecoder,
    "getDefaultLamportsEncoder",
    ()=>getDefaultLamportsEncoder,
    "getLamportsCodec",
    ()=>getLamportsCodec,
    "getLamportsDecoder",
    ()=>getLamportsDecoder,
    "getLamportsEncoder",
    ()=>getLamportsEncoder,
    "isBlockhash",
    ()=>isBlockhash,
    "isLamports",
    ()=>isLamports,
    "isStringifiedBigInt",
    ()=>isStringifiedBigInt,
    "isStringifiedNumber",
    ()=>isStringifiedNumber,
    "isUnixTimestamp",
    ()=>isUnixTimestamp,
    "lamports",
    ()=>lamports,
    "mainnet",
    ()=>mainnet,
    "stringifiedBigInt",
    ()=>stringifiedBigInt,
    "stringifiedNumber",
    ()=>stringifiedNumber,
    "testnet",
    ()=>testnet,
    "unixTimestamp",
    ()=>unixTimestamp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$addresses$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+addresses@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/addresses/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-core@2.3.0_typescript@5.9.2/node_modules/@solana/codecs-core/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+errors@2.3.0_typescript@5.9.2/node_modules/@solana/errors/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-numbers@2.3.0_typescript@5.9.2/node_modules/@solana/codecs-numbers/dist/index.node.mjs [app-route] (ecmascript)");
;
;
;
;
// src/blockhash.ts
function isBlockhash(putativeBlockhash) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$addresses$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAddress"])(putativeBlockhash);
}
function assertIsBlockhash(putativeBlockhash) {
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$addresses$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertIsAddress"])(putativeBlockhash);
    } catch (error) {
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSolanaError"])(error, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__STRING_LENGTH_OUT_OF_RANGE"])) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__BLOCKHASH_STRING_LENGTH_OUT_OF_RANGE"], error.context);
        }
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSolanaError"])(error, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__INVALID_BYTE_LENGTH"])) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__INVALID_BLOCKHASH_BYTE_LENGTH"], error.context);
        }
        throw error;
    }
}
function blockhash(putativeBlockhash) {
    assertIsBlockhash(putativeBlockhash);
    return putativeBlockhash;
}
function getBlockhashEncoder() {
    const addressEncoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$addresses$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAddressEncoder"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        fixedSize: 32,
        write: (value, bytes, offset)=>{
            assertIsBlockhash(value);
            return addressEncoder.write(value, bytes, offset);
        }
    });
}
function getBlockhashDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$addresses$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAddressDecoder"])();
}
function getBlockhashCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getBlockhashEncoder(), getBlockhashDecoder());
}
function getBlockhashComparator() {
    return new Intl.Collator("en", {
        caseFirst: "lower",
        ignorePunctuation: false,
        localeMatcher: "best fit",
        numeric: false,
        sensitivity: "variant",
        usage: "sort"
    }).compare;
}
// src/cluster-url.ts
function mainnet(putativeString) {
    return putativeString;
}
function devnet(putativeString) {
    return putativeString;
}
function testnet(putativeString) {
    return putativeString;
}
function getCommitmentScore(commitment) {
    switch(commitment){
        case "finalized":
            return 2;
        case "confirmed":
            return 1;
        case "processed":
            return 0;
        default:
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__INVARIANT_VIOLATION__SWITCH_MUST_BE_EXHAUSTIVE"], {
                unexpectedValue: commitment
            });
    }
}
function commitmentComparator(a, b) {
    if (a === b) {
        return 0;
    }
    return getCommitmentScore(a) < getCommitmentScore(b) ? -1 : 1;
}
var maxU64Value = 18446744073709551615n;
var memoizedU64Encoder;
var memoizedU64Decoder;
function getMemoizedU64Encoder() {
    if (!memoizedU64Encoder) memoizedU64Encoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Encoder"])();
    return memoizedU64Encoder;
}
function getMemoizedU64Decoder() {
    if (!memoizedU64Decoder) memoizedU64Decoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Decoder"])();
    return memoizedU64Decoder;
}
function isLamports(putativeLamports) {
    return putativeLamports >= 0 && putativeLamports <= maxU64Value;
}
function assertIsLamports(putativeLamports) {
    if (putativeLamports < 0 || putativeLamports > maxU64Value) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__LAMPORTS_OUT_OF_RANGE"]);
    }
}
function lamports(putativeLamports) {
    assertIsLamports(putativeLamports);
    return putativeLamports;
}
function getDefaultLamportsEncoder() {
    return getLamportsEncoder(getMemoizedU64Encoder());
}
function getLamportsEncoder(innerEncoder) {
    return innerEncoder;
}
function getDefaultLamportsDecoder() {
    return getLamportsDecoder(getMemoizedU64Decoder());
}
function getLamportsDecoder(innerDecoder) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])(innerDecoder, (value)=>lamports(typeof value === "bigint" ? value : BigInt(value)));
}
function getDefaultLamportsCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getDefaultLamportsEncoder(), getDefaultLamportsDecoder());
}
function getLamportsCodec(innerCodec) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getLamportsEncoder(innerCodec), getLamportsDecoder(innerCodec));
}
function isStringifiedBigInt(putativeBigInt) {
    try {
        BigInt(putativeBigInt);
        return true;
    } catch  {
        return false;
    }
}
function assertIsStringifiedBigInt(putativeBigInt) {
    try {
        BigInt(putativeBigInt);
    } catch  {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__MALFORMED_BIGINT_STRING"], {
            value: putativeBigInt
        });
    }
}
function stringifiedBigInt(putativeBigInt) {
    assertIsStringifiedBigInt(putativeBigInt);
    return putativeBigInt;
}
function isStringifiedNumber(putativeNumber) {
    return !Number.isNaN(Number(putativeNumber));
}
function assertIsStringifiedNumber(putativeNumber) {
    if (Number.isNaN(Number(putativeNumber))) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__MALFORMED_NUMBER_STRING"], {
            value: putativeNumber
        });
    }
}
function stringifiedNumber(putativeNumber) {
    assertIsStringifiedNumber(putativeNumber);
    return putativeNumber;
}
var maxI64Value = 9223372036854775807n;
var minI64Value = -9223372036854775808n;
function isUnixTimestamp(putativeTimestamp) {
    return putativeTimestamp >= minI64Value && putativeTimestamp <= maxI64Value;
}
function assertIsUnixTimestamp(putativeTimestamp) {
    if (putativeTimestamp < minI64Value || putativeTimestamp > maxI64Value) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__TIMESTAMP_OUT_OF_RANGE"], {
            value: putativeTimestamp
        });
    }
}
function unixTimestamp(putativeTimestamp) {
    assertIsUnixTimestamp(putativeTimestamp);
    return putativeTimestamp;
}
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+rpc-types@5.0.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/rpc-types/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assertIsBlockhash",
    ()=>assertIsBlockhash,
    "assertIsLamports",
    ()=>assertIsLamports,
    "assertIsStringifiedBigInt",
    ()=>assertIsStringifiedBigInt,
    "assertIsStringifiedNumber",
    ()=>assertIsStringifiedNumber,
    "assertIsUnixTimestamp",
    ()=>assertIsUnixTimestamp,
    "blockhash",
    ()=>blockhash,
    "commitmentComparator",
    ()=>commitmentComparator,
    "devnet",
    ()=>devnet,
    "getBlockhashCodec",
    ()=>getBlockhashCodec,
    "getBlockhashComparator",
    ()=>getBlockhashComparator,
    "getBlockhashDecoder",
    ()=>getBlockhashDecoder,
    "getBlockhashEncoder",
    ()=>getBlockhashEncoder,
    "getDefaultLamportsCodec",
    ()=>getDefaultLamportsCodec,
    "getDefaultLamportsDecoder",
    ()=>getDefaultLamportsDecoder,
    "getDefaultLamportsEncoder",
    ()=>getDefaultLamportsEncoder,
    "getLamportsCodec",
    ()=>getLamportsCodec,
    "getLamportsDecoder",
    ()=>getLamportsDecoder,
    "getLamportsEncoder",
    ()=>getLamportsEncoder,
    "isBlockhash",
    ()=>isBlockhash,
    "isLamports",
    ()=>isLamports,
    "isStringifiedBigInt",
    ()=>isStringifiedBigInt,
    "isStringifiedNumber",
    ()=>isStringifiedNumber,
    "isUnixTimestamp",
    ()=>isUnixTimestamp,
    "lamports",
    ()=>lamports,
    "mainnet",
    ()=>mainnet,
    "stringifiedBigInt",
    ()=>stringifiedBigInt,
    "stringifiedNumber",
    ()=>stringifiedNumber,
    "testnet",
    ()=>testnet,
    "unixTimestamp",
    ()=>unixTimestamp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$addresses$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+addresses@5.0.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/addresses/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-core@5.0.0_typescript@5.9.2/node_modules/@solana/codecs-core/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+errors@5.0.0_typescript@5.9.2/node_modules/@solana/errors/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-numbers@5.0.0_typescript@5.9.2/node_modules/@solana/codecs-numbers/dist/index.node.mjs [app-route] (ecmascript)");
;
;
;
;
// src/blockhash.ts
function isBlockhash(putativeBlockhash) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$addresses$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAddress"])(putativeBlockhash);
}
function assertIsBlockhash(putativeBlockhash) {
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$addresses$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertIsAddress"])(putativeBlockhash);
    } catch (error) {
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSolanaError"])(error, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__STRING_LENGTH_OUT_OF_RANGE"])) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__BLOCKHASH_STRING_LENGTH_OUT_OF_RANGE"], error.context);
        }
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSolanaError"])(error, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ADDRESSES__INVALID_BYTE_LENGTH"])) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__INVALID_BLOCKHASH_BYTE_LENGTH"], error.context);
        }
        throw error;
    }
}
function blockhash(putativeBlockhash) {
    assertIsBlockhash(putativeBlockhash);
    return putativeBlockhash;
}
function getBlockhashEncoder() {
    const addressEncoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$addresses$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAddressEncoder"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        fixedSize: 32,
        write: (value, bytes, offset)=>{
            assertIsBlockhash(value);
            return addressEncoder.write(value, bytes, offset);
        }
    });
}
function getBlockhashDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$addresses$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAddressDecoder"])();
}
function getBlockhashCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getBlockhashEncoder(), getBlockhashDecoder());
}
function getBlockhashComparator() {
    return new Intl.Collator("en", {
        caseFirst: "lower",
        ignorePunctuation: false,
        localeMatcher: "best fit",
        numeric: false,
        sensitivity: "variant",
        usage: "sort"
    }).compare;
}
// src/cluster-url.ts
function mainnet(putativeString) {
    return putativeString;
}
function devnet(putativeString) {
    return putativeString;
}
function testnet(putativeString) {
    return putativeString;
}
function getCommitmentScore(commitment) {
    switch(commitment){
        case "finalized":
            return 2;
        case "confirmed":
            return 1;
        case "processed":
            return 0;
        default:
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__INVARIANT_VIOLATION__SWITCH_MUST_BE_EXHAUSTIVE"], {
                unexpectedValue: commitment
            });
    }
}
function commitmentComparator(a, b) {
    if (a === b) {
        return 0;
    }
    return getCommitmentScore(a) < getCommitmentScore(b) ? -1 : 1;
}
var maxU64Value = 18446744073709551615n;
var memoizedU64Encoder;
var memoizedU64Decoder;
function getMemoizedU64Encoder() {
    if (!memoizedU64Encoder) memoizedU64Encoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Encoder"])();
    return memoizedU64Encoder;
}
function getMemoizedU64Decoder() {
    if (!memoizedU64Decoder) memoizedU64Decoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Decoder"])();
    return memoizedU64Decoder;
}
function isLamports(putativeLamports) {
    return putativeLamports >= 0 && putativeLamports <= maxU64Value;
}
function assertIsLamports(putativeLamports) {
    if (putativeLamports < 0 || putativeLamports > maxU64Value) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__LAMPORTS_OUT_OF_RANGE"]);
    }
}
function lamports(putativeLamports) {
    assertIsLamports(putativeLamports);
    return putativeLamports;
}
function getDefaultLamportsEncoder() {
    return getLamportsEncoder(getMemoizedU64Encoder());
}
function getLamportsEncoder(innerEncoder) {
    return innerEncoder;
}
function getDefaultLamportsDecoder() {
    return getLamportsDecoder(getMemoizedU64Decoder());
}
function getLamportsDecoder(innerDecoder) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])(innerDecoder, (value)=>lamports(typeof value === "bigint" ? value : BigInt(value)));
}
function getDefaultLamportsCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getDefaultLamportsEncoder(), getDefaultLamportsDecoder());
}
function getLamportsCodec(innerCodec) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getLamportsEncoder(innerCodec), getLamportsDecoder(innerCodec));
}
function isStringifiedBigInt(putativeBigInt) {
    try {
        BigInt(putativeBigInt);
        return true;
    } catch  {
        return false;
    }
}
function assertIsStringifiedBigInt(putativeBigInt) {
    try {
        BigInt(putativeBigInt);
    } catch  {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__MALFORMED_BIGINT_STRING"], {
            value: putativeBigInt
        });
    }
}
function stringifiedBigInt(putativeBigInt) {
    assertIsStringifiedBigInt(putativeBigInt);
    return putativeBigInt;
}
function isStringifiedNumber(putativeNumber) {
    return !Number.isNaN(Number(putativeNumber));
}
function assertIsStringifiedNumber(putativeNumber) {
    if (Number.isNaN(Number(putativeNumber))) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__MALFORMED_NUMBER_STRING"], {
            value: putativeNumber
        });
    }
}
function stringifiedNumber(putativeNumber) {
    assertIsStringifiedNumber(putativeNumber);
    return putativeNumber;
}
var maxI64Value = 9223372036854775807n;
var minI64Value = -9223372036854775808n;
function isUnixTimestamp(putativeTimestamp) {
    return putativeTimestamp >= minI64Value && putativeTimestamp <= maxI64Value;
}
function assertIsUnixTimestamp(putativeTimestamp) {
    if (putativeTimestamp < minI64Value || putativeTimestamp > maxI64Value) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__TIMESTAMP_OUT_OF_RANGE"], {
            value: putativeTimestamp
        });
    }
}
function unixTimestamp(putativeTimestamp) {
    assertIsUnixTimestamp(putativeTimestamp);
    return putativeTimestamp;
}
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+instructions@2.3.0_typescript@5.9.2/node_modules/@solana/instructions/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AccountRole",
    ()=>AccountRole,
    "assertIsInstructionForProgram",
    ()=>assertIsInstructionForProgram,
    "assertIsInstructionWithAccounts",
    ()=>assertIsInstructionWithAccounts,
    "assertIsInstructionWithData",
    ()=>assertIsInstructionWithData,
    "downgradeRoleToNonSigner",
    ()=>downgradeRoleToNonSigner,
    "downgradeRoleToReadonly",
    ()=>downgradeRoleToReadonly,
    "isInstructionForProgram",
    ()=>isInstructionForProgram,
    "isInstructionWithAccounts",
    ()=>isInstructionWithAccounts,
    "isInstructionWithData",
    ()=>isInstructionWithData,
    "isSignerRole",
    ()=>isSignerRole,
    "isWritableRole",
    ()=>isWritableRole,
    "mergeRoles",
    ()=>mergeRoles,
    "upgradeRoleToSigner",
    ()=>upgradeRoleToSigner,
    "upgradeRoleToWritable",
    ()=>upgradeRoleToWritable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+errors@2.3.0_typescript@5.9.2/node_modules/@solana/errors/dist/index.node.mjs [app-route] (ecmascript)");
;
// src/instruction.ts
function isInstructionForProgram(instruction, programAddress) {
    return instruction.programAddress === programAddress;
}
function assertIsInstructionForProgram(instruction, programAddress) {
    if (instruction.programAddress !== programAddress) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__INSTRUCTION__PROGRAM_ID_MISMATCH"], {
            actualProgramAddress: instruction.programAddress,
            expectedProgramAddress: programAddress
        });
    }
}
function isInstructionWithAccounts(instruction) {
    return instruction.accounts !== void 0;
}
function assertIsInstructionWithAccounts(instruction) {
    if (instruction.accounts === void 0) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__INSTRUCTION__EXPECTED_TO_HAVE_ACCOUNTS"], {
            data: instruction.data,
            programAddress: instruction.programAddress
        });
    }
}
function isInstructionWithData(instruction) {
    return instruction.data !== void 0;
}
function assertIsInstructionWithData(instruction) {
    if (instruction.data === void 0) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__INSTRUCTION__EXPECTED_TO_HAVE_DATA"], {
            accountAddresses: instruction.accounts?.map((a)=>a.address),
            programAddress: instruction.programAddress
        });
    }
}
// src/roles.ts
var AccountRole = /* @__PURE__ */ ((AccountRole2)=>{
    AccountRole2[AccountRole2["WRITABLE_SIGNER"] = /* 3 */ 3] = "WRITABLE_SIGNER";
    AccountRole2[AccountRole2["READONLY_SIGNER"] = /* 2 */ 2] = "READONLY_SIGNER";
    AccountRole2[AccountRole2["WRITABLE"] = /* 1 */ 1] = "WRITABLE";
    AccountRole2[AccountRole2["READONLY"] = /* 0 */ 0] = "READONLY";
    return AccountRole2;
})(AccountRole || {});
var IS_SIGNER_BITMASK = 2;
var IS_WRITABLE_BITMASK = 1;
function downgradeRoleToNonSigner(role) {
    return role & -3;
}
function downgradeRoleToReadonly(role) {
    return role & -2;
}
function isSignerRole(role) {
    return role >= 2 /* READONLY_SIGNER */ ;
}
function isWritableRole(role) {
    return (role & IS_WRITABLE_BITMASK) !== 0;
}
function mergeRoles(roleA, roleB) {
    return roleA | roleB;
}
function upgradeRoleToSigner(role) {
    return role | IS_SIGNER_BITMASK;
}
function upgradeRoleToWritable(role) {
    return role | IS_WRITABLE_BITMASK;
}
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+functional@2.3.0_typescript@5.9.2/node_modules/@solana/functional/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/pipe.ts
__turbopack_context__.s([
    "pipe",
    ()=>pipe
]);
function pipe(init, ...fns) {
    return fns.reduce((acc, fn)=>fn(acc), init);
}
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+transaction-messages@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/transaction-messages/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "appendTransactionMessageInstruction",
    ()=>appendTransactionMessageInstruction,
    "appendTransactionMessageInstructions",
    ()=>appendTransactionMessageInstructions,
    "assertIsDurableNonceTransactionMessage",
    ()=>assertIsDurableNonceTransactionMessage,
    "assertIsTransactionMessageWithBlockhashLifetime",
    ()=>assertIsTransactionMessageWithBlockhashLifetime,
    "assertIsTransactionMessageWithDurableNonceLifetime",
    ()=>assertIsTransactionMessageWithDurableNonceLifetime,
    "compileTransactionMessage",
    ()=>compileTransactionMessage,
    "compressTransactionMessageUsingAddressLookupTables",
    ()=>compressTransactionMessageUsingAddressLookupTables,
    "createTransactionMessage",
    ()=>createTransactionMessage,
    "decompileTransactionMessage",
    ()=>decompileTransactionMessage,
    "getCompiledTransactionMessageCodec",
    ()=>getCompiledTransactionMessageCodec,
    "getCompiledTransactionMessageDecoder",
    ()=>getCompiledTransactionMessageDecoder,
    "getCompiledTransactionMessageEncoder",
    ()=>getCompiledTransactionMessageEncoder,
    "getTransactionVersionCodec",
    ()=>getTransactionVersionCodec,
    "getTransactionVersionDecoder",
    ()=>getTransactionVersionDecoder,
    "getTransactionVersionEncoder",
    ()=>getTransactionVersionEncoder,
    "isAdvanceNonceAccountInstruction",
    ()=>isAdvanceNonceAccountInstruction,
    "isDurableNonceTransaction",
    ()=>isDurableNonceTransaction,
    "isTransactionMessageWithBlockhashLifetime",
    ()=>isTransactionMessageWithBlockhashLifetime,
    "isTransactionMessageWithDurableNonceLifetime",
    ()=>isTransactionMessageWithDurableNonceLifetime,
    "prependTransactionMessageInstruction",
    ()=>prependTransactionMessageInstruction,
    "prependTransactionMessageInstructions",
    ()=>prependTransactionMessageInstructions,
    "setTransactionMessageFeePayer",
    ()=>setTransactionMessageFeePayer,
    "setTransactionMessageLifetimeUsingBlockhash",
    ()=>setTransactionMessageLifetimeUsingBlockhash,
    "setTransactionMessageLifetimeUsingDurableNonce",
    ()=>setTransactionMessageLifetimeUsingDurableNonce
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+errors@2.3.0_typescript@5.9.2/node_modules/@solana/errors/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$types$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+rpc-types@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/rpc-types/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$addresses$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+addresses@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/addresses/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-core@2.3.0_typescript@5.9.2/node_modules/@solana/codecs-core/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-data-structures@2.3.0_typescript@5.9.2/node_modules/@solana/codecs-data-structures/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-numbers@2.3.0_typescript@5.9.2/node_modules/@solana/codecs-numbers/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+instructions@2.3.0_typescript@5.9.2/node_modules/@solana/instructions/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$functional$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$functional$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+functional@2.3.0_typescript@5.9.2/node_modules/@solana/functional/dist/index.node.mjs [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
// src/blockhash.ts
function isTransactionMessageWithBlockhashLifetime(transactionMessage) {
    return "lifetimeConstraint" in transactionMessage && typeof transactionMessage.lifetimeConstraint.blockhash === "string" && typeof transactionMessage.lifetimeConstraint.lastValidBlockHeight === "bigint" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$types$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isBlockhash"])(transactionMessage.lifetimeConstraint.blockhash);
}
function assertIsTransactionMessageWithBlockhashLifetime(transactionMessage) {
    if (!isTransactionMessageWithBlockhashLifetime(transactionMessage)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__TRANSACTION__EXPECTED_BLOCKHASH_LIFETIME"]);
    }
}
function setTransactionMessageLifetimeUsingBlockhash(blockhashLifetimeConstraint, transactionMessage) {
    if ("lifetimeConstraint" in transactionMessage && transactionMessage.lifetimeConstraint && "blockhash" in transactionMessage.lifetimeConstraint && transactionMessage.lifetimeConstraint.blockhash === blockhashLifetimeConstraint.blockhash && transactionMessage.lifetimeConstraint.lastValidBlockHeight === blockhashLifetimeConstraint.lastValidBlockHeight) {
        return transactionMessage;
    }
    return Object.freeze({
        ...transactionMessage,
        lifetimeConstraint: Object.freeze(blockhashLifetimeConstraint)
    });
}
function assertValidBaseString(alphabet4, testValue, givenValue = testValue) {
    if (!testValue.match(new RegExp(`^[${alphabet4}]*$`))) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__INVALID_STRING_FOR_BASE"], {
            alphabet: alphabet4,
            base: alphabet4.length,
            value: givenValue
        });
    }
}
var getBaseXEncoder = (alphabet4)=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        getSizeFromValue: (value)=>{
            const [leadingZeroes, tailChars] = partitionLeadingZeroes(value, alphabet4[0]);
            if (!tailChars) return value.length;
            const base10Number = getBigIntFromBaseX(tailChars, alphabet4);
            return leadingZeroes.length + Math.ceil(base10Number.toString(16).length / 2);
        },
        write (value, bytes, offset) {
            assertValidBaseString(alphabet4, value);
            if (value === "") return offset;
            const [leadingZeroes, tailChars] = partitionLeadingZeroes(value, alphabet4[0]);
            if (!tailChars) {
                bytes.set(new Uint8Array(leadingZeroes.length).fill(0), offset);
                return offset + leadingZeroes.length;
            }
            let base10Number = getBigIntFromBaseX(tailChars, alphabet4);
            const tailBytes = [];
            while(base10Number > 0n){
                tailBytes.unshift(Number(base10Number % 256n));
                base10Number /= 256n;
            }
            const bytesToAdd = [
                ...Array(leadingZeroes.length).fill(0),
                ...tailBytes
            ];
            bytes.set(bytesToAdd, offset);
            return offset + bytesToAdd.length;
        }
    });
};
var getBaseXDecoder = (alphabet4)=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        read (rawBytes, offset) {
            const bytes = offset === 0 ? rawBytes : rawBytes.slice(offset);
            if (bytes.length === 0) return [
                "",
                0
            ];
            let trailIndex = bytes.findIndex((n)=>n !== 0);
            trailIndex = trailIndex === -1 ? bytes.length : trailIndex;
            const leadingZeroes = alphabet4[0].repeat(trailIndex);
            if (trailIndex === bytes.length) return [
                leadingZeroes,
                rawBytes.length
            ];
            const base10Number = bytes.slice(trailIndex).reduce((sum, byte)=>sum * 256n + BigInt(byte), 0n);
            const tailChars = getBaseXFromBigInt(base10Number, alphabet4);
            return [
                leadingZeroes + tailChars,
                rawBytes.length
            ];
        }
    });
};
function partitionLeadingZeroes(value, zeroCharacter) {
    const [leadingZeros, tailChars] = value.split(new RegExp(`((?!${zeroCharacter}).*)`));
    return [
        leadingZeros,
        tailChars
    ];
}
function getBigIntFromBaseX(value, alphabet4) {
    const base = BigInt(alphabet4.length);
    let sum = 0n;
    for (const char of value){
        sum *= base;
        sum += BigInt(alphabet4.indexOf(char));
    }
    return sum;
}
function getBaseXFromBigInt(value, alphabet4) {
    const base = BigInt(alphabet4.length);
    const tailChars = [];
    while(value > 0n){
        tailChars.unshift(alphabet4[Number(value % base)]);
        value /= base;
    }
    return tailChars.join("");
}
var alphabet2 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
var getBase58Encoder = ()=>getBaseXEncoder(alphabet2);
var getBase58Decoder = ()=>getBaseXDecoder(alphabet2);
var memoizedAddressTableLookupEncoder;
function getAddressTableLookupEncoder() {
    if (!memoizedAddressTableLookupEncoder) {
        const indexEncoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getArrayEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Encoder"])(), {
            size: (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getShortU16Encoder"])()
        });
        memoizedAddressTableLookupEncoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructEncoder"])([
            [
                "lookupTableAddress",
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$addresses$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAddressEncoder"])()
            ],
            [
                "writableIndexes",
                indexEncoder
            ],
            [
                "readonlyIndexes",
                indexEncoder
            ]
        ]);
    }
    return memoizedAddressTableLookupEncoder;
}
var memoizedAddressTableLookupDecoder;
function getAddressTableLookupDecoder() {
    if (!memoizedAddressTableLookupDecoder) {
        const indexEncoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getArrayDecoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Decoder"])(), {
            size: (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getShortU16Decoder"])()
        });
        memoizedAddressTableLookupDecoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructDecoder"])([
            [
                "lookupTableAddress",
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$addresses$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAddressDecoder"])()
            ],
            [
                "writableIndexes",
                indexEncoder
            ],
            [
                "readonlyIndexes",
                indexEncoder
            ]
        ]), (lookupTable)=>"readableIndices" in lookupTable ? {
                ...lookupTable,
                readonlyIndexes: lookupTable.readableIndices,
                // @ts-expect-error Remove when `readableIndices` and `writableIndices` are removed.
                writableIndexes: lookupTable.writableIndices
            } : lookupTable);
    }
    return memoizedAddressTableLookupDecoder;
}
var memoizedU8Encoder;
function getMemoizedU8Encoder() {
    if (!memoizedU8Encoder) memoizedU8Encoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Encoder"])();
    return memoizedU8Encoder;
}
var memoizedU8Decoder;
function getMemoizedU8Decoder() {
    if (!memoizedU8Decoder) memoizedU8Decoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Decoder"])();
    return memoizedU8Decoder;
}
function getMessageHeaderEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructEncoder"])([
        [
            "numSignerAccounts",
            getMemoizedU8Encoder()
        ],
        [
            "numReadonlySignerAccounts",
            getMemoizedU8Encoder()
        ],
        [
            "numReadonlyNonSignerAccounts",
            getMemoizedU8Encoder()
        ]
    ]);
}
function getMessageHeaderDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructDecoder"])([
        [
            "numSignerAccounts",
            getMemoizedU8Decoder()
        ],
        [
            "numReadonlySignerAccounts",
            getMemoizedU8Decoder()
        ],
        [
            "numReadonlyNonSignerAccounts",
            getMemoizedU8Decoder()
        ]
    ]);
}
var memoizedGetInstructionEncoder;
function getInstructionEncoder() {
    if (!memoizedGetInstructionEncoder) {
        memoizedGetInstructionEncoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructEncoder"])([
            [
                "programAddressIndex",
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Encoder"])()
            ],
            [
                "accountIndices",
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getArrayEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Encoder"])(), {
                    size: (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getShortU16Encoder"])()
                })
            ],
            [
                "data",
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addEncoderSizePrefix"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBytesEncoder"])(), (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getShortU16Encoder"])())
            ]
        ]), // Convert an instruction to have all fields defined
        (instruction)=>{
            if (instruction.accountIndices !== void 0 && instruction.data !== void 0) {
                return instruction;
            }
            return {
                ...instruction,
                accountIndices: instruction.accountIndices ?? [],
                data: instruction.data ?? new Uint8Array(0)
            };
        });
    }
    return memoizedGetInstructionEncoder;
}
var memoizedGetInstructionDecoder;
function getInstructionDecoder() {
    if (!memoizedGetInstructionDecoder) {
        memoizedGetInstructionDecoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructDecoder"])([
            [
                "programAddressIndex",
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Decoder"])()
            ],
            [
                "accountIndices",
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getArrayDecoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Decoder"])(), {
                    size: (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getShortU16Decoder"])()
                })
            ],
            [
                "data",
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addDecoderSizePrefix"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBytesDecoder"])(), (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getShortU16Decoder"])())
            ]
        ]), // Convert an instruction to exclude optional fields if they are empty
        (instruction)=>{
            if (instruction.accountIndices.length && instruction.data.byteLength) {
                return instruction;
            }
            const { accountIndices, data, ...rest } = instruction;
            return {
                ...rest,
                ...accountIndices.length ? {
                    accountIndices
                } : null,
                ...data.byteLength ? {
                    data
                } : null
            };
        });
    }
    return memoizedGetInstructionDecoder;
}
var VERSION_FLAG_MASK = 128;
function getTransactionVersionEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        getSizeFromValue: (value)=>value === "legacy" ? 0 : 1,
        maxSize: 1,
        write: (value, bytes, offset)=>{
            if (value === "legacy") {
                return offset;
            }
            if (value < 0 || value > 127) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__TRANSACTION__VERSION_NUMBER_OUT_OF_RANGE"], {
                    actualVersion: value
                });
            }
            bytes.set([
                value | VERSION_FLAG_MASK
            ], offset);
            return offset + 1;
        }
    });
}
function getTransactionVersionDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        maxSize: 1,
        read: (bytes, offset)=>{
            const firstByte = bytes[offset];
            if ((firstByte & VERSION_FLAG_MASK) === 0) {
                return [
                    "legacy",
                    offset
                ];
            } else {
                const version = firstByte ^ VERSION_FLAG_MASK;
                return [
                    version,
                    offset + 1
                ];
            }
        }
    });
}
function getTransactionVersionCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getTransactionVersionEncoder(), getTransactionVersionDecoder());
}
// src/codecs/message.ts
function getCompiledMessageLegacyEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructEncoder"])(getPreludeStructEncoderTuple());
}
function getCompiledMessageVersionedEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructEncoder"])([
        ...getPreludeStructEncoderTuple(),
        [
            "addressTableLookups",
            getAddressTableLookupArrayEncoder()
        ]
    ]), (value)=>{
        if (value.version === "legacy") {
            return value;
        }
        return {
            ...value,
            addressTableLookups: value.addressTableLookups ?? []
        };
    });
}
function getPreludeStructEncoderTuple() {
    return [
        [
            "version",
            getTransactionVersionEncoder()
        ],
        [
            "header",
            getMessageHeaderEncoder()
        ],
        [
            "staticAccounts",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getArrayEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$addresses$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAddressEncoder"])(), {
                size: (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getShortU16Encoder"])()
            })
        ],
        [
            "lifetimeToken",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fixEncoderSize"])(getBase58Encoder(), 32)
        ],
        [
            "instructions",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getArrayEncoder"])(getInstructionEncoder(), {
                size: (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getShortU16Encoder"])()
            })
        ]
    ];
}
function getPreludeStructDecoderTuple() {
    return [
        [
            "version",
            getTransactionVersionDecoder()
        ],
        [
            "header",
            getMessageHeaderDecoder()
        ],
        [
            "staticAccounts",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getArrayDecoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$addresses$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAddressDecoder"])(), {
                size: (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getShortU16Decoder"])()
            })
        ],
        [
            "lifetimeToken",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fixDecoderSize"])(getBase58Decoder(), 32)
        ],
        [
            "instructions",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getArrayDecoder"])(getInstructionDecoder(), {
                size: (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getShortU16Decoder"])()
            })
        ],
        [
            "addressTableLookups",
            getAddressTableLookupArrayDecoder()
        ]
    ];
}
function getAddressTableLookupArrayEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getArrayEncoder"])(getAddressTableLookupEncoder(), {
        size: (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getShortU16Encoder"])()
    });
}
function getAddressTableLookupArrayDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getArrayDecoder"])(getAddressTableLookupDecoder(), {
        size: (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getShortU16Decoder"])()
    });
}
function getCompiledTransactionMessageEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        getSizeFromValue: (compiledMessage)=>{
            if (compiledMessage.version === "legacy") {
                return getCompiledMessageLegacyEncoder().getSizeFromValue(compiledMessage);
            } else {
                return getCompiledMessageVersionedEncoder().getSizeFromValue(compiledMessage);
            }
        },
        write: (compiledMessage, bytes, offset)=>{
            if (compiledMessage.version === "legacy") {
                return getCompiledMessageLegacyEncoder().write(compiledMessage, bytes, offset);
            } else {
                return getCompiledMessageVersionedEncoder().write(compiledMessage, bytes, offset);
            }
        }
    });
}
function getCompiledTransactionMessageDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructDecoder"])(getPreludeStructDecoderTuple()), ({ addressTableLookups, ...restOfMessage })=>{
        if (restOfMessage.version === "legacy" || !addressTableLookups?.length) {
            return restOfMessage;
        }
        return {
            ...restOfMessage,
            addressTableLookups
        };
    });
}
function getCompiledTransactionMessageCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getCompiledTransactionMessageEncoder(), getCompiledTransactionMessageDecoder());
}
function upsert(addressMap, address, update) {
    addressMap[address] = update(addressMap[address] ?? {
        role: __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AccountRole"].READONLY
    });
}
var TYPE = Symbol("AddressMapTypeProperty");
function getAddressMapFromInstructions(feePayer, instructions) {
    const addressMap = {
        [feePayer]: {
            [TYPE]: 0 /* FEE_PAYER */ ,
            role: __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AccountRole"].WRITABLE_SIGNER
        }
    };
    const addressesOfInvokedPrograms = /* @__PURE__ */ new Set();
    for (const instruction of instructions){
        upsert(addressMap, instruction.programAddress, (entry)=>{
            addressesOfInvokedPrograms.add(instruction.programAddress);
            if (TYPE in entry) {
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isWritableRole"])(entry.role)) {
                    switch(entry[TYPE]){
                        case 0 /* FEE_PAYER */ :
                            throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__TRANSACTION__INVOKED_PROGRAMS_CANNOT_PAY_FEES"], {
                                programAddress: instruction.programAddress
                            });
                        default:
                            throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__TRANSACTION__INVOKED_PROGRAMS_MUST_NOT_BE_WRITABLE"], {
                                programAddress: instruction.programAddress
                            });
                    }
                }
                if (entry[TYPE] === 2 /* STATIC */ ) {
                    return entry;
                }
            }
            return {
                [TYPE]: 2 /* STATIC */ ,
                role: __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AccountRole"].READONLY
            };
        });
        let addressComparator;
        if (!instruction.accounts) {
            continue;
        }
        for (const account of instruction.accounts){
            upsert(addressMap, account.address, (entry)=>{
                const { // eslint-disable-next-line @typescript-eslint/no-unused-vars
                address: _, ...accountMeta } = account;
                if (TYPE in entry) {
                    switch(entry[TYPE]){
                        case 0 /* FEE_PAYER */ :
                            return entry;
                        case 1 /* LOOKUP_TABLE */ :
                            {
                                const nextRole = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mergeRoles"])(entry.role, accountMeta.role);
                                if ("lookupTableAddress" in accountMeta) {
                                    const shouldReplaceEntry = // Consider using the new LOOKUP_TABLE if its address is different...
                                    entry.lookupTableAddress !== accountMeta.lookupTableAddress && // ...and sorts before the existing one.
                                    (addressComparator ||= (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$addresses$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAddressComparator"])())(accountMeta.lookupTableAddress, entry.lookupTableAddress) < 0;
                                    if (shouldReplaceEntry) {
                                        return {
                                            [TYPE]: 1 /* LOOKUP_TABLE */ ,
                                            ...accountMeta,
                                            role: nextRole
                                        };
                                    }
                                } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSignerRole"])(accountMeta.role)) {
                                    return {
                                        [TYPE]: 2 /* STATIC */ ,
                                        role: nextRole
                                    };
                                }
                                if (entry.role !== nextRole) {
                                    return {
                                        ...entry,
                                        role: nextRole
                                    };
                                } else {
                                    return entry;
                                }
                            }
                        case 2 /* STATIC */ :
                            {
                                const nextRole = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mergeRoles"])(entry.role, accountMeta.role);
                                if (// Check to see if this address represents a program that is invoked
                                // in this transaction.
                                addressesOfInvokedPrograms.has(account.address)) {
                                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isWritableRole"])(accountMeta.role)) {
                                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__TRANSACTION__INVOKED_PROGRAMS_MUST_NOT_BE_WRITABLE"], {
                                            programAddress: account.address
                                        });
                                    }
                                    if (entry.role !== nextRole) {
                                        return {
                                            ...entry,
                                            role: nextRole
                                        };
                                    } else {
                                        return entry;
                                    }
                                } else if ("lookupTableAddress" in accountMeta && // Static accounts can be 'upgraded' to lookup table accounts as
                                // long as they are not require to sign the transaction.
                                !(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSignerRole"])(entry.role)) {
                                    return {
                                        ...accountMeta,
                                        [TYPE]: 1 /* LOOKUP_TABLE */ ,
                                        role: nextRole
                                    };
                                } else {
                                    if (entry.role !== nextRole) {
                                        return {
                                            ...entry,
                                            role: nextRole
                                        };
                                    } else {
                                        return entry;
                                    }
                                }
                            }
                    }
                }
                if ("lookupTableAddress" in accountMeta) {
                    return {
                        ...accountMeta,
                        [TYPE]: 1 /* LOOKUP_TABLE */ 
                    };
                } else {
                    return {
                        ...accountMeta,
                        [TYPE]: 2 /* STATIC */ 
                    };
                }
            });
        }
    }
    return addressMap;
}
function getOrderedAccountsFromAddressMap(addressMap) {
    let addressComparator;
    const orderedAccounts = Object.entries(addressMap).sort(([leftAddress, leftEntry], [rightAddress, rightEntry])=>{
        if (leftEntry[TYPE] !== rightEntry[TYPE]) {
            if (leftEntry[TYPE] === 0 /* FEE_PAYER */ ) {
                return -1;
            } else if (rightEntry[TYPE] === 0 /* FEE_PAYER */ ) {
                return 1;
            } else if (leftEntry[TYPE] === 2 /* STATIC */ ) {
                return -1;
            } else if (rightEntry[TYPE] === 2 /* STATIC */ ) {
                return 1;
            }
        }
        const leftIsSigner = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSignerRole"])(leftEntry.role);
        if (leftIsSigner !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSignerRole"])(rightEntry.role)) {
            return leftIsSigner ? -1 : 1;
        }
        const leftIsWritable = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isWritableRole"])(leftEntry.role);
        if (leftIsWritable !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isWritableRole"])(rightEntry.role)) {
            return leftIsWritable ? -1 : 1;
        }
        addressComparator ||= (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$addresses$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAddressComparator"])();
        if (leftEntry[TYPE] === 1 /* LOOKUP_TABLE */  && rightEntry[TYPE] === 1 /* LOOKUP_TABLE */  && leftEntry.lookupTableAddress !== rightEntry.lookupTableAddress) {
            return addressComparator(leftEntry.lookupTableAddress, rightEntry.lookupTableAddress);
        } else {
            return addressComparator(leftAddress, rightAddress);
        }
    }).map(([address, addressMeta])=>({
            address,
            ...addressMeta
        }));
    return orderedAccounts;
}
function getCompiledAddressTableLookups(orderedAccounts) {
    const index = {};
    for (const account of orderedAccounts){
        if (!("lookupTableAddress" in account)) {
            continue;
        }
        const entry = index[account.lookupTableAddress] ||= {
            /** @deprecated Remove in a future major version */ readableIndices: [],
            readonlyIndexes: [],
            writableIndexes: [],
            /** @deprecated Remove in a future major version */ writableIndices: []
        };
        if (account.role === __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AccountRole"].WRITABLE) {
            entry.writableIndexes.push(account.addressIndex);
            entry.writableIndices.push(account.addressIndex);
        } else {
            entry.readableIndices.push(account.addressIndex);
            entry.readonlyIndexes.push(account.addressIndex);
        }
    }
    return Object.keys(index).sort((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$addresses$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAddressComparator"])()).map((lookupTableAddress)=>({
            lookupTableAddress,
            ...index[lookupTableAddress]
        }));
}
function getCompiledMessageHeader(orderedAccounts) {
    let numReadonlyNonSignerAccounts = 0;
    let numReadonlySignerAccounts = 0;
    let numSignerAccounts = 0;
    for (const account of orderedAccounts){
        if ("lookupTableAddress" in account) {
            break;
        }
        const accountIsWritable = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isWritableRole"])(account.role);
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSignerRole"])(account.role)) {
            numSignerAccounts++;
            if (!accountIsWritable) {
                numReadonlySignerAccounts++;
            }
        } else if (!accountIsWritable) {
            numReadonlyNonSignerAccounts++;
        }
    }
    return {
        numReadonlyNonSignerAccounts,
        numReadonlySignerAccounts,
        numSignerAccounts
    };
}
// src/compile/instructions.ts
function getAccountIndex(orderedAccounts) {
    const out = {};
    for (const [index, account] of orderedAccounts.entries()){
        out[account.address] = index;
    }
    return out;
}
function getCompiledInstructions(instructions, orderedAccounts) {
    const accountIndex = getAccountIndex(orderedAccounts);
    return instructions.map(({ accounts, data, programAddress })=>{
        return {
            programAddressIndex: accountIndex[programAddress],
            ...accounts ? {
                accountIndices: accounts.map(({ address })=>accountIndex[address])
            } : null,
            ...data ? {
                data
            } : null
        };
    });
}
// src/compile/lifetime-token.ts
function getCompiledLifetimeToken(lifetimeConstraint) {
    if ("nonce" in lifetimeConstraint) {
        return lifetimeConstraint.nonce;
    }
    return lifetimeConstraint.blockhash;
}
// src/compile/static-accounts.ts
function getCompiledStaticAccounts(orderedAccounts) {
    const firstLookupTableAccountIndex = orderedAccounts.findIndex((account)=>"lookupTableAddress" in account);
    const orderedStaticAccounts = firstLookupTableAccountIndex === -1 ? orderedAccounts : orderedAccounts.slice(0, firstLookupTableAccountIndex);
    return orderedStaticAccounts.map(({ address })=>address);
}
// src/compile/message.ts
function compileTransactionMessage(transactionMessage) {
    const addressMap = getAddressMapFromInstructions(transactionMessage.feePayer.address, transactionMessage.instructions);
    const orderedAccounts = getOrderedAccountsFromAddressMap(addressMap);
    return {
        ...transactionMessage.version !== "legacy" ? {
            addressTableLookups: getCompiledAddressTableLookups(orderedAccounts)
        } : null,
        header: getCompiledMessageHeader(orderedAccounts),
        instructions: getCompiledInstructions(transactionMessage.instructions, orderedAccounts),
        lifetimeToken: getCompiledLifetimeToken(transactionMessage.lifetimeConstraint),
        staticAccounts: getCompiledStaticAccounts(orderedAccounts),
        version: transactionMessage.version
    };
}
function findAddressInLookupTables(address, role, addressesByLookupTableAddress) {
    for (const [lookupTableAddress, addresses] of Object.entries(addressesByLookupTableAddress)){
        for(let i = 0; i < addresses.length; i++){
            if (address === addresses[i]) {
                return {
                    address,
                    addressIndex: i,
                    lookupTableAddress,
                    role
                };
            }
        }
    }
}
function compressTransactionMessageUsingAddressLookupTables(transactionMessage, addressesByLookupTableAddress) {
    const lookupTableAddresses = new Set(Object.values(addressesByLookupTableAddress).flatMap((a)=>a));
    const newInstructions = [];
    let updatedAnyInstructions = false;
    for (const instruction of transactionMessage.instructions){
        if (!instruction.accounts) {
            newInstructions.push(instruction);
            continue;
        }
        const newAccounts = [];
        let updatedAnyAccounts = false;
        for (const account of instruction.accounts){
            if ("lookupTableAddress" in account || !lookupTableAddresses.has(account.address) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSignerRole"])(account.role)) {
                newAccounts.push(account);
                continue;
            }
            const lookupMetaAccount = findAddressInLookupTables(account.address, account.role, addressesByLookupTableAddress);
            newAccounts.push(Object.freeze(lookupMetaAccount));
            updatedAnyAccounts = true;
            updatedAnyInstructions = true;
        }
        newInstructions.push(Object.freeze(updatedAnyAccounts ? {
            ...instruction,
            accounts: newAccounts
        } : instruction));
    }
    return Object.freeze(updatedAnyInstructions ? {
        ...transactionMessage,
        instructions: newInstructions
    } : transactionMessage);
}
// src/create-transaction-message.ts
function createTransactionMessage(config) {
    return Object.freeze({
        instructions: Object.freeze([]),
        version: config.version
    });
}
var RECENT_BLOCKHASHES_SYSVAR_ADDRESS = "SysvarRecentB1ockHashes11111111111111111111";
var SYSTEM_PROGRAM_ADDRESS = "11111111111111111111111111111111";
function createAdvanceNonceAccountInstruction(nonceAccountAddress, nonceAuthorityAddress) {
    return {
        accounts: [
            {
                address: nonceAccountAddress,
                role: __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AccountRole"].WRITABLE
            },
            {
                address: RECENT_BLOCKHASHES_SYSVAR_ADDRESS,
                role: __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AccountRole"].READONLY
            },
            {
                address: nonceAuthorityAddress,
                role: __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AccountRole"].READONLY_SIGNER
            }
        ],
        data: new Uint8Array([
            4,
            0,
            0,
            0
        ]),
        programAddress: SYSTEM_PROGRAM_ADDRESS
    };
}
function isAdvanceNonceAccountInstruction(instruction) {
    return instruction.programAddress === SYSTEM_PROGRAM_ADDRESS && // Test for `AdvanceNonceAccount` instruction data
    instruction.data != null && isAdvanceNonceAccountInstructionData(instruction.data) && // Test for exactly 3 accounts
    instruction.accounts?.length === 3 && // First account is nonce account address
    instruction.accounts[0].address != null && instruction.accounts[0].role === __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AccountRole"].WRITABLE && // Second account is recent blockhashes sysvar
    instruction.accounts[1].address === RECENT_BLOCKHASHES_SYSVAR_ADDRESS && instruction.accounts[1].role === __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AccountRole"].READONLY && // Third account is nonce authority account
    instruction.accounts[2].address != null && (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSignerRole"])(instruction.accounts[2].role);
}
function isAdvanceNonceAccountInstructionData(data) {
    return data.byteLength === 4 && data[0] === 4 && data[1] === 0 && data[2] === 0 && data[3] === 0;
}
// src/durable-nonce.ts
function isTransactionMessageWithDurableNonceLifetime(transactionMessage) {
    return "lifetimeConstraint" in transactionMessage && typeof transactionMessage.lifetimeConstraint.nonce === "string" && transactionMessage.instructions[0] != null && isAdvanceNonceAccountInstruction(transactionMessage.instructions[0]);
}
function assertIsTransactionMessageWithDurableNonceLifetime(transactionMessage) {
    if (!isTransactionMessageWithDurableNonceLifetime(transactionMessage)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__TRANSACTION__EXPECTED_NONCE_LIFETIME"]);
    }
}
function isAdvanceNonceAccountInstructionForNonce(instruction, nonceAccountAddress, nonceAuthorityAddress) {
    return instruction.accounts[0].address === nonceAccountAddress && instruction.accounts[2].address === nonceAuthorityAddress;
}
function setTransactionMessageLifetimeUsingDurableNonce({ nonce, nonceAccountAddress, nonceAuthorityAddress }, transactionMessage) {
    let newInstructions;
    const firstInstruction = transactionMessage.instructions[0];
    if (firstInstruction && isAdvanceNonceAccountInstruction(firstInstruction)) {
        if (isAdvanceNonceAccountInstructionForNonce(firstInstruction, nonceAccountAddress, nonceAuthorityAddress)) {
            if (isTransactionMessageWithDurableNonceLifetime(transactionMessage) && transactionMessage.lifetimeConstraint.nonce === nonce) {
                return transactionMessage;
            } else {
                newInstructions = [
                    firstInstruction,
                    ...transactionMessage.instructions.slice(1)
                ];
            }
        } else {
            newInstructions = [
                Object.freeze(createAdvanceNonceAccountInstruction(nonceAccountAddress, nonceAuthorityAddress)),
                ...transactionMessage.instructions.slice(1)
            ];
        }
    } else {
        newInstructions = [
            Object.freeze(createAdvanceNonceAccountInstruction(nonceAccountAddress, nonceAuthorityAddress)),
            ...transactionMessage.instructions
        ];
    }
    return Object.freeze({
        ...transactionMessage,
        instructions: Object.freeze(newInstructions),
        lifetimeConstraint: Object.freeze({
            nonce
        })
    });
}
// src/fee-payer.ts
function setTransactionMessageFeePayer(feePayer, transactionMessage) {
    if ("feePayer" in transactionMessage && feePayer === transactionMessage.feePayer?.address && isAddressOnlyFeePayer(transactionMessage.feePayer)) {
        return transactionMessage;
    }
    const out = {
        ...transactionMessage,
        feePayer: Object.freeze({
            address: feePayer
        })
    };
    Object.freeze(out);
    return out;
}
function isAddressOnlyFeePayer(feePayer) {
    return !!feePayer && "address" in feePayer && typeof feePayer.address === "string" && Object.keys(feePayer).length === 1;
}
// src/instructions.ts
function appendTransactionMessageInstruction(instruction, transactionMessage) {
    return appendTransactionMessageInstructions([
        instruction
    ], transactionMessage);
}
function appendTransactionMessageInstructions(instructions, transactionMessage) {
    return Object.freeze({
        ...transactionMessage,
        instructions: Object.freeze([
            ...transactionMessage.instructions,
            ...instructions
        ])
    });
}
function prependTransactionMessageInstruction(instruction, transactionMessage) {
    return prependTransactionMessageInstructions([
        instruction
    ], transactionMessage);
}
function prependTransactionMessageInstructions(instructions, transactionMessage) {
    return Object.freeze({
        ...transactionMessage,
        instructions: Object.freeze([
            ...instructions,
            ...transactionMessage.instructions
        ])
    });
}
// src/decompile-message.ts
function getAccountMetas(message) {
    const { header } = message;
    const numWritableSignerAccounts = header.numSignerAccounts - header.numReadonlySignerAccounts;
    const numWritableNonSignerAccounts = message.staticAccounts.length - header.numSignerAccounts - header.numReadonlyNonSignerAccounts;
    const accountMetas = [];
    let accountIndex = 0;
    for(let i = 0; i < numWritableSignerAccounts; i++){
        accountMetas.push({
            address: message.staticAccounts[accountIndex],
            role: __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AccountRole"].WRITABLE_SIGNER
        });
        accountIndex++;
    }
    for(let i = 0; i < header.numReadonlySignerAccounts; i++){
        accountMetas.push({
            address: message.staticAccounts[accountIndex],
            role: __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AccountRole"].READONLY_SIGNER
        });
        accountIndex++;
    }
    for(let i = 0; i < numWritableNonSignerAccounts; i++){
        accountMetas.push({
            address: message.staticAccounts[accountIndex],
            role: __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AccountRole"].WRITABLE
        });
        accountIndex++;
    }
    for(let i = 0; i < header.numReadonlyNonSignerAccounts; i++){
        accountMetas.push({
            address: message.staticAccounts[accountIndex],
            role: __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AccountRole"].READONLY
        });
        accountIndex++;
    }
    return accountMetas;
}
function getAddressLookupMetas(compiledAddressTableLookups, addressesByLookupTableAddress) {
    const compiledAddressTableLookupAddresses = compiledAddressTableLookups.map((l)=>l.lookupTableAddress);
    const missing = compiledAddressTableLookupAddresses.filter((a)=>addressesByLookupTableAddress[a] === void 0);
    if (missing.length > 0) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__TRANSACTION__FAILED_TO_DECOMPILE_ADDRESS_LOOKUP_TABLE_CONTENTS_MISSING"], {
            lookupTableAddresses: missing
        });
    }
    const readOnlyMetas = [];
    const writableMetas = [];
    for (const lookup of compiledAddressTableLookups){
        const addresses = addressesByLookupTableAddress[lookup.lookupTableAddress];
        const readonlyIndexes = lookup.readonlyIndexes ?? /** @deprecated Remove in a future major version */ lookup.readableIndices;
        const writableIndexes = lookup.writableIndexes ?? /** @deprecated Remove in a future major version */ lookup.writableIndices;
        const highestIndex = Math.max(...readonlyIndexes, ...writableIndexes);
        if (highestIndex >= addresses.length) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__TRANSACTION__FAILED_TO_DECOMPILE_ADDRESS_LOOKUP_TABLE_INDEX_OUT_OF_RANGE"], {
                highestKnownIndex: addresses.length - 1,
                highestRequestedIndex: highestIndex,
                lookupTableAddress: lookup.lookupTableAddress
            });
        }
        const readOnlyForLookup = readonlyIndexes.map((r)=>({
                address: addresses[r],
                addressIndex: r,
                lookupTableAddress: lookup.lookupTableAddress,
                role: __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AccountRole"].READONLY
            }));
        readOnlyMetas.push(...readOnlyForLookup);
        const writableForLookup = writableIndexes.map((w)=>({
                address: addresses[w],
                addressIndex: w,
                lookupTableAddress: lookup.lookupTableAddress,
                role: __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AccountRole"].WRITABLE
            }));
        writableMetas.push(...writableForLookup);
    }
    return [
        ...writableMetas,
        ...readOnlyMetas
    ];
}
function convertInstruction(instruction, accountMetas) {
    const programAddress = accountMetas[instruction.programAddressIndex]?.address;
    if (!programAddress) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__TRANSACTION__FAILED_TO_DECOMPILE_INSTRUCTION_PROGRAM_ADDRESS_NOT_FOUND"], {
            index: instruction.programAddressIndex
        });
    }
    const accounts = instruction.accountIndices?.map((accountIndex)=>accountMetas[accountIndex]);
    const { data } = instruction;
    return Object.freeze({
        programAddress,
        ...accounts && accounts.length ? {
            accounts: Object.freeze(accounts)
        } : {},
        ...data && data.length ? {
            data
        } : {}
    });
}
function getLifetimeConstraint(messageLifetimeToken, firstInstruction, lastValidBlockHeight) {
    if (!firstInstruction || !isAdvanceNonceAccountInstruction(firstInstruction)) {
        return {
            blockhash: messageLifetimeToken,
            lastValidBlockHeight: lastValidBlockHeight ?? 2n ** 64n - 1n
        };
    } else {
        const nonceAccountAddress = firstInstruction.accounts[0].address;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$addresses$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertIsAddress"])(nonceAccountAddress);
        const nonceAuthorityAddress = firstInstruction.accounts[2].address;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$addresses$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertIsAddress"])(nonceAuthorityAddress);
        return {
            nonce: messageLifetimeToken,
            nonceAccountAddress,
            nonceAuthorityAddress
        };
    }
}
function decompileTransactionMessage(compiledTransactionMessage, config) {
    const feePayer = compiledTransactionMessage.staticAccounts[0];
    if (!feePayer) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__TRANSACTION__FAILED_TO_DECOMPILE_FEE_PAYER_MISSING"]);
    }
    const accountMetas = getAccountMetas(compiledTransactionMessage);
    const accountLookupMetas = "addressTableLookups" in compiledTransactionMessage && compiledTransactionMessage.addressTableLookups !== void 0 && compiledTransactionMessage.addressTableLookups.length > 0 ? getAddressLookupMetas(compiledTransactionMessage.addressTableLookups, config?.addressesByLookupTableAddress ?? {}) : [];
    const transactionMetas = [
        ...accountMetas,
        ...accountLookupMetas
    ];
    const instructions = compiledTransactionMessage.instructions.map((compiledInstruction)=>convertInstruction(compiledInstruction, transactionMetas));
    const firstInstruction = instructions[0];
    const lifetimeConstraint = getLifetimeConstraint(compiledTransactionMessage.lifetimeToken, firstInstruction, config?.lastValidBlockHeight);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$functional$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$functional$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pipe"])(createTransactionMessage({
        version: compiledTransactionMessage.version
    }), (m)=>setTransactionMessageFeePayer(feePayer, m), (m)=>instructions.reduce((acc, instruction)=>appendTransactionMessageInstruction(instruction, acc), m), (m)=>"blockhash" in lifetimeConstraint ? setTransactionMessageLifetimeUsingBlockhash(lifetimeConstraint, m) : setTransactionMessageLifetimeUsingDurableNonce(lifetimeConstraint, m));
}
// src/deprecated.ts
var assertIsDurableNonceTransactionMessage = assertIsTransactionMessageWithDurableNonceLifetime;
var isDurableNonceTransaction = isTransactionMessageWithDurableNonceLifetime;
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+keys@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/keys/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assertIsSignature",
    ()=>assertIsSignature,
    "createKeyPairFromBytes",
    ()=>createKeyPairFromBytes,
    "createKeyPairFromPrivateKeyBytes",
    ()=>createKeyPairFromPrivateKeyBytes,
    "createPrivateKeyFromBytes",
    ()=>createPrivateKeyFromBytes,
    "generateKeyPair",
    ()=>generateKeyPair,
    "getPublicKeyFromPrivateKey",
    ()=>getPublicKeyFromPrivateKey,
    "isSignature",
    ()=>isSignature,
    "signBytes",
    ()=>signBytes,
    "signature",
    ()=>signature,
    "verifySignature",
    ()=>verifySignature
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$assertions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$assertions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+assertions@2.3.0_typescript@5.9.2/node_modules/@solana/assertions/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+errors@2.3.0_typescript@5.9.2/node_modules/@solana/errors/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$strings$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$strings$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-strings@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/codecs-strings/dist/index.node.mjs [app-route] (ecmascript)");
;
;
;
// src/key-pair.ts
// src/algorithm.ts
var ED25519_ALGORITHM_IDENTIFIER = // Resist the temptation to convert this to a simple string; As of version 133.0.3, Firefox
// requires the object form of `AlgorithmIdentifier` and will throw a `DOMException` otherwise.
Object.freeze({
    name: "Ed25519"
});
function addPkcs8Header(bytes) {
    return new Uint8Array([
        /**
     * PKCS#8 header
     */ 48,
        // ASN.1 sequence tag
        46,
        // Length of sequence (46 more bytes)
        2,
        // ASN.1 integer tag
        1,
        // Length of integer
        0,
        // Version number
        48,
        // ASN.1 sequence tag
        5,
        // Length of sequence
        6,
        // ASN.1 object identifier tag
        3,
        // Length of object identifier
        // Edwards curve algorithms identifier https://oid-rep.orange-labs.fr/get/1.3.101.112
        43,
        // iso(1) / identified-organization(3) (The first node is multiplied by the decimal 40 and the result is added to the value of the second node)
        101,
        // thawte(101)
        // Ed25519 identifier
        112,
        // id-Ed25519(112)
        /**
     * Private key payload
     */ 4,
        // ASN.1 octet string tag
        34,
        // String length (34 more bytes)
        // Private key bytes as octet string
        4,
        // ASN.1 octet string tag
        32,
        // String length (32 bytes)
        ...bytes
    ]);
}
async function createPrivateKeyFromBytes(bytes, extractable = false) {
    const actualLength = bytes.byteLength;
    if (actualLength !== 32) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__KEYS__INVALID_PRIVATE_KEY_BYTE_LENGTH"], {
            actualLength
        });
    }
    const privateKeyBytesPkcs8 = addPkcs8Header(bytes);
    return await crypto.subtle.importKey("pkcs8", privateKeyBytesPkcs8, ED25519_ALGORITHM_IDENTIFIER, extractable, [
        "sign"
    ]);
}
async function getPublicKeyFromPrivateKey(privateKey, extractable = false) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$assertions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$assertions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertKeyExporterIsAvailable"])();
    if (privateKey.extractable === false) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__SUBTLE_CRYPTO__CANNOT_EXPORT_NON_EXTRACTABLE_KEY"], {
            key: privateKey
        });
    }
    const jwk = await crypto.subtle.exportKey("jwk", privateKey);
    return await crypto.subtle.importKey("jwk", {
        crv: "Ed25519",
        ext: extractable,
        key_ops: [
            "verify"
        ],
        kty: "OKP",
        x: jwk.x
    }, "Ed25519", extractable, [
        "verify"
    ]);
}
var base58Encoder;
function assertIsSignature(putativeSignature) {
    if (!base58Encoder) base58Encoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$strings$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$strings$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBase58Encoder"])();
    if (// Lowest value (64 bytes of zeroes)
    putativeSignature.length < 64 || // Highest value (64 bytes of 255)
    putativeSignature.length > 88) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__KEYS__SIGNATURE_STRING_LENGTH_OUT_OF_RANGE"], {
            actualLength: putativeSignature.length
        });
    }
    const bytes = base58Encoder.encode(putativeSignature);
    const numBytes = bytes.byteLength;
    if (numBytes !== 64) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__KEYS__INVALID_SIGNATURE_BYTE_LENGTH"], {
            actualLength: numBytes
        });
    }
}
function isSignature(putativeSignature) {
    if (!base58Encoder) base58Encoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$strings$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$strings$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBase58Encoder"])();
    if (// Lowest value (64 bytes of zeroes)
    putativeSignature.length < 64 || // Highest value (64 bytes of 255)
    putativeSignature.length > 88) {
        return false;
    }
    const bytes = base58Encoder.encode(putativeSignature);
    const numBytes = bytes.byteLength;
    if (numBytes !== 64) {
        return false;
    }
    return true;
}
async function signBytes(key, data) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$assertions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$assertions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertSigningCapabilityIsAvailable"])();
    const signedData = await crypto.subtle.sign(ED25519_ALGORITHM_IDENTIFIER, key, data);
    return new Uint8Array(signedData);
}
function signature(putativeSignature) {
    assertIsSignature(putativeSignature);
    return putativeSignature;
}
async function verifySignature(key, signature2, data) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$assertions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$assertions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertVerificationCapabilityIsAvailable"])();
    return await crypto.subtle.verify(ED25519_ALGORITHM_IDENTIFIER, key, signature2, data);
}
// src/key-pair.ts
async function generateKeyPair() {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$assertions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$assertions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertKeyGenerationIsAvailable"])();
    const keyPair = await crypto.subtle.generateKey(/* algorithm */ ED25519_ALGORITHM_IDENTIFIER, // Native implementation status: https://github.com/WICG/webcrypto-secure-curves/issues/20
    /* extractable */ false, // Prevents the bytes of the private key from being visible to JS.
    /* allowed uses */ [
        "sign",
        "verify"
    ]);
    return keyPair;
}
async function createKeyPairFromBytes(bytes, extractable = false) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$assertions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$assertions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertPRNGIsAvailable"])();
    if (bytes.byteLength !== 64) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__KEYS__INVALID_KEY_PAIR_BYTE_LENGTH"], {
            byteLength: bytes.byteLength
        });
    }
    const [publicKey, privateKey] = await Promise.all([
        crypto.subtle.importKey("raw", bytes.slice(32), ED25519_ALGORITHM_IDENTIFIER, /* extractable */ true, [
            "verify"
        ]),
        createPrivateKeyFromBytes(bytes.slice(0, 32), extractable)
    ]);
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const signedData = await signBytes(privateKey, randomBytes);
    const isValid = await verifySignature(publicKey, signedData, randomBytes);
    if (!isValid) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__KEYS__PUBLIC_KEY_MUST_MATCH_PRIVATE_KEY"]);
    }
    return {
        privateKey,
        publicKey
    };
}
async function createKeyPairFromPrivateKeyBytes(bytes, extractable = false) {
    const privateKeyPromise = createPrivateKeyFromBytes(bytes, extractable);
    const [publicKey, privateKey] = await Promise.all([
        // This nested promise makes things efficient by
        // creating the public key in parallel with the
        // second private key creation, if it is needed.
        (extractable ? privateKeyPromise : createPrivateKeyFromBytes(bytes, true)).then(async (privateKey2)=>await getPublicKeyFromPrivateKey(privateKey2, true)),
        privateKeyPromise
    ]);
    return {
        privateKey,
        publicKey
    };
}
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+transactions@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/transactions/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TRANSACTION_PACKET_HEADER",
    ()=>TRANSACTION_PACKET_HEADER,
    "TRANSACTION_PACKET_SIZE",
    ()=>TRANSACTION_PACKET_SIZE,
    "TRANSACTION_SIZE_LIMIT",
    ()=>TRANSACTION_SIZE_LIMIT,
    "assertIsFullySignedTransaction",
    ()=>assertIsFullySignedTransaction,
    "assertIsTransactionMessageWithinSizeLimit",
    ()=>assertIsTransactionMessageWithinSizeLimit,
    "assertIsTransactionWithinSizeLimit",
    ()=>assertIsTransactionWithinSizeLimit,
    "assertTransactionIsFullySigned",
    ()=>assertTransactionIsFullySigned,
    "compileTransaction",
    ()=>compileTransaction,
    "getBase64EncodedWireTransaction",
    ()=>getBase64EncodedWireTransaction,
    "getSignatureFromTransaction",
    ()=>getSignatureFromTransaction,
    "getTransactionCodec",
    ()=>getTransactionCodec,
    "getTransactionDecoder",
    ()=>getTransactionDecoder,
    "getTransactionEncoder",
    ()=>getTransactionEncoder,
    "getTransactionMessageSize",
    ()=>getTransactionMessageSize,
    "getTransactionSize",
    ()=>getTransactionSize,
    "isFullySignedTransaction",
    ()=>isFullySignedTransaction,
    "isTransactionMessageWithinSizeLimit",
    ()=>isTransactionMessageWithinSizeLimit,
    "isTransactionWithinSizeLimit",
    ()=>isTransactionWithinSizeLimit,
    "partiallySignTransaction",
    ()=>partiallySignTransaction,
    "signTransaction",
    ()=>signTransaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$addresses$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+addresses@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/addresses/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-core@2.3.0_typescript@5.9.2/node_modules/@solana/codecs-core/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-data-structures@2.3.0_typescript@5.9.2/node_modules/@solana/codecs-data-structures/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-numbers@2.3.0_typescript@5.9.2/node_modules/@solana/codecs-numbers/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+errors@2.3.0_typescript@5.9.2/node_modules/@solana/errors/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$transaction$2d$messages$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$transaction$2d$messages$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+transaction-messages@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/transaction-messages/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$strings$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$strings$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-strings@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/codecs-strings/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$keys$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$keys$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+keys@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/keys/dist/index.node.mjs [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
// src/codecs/transaction-codec.ts
function getSignaturesToEncode(signaturesMap) {
    const signatures = Object.values(signaturesMap);
    if (signatures.length === 0) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__TRANSACTION__CANNOT_ENCODE_WITH_EMPTY_SIGNATURES"]);
    }
    return signatures.map((signature)=>{
        if (!signature) {
            return new Uint8Array(64).fill(0);
        }
        return signature;
    });
}
function getSignaturesEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getArrayEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fixEncoderSize"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBytesEncoder"])(), 64), {
        size: (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getShortU16Encoder"])()
    }), getSignaturesToEncode);
}
// src/codecs/transaction-codec.ts
function getTransactionEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructEncoder"])([
        [
            "signatures",
            getSignaturesEncoder()
        ],
        [
            "messageBytes",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBytesEncoder"])()
        ]
    ]);
}
function getTransactionDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructDecoder"])([
        [
            "signatures",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getArrayDecoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fixDecoderSize"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBytesDecoder"])(), 64), {
                size: (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getShortU16Decoder"])()
            })
        ],
        [
            "messageBytes",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBytesDecoder"])()
        ]
    ]), decodePartiallyDecodedTransaction);
}
function getTransactionCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getTransactionEncoder(), getTransactionDecoder());
}
function decodePartiallyDecodedTransaction(transaction) {
    const { messageBytes, signatures } = transaction;
    const signerAddressesDecoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTupleDecoder"])([
        // read transaction version
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$transaction$2d$messages$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$transaction$2d$messages$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTransactionVersionDecoder"])(),
        // read first byte of header, `numSignerAccounts`
        // padRight to skip the next 2 bytes, `numReadOnlySignedAccounts` and `numReadOnlyUnsignedAccounts` which we don't need
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["padRightDecoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Decoder"])(), 2),
        // read static addresses
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getArrayDecoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$addresses$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAddressDecoder"])(), {
            size: (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getShortU16Decoder"])()
        })
    ]);
    const [_txVersion, numRequiredSignatures, staticAddresses] = signerAddressesDecoder.decode(messageBytes);
    const signerAddresses = staticAddresses.slice(0, numRequiredSignatures);
    if (signerAddresses.length !== signatures.length) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__TRANSACTION__MESSAGE_SIGNATURES_MISMATCH"], {
            numRequiredSignatures,
            signaturesLength: signatures.length,
            signerAddresses
        });
    }
    const signaturesMap = {};
    signerAddresses.forEach((address, index)=>{
        const signatureForAddress = signatures[index];
        if (signatureForAddress.every((b)=>b === 0)) {
            signaturesMap[address] = null;
        } else {
            signaturesMap[address] = signatureForAddress;
        }
    });
    return {
        messageBytes,
        signatures: Object.freeze(signaturesMap)
    };
}
function compileTransaction(transactionMessage) {
    const compiledMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$transaction$2d$messages$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$transaction$2d$messages$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["compileTransactionMessage"])(transactionMessage);
    const messageBytes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$transaction$2d$messages$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$transaction$2d$messages$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompiledTransactionMessageEncoder"])().encode(compiledMessage);
    const transactionSigners = compiledMessage.staticAccounts.slice(0, compiledMessage.header.numSignerAccounts);
    const signatures = {};
    for (const signerAddress of transactionSigners){
        signatures[signerAddress] = null;
    }
    let lifetimeConstraint;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$transaction$2d$messages$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$transaction$2d$messages$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTransactionMessageWithBlockhashLifetime"])(transactionMessage)) {
        lifetimeConstraint = {
            blockhash: transactionMessage.lifetimeConstraint.blockhash,
            lastValidBlockHeight: transactionMessage.lifetimeConstraint.lastValidBlockHeight
        };
    } else {
        lifetimeConstraint = {
            nonce: transactionMessage.lifetimeConstraint.nonce,
            nonceAccountAddress: transactionMessage.instructions[0].accounts[0].address
        };
    }
    return Object.freeze({
        lifetimeConstraint,
        messageBytes,
        signatures: Object.freeze(signatures)
    });
}
var base58Decoder;
function getSignatureFromTransaction(transaction) {
    if (!base58Decoder) base58Decoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$strings$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$strings$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBase58Decoder"])();
    const signatureBytes = Object.values(transaction.signatures)[0];
    if (!signatureBytes) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__TRANSACTION__FEE_PAYER_SIGNATURE_MISSING"]);
    }
    const transactionSignature = base58Decoder.decode(signatureBytes);
    return transactionSignature;
}
function uint8ArraysEqual(arr1, arr2) {
    return arr1.length === arr2.length && arr1.every((value, index)=>value === arr2[index]);
}
async function partiallySignTransaction(keyPairs, transaction) {
    let newSignatures;
    let unexpectedSigners;
    await Promise.all(keyPairs.map(async (keyPair)=>{
        const address = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$addresses$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAddressFromPublicKey"])(keyPair.publicKey);
        const existingSignature = transaction.signatures[address];
        if (existingSignature === void 0) {
            unexpectedSigners ||= /* @__PURE__ */ new Set();
            unexpectedSigners.add(address);
            return;
        }
        if (unexpectedSigners) {
            return;
        }
        const newSignature = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$keys$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$keys$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["signBytes"])(keyPair.privateKey, transaction.messageBytes);
        if (existingSignature !== null && uint8ArraysEqual(newSignature, existingSignature)) {
            return;
        }
        newSignatures ||= {};
        newSignatures[address] = newSignature;
    }));
    if (unexpectedSigners && unexpectedSigners.size > 0) {
        const expectedSigners = Object.keys(transaction.signatures);
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__TRANSACTION__ADDRESSES_CANNOT_SIGN_TRANSACTION"], {
            expectedAddresses: expectedSigners,
            unexpectedAddresses: [
                ...unexpectedSigners
            ]
        });
    }
    if (!newSignatures) {
        return transaction;
    }
    return Object.freeze({
        ...transaction,
        signatures: Object.freeze({
            ...transaction.signatures,
            ...newSignatures
        })
    });
}
async function signTransaction(keyPairs, transaction) {
    const out = await partiallySignTransaction(keyPairs, transaction);
    assertIsFullySignedTransaction(out);
    Object.freeze(out);
    return out;
}
function isFullySignedTransaction(transaction) {
    return Object.entries(transaction.signatures).every(([_, signatureBytes])=>!!signatureBytes);
}
function assertIsFullySignedTransaction(transaction) {
    const missingSigs = [];
    Object.entries(transaction.signatures).forEach(([address, signatureBytes])=>{
        if (!signatureBytes) {
            missingSigs.push(address);
        }
    });
    if (missingSigs.length > 0) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING"], {
            addresses: missingSigs
        });
    }
}
function getBase64EncodedWireTransaction(transaction) {
    const wireTransactionBytes = getTransactionEncoder().encode(transaction);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$strings$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$strings$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBase64Decoder"])().decode(wireTransactionBytes);
}
var TRANSACTION_PACKET_SIZE = 1280;
var TRANSACTION_PACKET_HEADER = 40 + 8;
var TRANSACTION_SIZE_LIMIT = TRANSACTION_PACKET_SIZE - TRANSACTION_PACKET_HEADER;
function getTransactionSize(transaction) {
    return getTransactionEncoder().getSizeFromValue(transaction);
}
function isTransactionWithinSizeLimit(transaction) {
    return getTransactionSize(transaction) <= TRANSACTION_SIZE_LIMIT;
}
function assertIsTransactionWithinSizeLimit(transaction) {
    const transactionSize = getTransactionSize(transaction);
    if (transactionSize > TRANSACTION_SIZE_LIMIT) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__TRANSACTION__EXCEEDS_SIZE_LIMIT"], {
            transactionSize,
            transactionSizeLimit: TRANSACTION_SIZE_LIMIT
        });
    }
}
// src/transaction-message-size.ts
function getTransactionMessageSize(transactionMessage) {
    return getTransactionSize(compileTransaction(transactionMessage));
}
function isTransactionMessageWithinSizeLimit(transactionMessage) {
    return getTransactionMessageSize(transactionMessage) <= TRANSACTION_SIZE_LIMIT;
}
function assertIsTransactionMessageWithinSizeLimit(transactionMessage) {
    const transactionSize = getTransactionMessageSize(transactionMessage);
    if (transactionSize > TRANSACTION_SIZE_LIMIT) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__TRANSACTION__EXCEEDS_SIZE_LIMIT"], {
            transactionSize,
            transactionSizeLimit: TRANSACTION_SIZE_LIMIT
        });
    }
}
// src/deprecated.ts
var assertTransactionIsFullySigned = assertIsFullySignedTransaction;
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+rpc-spec-types@2.3.0_typescript@5.9.2/node_modules/@solana/rpc-spec-types/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/parse-json-with-bigints.ts
__turbopack_context__.s([
    "createRpcMessage",
    ()=>createRpcMessage,
    "parseJsonWithBigInts",
    ()=>parseJsonWithBigInts,
    "stringifyJsonWithBigints",
    ()=>stringifyJsonWithBigints
]);
function parseJsonWithBigInts(json) {
    return JSON.parse(wrapIntegersInBigIntValueObject(json), (_, value)=>{
        return isBigIntValueObject(value) ? unwrapBigIntValueObject(value) : value;
    });
}
function wrapIntegersInBigIntValueObject(json) {
    const out = [];
    let inQuote = false;
    for(let ii = 0; ii < json.length; ii++){
        let isEscaped = false;
        if (json[ii] === "\\") {
            out.push(json[ii++]);
            isEscaped = !isEscaped;
        }
        if (json[ii] === '"') {
            out.push(json[ii]);
            if (!isEscaped) {
                inQuote = !inQuote;
            }
            continue;
        }
        if (!inQuote) {
            const consumedNumber = consumeNumber(json, ii);
            if (consumedNumber?.length) {
                ii += consumedNumber.length - 1;
                if (consumedNumber.match(/\.|[eE]-/)) {
                    out.push(consumedNumber);
                } else {
                    out.push(wrapBigIntValueObject(consumedNumber));
                }
                continue;
            }
        }
        out.push(json[ii]);
    }
    return out.join("");
}
function consumeNumber(json, ii) {
    const JSON_NUMBER_REGEX = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/;
    if (!json[ii]?.match(/[-\d]/)) {
        return null;
    }
    const numberMatch = json.slice(ii).match(JSON_NUMBER_REGEX);
    return numberMatch ? numberMatch[0] : null;
}
function wrapBigIntValueObject(value) {
    return `{"$n":"${value}"}`;
}
function unwrapBigIntValueObject({ $n }) {
    if ($n.match(/[eE]/)) {
        const [units, exponent] = $n.split(/[eE]/);
        return BigInt(units) * BigInt(10) ** BigInt(exponent);
    }
    return BigInt($n);
}
function isBigIntValueObject(value) {
    return !!value && typeof value === "object" && "$n" in value && typeof value.$n === "string";
}
// src/rpc-message.ts
var _nextMessageId = 0n;
function getNextMessageId() {
    const id = _nextMessageId;
    _nextMessageId++;
    return id.toString();
}
function createRpcMessage(request) {
    return {
        id: getNextMessageId(),
        jsonrpc: "2.0",
        method: request.methodName,
        params: request.params
    };
}
// src/stringify-json-with-bigints.ts
function stringifyJsonWithBigints(value, space) {
    return unwrapBigIntValueObject2(JSON.stringify(value, (_, v)=>typeof v === "bigint" ? wrapBigIntValueObject2(v) : v, space));
}
function wrapBigIntValueObject2(value) {
    return {
        $n: `${value}`
    };
}
function unwrapBigIntValueObject2(value) {
    return value.replace(/\{\s*"\$n"\s*:\s*"(-?\d+)"\s*\}/g, "$1");
}
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+rpc-spec@2.3.0_typescript@5.9.2/node_modules/@solana/rpc-spec/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createJsonRpcApi",
    ()=>createJsonRpcApi,
    "createRpc",
    ()=>createRpc,
    "isJsonRpcPayload",
    ()=>isJsonRpcPayload
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+errors@2.3.0_typescript@5.9.2/node_modules/@solana/errors/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$spec$2d$types$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$spec$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+rpc-spec-types@2.3.0_typescript@5.9.2/node_modules/@solana/rpc-spec-types/dist/index.node.mjs [app-route] (ecmascript)");
;
;
// src/rpc.ts
function createRpc(rpcConfig) {
    return makeProxy(rpcConfig);
}
function makeProxy(rpcConfig) {
    return new Proxy(rpcConfig.api, {
        defineProperty () {
            return false;
        },
        deleteProperty () {
            return false;
        },
        get (target, p, receiver) {
            if (p === "then") {
                return void 0;
            }
            return function(...rawParams) {
                const methodName = p.toString();
                const getApiPlan = Reflect.get(target, methodName, receiver);
                if (!getApiPlan) {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__RPC__API_PLAN_MISSING_FOR_RPC_METHOD"], {
                        method: methodName,
                        params: rawParams
                    });
                }
                const apiPlan = getApiPlan(...rawParams);
                return createPendingRpcRequest(rpcConfig, apiPlan);
            };
        }
    });
}
function createPendingRpcRequest({ transport }, plan) {
    return {
        async send (options) {
            return await plan.execute({
                signal: options?.abortSignal,
                transport
            });
        }
    };
}
function createJsonRpcApi(config) {
    return new Proxy({}, {
        defineProperty () {
            return false;
        },
        deleteProperty () {
            return false;
        },
        get (...args) {
            const [_, p] = args;
            const methodName = p.toString();
            return function(...rawParams) {
                const rawRequest = Object.freeze({
                    methodName,
                    params: rawParams
                });
                const request = config?.requestTransformer ? config?.requestTransformer(rawRequest) : rawRequest;
                return Object.freeze({
                    execute: async ({ signal, transport })=>{
                        const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$spec$2d$types$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$spec$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createRpcMessage"])(request);
                        const response = await transport({
                            payload,
                            signal
                        });
                        if (!config?.responseTransformer) {
                            return response;
                        }
                        return config.responseTransformer(response, request);
                    }
                });
            };
        }
    });
}
// src/rpc-transport.ts
function isJsonRpcPayload(payload) {
    if (payload == null || typeof payload !== "object" || Array.isArray(payload)) {
        return false;
    }
    return "jsonrpc" in payload && payload.jsonrpc === "2.0" && "method" in payload && typeof payload.method === "string" && "params" in payload;
}
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+rpc-transformers@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/rpc-transformers/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "KEYPATH_WILDCARD",
    ()=>KEYPATH_WILDCARD,
    "getBigIntDowncastRequestTransformer",
    ()=>getBigIntDowncastRequestTransformer,
    "getBigIntUpcastResponseTransformer",
    ()=>getBigIntUpcastResponseTransformer,
    "getDefaultCommitmentRequestTransformer",
    ()=>getDefaultCommitmentRequestTransformer,
    "getDefaultRequestTransformerForSolanaRpc",
    ()=>getDefaultRequestTransformerForSolanaRpc,
    "getDefaultResponseTransformerForSolanaRpc",
    ()=>getDefaultResponseTransformerForSolanaRpc,
    "getDefaultResponseTransformerForSolanaRpcSubscriptions",
    ()=>getDefaultResponseTransformerForSolanaRpcSubscriptions,
    "getIntegerOverflowRequestTransformer",
    ()=>getIntegerOverflowRequestTransformer,
    "getResultResponseTransformer",
    ()=>getResultResponseTransformer,
    "getThrowSolanaErrorResponseTransformer",
    ()=>getThrowSolanaErrorResponseTransformer,
    "getTreeWalkerRequestTransformer",
    ()=>getTreeWalkerRequestTransformer,
    "getTreeWalkerResponseTransformer",
    ()=>getTreeWalkerResponseTransformer,
    "innerInstructionsConfigs",
    ()=>innerInstructionsConfigs,
    "jsonParsedAccountsConfigs",
    ()=>jsonParsedAccountsConfigs,
    "jsonParsedTokenAccountsConfigs",
    ()=>jsonParsedTokenAccountsConfigs,
    "messageConfig",
    ()=>messageConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$functional$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$functional$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+functional@2.3.0_typescript@5.9.2/node_modules/@solana/functional/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+errors@2.3.0_typescript@5.9.2/node_modules/@solana/errors/dist/index.node.mjs [app-route] (ecmascript)");
;
;
// src/request-transformer.ts
// src/request-transformer-bigint-downcast-internal.ts
function downcastNodeToNumberIfBigint(value) {
    return typeof value === "bigint" ? // FIXME(solana-labs/solana/issues/30341) Create a data type to represent u64 in the Solana
    // JSON RPC implementation so that we can throw away this entire patcher instead of unsafely
    // downcasting `bigints` to `numbers`.
    Number(value) : value;
}
// src/tree-traversal.ts
var KEYPATH_WILDCARD = {};
function getTreeWalker(visitors) {
    return function traverse(node, state) {
        if (Array.isArray(node)) {
            return node.map((element, ii)=>{
                const nextState = {
                    ...state,
                    keyPath: [
                        ...state.keyPath,
                        ii
                    ]
                };
                return traverse(element, nextState);
            });
        } else if (typeof node === "object" && node !== null) {
            const out = {};
            for(const propName in node){
                if (!Object.prototype.hasOwnProperty.call(node, propName)) {
                    continue;
                }
                const nextState = {
                    ...state,
                    keyPath: [
                        ...state.keyPath,
                        propName
                    ]
                };
                out[propName] = traverse(node[propName], nextState);
            }
            return out;
        } else {
            return visitors.reduce((acc, visitNode)=>visitNode(acc, state), node);
        }
    };
}
function getTreeWalkerRequestTransformer(visitors, initialState) {
    return (request)=>{
        const traverse = getTreeWalker(visitors);
        return Object.freeze({
            ...request,
            params: traverse(request.params, initialState)
        });
    };
}
function getTreeWalkerResponseTransformer(visitors, initialState) {
    return (json)=>getTreeWalker(visitors)(json, initialState);
}
// src/request-transformer-bigint-downcast.ts
function getBigIntDowncastRequestTransformer() {
    return getTreeWalkerRequestTransformer([
        downcastNodeToNumberIfBigint
    ], {
        keyPath: []
    });
}
// src/request-transformer-default-commitment-internal.ts
function applyDefaultCommitment({ commitmentPropertyName, params, optionsObjectPositionInParams, overrideCommitment }) {
    const paramInTargetPosition = params[optionsObjectPositionInParams];
    if (// There's no config.
    paramInTargetPosition === void 0 || // There is a config object.
    paramInTargetPosition && typeof paramInTargetPosition === "object" && !Array.isArray(paramInTargetPosition)) {
        if (// The config object already has a commitment set.
        paramInTargetPosition && commitmentPropertyName in paramInTargetPosition) {
            if (!paramInTargetPosition[commitmentPropertyName] || paramInTargetPosition[commitmentPropertyName] === "finalized") {
                const nextParams = [
                    ...params
                ];
                const { [commitmentPropertyName]: _, // eslint-disable-line @typescript-eslint/no-unused-vars
                ...rest } = paramInTargetPosition;
                if (Object.keys(rest).length > 0) {
                    nextParams[optionsObjectPositionInParams] = rest;
                } else {
                    if (optionsObjectPositionInParams === nextParams.length - 1) {
                        nextParams.length--;
                    } else {
                        nextParams[optionsObjectPositionInParams] = void 0;
                    }
                }
                return nextParams;
            }
        } else if (overrideCommitment !== "finalized") {
            const nextParams = [
                ...params
            ];
            nextParams[optionsObjectPositionInParams] = {
                ...paramInTargetPosition,
                [commitmentPropertyName]: overrideCommitment
            };
            return nextParams;
        }
    }
    return params;
}
// src/request-transformer-default-commitment.ts
function getDefaultCommitmentRequestTransformer({ defaultCommitment, optionsObjectPositionByMethod }) {
    return (request)=>{
        const { params, methodName } = request;
        if (!Array.isArray(params)) {
            return request;
        }
        const optionsObjectPositionInParams = optionsObjectPositionByMethod[methodName];
        if (optionsObjectPositionInParams == null) {
            return request;
        }
        return Object.freeze({
            methodName,
            params: applyDefaultCommitment({
                commitmentPropertyName: methodName === "sendTransaction" ? "preflightCommitment" : "commitment",
                optionsObjectPositionInParams,
                overrideCommitment: defaultCommitment,
                params
            })
        });
    };
}
// src/request-transformer-integer-overflow-internal.ts
function getIntegerOverflowNodeVisitor(onIntegerOverflow) {
    return (value, { keyPath })=>{
        if (typeof value === "bigint") {
            if (onIntegerOverflow && (value > Number.MAX_SAFE_INTEGER || value < -Number.MAX_SAFE_INTEGER)) {
                onIntegerOverflow(keyPath, value);
            }
        }
        return value;
    };
}
// src/request-transformer-integer-overflow.ts
function getIntegerOverflowRequestTransformer(onIntegerOverflow) {
    return (request)=>{
        const transformer = getTreeWalkerRequestTransformer([
            getIntegerOverflowNodeVisitor((...args)=>onIntegerOverflow(request, ...args))
        ], {
            keyPath: []
        });
        return transformer(request);
    };
}
// src/request-transformer-options-object-position-config.ts
var OPTIONS_OBJECT_POSITION_BY_METHOD = {
    accountNotifications: 1,
    blockNotifications: 1,
    getAccountInfo: 1,
    getBalance: 1,
    getBlock: 1,
    getBlockHeight: 0,
    getBlockProduction: 0,
    getBlocks: 2,
    getBlocksWithLimit: 2,
    getEpochInfo: 0,
    getFeeForMessage: 1,
    getInflationGovernor: 0,
    getInflationReward: 1,
    getLargestAccounts: 0,
    getLatestBlockhash: 0,
    getLeaderSchedule: 1,
    getMinimumBalanceForRentExemption: 1,
    getMultipleAccounts: 1,
    getProgramAccounts: 1,
    getSignaturesForAddress: 1,
    getSlot: 0,
    getSlotLeader: 0,
    getStakeMinimumDelegation: 0,
    getSupply: 0,
    getTokenAccountBalance: 1,
    getTokenAccountsByDelegate: 2,
    getTokenAccountsByOwner: 2,
    getTokenLargestAccounts: 1,
    getTokenSupply: 1,
    getTransaction: 1,
    getTransactionCount: 0,
    getVoteAccounts: 0,
    isBlockhashValid: 1,
    logsNotifications: 1,
    programNotifications: 1,
    requestAirdrop: 2,
    sendTransaction: 1,
    signatureNotifications: 1,
    simulateTransaction: 1
};
// src/request-transformer.ts
function getDefaultRequestTransformerForSolanaRpc(config) {
    const handleIntegerOverflow = config?.onIntegerOverflow;
    return (request)=>{
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$functional$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$functional$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pipe"])(request, handleIntegerOverflow ? getIntegerOverflowRequestTransformer(handleIntegerOverflow) : (r)=>r, getBigIntDowncastRequestTransformer(), getDefaultCommitmentRequestTransformer({
            defaultCommitment: config?.defaultCommitment,
            optionsObjectPositionByMethod: OPTIONS_OBJECT_POSITION_BY_METHOD
        }));
    };
}
// src/response-transformer-bigint-upcast-internal.ts
function getBigIntUpcastVisitor(allowedNumericKeyPaths) {
    return function upcastNodeToBigIntIfNumber(value, { keyPath }) {
        const isInteger = typeof value === "number" && Number.isInteger(value) || typeof value === "bigint";
        if (!isInteger) return value;
        if (keyPathIsAllowedToBeNumeric(keyPath, allowedNumericKeyPaths)) {
            return Number(value);
        } else {
            return BigInt(value);
        }
    };
}
function keyPathIsAllowedToBeNumeric(keyPath, allowedNumericKeyPaths) {
    return allowedNumericKeyPaths.some((prohibitedKeyPath)=>{
        if (prohibitedKeyPath.length !== keyPath.length) {
            return false;
        }
        for(let ii = keyPath.length - 1; ii >= 0; ii--){
            const keyPathPart = keyPath[ii];
            const prohibitedKeyPathPart = prohibitedKeyPath[ii];
            if (prohibitedKeyPathPart !== keyPathPart && (prohibitedKeyPathPart !== KEYPATH_WILDCARD || typeof keyPathPart !== "number")) {
                return false;
            }
        }
        return true;
    });
}
// src/response-transformer-bigint-upcast.ts
function getBigIntUpcastResponseTransformer(allowedNumericKeyPaths) {
    return getTreeWalkerResponseTransformer([
        getBigIntUpcastVisitor(allowedNumericKeyPaths)
    ], {
        keyPath: []
    });
}
// src/response-transformer-result.ts
function getResultResponseTransformer() {
    return (json)=>json.result;
}
function getThrowSolanaErrorResponseTransformer() {
    return (json)=>{
        const jsonRpcResponse = json;
        if ("error" in jsonRpcResponse) {
            throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSolanaErrorFromJsonRpcError"])(jsonRpcResponse.error);
        }
        return jsonRpcResponse;
    };
}
// src/response-transformer.ts
function getDefaultResponseTransformerForSolanaRpc(config) {
    return (response, request)=>{
        const methodName = request.methodName;
        const keyPaths = config?.allowedNumericKeyPaths && methodName ? config.allowedNumericKeyPaths[methodName] : void 0;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$functional$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$functional$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pipe"])(response, (r)=>getThrowSolanaErrorResponseTransformer()(r, request), (r)=>getResultResponseTransformer()(r, request), (r)=>getBigIntUpcastResponseTransformer(keyPaths ?? [])(r, request));
    };
}
function getDefaultResponseTransformerForSolanaRpcSubscriptions(config) {
    return (response, request)=>{
        const methodName = request.methodName;
        const keyPaths = config?.allowedNumericKeyPaths && methodName ? config.allowedNumericKeyPaths[methodName] : void 0;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$functional$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$functional$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pipe"])(response, (r)=>getBigIntUpcastResponseTransformer(keyPaths ?? [])(r, request));
    };
}
// src/response-transformer-allowed-numeric-values.ts
var jsonParsedTokenAccountsConfigs = [
    // parsed Token/Token22 token account
    [
        "data",
        "parsed",
        "info",
        "tokenAmount",
        "decimals"
    ],
    [
        "data",
        "parsed",
        "info",
        "tokenAmount",
        "uiAmount"
    ],
    [
        "data",
        "parsed",
        "info",
        "rentExemptReserve",
        "decimals"
    ],
    [
        "data",
        "parsed",
        "info",
        "rentExemptReserve",
        "uiAmount"
    ],
    [
        "data",
        "parsed",
        "info",
        "delegatedAmount",
        "decimals"
    ],
    [
        "data",
        "parsed",
        "info",
        "delegatedAmount",
        "uiAmount"
    ],
    [
        "data",
        "parsed",
        "info",
        "extensions",
        KEYPATH_WILDCARD,
        "state",
        "olderTransferFee",
        "transferFeeBasisPoints"
    ],
    [
        "data",
        "parsed",
        "info",
        "extensions",
        KEYPATH_WILDCARD,
        "state",
        "newerTransferFee",
        "transferFeeBasisPoints"
    ],
    [
        "data",
        "parsed",
        "info",
        "extensions",
        KEYPATH_WILDCARD,
        "state",
        "preUpdateAverageRate"
    ],
    [
        "data",
        "parsed",
        "info",
        "extensions",
        KEYPATH_WILDCARD,
        "state",
        "currentRate"
    ]
];
var jsonParsedAccountsConfigs = [
    ...jsonParsedTokenAccountsConfigs,
    // parsed AddressTableLookup account
    [
        "data",
        "parsed",
        "info",
        "lastExtendedSlotStartIndex"
    ],
    // parsed Config account
    [
        "data",
        "parsed",
        "info",
        "slashPenalty"
    ],
    [
        "data",
        "parsed",
        "info",
        "warmupCooldownRate"
    ],
    // parsed Token/Token22 mint account
    [
        "data",
        "parsed",
        "info",
        "decimals"
    ],
    // parsed Token/Token22 multisig account
    [
        "data",
        "parsed",
        "info",
        "numRequiredSigners"
    ],
    [
        "data",
        "parsed",
        "info",
        "numValidSigners"
    ],
    // parsed Stake account
    [
        "data",
        "parsed",
        "info",
        "stake",
        "delegation",
        "warmupCooldownRate"
    ],
    // parsed Sysvar rent account
    [
        "data",
        "parsed",
        "info",
        "exemptionThreshold"
    ],
    [
        "data",
        "parsed",
        "info",
        "burnPercent"
    ],
    // parsed Vote account
    [
        "data",
        "parsed",
        "info",
        "commission"
    ],
    [
        "data",
        "parsed",
        "info",
        "votes",
        KEYPATH_WILDCARD,
        "confirmationCount"
    ]
];
var innerInstructionsConfigs = [
    [
        "index"
    ],
    [
        "instructions",
        KEYPATH_WILDCARD,
        "accounts",
        KEYPATH_WILDCARD
    ],
    [
        "instructions",
        KEYPATH_WILDCARD,
        "programIdIndex"
    ],
    [
        "instructions",
        KEYPATH_WILDCARD,
        "stackHeight"
    ]
];
var messageConfig = [
    [
        "addressTableLookups",
        KEYPATH_WILDCARD,
        "writableIndexes",
        KEYPATH_WILDCARD
    ],
    [
        "addressTableLookups",
        KEYPATH_WILDCARD,
        "readonlyIndexes",
        KEYPATH_WILDCARD
    ],
    [
        "header",
        "numReadonlySignedAccounts"
    ],
    [
        "header",
        "numReadonlyUnsignedAccounts"
    ],
    [
        "header",
        "numRequiredSignatures"
    ],
    [
        "instructions",
        KEYPATH_WILDCARD,
        "accounts",
        KEYPATH_WILDCARD
    ],
    [
        "instructions",
        KEYPATH_WILDCARD,
        "programIdIndex"
    ],
    [
        "instructions",
        KEYPATH_WILDCARD,
        "stackHeight"
    ]
];
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+rpc-api@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/rpc-api/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createSolanaRpcApi",
    ()=>createSolanaRpcApi
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$spec$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$spec$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+rpc-spec@2.3.0_typescript@5.9.2/node_modules/@solana/rpc-spec/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+rpc-transformers@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/rpc-transformers/dist/index.node.mjs [app-route] (ecmascript)");
;
;
// src/index.ts
function createSolanaRpcApi(config) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$spec$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$spec$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createJsonRpcApi"])({
        requestTransformer: (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDefaultRequestTransformerForSolanaRpc"])(config),
        responseTransformer: (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDefaultResponseTransformerForSolanaRpc"])({
            allowedNumericKeyPaths: getAllowedNumericKeypaths()
        })
    });
}
var memoizedKeypaths;
function getAllowedNumericKeypaths() {
    if (!memoizedKeypaths) {
        memoizedKeypaths = {
            getAccountInfo: __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonParsedAccountsConfigs"].map((c)=>[
                    "value",
                    ...c
                ]),
            getBlock: [
                [
                    "transactions",
                    __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                    "meta",
                    "preTokenBalances",
                    __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                    "accountIndex"
                ],
                [
                    "transactions",
                    __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                    "meta",
                    "preTokenBalances",
                    __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                    "uiTokenAmount",
                    "decimals"
                ],
                [
                    "transactions",
                    __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                    "meta",
                    "postTokenBalances",
                    __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                    "accountIndex"
                ],
                [
                    "transactions",
                    __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                    "meta",
                    "postTokenBalances",
                    __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                    "uiTokenAmount",
                    "decimals"
                ],
                [
                    "transactions",
                    __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                    "meta",
                    "rewards",
                    __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                    "commission"
                ],
                ...__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["innerInstructionsConfigs"].map((c)=>[
                        "transactions",
                        __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                        "meta",
                        "innerInstructions",
                        __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                        ...c
                    ]),
                ...__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["messageConfig"].map((c)=>[
                        "transactions",
                        __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                        "transaction",
                        "message",
                        ...c
                    ]),
                [
                    "rewards",
                    __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                    "commission"
                ]
            ],
            getClusterNodes: [
                [
                    __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                    "featureSet"
                ],
                [
                    __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                    "shredVersion"
                ]
            ],
            getInflationGovernor: [
                [
                    "initial"
                ],
                [
                    "foundation"
                ],
                [
                    "foundationTerm"
                ],
                [
                    "taper"
                ],
                [
                    "terminal"
                ]
            ],
            getInflationRate: [
                [
                    "foundation"
                ],
                [
                    "total"
                ],
                [
                    "validator"
                ]
            ],
            getInflationReward: [
                [
                    __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                    "commission"
                ]
            ],
            getMultipleAccounts: __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonParsedAccountsConfigs"].map((c)=>[
                    "value",
                    __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                    ...c
                ]),
            getProgramAccounts: __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonParsedAccountsConfigs"].flatMap((c)=>[
                    [
                        "value",
                        __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                        "account",
                        ...c
                    ],
                    [
                        __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                        "account",
                        ...c
                    ]
                ]),
            getRecentPerformanceSamples: [
                [
                    __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                    "samplePeriodSecs"
                ]
            ],
            getTokenAccountBalance: [
                [
                    "value",
                    "decimals"
                ],
                [
                    "value",
                    "uiAmount"
                ]
            ],
            getTokenAccountsByDelegate: __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonParsedTokenAccountsConfigs"].map((c)=>[
                    "value",
                    __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                    "account",
                    ...c
                ]),
            getTokenAccountsByOwner: __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonParsedTokenAccountsConfigs"].map((c)=>[
                    "value",
                    __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                    "account",
                    ...c
                ]),
            getTokenLargestAccounts: [
                [
                    "value",
                    __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                    "decimals"
                ],
                [
                    "value",
                    __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                    "uiAmount"
                ]
            ],
            getTokenSupply: [
                [
                    "value",
                    "decimals"
                ],
                [
                    "value",
                    "uiAmount"
                ]
            ],
            getTransaction: [
                [
                    "meta",
                    "preTokenBalances",
                    __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                    "accountIndex"
                ],
                [
                    "meta",
                    "preTokenBalances",
                    __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                    "uiTokenAmount",
                    "decimals"
                ],
                [
                    "meta",
                    "postTokenBalances",
                    __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                    "accountIndex"
                ],
                [
                    "meta",
                    "postTokenBalances",
                    __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                    "uiTokenAmount",
                    "decimals"
                ],
                [
                    "meta",
                    "rewards",
                    __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                    "commission"
                ],
                ...__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["innerInstructionsConfigs"].map((c)=>[
                        "meta",
                        "innerInstructions",
                        __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                        ...c
                    ]),
                ...__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["messageConfig"].map((c)=>[
                        "transaction",
                        "message",
                        ...c
                    ])
            ],
            getVersion: [
                [
                    "feature-set"
                ]
            ],
            getVoteAccounts: [
                [
                    "current",
                    __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                    "commission"
                ],
                [
                    "delinquent",
                    __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                    "commission"
                ]
            ],
            simulateTransaction: [
                ...__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonParsedAccountsConfigs"].map((c)=>[
                        "value",
                        "accounts",
                        __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                        ...c
                    ]),
                ...__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["innerInstructionsConfigs"].map((c)=>[
                        "value",
                        "innerInstructions",
                        __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transformers$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transformers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KEYPATH_WILDCARD"],
                        ...c
                    ])
            ]
        };
    }
    return memoizedKeypaths;
}
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+rpc-transport-http@2.3.0_typescript@5.9.2/node_modules/@solana/rpc-transport-http/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createHttpTransport",
    ()=>createHttpTransport,
    "createHttpTransportForSolanaRpc",
    ()=>createHttpTransportForSolanaRpc
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+errors@2.3.0_typescript@5.9.2/node_modules/@solana/errors/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$spec$2d$types$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$spec$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+rpc-spec-types@2.3.0_typescript@5.9.2/node_modules/@solana/rpc-spec-types/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$spec$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$spec$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+rpc-spec@2.3.0_typescript@5.9.2/node_modules/@solana/rpc-spec/dist/index.node.mjs [app-route] (ecmascript)");
;
;
;
// src/http-transport.ts
var DISALLOWED_HEADERS = {
    accept: true,
    "content-length": true,
    "content-type": true
};
var FORBIDDEN_HEADERS = /* @__PURE__ */ Object.assign({
    "accept-charset": true,
    "access-control-request-headers": true,
    "access-control-request-method": true,
    connection: true,
    "content-length": true,
    cookie: true,
    date: true,
    dnt: true,
    expect: true,
    host: true,
    "keep-alive": true,
    origin: true,
    "permissions-policy": true,
    // Prefix matching is implemented in code, below.
    // 'proxy-': true,
    // 'sec-': true,
    referer: true,
    te: true,
    trailer: true,
    "transfer-encoding": true,
    upgrade: true,
    via: true
}, void 0);
function assertIsAllowedHttpRequestHeaders(headers) {
    const badHeaders = Object.keys(headers).filter((headerName)=>{
        const lowercaseHeaderName = headerName.toLowerCase();
        return DISALLOWED_HEADERS[headerName.toLowerCase()] === true || FORBIDDEN_HEADERS[headerName.toLowerCase()] === true || lowercaseHeaderName.startsWith("proxy-") || lowercaseHeaderName.startsWith("sec-");
    });
    if (badHeaders.length > 0) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__RPC__TRANSPORT_HTTP_HEADER_FORBIDDEN"], {
            headers: badHeaders
        });
    }
}
function normalizeHeaders(headers) {
    const out = {};
    for(const headerName in headers){
        out[headerName.toLowerCase()] = headers[headerName];
    }
    return out;
}
// src/http-transport.ts
function createHttpTransport(config) {
    if (("TURBOPACK compile-time value", "development") !== "production" && false) ;
    const { fromJson, headers, toJson, url } = config;
    if (("TURBOPACK compile-time value", "development") !== "production" && headers) {
        assertIsAllowedHttpRequestHeaders(headers);
    }
    let dispatcherConfig;
    if ("dispatcher_NODE_ONLY" in config) {
        dispatcherConfig = {
            dispatcher: config.dispatcher_NODE_ONLY
        };
    }
    const customHeaders = headers && normalizeHeaders(headers);
    return async function makeHttpRequest({ payload, signal }) {
        const body = toJson ? toJson(payload) : JSON.stringify(payload);
        const requestInfo = {
            ...dispatcherConfig,
            body,
            headers: {
                ...customHeaders,
                // Keep these headers lowercase so they will override any user-supplied headers above.
                accept: "application/json",
                "content-length": body.length.toString(),
                "content-type": "application/json; charset=utf-8"
            },
            method: "POST",
            signal
        };
        const response = await fetch(url, requestInfo);
        if (!response.ok) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__RPC__TRANSPORT_HTTP_ERROR"], {
                headers: response.headers,
                message: response.statusText,
                statusCode: response.status
            });
        }
        if (fromJson) {
            return fromJson(await response.text(), payload);
        }
        return await response.json();
    };
}
var SOLANA_RPC_METHODS = [
    "getAccountInfo",
    "getBalance",
    "getBlock",
    "getBlockCommitment",
    "getBlockHeight",
    "getBlockProduction",
    "getBlocks",
    "getBlocksWithLimit",
    "getBlockTime",
    "getClusterNodes",
    "getEpochInfo",
    "getEpochSchedule",
    "getFeeForMessage",
    "getFirstAvailableBlock",
    "getGenesisHash",
    "getHealth",
    "getHighestSnapshotSlot",
    "getIdentity",
    "getInflationGovernor",
    "getInflationRate",
    "getInflationReward",
    "getLargestAccounts",
    "getLatestBlockhash",
    "getLeaderSchedule",
    "getMaxRetransmitSlot",
    "getMaxShredInsertSlot",
    "getMinimumBalanceForRentExemption",
    "getMultipleAccounts",
    "getProgramAccounts",
    "getRecentPerformanceSamples",
    "getRecentPrioritizationFees",
    "getSignaturesForAddress",
    "getSignatureStatuses",
    "getSlot",
    "getSlotLeader",
    "getSlotLeaders",
    "getStakeMinimumDelegation",
    "getSupply",
    "getTokenAccountBalance",
    "getTokenAccountsByDelegate",
    "getTokenAccountsByOwner",
    "getTokenLargestAccounts",
    "getTokenSupply",
    "getTransaction",
    "getTransactionCount",
    "getVersion",
    "getVoteAccounts",
    "index",
    "isBlockhashValid",
    "minimumLedgerSlot",
    "requestAirdrop",
    "sendTransaction",
    "simulateTransaction"
];
function isSolanaRequest(payload) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$spec$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$spec$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isJsonRpcPayload"])(payload) && SOLANA_RPC_METHODS.includes(payload.method);
}
// src/http-transport-for-solana-rpc.ts
function createHttpTransportForSolanaRpc(config) {
    return createHttpTransport({
        ...config,
        fromJson: (rawResponse, payload)=>isSolanaRequest(payload) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$spec$2d$types$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$spec$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseJsonWithBigInts"])(rawResponse) : JSON.parse(rawResponse),
        toJson: (payload)=>isSolanaRequest(payload) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$spec$2d$types$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$spec$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stringifyJsonWithBigints"])(payload) : JSON.stringify(payload)
    });
}
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+fast-stable-stringify@2.3.0_typescript@5.9.2/node_modules/@solana/fast-stable-stringify/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/index.ts
__turbopack_context__.s([
    "default",
    ()=>index_default
]);
var objToString = Object.prototype.toString;
var objKeys = Object.keys || function(obj) {
    const keys = [];
    for(const name in obj){
        keys.push(name);
    }
    return keys;
};
function stringify(val, isArrayProp) {
    let i, max, str, keys, key, propVal, toStr;
    if (val === true) {
        return "true";
    }
    if (val === false) {
        return "false";
    }
    switch(typeof val){
        case "object":
            if (val === null) {
                return null;
            } else if ("toJSON" in val && typeof val.toJSON === "function") {
                return stringify(val.toJSON(), isArrayProp);
            } else {
                toStr = objToString.call(val);
                if (toStr === "[object Array]") {
                    str = "[";
                    max = val.length - 1;
                    for(i = 0; i < max; i++){
                        str += stringify(val[i], true) + ",";
                    }
                    if (max > -1) {
                        str += stringify(val[i], true);
                    }
                    return str + "]";
                } else if (toStr === "[object Object]") {
                    keys = objKeys(val).sort();
                    max = keys.length;
                    str = "";
                    i = 0;
                    while(i < max){
                        key = keys[i];
                        propVal = stringify(val[key], false);
                        if (propVal !== void 0) {
                            if (str) {
                                str += ",";
                            }
                            str += JSON.stringify(key) + ":" + propVal;
                        }
                        i++;
                    }
                    return "{" + str + "}";
                } else {
                    return JSON.stringify(val);
                }
            }
        case "function":
        case "undefined":
            return isArrayProp ? null : void 0;
        case "bigint":
            return `${val.toString()}n`;
        case "string":
            return JSON.stringify(val);
        default:
            return isFinite(val) ? val : null;
    }
}
function index_default(val) {
    const returnVal = stringify(val, false);
    if (returnVal !== void 0) {
        return "" + returnVal;
    }
}
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+rpc@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/rpc/dist/index.node.mjs [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_RPC_CONFIG",
    ()=>DEFAULT_RPC_CONFIG,
    "createDefaultRpcTransport",
    ()=>createDefaultRpcTransport,
    "createSolanaRpc",
    ()=>createSolanaRpc,
    "createSolanaRpcFromTransport",
    ()=>createSolanaRpcFromTransport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$api$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$api$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+rpc-api@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/rpc-api/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$spec$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$spec$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+rpc-spec@2.3.0_typescript@5.9.2/node_modules/@solana/rpc-spec/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+errors@2.3.0_typescript@5.9.2/node_modules/@solana/errors/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$functional$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$functional$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+functional@2.3.0_typescript@5.9.2/node_modules/@solana/functional/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transport$2d$http$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transport$2d$http$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+rpc-transport-http@2.3.0_typescript@5.9.2/node_modules/@solana/rpc-transport-http/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$events__$5b$external$5d$__$28$events$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/events [external] (events, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$fast$2d$stable$2d$stringify$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$fast$2d$stable$2d$stringify$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+fast-stable-stringify@2.3.0_typescript@5.9.2/node_modules/@solana/fast-stable-stringify/dist/index.node.mjs [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
// src/index.ts
function createSolanaJsonRpcIntegerOverflowError(methodName, keyPath, value) {
    let argumentLabel = "";
    if (typeof keyPath[0] === "number") {
        const argPosition = keyPath[0] + 1;
        const lastDigit = argPosition % 10;
        const lastTwoDigits = argPosition % 100;
        if (lastDigit == 1 && lastTwoDigits != 11) {
            argumentLabel = argPosition + "st";
        } else if (lastDigit == 2 && lastTwoDigits != 12) {
            argumentLabel = argPosition + "nd";
        } else if (lastDigit == 3 && lastTwoDigits != 13) {
            argumentLabel = argPosition + "rd";
        } else {
            argumentLabel = argPosition + "th";
        }
    } else {
        argumentLabel = `\`${keyPath[0].toString()}\``;
    }
    const path = keyPath.length > 1 ? keyPath.slice(1).map((pathPart)=>typeof pathPart === "number" ? `[${pathPart}]` : pathPart).join(".") : void 0;
    const error = new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__RPC__INTEGER_OVERFLOW"], {
        argumentLabel,
        keyPath,
        methodName,
        optionalPathLabel: path ? ` at path \`${path}\`` : "",
        value,
        ...path !== void 0 ? {
            path
        } : void 0
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safeCaptureStackTrace"])(error, createSolanaJsonRpcIntegerOverflowError);
    return error;
}
// src/rpc-default-config.ts
var DEFAULT_RPC_CONFIG = {
    defaultCommitment: "confirmed",
    onIntegerOverflow (request, keyPath, value) {
        throw createSolanaJsonRpcIntegerOverflowError(request.methodName, keyPath, value);
    }
};
var e = class extends globalThis.AbortController {
    constructor(...t){
        super(...t), (0, __TURBOPACK__imported__module__$5b$externals$5d2f$events__$5b$external$5d$__$28$events$2c$__cjs$29$__["setMaxListeners"])(Number.MAX_SAFE_INTEGER, this.signal);
    }
};
// src/rpc-request-coalescer.ts
var EXPLICIT_ABORT_TOKEN;
function createExplicitAbortToken() {
    return ("TURBOPACK compile-time truthy", 1) ? {
        EXPLICIT_ABORT_TOKEN: "This object is thrown from the request that underlies a series of coalesced requests when the last request in that series aborts"
    } : "TURBOPACK unreachable";
}
function getRpcTransportWithRequestCoalescing(transport, getDeduplicationKey) {
    let coalescedRequestsByDeduplicationKey;
    return async function makeCoalescedHttpRequest(request) {
        const { payload, signal } = request;
        const deduplicationKey = getDeduplicationKey(payload);
        if (deduplicationKey === void 0) {
            return await transport(request);
        }
        if (!coalescedRequestsByDeduplicationKey) {
            queueMicrotask(()=>{
                coalescedRequestsByDeduplicationKey = void 0;
            });
            coalescedRequestsByDeduplicationKey = {};
        }
        if (coalescedRequestsByDeduplicationKey[deduplicationKey] == null) {
            const abortController = new e();
            const responsePromise = (async ()=>{
                try {
                    return await transport({
                        ...request,
                        signal: abortController.signal
                    });
                } catch (e2) {
                    if (e2 === (EXPLICIT_ABORT_TOKEN ||= createExplicitAbortToken())) {
                        return;
                    }
                    throw e2;
                }
            })();
            coalescedRequestsByDeduplicationKey[deduplicationKey] = {
                abortController,
                numConsumers: 0,
                responsePromise
            };
        }
        const coalescedRequest = coalescedRequestsByDeduplicationKey[deduplicationKey];
        coalescedRequest.numConsumers++;
        if (signal) {
            const responsePromise = coalescedRequest.responsePromise;
            return await new Promise((resolve, reject)=>{
                const handleAbort = (e2)=>{
                    signal.removeEventListener("abort", handleAbort);
                    coalescedRequest.numConsumers -= 1;
                    queueMicrotask(()=>{
                        if (coalescedRequest.numConsumers === 0) {
                            const abortController = coalescedRequest.abortController;
                            abortController.abort(EXPLICIT_ABORT_TOKEN ||= createExplicitAbortToken());
                        }
                    });
                    reject(e2.target.reason);
                };
                signal.addEventListener("abort", handleAbort);
                responsePromise.then(resolve).catch(reject).finally(()=>{
                    signal.removeEventListener("abort", handleAbort);
                });
            });
        } else {
            return await coalescedRequest.responsePromise;
        }
    };
}
function getSolanaRpcPayloadDeduplicationKey(payload) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$spec$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$spec$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isJsonRpcPayload"])(payload) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$fast$2d$stable$2d$stringify$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$fast$2d$stable$2d$stringify$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])([
        payload.method,
        payload.params
    ]) : void 0;
}
// src/rpc-transport.ts
function normalizeHeaders(headers) {
    const out = {};
    for(const headerName in headers){
        out[headerName.toLowerCase()] = headers[headerName];
    }
    return out;
}
function createDefaultRpcTransport(config) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$functional$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$functional$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pipe"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$transport$2d$http$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$transport$2d$http$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createHttpTransportForSolanaRpc"])({
        ...config,
        headers: {
            ...{
                // Keep these headers lowercase so they will be overridden by any user-supplied headers below.
                "accept-encoding": // Natively supported by Node LTS v20.18.0 and above.
                "br,gzip,deflate"
            },
            ...config.headers ? normalizeHeaders(config.headers) : void 0,
            ...{
                // Keep these headers lowercase so they will override any user-supplied headers above.
                "solana-client": `js/${"2.3.0"}`
            }
        }
    }), (transport)=>getRpcTransportWithRequestCoalescing(transport, getSolanaRpcPayloadDeduplicationKey));
}
// src/rpc.ts
function createSolanaRpc(clusterUrl, config) {
    return createSolanaRpcFromTransport(createDefaultRpcTransport({
        url: clusterUrl,
        ...config
    }));
}
function createSolanaRpcFromTransport(transport) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$spec$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$spec$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createRpc"])({
        api: (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$api$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$api$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSolanaRpcApi"])(DEFAULT_RPC_CONFIG),
        transport
    });
}
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+options@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/options/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getOptionCodec",
    ()=>getOptionCodec,
    "getOptionDecoder",
    ()=>getOptionDecoder,
    "getOptionEncoder",
    ()=>getOptionEncoder,
    "isNone",
    ()=>isNone,
    "isOption",
    ()=>isOption,
    "isSome",
    ()=>isSome,
    "none",
    ()=>none,
    "some",
    ()=>some,
    "unwrapOption",
    ()=>unwrapOption,
    "unwrapOptionRecursively",
    ()=>unwrapOptionRecursively,
    "wrapNullable",
    ()=>wrapNullable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-core@2.3.0_typescript@5.9.2/node_modules/@solana/codecs-core/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-data-structures@2.3.0_typescript@5.9.2/node_modules/@solana/codecs-data-structures/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-numbers@2.3.0_typescript@5.9.2/node_modules/@solana/codecs-numbers/dist/index.node.mjs [app-route] (ecmascript)");
;
;
;
// src/option.ts
var some = (value)=>({
        __option: "Some",
        value
    });
var none = ()=>({
        __option: "None"
    });
var isOption = (input)=>!!(input && typeof input === "object" && "__option" in input && (input.__option === "Some" && "value" in input || input.__option === "None"));
var isSome = (option)=>option.__option === "Some";
var isNone = (option)=>option.__option === "None";
// src/unwrap-option.ts
function unwrapOption(option, fallback) {
    if (isSome(option)) return option.value;
    return fallback ? fallback() : null;
}
var wrapNullable = (nullable)=>nullable !== null ? some(nullable) : none();
// src/option-codec.ts
function getOptionEncoder(item, config = {}) {
    const prefix = (()=>{
        if (config.prefix === null) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUnitEncoder"])(), (_boolean)=>void 0);
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBooleanEncoder"])({
            size: config.prefix ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Encoder"])()
        });
    })();
    const noneValue = (()=>{
        if (config.noneValue === "zeroes") {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertIsFixedSize"])(item);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fixEncoderSize"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUnitEncoder"])(), item.fixedSize);
        }
        if (!config.noneValue) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUnitEncoder"])();
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getConstantEncoder"])(config.noneValue);
    })();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUnionEncoder"])([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTupleEncoder"])([
            prefix,
            noneValue
        ]), (_value)=>[
                false,
                void 0
            ]),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTupleEncoder"])([
            prefix,
            item
        ]), (value)=>[
                true,
                isOption(value) && isSome(value) ? value.value : value
            ])
    ], (variant)=>{
        const option = isOption(variant) ? variant : wrapNullable(variant);
        return Number(isSome(option));
    });
}
function getOptionDecoder(item, config = {}) {
    const prefix = (()=>{
        if (config.prefix === null) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUnitDecoder"])(), ()=>false);
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBooleanDecoder"])({
            size: config.prefix ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Decoder"])()
        });
    })();
    const noneValue = (()=>{
        if (config.noneValue === "zeroes") {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertIsFixedSize"])(item);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fixDecoderSize"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUnitDecoder"])(), item.fixedSize);
        }
        if (!config.noneValue) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUnitDecoder"])();
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getConstantDecoder"])(config.noneValue);
    })();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUnionDecoder"])([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTupleDecoder"])([
            prefix,
            noneValue
        ]), ()=>none()),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformDecoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTupleDecoder"])([
            prefix,
            item
        ]), ([, value])=>some(value))
    ], (bytes, offset)=>{
        if (config.prefix === null && !config.noneValue) {
            return Number(offset < bytes.length);
        }
        if (config.prefix === null && config.noneValue != null) {
            const zeroValue = config.noneValue === "zeroes" ? new Uint8Array(noneValue.fixedSize).fill(0) : config.noneValue;
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["containsBytes"])(bytes, zeroValue, offset) ? 0 : 1;
        }
        return Number(prefix.read(bytes, offset)[0]);
    });
}
function getOptionCodec(item, config = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getOptionEncoder(item, config), getOptionDecoder(item, config));
}
// src/unwrap-option-recursively.ts
function unwrapOptionRecursively(input, fallback) {
    if (!input || ArrayBuffer.isView(input)) {
        return input;
    }
    const next = (x)=>fallback ? unwrapOptionRecursively(x, fallback) : unwrapOptionRecursively(x);
    if (isOption(input)) {
        if (isSome(input)) return next(input.value);
        return fallback ? fallback() : null;
    }
    if (Array.isArray(input)) {
        return input.map(next);
    }
    if (typeof input === "object") {
        return Object.fromEntries(Object.entries(input).map(([k, v])=>[
                k,
                next(v)
            ]));
    }
    return input;
}
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+accounts@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/accounts/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BASE_ACCOUNT_SIZE",
    ()=>BASE_ACCOUNT_SIZE,
    "assertAccountDecoded",
    ()=>assertAccountDecoded,
    "assertAccountExists",
    ()=>assertAccountExists,
    "assertAccountsDecoded",
    ()=>assertAccountsDecoded,
    "assertAccountsExist",
    ()=>assertAccountsExist,
    "decodeAccount",
    ()=>decodeAccount,
    "fetchEncodedAccount",
    ()=>fetchEncodedAccount,
    "fetchEncodedAccounts",
    ()=>fetchEncodedAccounts,
    "fetchJsonParsedAccount",
    ()=>fetchJsonParsedAccount,
    "fetchJsonParsedAccounts",
    ()=>fetchJsonParsedAccounts,
    "parseBase58RpcAccount",
    ()=>parseBase58RpcAccount,
    "parseBase64RpcAccount",
    ()=>parseBase64RpcAccount,
    "parseJsonRpcAccount",
    ()=>parseJsonRpcAccount
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+errors@2.3.0_typescript@5.9.2/node_modules/@solana/errors/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$strings$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$strings$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-strings@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/codecs-strings/dist/index.node.mjs [app-route] (ecmascript)");
;
;
// src/account.ts
var BASE_ACCOUNT_SIZE = 128;
function decodeAccount(encodedAccount, decoder) {
    try {
        if ("exists" in encodedAccount && !encodedAccount.exists) {
            return encodedAccount;
        }
        return Object.freeze({
            ...encodedAccount,
            data: decoder.decode(encodedAccount.data)
        });
    } catch  {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ACCOUNTS__FAILED_TO_DECODE_ACCOUNT"], {
            address: encodedAccount.address
        });
    }
}
function accountExists(account) {
    return !("exists" in account) || "exists" in account && account.exists;
}
function assertAccountDecoded(account) {
    if (accountExists(account) && account.data instanceof Uint8Array) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ACCOUNTS__EXPECTED_DECODED_ACCOUNT"], {
            address: account.address
        });
    }
}
function assertAccountsDecoded(accounts) {
    const encoded = accounts.filter((a)=>accountExists(a) && a.data instanceof Uint8Array);
    if (encoded.length > 0) {
        const encodedAddresses = encoded.map((a)=>a.address);
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ACCOUNTS__EXPECTED_ALL_ACCOUNTS_TO_BE_DECODED"], {
            addresses: encodedAddresses
        });
    }
}
function parseBase64RpcAccount(address, rpcAccount) {
    if (!rpcAccount) return Object.freeze({
        address,
        exists: false
    });
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$strings$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$strings$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBase64Encoder"])().encode(rpcAccount.data[0]);
    return Object.freeze({
        ...parseBaseAccount(rpcAccount),
        address,
        data,
        exists: true
    });
}
function parseBase58RpcAccount(address, rpcAccount) {
    if (!rpcAccount) return Object.freeze({
        address,
        exists: false
    });
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$strings$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$strings$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBase58Encoder"])().encode(typeof rpcAccount.data === "string" ? rpcAccount.data : rpcAccount.data[0]);
    return Object.freeze({
        ...parseBaseAccount(rpcAccount),
        address,
        data,
        exists: true
    });
}
function parseJsonRpcAccount(address, rpcAccount) {
    if (!rpcAccount) return Object.freeze({
        address,
        exists: false
    });
    const data = rpcAccount.data.parsed.info;
    return Object.freeze({
        ...parseBaseAccount(rpcAccount),
        address,
        data,
        exists: true
    });
}
function parseBaseAccount(rpcAccount) {
    return Object.freeze({
        executable: rpcAccount.executable,
        lamports: rpcAccount.lamports,
        programAddress: rpcAccount.owner,
        space: rpcAccount.space
    });
}
// src/fetch-account.ts
async function fetchEncodedAccount(rpc, address, config = {}) {
    const { abortSignal, ...rpcConfig } = config;
    const response = await rpc.getAccountInfo(address, {
        ...rpcConfig,
        encoding: "base64"
    }).send({
        abortSignal
    });
    return parseBase64RpcAccount(address, response.value);
}
async function fetchJsonParsedAccount(rpc, address, config = {}) {
    const { abortSignal, ...rpcConfig } = config;
    const { value: account } = await rpc.getAccountInfo(address, {
        ...rpcConfig,
        encoding: "jsonParsed"
    }).send({
        abortSignal
    });
    return !!account && typeof account === "object" && "parsed" in account.data ? parseJsonRpcAccount(address, account) : parseBase64RpcAccount(address, account);
}
async function fetchEncodedAccounts(rpc, addresses, config = {}) {
    const { abortSignal, ...rpcConfig } = config;
    const response = await rpc.getMultipleAccounts(addresses, {
        ...rpcConfig,
        encoding: "base64"
    }).send({
        abortSignal
    });
    return response.value.map((account, index)=>parseBase64RpcAccount(addresses[index], account));
}
async function fetchJsonParsedAccounts(rpc, addresses, config = {}) {
    const { abortSignal, ...rpcConfig } = config;
    const response = await rpc.getMultipleAccounts(addresses, {
        ...rpcConfig,
        encoding: "jsonParsed"
    }).send({
        abortSignal
    });
    return response.value.map((account, index)=>{
        return !!account && typeof account === "object" && "parsed" in account.data ? parseJsonRpcAccount(addresses[index], account) : parseBase64RpcAccount(addresses[index], account);
    });
}
function assertAccountExists(account) {
    if (!account.exists) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ACCOUNTS__ACCOUNT_NOT_FOUND"], {
            address: account.address
        });
    }
}
function assertAccountsExist(accounts) {
    const missingAccounts = accounts.filter((a)=>!a.exists);
    if (missingAccounts.length > 0) {
        const missingAddresses = missingAccounts.map((a)=>a.address);
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ACCOUNTS__ONE_OR_MORE_ACCOUNTS_NOT_FOUND"], {
            addresses: missingAddresses
        });
    }
}
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+accounts@5.0.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/accounts/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BASE_ACCOUNT_SIZE",
    ()=>BASE_ACCOUNT_SIZE,
    "assertAccountDecoded",
    ()=>assertAccountDecoded,
    "assertAccountExists",
    ()=>assertAccountExists,
    "assertAccountsDecoded",
    ()=>assertAccountsDecoded,
    "assertAccountsExist",
    ()=>assertAccountsExist,
    "decodeAccount",
    ()=>decodeAccount,
    "fetchEncodedAccount",
    ()=>fetchEncodedAccount,
    "fetchEncodedAccounts",
    ()=>fetchEncodedAccounts,
    "fetchJsonParsedAccount",
    ()=>fetchJsonParsedAccount,
    "fetchJsonParsedAccounts",
    ()=>fetchJsonParsedAccounts,
    "parseBase58RpcAccount",
    ()=>parseBase58RpcAccount,
    "parseBase64RpcAccount",
    ()=>parseBase64RpcAccount,
    "parseJsonRpcAccount",
    ()=>parseJsonRpcAccount
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+errors@5.0.0_typescript@5.9.2/node_modules/@solana/errors/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$strings$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$strings$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-strings@5.0.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/codecs-strings/dist/index.node.mjs [app-route] (ecmascript)");
;
;
// src/account.ts
var BASE_ACCOUNT_SIZE = 128;
function decodeAccount(encodedAccount, decoder) {
    try {
        if ("exists" in encodedAccount && !encodedAccount.exists) {
            return encodedAccount;
        }
        return Object.freeze({
            ...encodedAccount,
            data: decoder.decode(encodedAccount.data)
        });
    } catch  {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ACCOUNTS__FAILED_TO_DECODE_ACCOUNT"], {
            address: encodedAccount.address
        });
    }
}
function accountExists(account) {
    return !("exists" in account) || "exists" in account && account.exists;
}
function assertAccountDecoded(account) {
    if (accountExists(account) && account.data instanceof Uint8Array) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ACCOUNTS__EXPECTED_DECODED_ACCOUNT"], {
            address: account.address
        });
    }
}
function assertAccountsDecoded(accounts) {
    const encoded = accounts.filter((a)=>accountExists(a) && a.data instanceof Uint8Array);
    if (encoded.length > 0) {
        const encodedAddresses = encoded.map((a)=>a.address);
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ACCOUNTS__EXPECTED_ALL_ACCOUNTS_TO_BE_DECODED"], {
            addresses: encodedAddresses
        });
    }
}
function parseBase64RpcAccount(address, rpcAccount) {
    if (!rpcAccount) return Object.freeze({
        address,
        exists: false
    });
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$strings$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$strings$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBase64Encoder"])().encode(rpcAccount.data[0]);
    return Object.freeze({
        ...parseBaseAccount(rpcAccount),
        address,
        data,
        exists: true
    });
}
function parseBase58RpcAccount(address, rpcAccount) {
    if (!rpcAccount) return Object.freeze({
        address,
        exists: false
    });
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$strings$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$strings$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBase58Encoder"])().encode(typeof rpcAccount.data === "string" ? rpcAccount.data : rpcAccount.data[0]);
    return Object.freeze({
        ...parseBaseAccount(rpcAccount),
        address,
        data,
        exists: true
    });
}
function parseJsonRpcAccount(address, rpcAccount) {
    if (!rpcAccount) return Object.freeze({
        address,
        exists: false
    });
    const data = rpcAccount.data.parsed.info;
    return Object.freeze({
        ...parseBaseAccount(rpcAccount),
        address,
        data,
        exists: true
    });
}
function parseBaseAccount(rpcAccount) {
    return Object.freeze({
        executable: rpcAccount.executable,
        lamports: rpcAccount.lamports,
        programAddress: rpcAccount.owner,
        space: rpcAccount.space
    });
}
// src/fetch-account.ts
async function fetchEncodedAccount(rpc, address, config = {}) {
    const { abortSignal, ...rpcConfig } = config;
    const response = await rpc.getAccountInfo(address, {
        ...rpcConfig,
        encoding: "base64"
    }).send({
        abortSignal
    });
    return parseBase64RpcAccount(address, response.value);
}
async function fetchJsonParsedAccount(rpc, address, config = {}) {
    const { abortSignal, ...rpcConfig } = config;
    const { value: account } = await rpc.getAccountInfo(address, {
        ...rpcConfig,
        encoding: "jsonParsed"
    }).send({
        abortSignal
    });
    return !!account && typeof account === "object" && "parsed" in account.data ? parseJsonRpcAccount(address, account) : parseBase64RpcAccount(address, account);
}
async function fetchEncodedAccounts(rpc, addresses, config = {}) {
    const { abortSignal, ...rpcConfig } = config;
    const response = await rpc.getMultipleAccounts(addresses, {
        ...rpcConfig,
        encoding: "base64"
    }).send({
        abortSignal
    });
    return response.value.map((account, index)=>parseBase64RpcAccount(addresses[index], account));
}
async function fetchJsonParsedAccounts(rpc, addresses, config = {}) {
    const { abortSignal, ...rpcConfig } = config;
    const response = await rpc.getMultipleAccounts(addresses, {
        ...rpcConfig,
        encoding: "jsonParsed"
    }).send({
        abortSignal
    });
    return response.value.map((account, index)=>{
        return !!account && typeof account === "object" && "parsed" in account.data ? parseJsonRpcAccount(addresses[index], account) : parseBase64RpcAccount(addresses[index], account);
    });
}
function assertAccountExists(account) {
    if (!account.exists) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ACCOUNTS__ACCOUNT_NOT_FOUND"], {
            address: account.address
        });
    }
}
function assertAccountsExist(accounts) {
    const missingAccounts = accounts.filter((a)=>!a.exists);
    if (missingAccounts.length > 0) {
        const missingAddresses = missingAccounts.map((a)=>a.address);
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__ACCOUNTS__ONE_OR_MORE_ACCOUNTS_NOT_FOUND"], {
            addresses: missingAddresses
        });
    }
}
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+programs@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/programs/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isProgramError",
    ()=>isProgramError
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+errors@2.3.0_typescript@5.9.2/node_modules/@solana/errors/dist/index.node.mjs [app-route] (ecmascript)");
;
// src/program-error.ts
function isProgramError(error, transactionMessage, programAddress, code) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSolanaError"])(error, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM"])) {
        return false;
    }
    const instructionProgramAddress = transactionMessage.instructions[error.context.index]?.programAddress;
    if (!instructionProgramAddress || instructionProgramAddress !== programAddress) {
        return false;
    }
    return typeof code === "undefined" || error.context.code === code;
}
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+signers@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/signers/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addSignersToInstruction",
    ()=>addSignersToInstruction,
    "addSignersToTransactionMessage",
    ()=>addSignersToTransactionMessage,
    "assertIsKeyPairSigner",
    ()=>assertIsKeyPairSigner,
    "assertIsMessageModifyingSigner",
    ()=>assertIsMessageModifyingSigner,
    "assertIsMessagePartialSigner",
    ()=>assertIsMessagePartialSigner,
    "assertIsMessageSigner",
    ()=>assertIsMessageSigner,
    "assertIsTransactionMessageWithSingleSendingSigner",
    ()=>assertIsTransactionMessageWithSingleSendingSigner,
    "assertIsTransactionModifyingSigner",
    ()=>assertIsTransactionModifyingSigner,
    "assertIsTransactionPartialSigner",
    ()=>assertIsTransactionPartialSigner,
    "assertIsTransactionSendingSigner",
    ()=>assertIsTransactionSendingSigner,
    "assertIsTransactionSigner",
    ()=>assertIsTransactionSigner,
    "createKeyPairSignerFromBytes",
    ()=>createKeyPairSignerFromBytes,
    "createKeyPairSignerFromPrivateKeyBytes",
    ()=>createKeyPairSignerFromPrivateKeyBytes,
    "createNoopSigner",
    ()=>createNoopSigner,
    "createSignableMessage",
    ()=>createSignableMessage,
    "createSignerFromKeyPair",
    ()=>createSignerFromKeyPair,
    "generateKeyPairSigner",
    ()=>generateKeyPairSigner,
    "getSignersFromInstruction",
    ()=>getSignersFromInstruction,
    "getSignersFromTransactionMessage",
    ()=>getSignersFromTransactionMessage,
    "isKeyPairSigner",
    ()=>isKeyPairSigner,
    "isMessageModifyingSigner",
    ()=>isMessageModifyingSigner,
    "isMessagePartialSigner",
    ()=>isMessagePartialSigner,
    "isMessageSigner",
    ()=>isMessageSigner,
    "isTransactionMessageWithSingleSendingSigner",
    ()=>isTransactionMessageWithSingleSendingSigner,
    "isTransactionModifyingSigner",
    ()=>isTransactionModifyingSigner,
    "isTransactionPartialSigner",
    ()=>isTransactionPartialSigner,
    "isTransactionSendingSigner",
    ()=>isTransactionSendingSigner,
    "isTransactionSigner",
    ()=>isTransactionSigner,
    "partiallySignTransactionMessageWithSigners",
    ()=>partiallySignTransactionMessageWithSigners,
    "setTransactionMessageFeePayerSigner",
    ()=>setTransactionMessageFeePayerSigner,
    "signAndSendTransactionMessageWithSigners",
    ()=>signAndSendTransactionMessageWithSigners,
    "signTransactionMessageWithSigners",
    ()=>signTransactionMessageWithSigners
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+errors@2.3.0_typescript@5.9.2/node_modules/@solana/errors/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+instructions@2.3.0_typescript@5.9.2/node_modules/@solana/instructions/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$addresses$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+addresses@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/addresses/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$keys$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$keys$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+keys@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/keys/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$transactions$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$transactions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+transactions@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/transactions/dist/index.node.mjs [app-route] (ecmascript)");
;
;
;
;
;
// src/deduplicate-signers.ts
function deduplicateSigners(signers) {
    const deduplicated = {};
    signers.forEach((signer)=>{
        if (!deduplicated[signer.address]) {
            deduplicated[signer.address] = signer;
        } else if (deduplicated[signer.address] !== signer) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__SIGNER__ADDRESS_CANNOT_HAVE_MULTIPLE_SIGNERS"], {
                address: signer.address
            });
        }
    });
    return Object.values(deduplicated);
}
function isTransactionModifyingSigner(value) {
    return "modifyAndSignTransactions" in value && typeof value.modifyAndSignTransactions === "function";
}
function assertIsTransactionModifyingSigner(value) {
    if (!isTransactionModifyingSigner(value)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__SIGNER__EXPECTED_TRANSACTION_MODIFYING_SIGNER"], {
            address: value.address
        });
    }
}
function isTransactionPartialSigner(value) {
    return "signTransactions" in value && typeof value.signTransactions === "function";
}
function assertIsTransactionPartialSigner(value) {
    if (!isTransactionPartialSigner(value)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__SIGNER__EXPECTED_TRANSACTION_PARTIAL_SIGNER"], {
            address: value.address
        });
    }
}
function isTransactionSendingSigner(value) {
    return "signAndSendTransactions" in value && typeof value.signAndSendTransactions === "function";
}
function assertIsTransactionSendingSigner(value) {
    if (!isTransactionSendingSigner(value)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__SIGNER__EXPECTED_TRANSACTION_SENDING_SIGNER"], {
            address: value.address
        });
    }
}
// src/transaction-signer.ts
function isTransactionSigner(value) {
    return isTransactionPartialSigner(value) || isTransactionModifyingSigner(value) || isTransactionSendingSigner(value);
}
function assertIsTransactionSigner(value) {
    if (!isTransactionSigner(value)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__SIGNER__EXPECTED_TRANSACTION_SIGNER"], {
            address: value.address
        });
    }
}
// src/account-signer-meta.ts
function getSignersFromInstruction(instruction) {
    return deduplicateSigners((instruction.accounts ?? []).flatMap((account)=>"signer" in account ? account.signer : []));
}
function getSignersFromTransactionMessage(transaction) {
    return deduplicateSigners([
        ...transaction.feePayer && isTransactionSigner(transaction.feePayer) ? [
            transaction.feePayer
        ] : [],
        ...transaction.instructions.flatMap(getSignersFromInstruction)
    ]);
}
function addSignersToInstruction(signers, instruction) {
    if (!instruction.accounts || instruction.accounts.length === 0) {
        return instruction;
    }
    const signerByAddress = new Map(deduplicateSigners(signers).map((signer)=>[
            signer.address,
            signer
        ]));
    return Object.freeze({
        ...instruction,
        accounts: instruction.accounts.map((account)=>{
            const signer = signerByAddress.get(account.address);
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$instructions$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSignerRole"])(account.role) || "signer" in account || !signer) {
                return account;
            }
            return Object.freeze({
                ...account,
                signer
            });
        })
    });
}
function addSignersToTransactionMessage(signers, transactionMessage) {
    const feePayerSigner = hasAddressOnlyFeePayer(transactionMessage) ? signers.find((signer)=>signer.address === transactionMessage.feePayer.address) : void 0;
    if (!feePayerSigner && transactionMessage.instructions.length === 0) {
        return transactionMessage;
    }
    return Object.freeze({
        ...transactionMessage,
        ...feePayerSigner ? {
            feePayer: feePayerSigner
        } : null,
        instructions: transactionMessage.instructions.map((instruction)=>addSignersToInstruction(signers, instruction))
    });
}
function hasAddressOnlyFeePayer(message) {
    return !!message && "feePayer" in message && !!message.feePayer && typeof message.feePayer.address === "string" && !isTransactionSigner(message.feePayer);
}
// src/fee-payer-signer.ts
function setTransactionMessageFeePayerSigner(feePayer, transactionMessage) {
    Object.freeze(feePayer);
    const out = {
        ...transactionMessage,
        feePayer
    };
    Object.freeze(out);
    return out;
}
function isMessagePartialSigner(value) {
    return "signMessages" in value && typeof value.signMessages === "function";
}
function assertIsMessagePartialSigner(value) {
    if (!isMessagePartialSigner(value)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__SIGNER__EXPECTED_MESSAGE_PARTIAL_SIGNER"], {
            address: value.address
        });
    }
}
// src/keypair-signer.ts
function isKeyPairSigner(value) {
    return "keyPair" in value && typeof value.keyPair === "object" && isMessagePartialSigner(value) && isTransactionPartialSigner(value);
}
function assertIsKeyPairSigner(value) {
    if (!isKeyPairSigner(value)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__SIGNER__EXPECTED_KEY_PAIR_SIGNER"], {
            address: value.address
        });
    }
}
async function createSignerFromKeyPair(keyPair) {
    const address = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$addresses$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAddressFromPublicKey"])(keyPair.publicKey);
    const out = {
        address,
        keyPair,
        signMessages: (messages)=>Promise.all(messages.map(async (message)=>Object.freeze({
                    [address]: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$keys$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$keys$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["signBytes"])(keyPair.privateKey, message.content)
                }))),
        signTransactions: (transactions)=>Promise.all(transactions.map(async (transaction)=>{
                const signedTransaction = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$transactions$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$transactions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["partiallySignTransaction"])([
                    keyPair
                ], transaction);
                return Object.freeze({
                    [address]: signedTransaction.signatures[address]
                });
            }))
    };
    return Object.freeze(out);
}
async function generateKeyPairSigner() {
    return await createSignerFromKeyPair(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$keys$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$keys$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateKeyPair"])());
}
async function createKeyPairSignerFromBytes(bytes, extractable) {
    return await createSignerFromKeyPair(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$keys$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$keys$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createKeyPairFromBytes"])(bytes, extractable));
}
async function createKeyPairSignerFromPrivateKeyBytes(bytes, extractable) {
    return await createSignerFromKeyPair(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$keys$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$keys$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createKeyPairFromPrivateKeyBytes"])(bytes, extractable));
}
function isMessageModifyingSigner(value) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$addresses$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAddress"])(value.address) && "modifyAndSignMessages" in value && typeof value.modifyAndSignMessages === "function";
}
function assertIsMessageModifyingSigner(value) {
    if (!isMessageModifyingSigner(value)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__SIGNER__EXPECTED_MESSAGE_MODIFYING_SIGNER"], {
            address: value.address
        });
    }
}
function isMessageSigner(value) {
    return isMessagePartialSigner(value) || isMessageModifyingSigner(value);
}
function assertIsMessageSigner(value) {
    if (!isMessageSigner(value)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__SIGNER__EXPECTED_MESSAGE_SIGNER"], {
            address: value.address
        });
    }
}
// src/noop-signer.ts
function createNoopSigner(address) {
    const out = {
        address,
        signMessages: (messages)=>Promise.resolve(messages.map(()=>Object.freeze({}))),
        signTransactions: (transactions)=>Promise.resolve(transactions.map(()=>Object.freeze({})))
    };
    return Object.freeze(out);
}
function isTransactionMessageWithSingleSendingSigner(transaction) {
    try {
        assertIsTransactionMessageWithSingleSendingSigner(transaction);
        return true;
    } catch  {
        return false;
    }
}
function assertIsTransactionMessageWithSingleSendingSigner(transaction) {
    const signers = getSignersFromTransactionMessage(transaction);
    const sendingSigners = signers.filter(isTransactionSendingSigner);
    if (sendingSigners.length === 0) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__SIGNER__TRANSACTION_SENDING_SIGNER_MISSING"]);
    }
    const sendingOnlySigners = sendingSigners.filter((signer)=>!isTransactionPartialSigner(signer) && !isTransactionModifyingSigner(signer));
    if (sendingOnlySigners.length > 1) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__SIGNER__TRANSACTION_CANNOT_HAVE_MULTIPLE_SENDING_SIGNERS"]);
    }
}
// src/sign-transaction.ts
async function partiallySignTransactionMessageWithSigners(transactionMessage, config) {
    const { partialSigners, modifyingSigners } = categorizeTransactionSigners(deduplicateSigners(getSignersFromTransactionMessage(transactionMessage).filter(isTransactionSigner)), {
        identifySendingSigner: false
    });
    return await signModifyingAndPartialTransactionSigners(transactionMessage, modifyingSigners, partialSigners, config);
}
async function signTransactionMessageWithSigners(transactionMessage, config) {
    const signedTransaction = await partiallySignTransactionMessageWithSigners(transactionMessage, config);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$transactions$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$transactions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertIsFullySignedTransaction"])(signedTransaction);
    return signedTransaction;
}
async function signAndSendTransactionMessageWithSigners(transaction, config) {
    assertIsTransactionMessageWithSingleSendingSigner(transaction);
    const abortSignal = config?.abortSignal;
    const { partialSigners, modifyingSigners, sendingSigner } = categorizeTransactionSigners(deduplicateSigners(getSignersFromTransactionMessage(transaction).filter(isTransactionSigner)));
    abortSignal?.throwIfAborted();
    const signedTransaction = await signModifyingAndPartialTransactionSigners(transaction, modifyingSigners, partialSigners, config);
    if (!sendingSigner) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$2$2e$3$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__SIGNER__TRANSACTION_SENDING_SIGNER_MISSING"]);
    }
    abortSignal?.throwIfAborted();
    const [signature] = await sendingSigner.signAndSendTransactions([
        signedTransaction
    ], config);
    abortSignal?.throwIfAborted();
    return signature;
}
function categorizeTransactionSigners(signers, config = {}) {
    const identifySendingSigner = config.identifySendingSigner ?? true;
    const sendingSigner = identifySendingSigner ? identifyTransactionSendingSigner(signers) : null;
    const otherSigners = signers.filter((signer)=>signer !== sendingSigner && (isTransactionModifyingSigner(signer) || isTransactionPartialSigner(signer)));
    const modifyingSigners = identifyTransactionModifyingSigners(otherSigners);
    const partialSigners = otherSigners.filter(isTransactionPartialSigner).filter((signer)=>!modifyingSigners.includes(signer));
    return Object.freeze({
        modifyingSigners,
        partialSigners,
        sendingSigner
    });
}
function identifyTransactionSendingSigner(signers) {
    const sendingSigners = signers.filter(isTransactionSendingSigner);
    if (sendingSigners.length === 0) return null;
    const sendingOnlySigners = sendingSigners.filter((signer)=>!isTransactionModifyingSigner(signer) && !isTransactionPartialSigner(signer));
    if (sendingOnlySigners.length > 0) {
        return sendingOnlySigners[0];
    }
    return sendingSigners[0];
}
function identifyTransactionModifyingSigners(signers) {
    const modifyingSigners = signers.filter(isTransactionModifyingSigner);
    if (modifyingSigners.length === 0) return [];
    const nonPartialSigners = modifyingSigners.filter((signer)=>!isTransactionPartialSigner(signer));
    if (nonPartialSigners.length > 0) return nonPartialSigners;
    return [
        modifyingSigners[0]
    ];
}
async function signModifyingAndPartialTransactionSigners(transactionMessage, modifyingSigners = [], partialSigners = [], config) {
    const transaction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$transactions$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$transactions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["compileTransaction"])(transactionMessage);
    const modifiedTransaction = await modifyingSigners.reduce(async (transaction2, modifyingSigner)=>{
        config?.abortSignal?.throwIfAborted();
        const [tx] = await modifyingSigner.modifyAndSignTransactions([
            await transaction2
        ], config);
        return Object.freeze(tx);
    }, Promise.resolve(transaction));
    config?.abortSignal?.throwIfAborted();
    const signatureDictionaries = await Promise.all(partialSigners.map(async (partialSigner)=>{
        const [signatures] = await partialSigner.signTransactions([
            modifiedTransaction
        ], config);
        return signatures;
    }));
    return Object.freeze({
        ...modifiedTransaction,
        signatures: Object.freeze(signatureDictionaries.reduce((signatures, signatureDictionary)=>{
            return {
                ...signatures,
                ...signatureDictionary
            };
        }, modifiedTransaction.signatures ?? {}))
    });
}
var o = globalThis.TextEncoder;
// src/signable-message.ts
function createSignableMessage(content, signatures = {}) {
    return Object.freeze({
        content: typeof content === "string" ? new o().encode(content) : content,
        signatures: Object.freeze({
            ...signatures
        })
    });
}
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/examples/typescript/node_modules/.pnpm/@solana+sysvars@5.0.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/sysvars/dist/index.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SYSVAR_CLOCK_ADDRESS",
    ()=>SYSVAR_CLOCK_ADDRESS,
    "SYSVAR_EPOCH_REWARDS_ADDRESS",
    ()=>SYSVAR_EPOCH_REWARDS_ADDRESS,
    "SYSVAR_EPOCH_SCHEDULE_ADDRESS",
    ()=>SYSVAR_EPOCH_SCHEDULE_ADDRESS,
    "SYSVAR_INSTRUCTIONS_ADDRESS",
    ()=>SYSVAR_INSTRUCTIONS_ADDRESS,
    "SYSVAR_LAST_RESTART_SLOT_ADDRESS",
    ()=>SYSVAR_LAST_RESTART_SLOT_ADDRESS,
    "SYSVAR_RECENT_BLOCKHASHES_ADDRESS",
    ()=>SYSVAR_RECENT_BLOCKHASHES_ADDRESS,
    "SYSVAR_RENT_ADDRESS",
    ()=>SYSVAR_RENT_ADDRESS,
    "SYSVAR_SLOT_HASHES_ADDRESS",
    ()=>SYSVAR_SLOT_HASHES_ADDRESS,
    "SYSVAR_SLOT_HISTORY_ADDRESS",
    ()=>SYSVAR_SLOT_HISTORY_ADDRESS,
    "SYSVAR_STAKE_HISTORY_ADDRESS",
    ()=>SYSVAR_STAKE_HISTORY_ADDRESS,
    "fetchEncodedSysvarAccount",
    ()=>fetchEncodedSysvarAccount,
    "fetchJsonParsedSysvarAccount",
    ()=>fetchJsonParsedSysvarAccount,
    "fetchSysvarClock",
    ()=>fetchSysvarClock,
    "fetchSysvarEpochRewards",
    ()=>fetchSysvarEpochRewards,
    "fetchSysvarEpochSchedule",
    ()=>fetchSysvarEpochSchedule,
    "fetchSysvarLastRestartSlot",
    ()=>fetchSysvarLastRestartSlot,
    "fetchSysvarRecentBlockhashes",
    ()=>fetchSysvarRecentBlockhashes,
    "fetchSysvarRent",
    ()=>fetchSysvarRent,
    "fetchSysvarSlotHashes",
    ()=>fetchSysvarSlotHashes,
    "fetchSysvarSlotHistory",
    ()=>fetchSysvarSlotHistory,
    "fetchSysvarStakeHistory",
    ()=>fetchSysvarStakeHistory,
    "getSysvarClockCodec",
    ()=>getSysvarClockCodec,
    "getSysvarClockDecoder",
    ()=>getSysvarClockDecoder,
    "getSysvarClockEncoder",
    ()=>getSysvarClockEncoder,
    "getSysvarEpochRewardsCodec",
    ()=>getSysvarEpochRewardsCodec,
    "getSysvarEpochRewardsDecoder",
    ()=>getSysvarEpochRewardsDecoder,
    "getSysvarEpochRewardsEncoder",
    ()=>getSysvarEpochRewardsEncoder,
    "getSysvarEpochScheduleCodec",
    ()=>getSysvarEpochScheduleCodec,
    "getSysvarEpochScheduleDecoder",
    ()=>getSysvarEpochScheduleDecoder,
    "getSysvarEpochScheduleEncoder",
    ()=>getSysvarEpochScheduleEncoder,
    "getSysvarLastRestartSlotCodec",
    ()=>getSysvarLastRestartSlotCodec,
    "getSysvarLastRestartSlotDecoder",
    ()=>getSysvarLastRestartSlotDecoder,
    "getSysvarLastRestartSlotEncoder",
    ()=>getSysvarLastRestartSlotEncoder,
    "getSysvarRecentBlockhashesCodec",
    ()=>getSysvarRecentBlockhashesCodec,
    "getSysvarRecentBlockhashesDecoder",
    ()=>getSysvarRecentBlockhashesDecoder,
    "getSysvarRecentBlockhashesEncoder",
    ()=>getSysvarRecentBlockhashesEncoder,
    "getSysvarRentCodec",
    ()=>getSysvarRentCodec,
    "getSysvarRentDecoder",
    ()=>getSysvarRentDecoder,
    "getSysvarRentEncoder",
    ()=>getSysvarRentEncoder,
    "getSysvarSlotHashesCodec",
    ()=>getSysvarSlotHashesCodec,
    "getSysvarSlotHashesDecoder",
    ()=>getSysvarSlotHashesDecoder,
    "getSysvarSlotHashesEncoder",
    ()=>getSysvarSlotHashesEncoder,
    "getSysvarSlotHistoryCodec",
    ()=>getSysvarSlotHistoryCodec,
    "getSysvarSlotHistoryDecoder",
    ()=>getSysvarSlotHistoryDecoder,
    "getSysvarSlotHistoryEncoder",
    ()=>getSysvarSlotHistoryEncoder,
    "getSysvarStakeHistoryCodec",
    ()=>getSysvarStakeHistoryCodec,
    "getSysvarStakeHistoryDecoder",
    ()=>getSysvarStakeHistoryDecoder,
    "getSysvarStakeHistoryEncoder",
    ()=>getSysvarStakeHistoryEncoder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$accounts$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+accounts@5.0.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/accounts/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-data-structures@5.0.0_typescript@5.9.2/node_modules/@solana/codecs-data-structures/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-numbers@5.0.0_typescript@5.9.2/node_modules/@solana/codecs-numbers/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-core@5.0.0_typescript@5.9.2/node_modules/@solana/codecs-core/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$types$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+rpc-types@5.0.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/rpc-types/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+errors@5.0.0_typescript@5.9.2/node_modules/@solana/errors/dist/index.node.mjs [app-route] (ecmascript)");
;
;
;
;
// src/clock.ts
var SYSVAR_CLOCK_ADDRESS = "SysvarC1ock11111111111111111111111111111111";
var SYSVAR_EPOCH_REWARDS_ADDRESS = "SysvarEpochRewards1111111111111111111111111";
var SYSVAR_EPOCH_SCHEDULE_ADDRESS = "SysvarEpochSchedu1e111111111111111111111111";
var SYSVAR_INSTRUCTIONS_ADDRESS = "Sysvar1nstructions1111111111111111111111111";
var SYSVAR_LAST_RESTART_SLOT_ADDRESS = "SysvarLastRestartS1ot1111111111111111111111";
var SYSVAR_RECENT_BLOCKHASHES_ADDRESS = "SysvarRecentB1ockHashes11111111111111111111";
var SYSVAR_RENT_ADDRESS = "SysvarRent111111111111111111111111111111111";
var SYSVAR_SLOT_HASHES_ADDRESS = "SysvarS1otHashes111111111111111111111111111";
var SYSVAR_SLOT_HISTORY_ADDRESS = "SysvarS1otHistory11111111111111111111111111";
var SYSVAR_STAKE_HISTORY_ADDRESS = "SysvarStakeHistory1111111111111111111111111";
async function fetchEncodedSysvarAccount(rpc, address, config) {
    return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$accounts$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchEncodedAccount"])(rpc, address, config);
}
async function fetchJsonParsedSysvarAccount(rpc, address, config) {
    return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$accounts$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchJsonParsedAccount"])(rpc, address, config);
}
// src/clock.ts
function getSysvarClockEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructEncoder"])([
        [
            "slot",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Encoder"])()
        ],
        [
            "epochStartTimestamp",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getI64Encoder"])()
        ],
        [
            "epoch",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Encoder"])()
        ],
        [
            "leaderScheduleEpoch",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Encoder"])()
        ],
        [
            "unixTimestamp",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getI64Encoder"])()
        ]
    ]);
}
function getSysvarClockDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructDecoder"])([
        [
            "slot",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Decoder"])()
        ],
        [
            "epochStartTimestamp",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getI64Decoder"])()
        ],
        [
            "epoch",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Decoder"])()
        ],
        [
            "leaderScheduleEpoch",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Decoder"])()
        ],
        [
            "unixTimestamp",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getI64Decoder"])()
        ]
    ]);
}
function getSysvarClockCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getSysvarClockEncoder(), getSysvarClockDecoder());
}
async function fetchSysvarClock(rpc, config) {
    const account = await fetchEncodedSysvarAccount(rpc, SYSVAR_CLOCK_ADDRESS, config);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$accounts$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertAccountExists"])(account);
    const decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$accounts$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decodeAccount"])(account, getSysvarClockDecoder());
    return decoded.data;
}
function getSysvarEpochRewardsEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructEncoder"])([
        [
            "distributionStartingBlockHeight",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Encoder"])()
        ],
        [
            "numPartitions",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Encoder"])()
        ],
        [
            "parentBlockhash",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$types$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBlockhashEncoder"])()
        ],
        [
            "totalPoints",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU128Encoder"])()
        ],
        [
            "totalRewards",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$types$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDefaultLamportsEncoder"])()
        ],
        [
            "distributedRewards",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$types$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDefaultLamportsEncoder"])()
        ],
        [
            "active",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBooleanEncoder"])()
        ]
    ]);
}
function getSysvarEpochRewardsDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructDecoder"])([
        [
            "distributionStartingBlockHeight",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Decoder"])()
        ],
        [
            "numPartitions",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Decoder"])()
        ],
        [
            "parentBlockhash",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$types$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBlockhashDecoder"])()
        ],
        [
            "totalPoints",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU128Decoder"])()
        ],
        [
            "totalRewards",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$types$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDefaultLamportsDecoder"])()
        ],
        [
            "distributedRewards",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$types$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDefaultLamportsDecoder"])()
        ],
        [
            "active",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBooleanDecoder"])()
        ]
    ]);
}
function getSysvarEpochRewardsCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getSysvarEpochRewardsEncoder(), getSysvarEpochRewardsDecoder());
}
async function fetchSysvarEpochRewards(rpc, config) {
    const account = await fetchEncodedSysvarAccount(rpc, SYSVAR_EPOCH_REWARDS_ADDRESS, config);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$accounts$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertAccountExists"])(account);
    const decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$accounts$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decodeAccount"])(account, getSysvarEpochRewardsDecoder());
    return decoded.data;
}
function getSysvarEpochScheduleEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructEncoder"])([
        [
            "slotsPerEpoch",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Encoder"])()
        ],
        [
            "leaderScheduleSlotOffset",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Encoder"])()
        ],
        [
            "warmup",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBooleanEncoder"])()
        ],
        [
            "firstNormalEpoch",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Encoder"])()
        ],
        [
            "firstNormalSlot",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Encoder"])()
        ]
    ]);
}
function getSysvarEpochScheduleDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructDecoder"])([
        [
            "slotsPerEpoch",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Decoder"])()
        ],
        [
            "leaderScheduleSlotOffset",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Decoder"])()
        ],
        [
            "warmup",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBooleanDecoder"])()
        ],
        [
            "firstNormalEpoch",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Decoder"])()
        ],
        [
            "firstNormalSlot",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Decoder"])()
        ]
    ]);
}
function getSysvarEpochScheduleCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getSysvarEpochScheduleEncoder(), getSysvarEpochScheduleDecoder());
}
async function fetchSysvarEpochSchedule(rpc, config) {
    const account = await fetchEncodedSysvarAccount(rpc, SYSVAR_EPOCH_SCHEDULE_ADDRESS, config);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$accounts$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertAccountExists"])(account);
    const decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$accounts$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decodeAccount"])(account, getSysvarEpochScheduleDecoder());
    return decoded.data;
}
function getSysvarLastRestartSlotEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructEncoder"])([
        [
            "lastRestartSlot",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Encoder"])()
        ]
    ]);
}
function getSysvarLastRestartSlotDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructDecoder"])([
        [
            "lastRestartSlot",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Decoder"])()
        ]
    ]);
}
function getSysvarLastRestartSlotCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getSysvarLastRestartSlotEncoder(), getSysvarLastRestartSlotDecoder());
}
async function fetchSysvarLastRestartSlot(rpc, config) {
    const account = await fetchEncodedSysvarAccount(rpc, SYSVAR_LAST_RESTART_SLOT_ADDRESS, config);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$accounts$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertAccountExists"])(account);
    const decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$accounts$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decodeAccount"])(account, getSysvarLastRestartSlotDecoder());
    return decoded.data;
}
function getSysvarRecentBlockhashesEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getArrayEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructEncoder"])([
        [
            "blockhash",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$types$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBlockhashEncoder"])()
        ],
        [
            "feeCalculator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructEncoder"])([
                [
                    "lamportsPerSignature",
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$types$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDefaultLamportsEncoder"])()
                ]
            ])
        ]
    ]));
}
function getSysvarRecentBlockhashesDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getArrayDecoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructDecoder"])([
        [
            "blockhash",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$types$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBlockhashDecoder"])()
        ],
        [
            "feeCalculator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructDecoder"])([
                [
                    "lamportsPerSignature",
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$types$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDefaultLamportsDecoder"])()
                ]
            ])
        ]
    ]));
}
function getSysvarRecentBlockhashesCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getSysvarRecentBlockhashesEncoder(), getSysvarRecentBlockhashesDecoder());
}
async function fetchSysvarRecentBlockhashes(rpc, config) {
    const account = await fetchEncodedSysvarAccount(rpc, SYSVAR_RECENT_BLOCKHASHES_ADDRESS, config);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$accounts$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertAccountExists"])(account);
    const decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$accounts$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decodeAccount"])(account, getSysvarRecentBlockhashesDecoder());
    return decoded.data;
}
function getSysvarRentEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructEncoder"])([
        [
            "lamportsPerByteYear",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$types$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDefaultLamportsEncoder"])()
        ],
        [
            "exemptionThreshold",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getF64Encoder"])()
        ],
        [
            "burnPercent",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Encoder"])()
        ]
    ]);
}
function getSysvarRentDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructDecoder"])([
        [
            "lamportsPerByteYear",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$types$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDefaultLamportsDecoder"])()
        ],
        [
            "exemptionThreshold",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getF64Decoder"])()
        ],
        [
            "burnPercent",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU8Decoder"])()
        ]
    ]);
}
function getSysvarRentCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getSysvarRentEncoder(), getSysvarRentDecoder());
}
async function fetchSysvarRent(rpc, config) {
    const account = await fetchEncodedSysvarAccount(rpc, SYSVAR_RENT_ADDRESS, config);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$accounts$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertAccountExists"])(account);
    const decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$accounts$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decodeAccount"])(account, getSysvarRentDecoder());
    return decoded.data;
}
function getSysvarSlotHashesEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getArrayEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructEncoder"])([
        [
            "slot",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Encoder"])()
        ],
        [
            "hash",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$types$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBlockhashEncoder"])()
        ]
    ]));
}
function getSysvarSlotHashesDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getArrayDecoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructDecoder"])([
        [
            "slot",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Decoder"])()
        ],
        [
            "hash",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$types$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBlockhashDecoder"])()
        ]
    ]));
}
function getSysvarSlotHashesCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getSysvarSlotHashesEncoder(), getSysvarSlotHashesDecoder());
}
async function fetchSysvarSlotHashes(rpc, config) {
    const account = await fetchEncodedSysvarAccount(rpc, SYSVAR_SLOT_HASHES_ADDRESS, config);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$accounts$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertAccountExists"])(account);
    const decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$accounts$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decodeAccount"])(account, getSysvarSlotHashesDecoder());
    return decoded.data;
}
var BITVEC_DISCRIMINATOR = 1;
var BITVEC_NUM_BITS = 1024 * 1024;
var BITVEC_LENGTH = BITVEC_NUM_BITS / 64;
var SLOT_HISTORY_ACCOUNT_DATA_STATIC_SIZE = 1 + // Discriminator
8 + // bitvector length (u64)
BITVEC_LENGTH * 8 + 8 + // Number of bits (u64)
8;
var memoizedU64Encoder;
var memoizedU64Decoder;
var memoizedU64ArrayEncoder;
var memoizedU64ArrayDecoder;
function getMemoizedU64Encoder() {
    if (!memoizedU64Encoder) memoizedU64Encoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Encoder"])();
    return memoizedU64Encoder;
}
function getMemoizedU64Decoder() {
    if (!memoizedU64Decoder) memoizedU64Decoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Decoder"])();
    return memoizedU64Decoder;
}
function getMemoizedU64ArrayEncoder() {
    if (!memoizedU64ArrayEncoder) memoizedU64ArrayEncoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getArrayCodec"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Codec"])(), {
        size: BITVEC_LENGTH
    });
    return memoizedU64ArrayEncoder;
}
function getMemoizedU64ArrayDecoder() {
    if (!memoizedU64ArrayDecoder) memoizedU64ArrayDecoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getArrayCodec"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Codec"])(), {
        size: BITVEC_LENGTH
    });
    return memoizedU64ArrayDecoder;
}
function getSysvarSlotHistoryEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEncoder"])({
        fixedSize: SLOT_HISTORY_ACCOUNT_DATA_STATIC_SIZE,
        write: (value, bytes, offset)=>{
            bytes.set([
                BITVEC_DISCRIMINATOR
            ], offset);
            offset += 1;
            getMemoizedU64Encoder().write(BigInt(BITVEC_LENGTH), bytes, offset);
            offset += 8;
            getMemoizedU64ArrayEncoder().write(value.bits, bytes, offset);
            offset += BITVEC_LENGTH * 8;
            getMemoizedU64Encoder().write(BigInt(BITVEC_NUM_BITS), bytes, offset);
            offset += 8;
            getMemoizedU64Encoder().write(value.nextSlot, bytes, offset);
            offset += 8;
            return offset;
        }
    });
}
function getSysvarSlotHistoryDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDecoder"])({
        fixedSize: SLOT_HISTORY_ACCOUNT_DATA_STATIC_SIZE,
        read: (bytes, offset)=>{
            if (bytes.length != SLOT_HISTORY_ACCOUNT_DATA_STATIC_SIZE) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__INVALID_BYTE_LENGTH"], {
                    actual: bytes.length,
                    expected: SLOT_HISTORY_ACCOUNT_DATA_STATIC_SIZE
                });
            }
            const discriminator = bytes[offset];
            offset += 1;
            if (discriminator !== BITVEC_DISCRIMINATOR) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE"], {
                    actual: discriminator,
                    expected: BITVEC_DISCRIMINATOR
                });
            }
            const bitVecLength = getMemoizedU64Decoder().read(bytes, offset)[0];
            offset += 8;
            if (bitVecLength !== BigInt(BITVEC_LENGTH)) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__INVALID_NUMBER_OF_ITEMS"], {
                    actual: bitVecLength,
                    codecDescription: "SysvarSlotHistoryCodec",
                    expected: BITVEC_LENGTH
                });
            }
            const bits = getMemoizedU64ArrayDecoder().read(bytes, offset)[0];
            offset += BITVEC_LENGTH * 8;
            const numBits = getMemoizedU64Decoder().read(bytes, offset)[0];
            offset += 8;
            if (numBits !== BigInt(BITVEC_NUM_BITS)) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$errors$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__INVALID_NUMBER_OF_ITEMS"], {
                    actual: numBits,
                    codecDescription: "SysvarSlotHistoryCodec",
                    expected: BITVEC_NUM_BITS
                });
            }
            const nextSlot = getMemoizedU64Decoder().read(bytes, offset)[0];
            offset += 8;
            return [
                {
                    bits,
                    nextSlot
                },
                offset
            ];
        }
    });
}
function getSysvarSlotHistoryCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getSysvarSlotHistoryEncoder(), getSysvarSlotHistoryDecoder());
}
async function fetchSysvarSlotHistory(rpc, config) {
    const account = await fetchEncodedSysvarAccount(rpc, SYSVAR_SLOT_HISTORY_ADDRESS, config);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$accounts$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertAccountExists"])(account);
    const decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$accounts$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decodeAccount"])(account, getSysvarSlotHistoryDecoder());
    return decoded.data;
}
function getSysvarStakeHistoryEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getArrayEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructEncoder"])([
        [
            "epoch",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Encoder"])()
        ],
        [
            "stakeHistory",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructEncoder"])([
                [
                    "effective",
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$types$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDefaultLamportsEncoder"])()
                ],
                [
                    "activating",
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$types$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDefaultLamportsEncoder"])()
                ],
                [
                    "deactivating",
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$types$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDefaultLamportsEncoder"])()
                ]
            ])
        ]
    ]), {
        size: (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Encoder"])()
    });
}
function getSysvarStakeHistoryDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getArrayDecoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructDecoder"])([
        [
            "epoch",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Decoder"])()
        ],
        [
            "stakeHistory",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$data$2d$structures$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStructDecoder"])([
                [
                    "effective",
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$types$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDefaultLamportsDecoder"])()
                ],
                [
                    "activating",
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$types$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDefaultLamportsDecoder"])()
                ],
                [
                    "deactivating",
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$types$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDefaultLamportsDecoder"])()
                ]
            ])
        ]
    ]), {
        size: (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$numbers$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getU64Decoder"])()
    });
}
function getSysvarStakeHistoryCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$core$40$5$2e$0$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineCodec"])(getSysvarStakeHistoryEncoder(), getSysvarStakeHistoryDecoder());
}
async function fetchSysvarStakeHistory(rpc, config) {
    const account = await fetchEncodedSysvarAccount(rpc, SYSVAR_STAKE_HISTORY_ADDRESS, config);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$accounts$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertAccountExists"])(account);
    const decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$accounts$40$5$2e$0$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decodeAccount"])(account, getSysvarStakeHistoryDecoder());
    return decoded.data;
}
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
];

//# sourceMappingURL=665e3__pnpm_a2950909._.js.map