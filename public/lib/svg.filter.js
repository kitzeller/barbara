/*!
* @svgdotjs/svg.filter.js - A plugin for svg.js adding filter functionality
* @version 3.0.7
* https://github.com/svgdotjs/svg.filter.js
*
* @copyright Wout Fierens
* @license MIT
*
* BUILT: Thu Oct 31 2019 19:57:46 GMT+0100 (GMT+01:00)
*/;
this.SVG = this.SVG || {};
this.SVG.Filter = (function (svg_js) {
  'use strict';

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    }
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

  function _typeof(obj) {
    if (typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol") {
      _typeof = function _typeof(obj) {
        return _typeof2(obj);
      };
    } else {
      _typeof = function _typeof(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
      };
    }

    return _typeof(obj);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (_typeof(call) === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _superPropBase(object, property) {
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
      object = _getPrototypeOf(object);
      if (object === null) break;
    }

    return object;
  }

  function _get(target, property, receiver) {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get;
    } else {
      _get = function _get(target, property, receiver) {
        var base = _superPropBase(target, property);
        if (!base) return;
        var desc = Object.getOwnPropertyDescriptor(base, property);

        if (desc.get) {
          return desc.get.call(receiver);
        }

        return desc.value;
      };
    }

    return _get(target, property, receiver || target);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  var Filter =
  /*#__PURE__*/
  function (_Element) {
    _inherits(Filter, _Element);

    function Filter(node) {
      var _this;

      _classCallCheck(this, Filter);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(Filter).call(this, svg_js.nodeOrNew('filter', node), node));
      _this.$source = 'SourceGraphic';
      _this.$sourceAlpha = 'SourceAlpha';
      _this.$background = 'BackgroundImage';
      _this.$backgroundAlpha = 'BackgroundAlpha';
      _this.$fill = 'FillPaint';
      _this.$stroke = 'StrokePaint';
      _this.$autoSetIn = true;
      return _this;
    }

    _createClass(Filter, [{
      key: "put",
      value: function put(element, i) {
        element = _get(_getPrototypeOf(Filter.prototype), "put", this).call(this, element, i);

        if (!element.attr('in') && this.$autoSetIn) {
          element.attr('in', this.$source);
        }

        if (!element.attr('result')) {
          element.attr('result', element.id());
        }

        return element;
      } // Unmask all masked elements and remove itself

    }, {
      key: "remove",
      value: function remove() {
        // unmask all targets
        this.targets().each('unfilter'); // remove mask from parent

        return _get(_getPrototypeOf(Filter.prototype), "remove", this).call(this);
      }
    }, {
      key: "targets",
      value: function targets() {
        return svg_js.find('svg [filter*="' + this.id() + '"]');
      }
    }, {
      key: "toString",
      value: function toString() {
        return 'url(#' + this.id() + ')';
      }
    }]);

    return Filter;
  }(svg_js.Element); // Create Effect class

  var Effect =
  /*#__PURE__*/
  function (_Element2) {
    _inherits(Effect, _Element2);

    function Effect(node) {
      var _this2;

      _classCallCheck(this, Effect);

      _this2 = _possibleConstructorReturn(this, _getPrototypeOf(Effect).call(this, node, node));

      _this2.result(_this2.id());

      return _this2;
    }

    _createClass(Effect, [{
      key: "in",
      value: function _in(effect) {
        // Act as getter
        if (effect == null) {
          var _in = this.attr('in');

          var ref = this.parent() && this.parent().find("[result=\"".concat(_in, "\"]"))[0];
          return ref || _in;
        } // Avr as setter


        return this.attr('in', effect);
      } // Named result

    }, {
      key: "result",
      value: function result(_result) {
        return this.attr('result', _result);
      } // Stringification

    }, {
      key: "toString",
      value: function toString() {
        return this.result();
      }
    }]);

    return Effect;
  }(svg_js.Element); // This function takes an array with attr keys and sets for every key the
  // attribute to the value of one paramater
  // getAttrSetter(['a', 'b']) becomes this.attr({a: param1, b: param2})


  var getAttrSetter = function getAttrSetter(params) {
    return function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      for (var i = params.length; i--;) {
        if (args[i] != null) {
          this.attr(params[i], args[i]);
        }
      }
    };
  };

  var updateFunctions = {
    blend: getAttrSetter(['in', 'in2', 'mode']),
    // ColorMatrix effect
    colorMatrix: getAttrSetter(['type', 'values']),
    // Composite effect
    composite: getAttrSetter(['in', 'in2', 'operator']),
    // ConvolveMatrix effect
    convolveMatrix: function convolveMatrix(matrix) {
      matrix = new svg_js.Array(matrix).toString();
      this.attr({
        order: Math.sqrt(matrix.split(' ').length),
        kernelMatrix: matrix
      });
    },
    // DiffuseLighting effect
    diffuseLighting: getAttrSetter(['surfaceScale', 'lightingColor', 'diffuseConstant', 'kernelUnitLength']),
    // DisplacementMap effect
    displacementMap: getAttrSetter(['in', 'in2', 'scale', 'xChannelSelector', 'yChannelSelector']),
    // DropShadow effect
    dropShadow: getAttrSetter(['in', 'dx', 'dy', 'stdDeviation']),
    // Flood effect
    flood: getAttrSetter(['flood-color', 'flood-opacity']),
    // Gaussian Blur effect
    gaussianBlur: function gaussianBlur() {
      var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : x;
      this.attr('stdDeviation', x + ' ' + y);
    },
    // Image effect
    image: function image(src) {
      this.attr('href', src, svg_js.namespaces.xlink);
    },
    // Morphology effect
    morphology: getAttrSetter(['operator', 'radius']),
    // Offset effect
    offset: getAttrSetter(['dx', 'dy']),
    // SpecularLighting effect
    specularLighting: getAttrSetter(['surfaceScale', 'lightingColor', 'diffuseConstant', 'specularExponent', 'kernelUnitLength']),
    // Tile effect
    tile: getAttrSetter([]),
    // Turbulence effect
    turbulence: getAttrSetter(['baseFrequency', 'numOctaves', 'seed', 'stitchTiles', 'type'])
  };
  var filterNames = ['blend', 'colorMatrix', 'componentTransfer', 'composite', 'convolveMatrix', 'diffuseLighting', 'displacementMap', 'dropShadow', 'flood', 'gaussianBlur', 'image', 'merge', 'morphology', 'offset', 'specularLighting', 'tile', 'turbulence']; // For every filter create a class

  filterNames.forEach(function (effect) {
    var name = svg_js.utils.capitalize(effect);
    var fn = updateFunctions[effect];

    Filter[name + 'Effect'] =
    /*#__PURE__*/
    function (_Effect) {
      _inherits(_class2, _Effect);

      function _class2(node) {
        _classCallCheck(this, _class2);

        return _possibleConstructorReturn(this, _getPrototypeOf(_class2).call(this, svg_js.nodeOrNew('fe' + name, node), node));
      } // This function takes all parameters from the factory call
      // and updates the attributes according to the updateFunctions


      _createClass(_class2, [{
        key: "update",
        value: function update(args) {
          fn.apply(this, args);
          return this;
        }
      }]);

      return _class2;
    }(Effect); // Add factory function to filter
    // Allow to pass a function or object
    // The attr object is catched from "wrapWithAttrCheck"


    Filter.prototype[effect] = svg_js.wrapWithAttrCheck(function (fn) {
      var effect = new Filter[name + 'Effect']();
      if (fn == null) return this.put(effect); // For Effects which can take children, a function is allowed

      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      if (typeof fn === 'function') {
        fn.call(effect, effect);
      } else {
        // In case it is not a function, add it to arguments
        args.unshift(fn);
      }

      return this.put(effect).update(args);
    });
  }); // Correct factories which are not that simple

  svg_js.extend(Filter, {
    merge: function merge(arrayOrFn) {
      var node = this.put(new Filter.MergeEffect()); // If a function was passed, execute it
      // That makes stuff like this possible:
      // filter.merge((mergeEffect) => mergeEffect.mergeNode(in))

      if (typeof arrayOrFn === 'function') {
        arrayOrFn.call(node, node);
        return node;
      } // Check if first child is an array, otherwise use arguments as array


      var children = arrayOrFn instanceof Array ? arrayOrFn : Array.prototype.slice.call(arguments);
      children.forEach(function (child) {
        if (child instanceof Filter.MergeNode) {
          node.put(child);
        } else {
          node.mergeNode(child);
        }
      });
      return node;
    },
    componentTransfer: function componentTransfer() {
      var components = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var node = this.put(new Filter.ComponentTransferEffect());

      if (typeof components === 'function') {
        components.call(node, node);
        return node;
      } // If no component is set, we use the given object for all components


      if (!components.r && !components.g && !components.b && !components.a) {
        var temp = components;
        components = {
          r: temp,
          g: temp,
          b: temp,
          a: temp
        };
      }

      for (var c in components) {
        // components[c] has to hold an attributes object
        node.add(new Filter['Func' + c.toUpperCase()](components[c]));
      }

      return node;
    }
  });
  var filterChildNodes = ['distantLight', 'pointLight', 'spotLight', 'mergeNode', 'FuncR', 'FuncG', 'FuncB', 'FuncA'];
  filterChildNodes.forEach(function (child) {
    var name = svg_js.utils.capitalize(child);

    Filter[name] =
    /*#__PURE__*/
    function (_Effect2) {
      _inherits(_class3, _Effect2);

      function _class3(node) {
        _classCallCheck(this, _class3);

        return _possibleConstructorReturn(this, _getPrototypeOf(_class3).call(this, svg_js.nodeOrNew('fe' + name, node), node));
      }

      return _class3;
    }(Effect);
  });
  var componentFuncs = ['funcR', 'funcG', 'funcB', 'funcA']; // Add an update function for componentTransfer-children

  componentFuncs.forEach(function (c) {
    var _class = Filter[svg_js.utils.capitalize(c)];
    var fn = svg_js.wrapWithAttrCheck(function () {
      return this.put(new _class());
    });
    Filter.ComponentTransferEffect.prototype[c] = fn;
  });
  var lights = ['distantLight', 'pointLight', 'spotLight']; // Add light sources factories to lightining effects

  lights.forEach(function (light) {
    var _class = Filter[svg_js.utils.capitalize(light)];
    var fn = svg_js.wrapWithAttrCheck(function () {
      return this.put(new _class());
    });
    Filter.DiffuseLightingEffect.prototype[light] = fn;
    Filter.SpecularLightingEffect.prototype[light] = fn;
  });
  svg_js.extend(Filter.MergeEffect, {
    mergeNode: function mergeNode(_in) {
      return this.put(new Filter.MergeNode()).attr('in', _in);
    }
  }); // add .filter function

  svg_js.extend(svg_js.Defs, {
    // Define filter
    filter: function filter(block) {
      var filter = this.put(new Filter());
      /* invoke passed block */

      if (typeof block === 'function') {
        block.call(filter, filter);
      }

      return filter;
    }
  });
  svg_js.extend(svg_js.Container, {
    // Define filter on defs
    filter: function filter(block) {
      return this.defs().filter(block);
    }
  });
  svg_js.extend(svg_js.Element, {
    // Create filter element in defs and store reference
    filterWith: function filterWith(block) {
      var filter = block instanceof Filter ? block : this.defs().filter(block);
      return this.attr('filter', filter);
    },
    // Remove filter
    unfilter: function unfilter(remove) {
      /* remove filter attribute */
      return this.attr('filter', null);
    },
    filterer: function filterer() {
      return this.reference('filter');
    }
  }); // chaining

  var chainingEffects = {
    // Blend effect
    blend: function blend(in2, mode) {
      return this.parent() && this.parent().blend(this, in2, mode); // pass this as the first input
    },
    // ColorMatrix effect
    colorMatrix: function colorMatrix(type, values) {
      return this.parent() && this.parent().colorMatrix(type, values)["in"](this);
    },
    // ComponentTransfer effect
    componentTransfer: function componentTransfer(components) {
      return this.parent() && this.parent().componentTransfer(components)["in"](this);
    },
    // Composite effect
    composite: function composite(in2, operator) {
      return this.parent() && this.parent().composite(this, in2, operator); // pass this as the first input
    },
    // ConvolveMatrix effect
    convolveMatrix: function convolveMatrix(matrix) {
      return this.parent() && this.parent().convolveMatrix(matrix)["in"](this);
    },
    // DiffuseLighting effect
    diffuseLighting: function diffuseLighting(surfaceScale, lightingColor, diffuseConstant, kernelUnitLength) {
      return this.parent() && this.parent().diffuseLighting(surfaceScale, diffuseConstant, kernelUnitLength)["in"](this);
    },
    // DisplacementMap effect
    displacementMap: function displacementMap(in2, scale, xChannelSelector, yChannelSelector) {
      return this.parent() && this.parent().displacementMap(this, in2, scale, xChannelSelector, yChannelSelector); // pass this as the first input
    },
    // DisplacementMap effect
    dropShadow: function dropShadow(x, y, stdDeviation) {
      return this.parent() && this.parent().dropShadow(this, x, y, stdDeviation)["in"](this); // pass this as the first input
    },
    // Flood effect
    flood: function flood(color, opacity) {
      return this.parent() && this.parent().flood(color, opacity); // this effect dont have inputs
    },
    // Gaussian Blur effect
    gaussianBlur: function gaussianBlur(x, y) {
      return this.parent() && this.parent().gaussianBlur(x, y)["in"](this);
    },
    // Image effect
    image: function image(src) {
      return this.parent() && this.parent().image(src); // this effect dont have inputs
    },
    // Merge effect
    merge: function merge(arg) {
      var _this$parent;

      arg = arg instanceof Array ? arg : _toConsumableArray(arg);
      return this.parent() && (_this$parent = this.parent()).merge.apply(_this$parent, [this].concat(_toConsumableArray(arg))); // pass this as the first argument
    },
    // Morphology effect
    morphology: function morphology(operator, radius) {
      return this.parent() && this.parent().morphology(operator, radius)["in"](this);
    },
    // Offset effect
    offset: function offset(dx, dy) {
      return this.parent() && this.parent().offset(dx, dy)["in"](this);
    },
    // SpecularLighting effect
    specularLighting: function specularLighting(surfaceScale, lightingColor, diffuseConstant, specularExponent, kernelUnitLength) {
      return this.parent() && this.parent().specularLighting(surfaceScale, diffuseConstant, specularExponent, kernelUnitLength)["in"](this);
    },
    // Tile effect
    tile: function tile() {
      return this.parent() && this.parent().tile()["in"](this);
    },
    // Turbulence effect
    turbulence: function turbulence(baseFrequency, numOctaves, seed, stitchTiles, type) {
      return this.parent() && this.parent().turbulence(baseFrequency, numOctaves, seed, stitchTiles, type)["in"](this);
    }
  };
  svg_js.extend(Effect, chainingEffects); // Effect-specific extensions

  svg_js.extend(Filter.MergeEffect, {
    "in": function _in(effect) {
      if (effect instanceof Filter.MergeNode) {
        this.add(effect, 0);
      } else {
        this.add(new Filter.MergeNode()["in"](effect), 0);
      }

      return this;
    }
  });
  svg_js.extend([Filter.CompositeEffect, Filter.BlendEffect, Filter.DisplacementMapEffect], {
    in2: function in2(effect) {
      if (effect == null) {
        var in2 = this.attr('in2');
        var ref = this.parent() && this.parent().find("[result=\"".concat(in2, "\"]"))[0];
        return ref || in2;
      }

      return this.attr('in2', effect);
    }
  }); // Presets

  Filter.filter = {
    sepiatone: [0.343, 0.669, 0.119, 0, 0, 0.249, 0.626, 0.130, 0, 0, 0.172, 0.334, 0.111, 0, 0, 0.000, 0.000, 0.000, 1, 0]
  };

  return Filter;

}(SVG));
//# sourceMappingURL=svg.filter.js.map
