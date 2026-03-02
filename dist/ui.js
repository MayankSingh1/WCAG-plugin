"use strict";
(() => {
  // node_modules/preact/dist/preact.module.js
  var n;
  var l;
  var u;
  var t;
  var i;
  var r;
  var o;
  var e;
  var f;
  var c;
  var s;
  var a;
  var h;
  var p = {};
  var v = [];
  var y = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
  var d = Array.isArray;
  function w(n2, l3) {
    for (var u4 in l3) n2[u4] = l3[u4];
    return n2;
  }
  function g(n2) {
    n2 && n2.parentNode && n2.parentNode.removeChild(n2);
  }
  function _(l3, u4, t3) {
    var i4, r3, o3, e3 = {};
    for (o3 in u4) "key" == o3 ? i4 = u4[o3] : "ref" == o3 ? r3 = u4[o3] : e3[o3] = u4[o3];
    if (arguments.length > 2 && (e3.children = arguments.length > 3 ? n.call(arguments, 2) : t3), "function" == typeof l3 && null != l3.defaultProps) for (o3 in l3.defaultProps) void 0 === e3[o3] && (e3[o3] = l3.defaultProps[o3]);
    return m(l3, e3, i4, r3, null);
  }
  function m(n2, t3, i4, r3, o3) {
    var e3 = { type: n2, props: t3, key: i4, ref: r3, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: null == o3 ? ++u : o3, __i: -1, __u: 0 };
    return null == o3 && null != l.vnode && l.vnode(e3), e3;
  }
  function k(n2) {
    return n2.children;
  }
  function x(n2, l3) {
    this.props = n2, this.context = l3;
  }
  function S(n2, l3) {
    if (null == l3) return n2.__ ? S(n2.__, n2.__i + 1) : null;
    for (var u4; l3 < n2.__k.length; l3++) if (null != (u4 = n2.__k[l3]) && null != u4.__e) return u4.__e;
    return "function" == typeof n2.type ? S(n2) : null;
  }
  function C(n2) {
    if (n2.__P && n2.__d) {
      var u4 = n2.__v, t3 = u4.__e, i4 = [], r3 = [], o3 = w({}, u4);
      o3.__v = u4.__v + 1, l.vnode && l.vnode(o3), z(n2.__P, o3, u4, n2.__n, n2.__P.namespaceURI, 32 & u4.__u ? [t3] : null, i4, null == t3 ? S(u4) : t3, !!(32 & u4.__u), r3), o3.__v = u4.__v, o3.__.__k[o3.__i] = o3, V(i4, o3, r3), u4.__e = u4.__ = null, o3.__e != t3 && M(o3);
    }
  }
  function M(n2) {
    if (null != (n2 = n2.__) && null != n2.__c) return n2.__e = n2.__c.base = null, n2.__k.some(function(l3) {
      if (null != l3 && null != l3.__e) return n2.__e = n2.__c.base = l3.__e;
    }), M(n2);
  }
  function $(n2) {
    (!n2.__d && (n2.__d = true) && i.push(n2) && !I.__r++ || r != l.debounceRendering) && ((r = l.debounceRendering) || o)(I);
  }
  function I() {
    for (var n2, l3 = 1; i.length; ) i.length > l3 && i.sort(e), n2 = i.shift(), l3 = i.length, C(n2);
    I.__r = 0;
  }
  function P(n2, l3, u4, t3, i4, r3, o3, e3, f4, c3, s3) {
    var a3, h4, y3, d3, w3, g2, _2, m3 = t3 && t3.__k || v, b = l3.length;
    for (f4 = A(u4, l3, m3, f4, b), a3 = 0; a3 < b; a3++) null != (y3 = u4.__k[a3]) && (h4 = -1 != y3.__i && m3[y3.__i] || p, y3.__i = a3, g2 = z(n2, y3, h4, i4, r3, o3, e3, f4, c3, s3), d3 = y3.__e, y3.ref && h4.ref != y3.ref && (h4.ref && D(h4.ref, null, y3), s3.push(y3.ref, y3.__c || d3, y3)), null == w3 && null != d3 && (w3 = d3), (_2 = !!(4 & y3.__u)) || h4.__k === y3.__k ? f4 = H(y3, f4, n2, _2) : "function" == typeof y3.type && void 0 !== g2 ? f4 = g2 : d3 && (f4 = d3.nextSibling), y3.__u &= -7);
    return u4.__e = w3, f4;
  }
  function A(n2, l3, u4, t3, i4) {
    var r3, o3, e3, f4, c3, s3 = u4.length, a3 = s3, h4 = 0;
    for (n2.__k = new Array(i4), r3 = 0; r3 < i4; r3++) null != (o3 = l3[r3]) && "boolean" != typeof o3 && "function" != typeof o3 ? ("string" == typeof o3 || "number" == typeof o3 || "bigint" == typeof o3 || o3.constructor == String ? o3 = n2.__k[r3] = m(null, o3, null, null, null) : d(o3) ? o3 = n2.__k[r3] = m(k, { children: o3 }, null, null, null) : void 0 === o3.constructor && o3.__b > 0 ? o3 = n2.__k[r3] = m(o3.type, o3.props, o3.key, o3.ref ? o3.ref : null, o3.__v) : n2.__k[r3] = o3, f4 = r3 + h4, o3.__ = n2, o3.__b = n2.__b + 1, e3 = null, -1 != (c3 = o3.__i = T(o3, u4, f4, a3)) && (a3--, (e3 = u4[c3]) && (e3.__u |= 2)), null == e3 || null == e3.__v ? (-1 == c3 && (i4 > s3 ? h4-- : i4 < s3 && h4++), "function" != typeof o3.type && (o3.__u |= 4)) : c3 != f4 && (c3 == f4 - 1 ? h4-- : c3 == f4 + 1 ? h4++ : (c3 > f4 ? h4-- : h4++, o3.__u |= 4))) : n2.__k[r3] = null;
    if (a3) for (r3 = 0; r3 < s3; r3++) null != (e3 = u4[r3]) && 0 == (2 & e3.__u) && (e3.__e == t3 && (t3 = S(e3)), E(e3, e3));
    return t3;
  }
  function H(n2, l3, u4, t3) {
    var i4, r3;
    if ("function" == typeof n2.type) {
      for (i4 = n2.__k, r3 = 0; i4 && r3 < i4.length; r3++) i4[r3] && (i4[r3].__ = n2, l3 = H(i4[r3], l3, u4, t3));
      return l3;
    }
    n2.__e != l3 && (t3 && (l3 && n2.type && !l3.parentNode && (l3 = S(n2)), u4.insertBefore(n2.__e, l3 || null)), l3 = n2.__e);
    do {
      l3 = l3 && l3.nextSibling;
    } while (null != l3 && 8 == l3.nodeType);
    return l3;
  }
  function T(n2, l3, u4, t3) {
    var i4, r3, o3, e3 = n2.key, f4 = n2.type, c3 = l3[u4], s3 = null != c3 && 0 == (2 & c3.__u);
    if (null === c3 && null == e3 || s3 && e3 == c3.key && f4 == c3.type) return u4;
    if (t3 > (s3 ? 1 : 0)) {
      for (i4 = u4 - 1, r3 = u4 + 1; i4 >= 0 || r3 < l3.length; ) if (null != (c3 = l3[o3 = i4 >= 0 ? i4-- : r3++]) && 0 == (2 & c3.__u) && e3 == c3.key && f4 == c3.type) return o3;
    }
    return -1;
  }
  function j(n2, l3, u4) {
    "-" == l3[0] ? n2.setProperty(l3, null == u4 ? "" : u4) : n2[l3] = null == u4 ? "" : "number" != typeof u4 || y.test(l3) ? u4 : u4 + "px";
  }
  function F(n2, l3, u4, t3, i4) {
    var r3, o3;
    n: if ("style" == l3) if ("string" == typeof u4) n2.style.cssText = u4;
    else {
      if ("string" == typeof t3 && (n2.style.cssText = t3 = ""), t3) for (l3 in t3) u4 && l3 in u4 || j(n2.style, l3, "");
      if (u4) for (l3 in u4) t3 && u4[l3] == t3[l3] || j(n2.style, l3, u4[l3]);
    }
    else if ("o" == l3[0] && "n" == l3[1]) r3 = l3 != (l3 = l3.replace(f, "$1")), o3 = l3.toLowerCase(), l3 = o3 in n2 || "onFocusOut" == l3 || "onFocusIn" == l3 ? o3.slice(2) : l3.slice(2), n2.l || (n2.l = {}), n2.l[l3 + r3] = u4, u4 ? t3 ? u4.u = t3.u : (u4.u = c, n2.addEventListener(l3, r3 ? a : s, r3)) : n2.removeEventListener(l3, r3 ? a : s, r3);
    else {
      if ("http://www.w3.org/2000/svg" == i4) l3 = l3.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
      else if ("width" != l3 && "height" != l3 && "href" != l3 && "list" != l3 && "form" != l3 && "tabIndex" != l3 && "download" != l3 && "rowSpan" != l3 && "colSpan" != l3 && "role" != l3 && "popover" != l3 && l3 in n2) try {
        n2[l3] = null == u4 ? "" : u4;
        break n;
      } catch (n3) {
      }
      "function" == typeof u4 || (null == u4 || false === u4 && "-" != l3[4] ? n2.removeAttribute(l3) : n2.setAttribute(l3, "popover" == l3 && 1 == u4 ? "" : u4));
    }
  }
  function O(n2) {
    return function(u4) {
      if (this.l) {
        var t3 = this.l[u4.type + n2];
        if (null == u4.t) u4.t = c++;
        else if (u4.t < t3.u) return;
        return t3(l.event ? l.event(u4) : u4);
      }
    };
  }
  function z(n2, u4, t3, i4, r3, o3, e3, f4, c3, s3) {
    var a3, h4, p3, y3, _2, m3, b, S2, C3, M2, $2, I2, A2, H2, L, T3 = u4.type;
    if (void 0 !== u4.constructor) return null;
    128 & t3.__u && (c3 = !!(32 & t3.__u), o3 = [f4 = u4.__e = t3.__e]), (a3 = l.__b) && a3(u4);
    n: if ("function" == typeof T3) try {
      if (S2 = u4.props, C3 = "prototype" in T3 && T3.prototype.render, M2 = (a3 = T3.contextType) && i4[a3.__c], $2 = a3 ? M2 ? M2.props.value : a3.__ : i4, t3.__c ? b = (h4 = u4.__c = t3.__c).__ = h4.__E : (C3 ? u4.__c = h4 = new T3(S2, $2) : (u4.__c = h4 = new x(S2, $2), h4.constructor = T3, h4.render = G), M2 && M2.sub(h4), h4.state || (h4.state = {}), h4.__n = i4, p3 = h4.__d = true, h4.__h = [], h4._sb = []), C3 && null == h4.__s && (h4.__s = h4.state), C3 && null != T3.getDerivedStateFromProps && (h4.__s == h4.state && (h4.__s = w({}, h4.__s)), w(h4.__s, T3.getDerivedStateFromProps(S2, h4.__s))), y3 = h4.props, _2 = h4.state, h4.__v = u4, p3) C3 && null == T3.getDerivedStateFromProps && null != h4.componentWillMount && h4.componentWillMount(), C3 && null != h4.componentDidMount && h4.__h.push(h4.componentDidMount);
      else {
        if (C3 && null == T3.getDerivedStateFromProps && S2 !== y3 && null != h4.componentWillReceiveProps && h4.componentWillReceiveProps(S2, $2), u4.__v == t3.__v || !h4.__e && null != h4.shouldComponentUpdate && false === h4.shouldComponentUpdate(S2, h4.__s, $2)) {
          u4.__v != t3.__v && (h4.props = S2, h4.state = h4.__s, h4.__d = false), u4.__e = t3.__e, u4.__k = t3.__k, u4.__k.some(function(n3) {
            n3 && (n3.__ = u4);
          }), v.push.apply(h4.__h, h4._sb), h4._sb = [], h4.__h.length && e3.push(h4);
          break n;
        }
        null != h4.componentWillUpdate && h4.componentWillUpdate(S2, h4.__s, $2), C3 && null != h4.componentDidUpdate && h4.__h.push(function() {
          h4.componentDidUpdate(y3, _2, m3);
        });
      }
      if (h4.context = $2, h4.props = S2, h4.__P = n2, h4.__e = false, I2 = l.__r, A2 = 0, C3) h4.state = h4.__s, h4.__d = false, I2 && I2(u4), a3 = h4.render(h4.props, h4.state, h4.context), v.push.apply(h4.__h, h4._sb), h4._sb = [];
      else do {
        h4.__d = false, I2 && I2(u4), a3 = h4.render(h4.props, h4.state, h4.context), h4.state = h4.__s;
      } while (h4.__d && ++A2 < 25);
      h4.state = h4.__s, null != h4.getChildContext && (i4 = w(w({}, i4), h4.getChildContext())), C3 && !p3 && null != h4.getSnapshotBeforeUpdate && (m3 = h4.getSnapshotBeforeUpdate(y3, _2)), H2 = null != a3 && a3.type === k && null == a3.key ? q(a3.props.children) : a3, f4 = P(n2, d(H2) ? H2 : [H2], u4, t3, i4, r3, o3, e3, f4, c3, s3), h4.base = u4.__e, u4.__u &= -161, h4.__h.length && e3.push(h4), b && (h4.__E = h4.__ = null);
    } catch (n3) {
      if (u4.__v = null, c3 || null != o3) if (n3.then) {
        for (u4.__u |= c3 ? 160 : 128; f4 && 8 == f4.nodeType && f4.nextSibling; ) f4 = f4.nextSibling;
        o3[o3.indexOf(f4)] = null, u4.__e = f4;
      } else {
        for (L = o3.length; L--; ) g(o3[L]);
        N(u4);
      }
      else u4.__e = t3.__e, u4.__k = t3.__k, n3.then || N(u4);
      l.__e(n3, u4, t3);
    }
    else null == o3 && u4.__v == t3.__v ? (u4.__k = t3.__k, u4.__e = t3.__e) : f4 = u4.__e = B(t3.__e, u4, t3, i4, r3, o3, e3, c3, s3);
    return (a3 = l.diffed) && a3(u4), 128 & u4.__u ? void 0 : f4;
  }
  function N(n2) {
    n2 && (n2.__c && (n2.__c.__e = true), n2.__k && n2.__k.some(N));
  }
  function V(n2, u4, t3) {
    for (var i4 = 0; i4 < t3.length; i4++) D(t3[i4], t3[++i4], t3[++i4]);
    l.__c && l.__c(u4, n2), n2.some(function(u5) {
      try {
        n2 = u5.__h, u5.__h = [], n2.some(function(n3) {
          n3.call(u5);
        });
      } catch (n3) {
        l.__e(n3, u5.__v);
      }
    });
  }
  function q(n2) {
    return "object" != typeof n2 || null == n2 || n2.__b > 0 ? n2 : d(n2) ? n2.map(q) : w({}, n2);
  }
  function B(u4, t3, i4, r3, o3, e3, f4, c3, s3) {
    var a3, h4, v3, y3, w3, _2, m3, b = i4.props || p, k3 = t3.props, x2 = t3.type;
    if ("svg" == x2 ? o3 = "http://www.w3.org/2000/svg" : "math" == x2 ? o3 = "http://www.w3.org/1998/Math/MathML" : o3 || (o3 = "http://www.w3.org/1999/xhtml"), null != e3) {
      for (a3 = 0; a3 < e3.length; a3++) if ((w3 = e3[a3]) && "setAttribute" in w3 == !!x2 && (x2 ? w3.localName == x2 : 3 == w3.nodeType)) {
        u4 = w3, e3[a3] = null;
        break;
      }
    }
    if (null == u4) {
      if (null == x2) return document.createTextNode(k3);
      u4 = document.createElementNS(o3, x2, k3.is && k3), c3 && (l.__m && l.__m(t3, e3), c3 = false), e3 = null;
    }
    if (null == x2) b === k3 || c3 && u4.data == k3 || (u4.data = k3);
    else {
      if (e3 = e3 && n.call(u4.childNodes), !c3 && null != e3) for (b = {}, a3 = 0; a3 < u4.attributes.length; a3++) b[(w3 = u4.attributes[a3]).name] = w3.value;
      for (a3 in b) w3 = b[a3], "dangerouslySetInnerHTML" == a3 ? v3 = w3 : "children" == a3 || a3 in k3 || "value" == a3 && "defaultValue" in k3 || "checked" == a3 && "defaultChecked" in k3 || F(u4, a3, null, w3, o3);
      for (a3 in k3) w3 = k3[a3], "children" == a3 ? y3 = w3 : "dangerouslySetInnerHTML" == a3 ? h4 = w3 : "value" == a3 ? _2 = w3 : "checked" == a3 ? m3 = w3 : c3 && "function" != typeof w3 || b[a3] === w3 || F(u4, a3, w3, b[a3], o3);
      if (h4) c3 || v3 && (h4.__html == v3.__html || h4.__html == u4.innerHTML) || (u4.innerHTML = h4.__html), t3.__k = [];
      else if (v3 && (u4.innerHTML = ""), P("template" == t3.type ? u4.content : u4, d(y3) ? y3 : [y3], t3, i4, r3, "foreignObject" == x2 ? "http://www.w3.org/1999/xhtml" : o3, e3, f4, e3 ? e3[0] : i4.__k && S(i4, 0), c3, s3), null != e3) for (a3 = e3.length; a3--; ) g(e3[a3]);
      c3 || (a3 = "value", "progress" == x2 && null == _2 ? u4.removeAttribute("value") : null != _2 && (_2 !== u4[a3] || "progress" == x2 && !_2 || "option" == x2 && _2 != b[a3]) && F(u4, a3, _2, b[a3], o3), a3 = "checked", null != m3 && m3 != u4[a3] && F(u4, a3, m3, b[a3], o3));
    }
    return u4;
  }
  function D(n2, u4, t3) {
    try {
      if ("function" == typeof n2) {
        var i4 = "function" == typeof n2.__u;
        i4 && n2.__u(), i4 && null == u4 || (n2.__u = n2(u4));
      } else n2.current = u4;
    } catch (n3) {
      l.__e(n3, t3);
    }
  }
  function E(n2, u4, t3) {
    var i4, r3;
    if (l.unmount && l.unmount(n2), (i4 = n2.ref) && (i4.current && i4.current != n2.__e || D(i4, null, u4)), null != (i4 = n2.__c)) {
      if (i4.componentWillUnmount) try {
        i4.componentWillUnmount();
      } catch (n3) {
        l.__e(n3, u4);
      }
      i4.base = i4.__P = null;
    }
    if (i4 = n2.__k) for (r3 = 0; r3 < i4.length; r3++) i4[r3] && E(i4[r3], u4, t3 || "function" != typeof n2.type);
    t3 || g(n2.__e), n2.__c = n2.__ = n2.__e = void 0;
  }
  function G(n2, l3, u4) {
    return this.constructor(n2, u4);
  }
  function J(u4, t3, i4) {
    var r3, o3, e3, f4;
    t3 == document && (t3 = document.documentElement), l.__ && l.__(u4, t3), o3 = (r3 = "function" == typeof i4) ? null : i4 && i4.__k || t3.__k, e3 = [], f4 = [], z(t3, u4 = (!r3 && i4 || t3).__k = _(k, null, [u4]), o3 || p, p, t3.namespaceURI, !r3 && i4 ? [i4] : o3 ? null : t3.firstChild ? n.call(t3.childNodes) : null, e3, !r3 && i4 ? i4 : o3 ? o3.__e : t3.firstChild, r3, f4), V(e3, u4, f4);
  }
  n = v.slice, l = { __e: function(n2, l3, u4, t3) {
    for (var i4, r3, o3; l3 = l3.__; ) if ((i4 = l3.__c) && !i4.__) try {
      if ((r3 = i4.constructor) && null != r3.getDerivedStateFromError && (i4.setState(r3.getDerivedStateFromError(n2)), o3 = i4.__d), null != i4.componentDidCatch && (i4.componentDidCatch(n2, t3 || {}), o3 = i4.__d), o3) return i4.__E = i4;
    } catch (l4) {
      n2 = l4;
    }
    throw n2;
  } }, u = 0, t = function(n2) {
    return null != n2 && void 0 === n2.constructor;
  }, x.prototype.setState = function(n2, l3) {
    var u4;
    u4 = null != this.__s && this.__s != this.state ? this.__s : this.__s = w({}, this.state), "function" == typeof n2 && (n2 = n2(w({}, u4), this.props)), n2 && w(u4, n2), null != n2 && this.__v && (l3 && this._sb.push(l3), $(this));
  }, x.prototype.forceUpdate = function(n2) {
    this.__v && (this.__e = true, n2 && this.__h.push(n2), $(this));
  }, x.prototype.render = k, i = [], o = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e = function(n2, l3) {
    return n2.__v.__b - l3.__v.__b;
  }, I.__r = 0, f = /(PointerCapture)$|Capture$/i, c = 0, s = O(false), a = O(true), h = 0;

  // node_modules/preact/hooks/dist/hooks.module.js
  var t2;
  var r2;
  var u2;
  var i2;
  var o2 = 0;
  var f2 = [];
  var c2 = l;
  var e2 = c2.__b;
  var a2 = c2.__r;
  var v2 = c2.diffed;
  var l2 = c2.__c;
  var m2 = c2.unmount;
  var s2 = c2.__;
  function p2(n2, t3) {
    c2.__h && c2.__h(r2, n2, o2 || t3), o2 = 0;
    var u4 = r2.__H || (r2.__H = { __: [], __h: [] });
    return n2 >= u4.__.length && u4.__.push({}), u4.__[n2];
  }
  function d2(n2) {
    return o2 = 1, h2(D2, n2);
  }
  function h2(n2, u4, i4) {
    var o3 = p2(t2++, 2);
    if (o3.t = n2, !o3.__c && (o3.__ = [i4 ? i4(u4) : D2(void 0, u4), function(n3) {
      var t3 = o3.__N ? o3.__N[0] : o3.__[0], r3 = o3.t(t3, n3);
      t3 !== r3 && (o3.__N = [r3, o3.__[1]], o3.__c.setState({}));
    }], o3.__c = r2, !r2.__f)) {
      var f4 = function(n3, t3, r3) {
        if (!o3.__c.__H) return true;
        var u5 = o3.__c.__H.__.filter(function(n4) {
          return n4.__c;
        });
        if (u5.every(function(n4) {
          return !n4.__N;
        })) return !c3 || c3.call(this, n3, t3, r3);
        var i5 = o3.__c.props !== n3;
        return u5.some(function(n4) {
          if (n4.__N) {
            var t4 = n4.__[0];
            n4.__ = n4.__N, n4.__N = void 0, t4 !== n4.__[0] && (i5 = true);
          }
        }), c3 && c3.call(this, n3, t3, r3) || i5;
      };
      r2.__f = true;
      var c3 = r2.shouldComponentUpdate, e3 = r2.componentWillUpdate;
      r2.componentWillUpdate = function(n3, t3, r3) {
        if (this.__e) {
          var u5 = c3;
          c3 = void 0, f4(n3, t3, r3), c3 = u5;
        }
        e3 && e3.call(this, n3, t3, r3);
      }, r2.shouldComponentUpdate = f4;
    }
    return o3.__N || o3.__;
  }
  function y2(n2, u4) {
    var i4 = p2(t2++, 3);
    !c2.__s && C2(i4.__H, u4) && (i4.__ = n2, i4.u = u4, r2.__H.__h.push(i4));
  }
  function T2(n2, r3) {
    var u4 = p2(t2++, 7);
    return C2(u4.__H, r3) && (u4.__ = n2(), u4.__H = r3, u4.__h = n2), u4.__;
  }
  function j2() {
    for (var n2; n2 = f2.shift(); ) {
      var t3 = n2.__H;
      if (n2.__P && t3) try {
        t3.__h.some(z2), t3.__h.some(B2), t3.__h = [];
      } catch (r3) {
        t3.__h = [], c2.__e(r3, n2.__v);
      }
    }
  }
  c2.__b = function(n2) {
    r2 = null, e2 && e2(n2);
  }, c2.__ = function(n2, t3) {
    n2 && t3.__k && t3.__k.__m && (n2.__m = t3.__k.__m), s2 && s2(n2, t3);
  }, c2.__r = function(n2) {
    a2 && a2(n2), t2 = 0;
    var i4 = (r2 = n2.__c).__H;
    i4 && (u2 === r2 ? (i4.__h = [], r2.__h = [], i4.__.some(function(n3) {
      n3.__N && (n3.__ = n3.__N), n3.u = n3.__N = void 0;
    })) : (i4.__h.some(z2), i4.__h.some(B2), i4.__h = [], t2 = 0)), u2 = r2;
  }, c2.diffed = function(n2) {
    v2 && v2(n2);
    var t3 = n2.__c;
    t3 && t3.__H && (t3.__H.__h.length && (1 !== f2.push(t3) && i2 === c2.requestAnimationFrame || ((i2 = c2.requestAnimationFrame) || w2)(j2)), t3.__H.__.some(function(n3) {
      n3.u && (n3.__H = n3.u), n3.u = void 0;
    })), u2 = r2 = null;
  }, c2.__c = function(n2, t3) {
    t3.some(function(n3) {
      try {
        n3.__h.some(z2), n3.__h = n3.__h.filter(function(n4) {
          return !n4.__ || B2(n4);
        });
      } catch (r3) {
        t3.some(function(n4) {
          n4.__h && (n4.__h = []);
        }), t3 = [], c2.__e(r3, n3.__v);
      }
    }), l2 && l2(n2, t3);
  }, c2.unmount = function(n2) {
    m2 && m2(n2);
    var t3, r3 = n2.__c;
    r3 && r3.__H && (r3.__H.__.some(function(n3) {
      try {
        z2(n3);
      } catch (n4) {
        t3 = n4;
      }
    }), r3.__H = void 0, t3 && c2.__e(t3, r3.__v));
  };
  var k2 = "function" == typeof requestAnimationFrame;
  function w2(n2) {
    var t3, r3 = function() {
      clearTimeout(u4), k2 && cancelAnimationFrame(t3), setTimeout(n2);
    }, u4 = setTimeout(r3, 35);
    k2 && (t3 = requestAnimationFrame(r3));
  }
  function z2(n2) {
    var t3 = r2, u4 = n2.__c;
    "function" == typeof u4 && (n2.__c = void 0, u4()), r2 = t3;
  }
  function B2(n2) {
    var t3 = r2;
    n2.__c = n2.__(), r2 = t3;
  }
  function C2(n2, t3) {
    return !n2 || n2.length !== t3.length || t3.some(function(t4, r3) {
      return t4 !== n2[r3];
    });
  }
  function D2(n2, t3) {
    return "function" == typeof t3 ? t3(n2) : t3;
  }

  // src/settings.ts
  var defaultSettings = {
    includeHidden: false,
    includeLocked: false,
    textSizeMin: 12,
    strictTextSize: false
  };

  // node_modules/preact/jsx-runtime/dist/jsxRuntime.module.js
  var f3 = 0;
  var i3 = Array.isArray;
  function u3(e3, t3, n2, o3, i4, u4) {
    t3 || (t3 = {});
    var a3, c3, p3 = t3;
    if ("ref" in p3) for (c3 in p3 = {}, t3) "ref" == c3 ? a3 = t3[c3] : p3[c3] = t3[c3];
    var l3 = { type: e3, props: p3, key: n2, ref: a3, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f3, __i: -1, __u: 0, __source: i4, __self: u4 };
    if ("function" == typeof e3 && (a3 = e3.defaultProps)) for (c3 in a3) void 0 === p3[c3] && (p3[c3] = a3[c3]);
    return l.vnode && l.vnode(l3), l3;
  }

  // src/ui.tsx
  function rgbToHex(rgb) {
    if (!rgb) return "--";
    const to255 = (v3) => Math.round((v3 != null ? v3 : 0) * 255);
    const r3 = to255(rgb.r);
    const g2 = to255(rgb.g);
    const b = to255(rgb.b);
    return `#${[r3, g2, b].map((n2) => n2.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
  }
  function App() {
    var _a;
    const [scope, setScope] = d2("selection");
    const [state, setState] = d2("idle");
    const [progress, setProgress] = d2({ scanned: 0, total: 0, percent: 0 });
    const [issues, setIssues] = d2([]);
    const [selectedIssueId, setSelectedIssueId] = d2(null);
    const [summary, setSummary] = d2(null);
    const [error, setError] = d2(null);
    const [includeHidden, setIncludeHidden] = d2(defaultSettings.includeHidden);
    const [includeLocked, setIncludeLocked] = d2(defaultSettings.includeLocked);
    const [textSizeMin, setTextSizeMin] = d2(defaultSettings.textSizeMin);
    const [strictTextSize, setStrictTextSize] = d2(defaultSettings.strictTextSize);
    const [filters, setFilters] = d2({ severity: "all", ref: "all", search: "", issueType: "all" });
    const [showSettings, setShowSettings] = d2(false);
    y2(() => {
      window.onmessage = (event) => {
        var _a2, _b;
        const { type, payload } = event.data.pluginMessage || {};
        if (!type) return;
        switch (type) {
          case "SCAN_PROGRESS":
            setState("scanning");
            setProgress(payload);
            break;
          case "SCAN_COMPLETE":
            setIssues(payload.issues);
            setSummary(payload.summary);
            setState(payload.issues.length === 0 ? "empty" : "complete");
            setSelectedIssueId((_b = (_a2 = payload.issues[0]) == null ? void 0 : _a2.id) != null ? _b : null);
            break;
          case "SCAN_ERROR":
            setError(payload.message);
            setState("error");
            break;
          case "SCAN_CANCELLED":
            setState("cancelled");
            break;
          default:
            break;
        }
      };
    }, []);
    const filteredIssues = T2(() => {
      return issues.filter((i4) => {
        if (filters.severity !== "all" && i4.severity !== filters.severity) return false;
        if (filters.ref !== "all" && i4.wcagRef !== filters.ref) return false;
        if (filters.issueType !== "all" && i4.issueType !== filters.issueType) return false;
        if (filters.search && !i4.nodeName.toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
      });
    }, [issues, filters]);
    const startScan = () => {
      setState("scanning");
      setIssues([]);
      setError(null);
      setSelectedIssueId(null);
      parent.postMessage(
        {
          pluginMessage: {
            type: "START_SCAN",
            payload: {
              scope,
              includeHidden,
              includeLocked,
              textSizeMin,
              strictTextSize
            }
          }
        },
        "*"
      );
    };
    const cancelScan = () => {
      parent.postMessage({ pluginMessage: { type: "CANCEL_SCAN" } }, "*");
    };
    const goToNode = (id) => {
      parent.postMessage({ pluginMessage: { type: "GO_TO_NODE", payload: { id } } }, "*");
    };
    const onChipClick = (severity) => {
      setFilters((f4) => ({
        ...f4,
        severity: f4.severity === severity ? "all" : severity
      }));
    };
    const resetFilters = () => setFilters({ severity: "all", ref: "all", search: "", issueType: "all" });
    const selectedIssue = (_a = issues.find((i4) => i4.id === selectedIssueId)) != null ? _a : filteredIssues[0];
    const issueTypeCounts = T2(() => {
      const base = { "text-size": 0, contrast: 0, "target-size": 0 };
      issues.forEach((i4) => {
        var _a2;
        base[i4.issueType] = ((_a2 = base[i4.issueType]) != null ? _a2 : 0) + 1;
      });
      return base;
    }, [issues]);
    const compliance = getComplianceStatus(issues);
    const scopeLabel = scope === "selection" ? "Results for Selected Layers" : "Results for This Page";
    return /* @__PURE__ */ u3("div", { className: "app", children: /* @__PURE__ */ u3("div", { className: "shell", children: [
      /* @__PURE__ */ u3("header", { className: "header", children: [
        /* @__PURE__ */ u3("div", { className: "title-block", children: [
          /* @__PURE__ */ u3("h1", { children: "WCAG 2.2 Checker" }),
          /* @__PURE__ */ u3("div", { className: "subtitle", children: "Target size \u2022 Contrast \u2022 Text size" })
        ] }),
        /* @__PURE__ */ u3("div", { className: "segmented", children: [
          /* @__PURE__ */ u3("button", { className: scope === "selection" ? "active" : "", onClick: () => setScope("selection"), children: "Selection" }),
          /* @__PURE__ */ u3("button", { className: scope === "page" ? "active" : "", onClick: () => setScope("page"), children: "Page" })
        ] })
      ] }),
      /* @__PURE__ */ u3("div", { className: "actions", children: [
        /* @__PURE__ */ u3("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [
          /* @__PURE__ */ u3("button", { className: "btn btn-primary", onClick: startScan, disabled: state === "scanning", children: state === "scanning" ? /* @__PURE__ */ u3(k, { children: [
            /* @__PURE__ */ u3("span", { className: "spinner" }),
            " Scanning\u2026"
          ] }) : "Scan" }),
          /* @__PURE__ */ u3("button", { className: "btn btn-secondary", onClick: cancelScan, disabled: state !== "scanning", children: "Cancel" }),
          state === "scanning" && /* @__PURE__ */ u3("span", { className: "progress-text", children: [
            "Scanned ",
            progress.scanned,
            "/",
            progress.total,
            " nodes"
          ] })
        ] }),
        /* @__PURE__ */ u3("button", { className: "btn btn-ghost", onClick: () => setShowSettings((v3) => !v3), "aria-label": "Settings", children: "\u2699 Settings" })
      ] }),
      showSettings && /* @__PURE__ */ u3("div", { className: "card", style: { padding: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }, children: [
        /* @__PURE__ */ u3("label", { children: [
          /* @__PURE__ */ u3("input", { type: "checkbox", checked: includeHidden, onChange: (e3) => setIncludeHidden(e3.target.checked) }),
          " Include hidden"
        ] }),
        /* @__PURE__ */ u3("label", { children: [
          /* @__PURE__ */ u3("input", { type: "checkbox", checked: includeLocked, onChange: (e3) => setIncludeLocked(e3.target.checked) }),
          " Include locked"
        ] }),
        /* @__PURE__ */ u3("label", { children: [
          "Text min px: ",
          /* @__PURE__ */ u3("input", { className: "field", type: "number", min: 10, value: textSizeMin, onChange: (e3) => setTextSizeMin(Number(e3.target.value)), style: { width: 80 } })
        ] }),
        /* @__PURE__ */ u3("label", { children: [
          /* @__PURE__ */ u3("input", { type: "checkbox", checked: strictTextSize, onChange: (e3) => setStrictTextSize(e3.target.checked) }),
          " Strict text size (errors)"
        ] })
      ] }),
      /* @__PURE__ */ u3("div", { className: "filters", children: [
        /* @__PURE__ */ u3("select", { className: "select", value: filters.severity, onChange: (e3) => setFilters({ ...filters, severity: e3.target.value }), children: [
          /* @__PURE__ */ u3("option", { value: "all", children: "Severity: All" }),
          /* @__PURE__ */ u3("option", { value: "error", children: "Error" }),
          /* @__PURE__ */ u3("option", { value: "warning", children: "Warning" }),
          /* @__PURE__ */ u3("option", { value: "manual", children: "Manual" })
        ] }),
        /* @__PURE__ */ u3("select", { className: "select", value: filters.ref, onChange: (e3) => setFilters({ ...filters, ref: e3.target.value }), children: [
          /* @__PURE__ */ u3("option", { value: "all", children: "Criteria: All" }),
          /* @__PURE__ */ u3("option", { value: "2.5.8", children: "2.5.8" }),
          /* @__PURE__ */ u3("option", { value: "1.4.3", children: "1.4.3" }),
          /* @__PURE__ */ u3("option", { value: "1.4.11", children: "1.4.11" }),
          /* @__PURE__ */ u3("option", { value: "DS-TextSize", children: "Text size heuristic" })
        ] }),
        /* @__PURE__ */ u3("select", { className: "select", value: filters.issueType, onChange: (e3) => setFilters({ ...filters, issueType: e3.target.value }), children: [
          /* @__PURE__ */ u3("option", { value: "all", children: "Issue type: All" }),
          /* @__PURE__ */ u3("option", { value: "text-size", children: "Text size" }),
          /* @__PURE__ */ u3("option", { value: "contrast", children: "Contrast" }),
          /* @__PURE__ */ u3("option", { value: "target-size", children: "Target size" })
        ] }),
        /* @__PURE__ */ u3(
          "input",
          {
            className: "field",
            type: "search",
            placeholder: "Search node",
            value: filters.search,
            onInput: (e3) => setFilters({ ...filters, search: e3.target.value })
          }
        ),
        /* @__PURE__ */ u3("button", { className: "btn btn-secondary", onClick: resetFilters, children: "Reset" })
      ] }),
      summary && /* @__PURE__ */ u3("div", { className: "status-row", children: [
        /* @__PURE__ */ u3("div", { className: `status-card ${compliance === "PASS" ? "pass" : ""}`, children: [
          /* @__PURE__ */ u3("div", { className: "status-title", children: [
            compliance === "FAIL" && "WCAG 2.2 AA \u2013 Failed",
            compliance === "REVIEW" && "WCAG 2.2 AA \u2013 Needs Review",
            compliance === "PASS" && "WCAG 2.2 AA \u2013 Pass"
          ] }),
          /* @__PURE__ */ u3("div", { className: "status-sub", children: [
            scopeLabel,
            " \u2022 Nodes scanned: ",
            summary.nodesScanned
          ] })
        ] }),
        /* @__PURE__ */ u3(
          TypeCard,
          {
            label: "Text Size Issues",
            count: issueTypeCounts["text-size"],
            tone: "text",
            active: filters.issueType === "text-size",
            onClick: () => setFilters((f4) => ({ ...f4, issueType: f4.issueType === "text-size" ? "all" : "text-size" }))
          }
        ),
        /* @__PURE__ */ u3(
          TypeCard,
          {
            label: "Contrast Issues",
            count: issueTypeCounts["contrast"],
            tone: "contrast",
            active: filters.issueType === "contrast",
            onClick: () => setFilters((f4) => ({ ...f4, issueType: f4.issueType === "contrast" ? "all" : "contrast" }))
          }
        ),
        /* @__PURE__ */ u3(
          TypeCard,
          {
            label: "Target Size Issues",
            count: issueTypeCounts["target-size"],
            tone: "target",
            active: filters.issueType === "target-size",
            onClick: () => setFilters((f4) => ({ ...f4, issueType: f4.issueType === "target-size" ? "all" : "target-size" }))
          }
        )
      ] }),
      summary && /* @__PURE__ */ u3("div", { className: "chips", children: [
        /* @__PURE__ */ u3(Chip, { label: "Errors", count: summary.errors, severity: "error", active: filters.severity === "error", onClick: () => onChipClick("error") }),
        /* @__PURE__ */ u3(Chip, { label: "Warnings", count: summary.warnings, severity: "warning", active: filters.severity === "warning", onClick: () => onChipClick("warning") }),
        /* @__PURE__ */ u3(Chip, { label: "Manual", count: summary.manual, severity: "manual", active: filters.severity === "manual", onClick: () => onChipClick("manual") })
      ] }),
      /* @__PURE__ */ u3("main", { className: "content", children: [
        /* @__PURE__ */ u3("div", { className: "table-card", children: [
          state === "error" && /* @__PURE__ */ u3("div", { className: "empty", children: [
            "\u26A0 ",
            error
          ] }),
          state === "cancelled" && /* @__PURE__ */ u3("div", { className: "empty", children: "\u2716 Scan cancelled" }),
          state !== "error" && filteredIssues.length === 0 && /* @__PURE__ */ u3("div", { className: "empty", children: "\u{1F50D} No issues found. Try scanning another scope." }),
          filteredIssues.length > 0 && /* @__PURE__ */ u3("table", { className: "table", children: [
            /* @__PURE__ */ u3("thead", { children: /* @__PURE__ */ u3("tr", { children: [
              /* @__PURE__ */ u3("th", { children: "Severity" }),
              /* @__PURE__ */ u3("th", { children: "Ref" }),
              /* @__PURE__ */ u3("th", { children: "Node" }),
              /* @__PURE__ */ u3("th", { children: "Issue" }),
              /* @__PURE__ */ u3("th", { children: "Action" })
            ] }) }),
            /* @__PURE__ */ u3("tbody", { children: filteredIssues.map((issue) => /* @__PURE__ */ u3(
              "tr",
              {
                className: selectedIssueId === issue.id ? "selected" : "",
                onClick: () => setSelectedIssueId(issue.id),
                children: [
                  /* @__PURE__ */ u3("td", { children: /* @__PURE__ */ u3(SeverityPill, { severity: issue.severity }) }),
                  /* @__PURE__ */ u3("td", { children: /* @__PURE__ */ u3("span", { className: "ref-chip", children: issue.wcagRef }) }),
                  /* @__PURE__ */ u3("td", { children: [
                    /* @__PURE__ */ u3("div", { children: issue.nodeName }),
                    /* @__PURE__ */ u3("div", { className: "muted", style: { fontSize: 12 }, children: issue.nodeType })
                  ] }),
                  /* @__PURE__ */ u3("td", { children: issue.message }),
                  /* @__PURE__ */ u3("td", { children: /* @__PURE__ */ u3("button", { className: "small-btn", onClick: (e3) => {
                    e3.stopPropagation();
                    goToNode(issue.nodeId);
                  }, children: "\u2197 Go" }) })
                ]
              },
              issue.id
            )) })
          ] })
        ] }),
        /* @__PURE__ */ u3("div", { className: "detail-card", children: /* @__PURE__ */ u3(DetailPanel, { issue: selectedIssue, onGo: () => selectedIssue && goToNode(selectedIssue.nodeId) }) })
      ] })
    ] }) });
  }
  function Chip({ label, count, severity, active, onClick }) {
    return /* @__PURE__ */ u3("button", { className: `chip ${severity} ${active ? "active" : ""}`, onClick, children: [
      /* @__PURE__ */ u3("span", { children: label }),
      /* @__PURE__ */ u3("strong", { children: count })
    ] });
  }
  function TypeCard({ label, count, tone, active, onClick }) {
    return /* @__PURE__ */ u3("div", { className: `type-card ${tone === "text" ? "text" : tone === "contrast" ? "contrast" : "target"} ${active ? "active" : ""}`, onClick, children: [
      /* @__PURE__ */ u3("div", { className: "label", children: label }),
      /* @__PURE__ */ u3("div", { className: "count", children: count })
    ] });
  }
  function DetailPanel({ issue, onGo }) {
    var _a, _b, _c, _d, _e, _f;
    if (!issue) return /* @__PURE__ */ u3("div", { className: "empty", children: "Select an issue to see details." });
    const ratio = (_a = issue.evidence) == null ? void 0 : _a.ratio;
    const fg = ((_b = issue.evidence) == null ? void 0 : _b.textColor) || ((_c = issue.evidence) == null ? void 0 : _c.fg);
    const bg = (_d = issue.evidence) == null ? void 0 : _d.bgColor;
    const sizeW = (_e = issue.evidence) == null ? void 0 : _e.width;
    const sizeH = (_f = issue.evidence) == null ? void 0 : _f.height;
    const ratioText = ratio ? `${ratio.toFixed(2)}:1` : "\u2014";
    const normalPass = ratio !== void 0 ? ratio >= 4.5 : void 0;
    const largePass = ratio !== void 0 ? ratio >= 3 : void 0;
    const evidenceItems = [];
    if (ratio) evidenceItems.push(`Contrast: ${ratioText}`);
    if (sizeW && sizeH) evidenceItems.push(`Size: ${Math.round(sizeW)}\xD7${Math.round(sizeH)}px`);
    if (fg) evidenceItems.push(`FG ${rgbToHex(fg)}`);
    if (bg) evidenceItems.push(`BG ${rgbToHex(bg)}`);
    return /* @__PURE__ */ u3("div", { className: "detail", children: [
      /* @__PURE__ */ u3("div", { className: "detail-header", children: [
        /* @__PURE__ */ u3("div", { children: [
          /* @__PURE__ */ u3("div", { className: "detail-title", children: issue.title }),
          /* @__PURE__ */ u3("div", { className: "badge-line", children: issue.wcagRef })
        ] }),
        /* @__PURE__ */ u3(SeverityPill, { severity: issue.severity })
      ] }),
      evidenceItems.length > 0 && /* @__PURE__ */ u3("div", { className: "evidence", children: evidenceItems.map((item) => /* @__PURE__ */ u3("div", { children: item }, item)) }),
      /* @__PURE__ */ u3("div", { style: { textAlign: "center" }, children: [
        /* @__PURE__ */ u3("div", { style: { fontSize: 32, fontWeight: 800 }, children: ratioText }),
        /* @__PURE__ */ u3("div", { className: "muted", style: { fontSize: 12 }, children: "Simple Contrast (WCAG)" })
      ] }),
      /* @__PURE__ */ u3("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }, children: [
        /* @__PURE__ */ u3(ThresholdCard, { label: "Normal Text", threshold: "4.5:1", pass: normalPass }),
        /* @__PURE__ */ u3(ThresholdCard, { label: "Large Text", threshold: "3:1", pass: largePass })
      ] }),
      /* @__PURE__ */ u3("details", { className: "suggestion", children: [
        /* @__PURE__ */ u3("summary", { children: "Suggestion" }),
        /* @__PURE__ */ u3("div", { children: issue.suggestion })
      ] }),
      /* @__PURE__ */ u3("div", { style: { marginTop: "auto" }, children: /* @__PURE__ */ u3("button", { className: "btn btn-primary", onClick: onGo, children: "Go to node" }) })
    ] });
  }
  function ThresholdCard({ label, threshold, pass }) {
    const color = pass === void 0 ? "var(--muted)" : pass ? "var(--primary)" : "var(--danger)";
    const icon = pass === void 0 ? "\u2022" : pass ? "\u2714" : "\u2716";
    return /* @__PURE__ */ u3("div", { className: "card", style: { padding: 10, boxShadow: "none" }, children: [
      /* @__PURE__ */ u3("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
        /* @__PURE__ */ u3("div", { style: { fontWeight: 600 }, children: label }),
        /* @__PURE__ */ u3("span", { style: { color }, children: icon })
      ] }),
      /* @__PURE__ */ u3("div", { className: "muted", style: { fontSize: 12 }, children: [
        "Threshold ",
        threshold
      ] })
    ] });
  }
  function SeverityPill({ severity }) {
    return /* @__PURE__ */ u3("span", { className: `pill ${severity}`, children: severity });
  }
  function getComplianceStatus(issues) {
    const hasError = issues.some((i4) => i4.severity === "error");
    const hasWarnOrManual = issues.some((i4) => i4.severity === "warning" || i4.severity === "manual");
    if (hasError) return "FAIL";
    if (hasWarnOrManual) return "REVIEW";
    return "PASS";
  }
  J(/* @__PURE__ */ u3(App, {}), document.getElementById("root"));
})();
//# sourceMappingURL=ui.js.map
