import axios from 'axios';
import crypto from 'crypto-js';
import _ from 'lodash';

const isMissing = (param) => {
    throw new Error(`Missing parameter "${param}"`);
};

class BFXRest {

  /**
   * constructor
   *
   * @param {object} required (API_KEY, API_SECRET)
   */
  constructor({
    API_KEY,
    API_SECRET
  }) {
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
  _nonce() {
    return new Date().getTime();
  }


  /**
   * _authReq - Make request params and headers
   *
   * @param  {string} path    Path to api endpoint
   * @param  {object} params  Params for post request
   * @return {promise}        Request promise
   */
  _authReq(path, params) {
    const url = `${this.baseUrl}/${this.version}/${path}`;

    const body = {
      request: `/${this.version}/${path}`,
      nonce: JSON.stringify(this._nonce())
    };

    if (!_.isEmpty(params)) {
      _.map(params, (paramVal, paramKey) => { body[paramKey] = paramVal; })
    }

    const payload = new Buffer(JSON.stringify(body)).toString('base64');

    const signature = crypto.HmacSHA384(payload, this.apiSecret).toString(crypto.enc.Hex);

    const headers = {
      'X-BFX-APIKEY': this.apiKey,
      'X-BFX-PAYLOAD': payload,
      'X-BFX-SIGNATURE': signature
    };

    return axios.post(url, {}, {
      headers
    })
    .then(({ data }) => {
      if (data.message) {
        throw new Error(data.message);
      }

      return data;
    });
  }

  _pubReq(path, params = {}) {
    const url = `${this.baseUrl}/${this.version}/${path}`;

    return axios.get(url, {
      params
    });
  }

  /**
   * balance - Current balance of wallets
   *
   * @return {array}  Array of wallets
   */
  walletBalance() {
    return this._authReq('balances');
  }

  newOrder({
    symbol = isMissing('symbol'),
    amount = isMissing('amount'),
    price = isMissing('price'),
    exchange = isMissing('exchange'),
    side = isMissing('side'),
    type = isMissing('type'),
    post_only = false,
    is_hidden = false
  } = {}) {

    const params = {
      symbol,
      amount,
      price,
      exchange,
      side,
      type,
      post_only,
      is_hidden
    };

    return this._authReq('order/new', params);
  }

  newMultipleOrders({
    orders = isMissing('orders')
  } = {}) {

    if (_.isEmpty(orders) || !_.isArray(orders)) {
      throw new Error('Orders is empty or is not array');
    }

    const params = {
      orders
    };

    return this._authReq('order/new/multi', params);
  }

  cancelOrder({
    order_id = isMissing('order_id')
  } = {}) {

    const params = {
      order_id
    };

    return this._authReq('order/cancel', params);
  }

  cancelMultipleOrders({
    orders = isMissing('orders')
  } = {}) {

    const params = {
      order_ids: _.map(orders, order => +order.id)
    };

    return this._authReq('order/cancel/multi', params);
  }

  cancelAllOrders() {
    return this._authReq('order/cancel/all');
  }

  activeOrders() {
    return this._authReq('orders');
  }

  ordersHistory() {
    return this._authReq('orders/hist');
  }

  ticker(symbol) {
    return this._pubReq(`pubticker/${symbol}`);
  }

  symbols() {
    return this._pubReq(`symbols`);
  }

  symbolDitails() {
    return this._pubReq(`symbols_details`);
  }

  trades(symbol) {
    return this._pubReq(`trades/${symbol}`);
  }

  stats(symbol) {
    return this._pubReq(`stats/${symbol}`);
  }
};

export default BFXRest;
