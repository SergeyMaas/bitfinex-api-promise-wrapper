'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _cryptoJs = require('crypto-js');

var _cryptoJs2 = _interopRequireDefault(_cryptoJs);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isMissing = function isMissing(param) {
  throw new Error('Missing parameter "' + param + '"');
};

var BFXRest = function () {

  /**
   * constructor
   *
   * @param {object} required (API_KEY, API_SECRET)
   */
  function BFXRest(_ref) {
    var API_KEY = _ref.API_KEY,
        API_SECRET = _ref.API_SECRET;
    (0, _classCallCheck3.default)(this, BFXRest);

    this.apiKey = API_KEY;
    this.apiSecret = API_SECRET;
    this.version = 'v1';
    this.baseUrl = 'https://api.bitfinex.com';
  }

  /**
   * _nonce - Nonce generator
   *
   * @return {number}  Incremented nonce
   */


  (0, _createClass3.default)(BFXRest, [{
    key: '_nonce',
    value: function _nonce() {
      return new Date().getTime();
    }

    /**
     * _authReq - Make request params and headers
     *
     * @param  {string} path    Path to api endpoint
     * @param  {object} params  Params for post request
     * @return {promise}        Request promise
     */

  }, {
    key: '_authReq',
    value: function _authReq(path, params) {
      var url = this.baseUrl + '/' + this.version + '/' + path;

      var body = {
        request: '/' + this.version + '/' + path,
        nonce: (0, _stringify2.default)(this._nonce())
      };

      if (!_lodash2.default.isEmpty(params)) {
        _lodash2.default.map(params, function (paramVal, paramKey) {
          body[paramKey] = paramVal;
        });
      }

      var payload = new Buffer((0, _stringify2.default)(body)).toString('base64');

      var signature = _cryptoJs2.default.HmacSHA384(payload, this.apiSecret).toString(_cryptoJs2.default.enc.Hex);

      var headers = {
        'X-BFX-APIKEY': this.apiKey,
        'X-BFX-PAYLOAD': payload,
        'X-BFX-SIGNATURE': signature
      };

      return _axios2.default.post(url, {}, {
        headers: headers
      }).then(function (_ref2) {
        var data = _ref2.data;

        if (data.message) {
          throw new Error(data.message);
        }

        return data;
      });
    }
  }, {
    key: '_pubReq',
    value: function _pubReq(path) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var url = this.baseUrl + '/' + this.version + '/' + path;

      return _axios2.default.get(url, {
        params: params
      }).then(function (_ref3) {
        var data = _ref3.data;

        if (data.message) {
          throw new Error(data.message);
        }

        return data;
      });
    }

    /**
     * balance - Current balance of wallets
     *
     * @return {array}  Array of wallets
     */

  }, {
    key: 'walletBalance',
    value: function walletBalance() {
      return this._authReq('balances');
    }
  }, {
    key: 'newOrder',
    value: function newOrder() {
      var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref4$symbol = _ref4.symbol,
          symbol = _ref4$symbol === undefined ? isMissing('symbol') : _ref4$symbol,
          _ref4$amount = _ref4.amount,
          amount = _ref4$amount === undefined ? isMissing('amount') : _ref4$amount,
          _ref4$price = _ref4.price,
          price = _ref4$price === undefined ? isMissing('price') : _ref4$price,
          _ref4$exchange = _ref4.exchange,
          exchange = _ref4$exchange === undefined ? isMissing('exchange') : _ref4$exchange,
          _ref4$side = _ref4.side,
          side = _ref4$side === undefined ? isMissing('side') : _ref4$side,
          _ref4$type = _ref4.type,
          type = _ref4$type === undefined ? isMissing('type') : _ref4$type,
          _ref4$post_only = _ref4.post_only,
          post_only = _ref4$post_only === undefined ? false : _ref4$post_only,
          _ref4$is_hidden = _ref4.is_hidden,
          is_hidden = _ref4$is_hidden === undefined ? false : _ref4$is_hidden;

      var params = {
        symbol: symbol,
        amount: amount,
        price: price,
        exchange: exchange,
        side: side,
        type: type,
        post_only: post_only,
        is_hidden: is_hidden
      };

      return this._authReq('order/new', params);
    }
  }, {
    key: 'newMultipleOrders',
    value: function newMultipleOrders() {
      var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref5$orders = _ref5.orders,
          orders = _ref5$orders === undefined ? isMissing('orders') : _ref5$orders;

      if (_lodash2.default.isEmpty(orders) || !_lodash2.default.isArray(orders)) {
        throw new Error('Orders is empty or is not array');
      }

      var params = {
        orders: orders
      };

      return this._authReq('order/new/multi', params);
    }
  }, {
    key: 'cancelOrder',
    value: function cancelOrder() {
      var _ref6 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref6$order_id = _ref6.order_id,
          order_id = _ref6$order_id === undefined ? isMissing('order_id') : _ref6$order_id;

      var params = {
        order_id: order_id
      };

      return this._authReq('order/cancel', params);
    }
  }, {
    key: 'cancelMultipleOrders',
    value: function cancelMultipleOrders() {
      var _ref7 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref7$orders = _ref7.orders,
          orders = _ref7$orders === undefined ? isMissing('orders') : _ref7$orders;

      var params = {
        order_ids: _lodash2.default.map(orders, function (order) {
          return +order.id;
        })
      };

      return this._authReq('order/cancel/multi', params);
    }
  }, {
    key: 'cancelAllOrders',
    value: function cancelAllOrders() {
      return this._authReq('order/cancel/all');
    }
  }, {
    key: 'activeOrders',
    value: function activeOrders() {
      return this._authReq('orders');
    }
  }, {
    key: 'ordersHistory',
    value: function ordersHistory() {
      return this._authReq('orders/hist');
    }
  }, {
    key: 'ticker',
    value: function ticker(symbol) {
      return this._pubReq('pubticker/' + symbol);
    }
  }, {
    key: 'symbols',
    value: function symbols() {
      return this._pubReq('symbols');
    }
  }, {
    key: 'symbolDitails',
    value: function symbolDitails() {
      return this._pubReq('symbols_details');
    }
  }, {
    key: 'trades',
    value: function trades(symbol) {
      return this._pubReq('trades/' + symbol);
    }
  }, {
    key: 'stats',
    value: function stats(symbol) {
      return this._pubReq('stats/' + symbol);
    }
  }]);
  return BFXRest;
}();

;

exports.default = BFXRest;