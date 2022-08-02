// @ts-nocheck
import { fabric } from '../../HEADER';

/**
 * Rectangle class
 * @class fabric.Rect
 * @extends fabric.Object
 * @return {fabric.Rect} thisArg
 * @see {@link fabric.Rect#initialize} for constructor definition
 */
export const Rect = fabric.util.createClass(fabric.Object, /** @lends fabric.Rect.prototype */ {

  /**
   * List of properties to consider when checking if state of an object is changed ({@link fabric.Object#hasStateChanged})
   * as well as for history (undo/redo) purposes
   * @type Array
   */
  stateProperties: fabric.Object.prototype.stateProperties.concat('rx', 'ry'),

  /**
   * Type of an object
   * @type String
   * @default
   */
  type: 'rect',

  /**
   * Horizontal border radius
   * @type Number
   * @default
   */
  rx:   0,

  /**
   * Vertical border radius
   * @type Number
   * @default
   */
  ry:   0,

  cacheProperties: fabric.Object.prototype.cacheProperties.concat('rx', 'ry'),

  /**
   * Constructor
   * @param {Object} [options] Options object
   * @return {Object} thisArg
   */
  initialize: function(options) {
    this.callSuper('initialize', options);
    this._initRxRy();
  },

  /**
   * Initializes rx/ry attributes
   * @private
   */
  _initRxRy: function() {
    if (this.rx && !this.ry) {
      this.ry = this.rx;
    }
    else if (this.ry && !this.rx) {
      this.rx = this.ry;
    }
  },

  /**
   * @private
   * @param {CanvasRenderingContext2D} ctx Context to render on
   */
  _render: function(ctx) {

    // 1x1 case (used in spray brush) optimization was removed because
    // with caching and higher zoom level this makes more damage than help

    const rx = this.rx ? Math.min(this.rx, this.width / 2) : 0,
        ry = this.ry ? Math.min(this.ry, this.height / 2) : 0,
        w = this.width,
        h = this.height,
        x = -this.width / 2,
        y = -this.height / 2,
        isRounded = rx !== 0 || ry !== 0,
        /* "magic number" for bezier approximations of arcs (http://itc.ktu.lt/itc354/Riskus354.pdf) */
        k = 1 - 0.5522847498;
    ctx.beginPath();

    ctx.moveTo(x + rx, y);

    ctx.lineTo(x + w - rx, y);
    isRounded && ctx.bezierCurveTo(x + w - k * rx, y, x + w, y + k * ry, x + w, y + ry);

    ctx.lineTo(x + w, y + h - ry);
    isRounded && ctx.bezierCurveTo(x + w, y + h - k * ry, x + w - k * rx, y + h, x + w - rx, y + h);

    ctx.lineTo(x + rx, y + h);
    isRounded && ctx.bezierCurveTo(x + k * rx, y + h, x, y + h - k * ry, x, y + h - ry);

    ctx.lineTo(x, y + ry);
    isRounded && ctx.bezierCurveTo(x, y + k * ry, x + k * rx, y, x + rx, y);

    ctx.closePath();

    this._renderPaintInOrder(ctx);
  },

  /**
   * Returns object representation of an instance
   * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
   * @return {Object} object representation of an instance
   */
  toObject: function(propertiesToInclude) {
    return this.callSuper('toObject', ['rx', 'ry'].concat(propertiesToInclude));
  },

  /* _TO_SVG_START_ */
  /**
   * Returns svg representation of an instance
   * @return {Array} an array of strings with the specific svg representation
   * of the instance
   */
  _toSVG: function() {
    const x = -this.width / 2, y = -this.height / 2;
    return [
      '<rect ', 'COMMON_PARTS',
      'x="', x, '" y="', y,
      '" rx="', this.rx, '" ry="', this.ry,
      '" width="', this.width, '" height="', this.height,
      '" />\n'
    ];
  },
  /* _TO_SVG_END_ */
});

/* _FROM_SVG_START_ */
/**
 * List of attribute names to account for when parsing SVG element (used by `fabric.Rect.fromElement`)
 * @static
 * @memberOf fabric.Rect
 * @see: http://www.w3.org/TR/SVG/shapes.html#RectElement
 */
Rect.ATTRIBUTE_NAMES = fabric.SHARED_ATTRIBUTES.concat('x y rx ry width height'.split(' '));

/**
 * Returns {@link fabric.Rect} instance from an SVG element
 * @static
 * @memberOf fabric.Rect
 * @param {SVGElement} element Element to parse
 * @param {Function} callback callback function invoked after parsing
 * @param {Object} [options] Options object
 */
Rect.fromElement = function(element, callback, options) {
  if (!element) {
    return callback(null);
  }
  options = options || { };

  const { left = 0, top = 0, width = 0, height = 0, ...otherAttrubtes } = fabric.parseAttributes(element, Rect.ATTRIBUTE_NAMES);
  const rect = new Rect({
    ...options,
    left,
    top,
    width,
    height,
    ...otherAttrubtes,
    visible: width > 0 && height > 0,
  });
  callback(rect);
};
/* _FROM_SVG_END_ */

/**
 * Returns {@link fabric.Rect} instance from an object representation
 * @static
 * @memberOf fabric.Rect
 * @param {Object} object Object to create an instance from
 * @returns {Promise<fabric.Rect>}
 */
Rect.fromObject = function(object) {
  return fabric.Object._fromObject(Rect, object);
};

fabric.Rect = Rect;
