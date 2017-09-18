# bitfinex-api-promise-wrapper
wrapper for bitfinex api with promise

## Install

```
npm i bitfinex-api-promise-wrapper --save
```

## Import

```javascript
import BFX from 'bitfinex-api-promise-wrapper'
```

## Setup

```javascript
const bfx = new BFX({
  API_KEY: YOUR_API_KEY,
  API_SECRET: YOUR_API_SECRET
})
```

## Usage

```javascript
// tiker
bfx.ticker('ethbtc')
  .then(data => console.log(data)) // ticker data
  .catch(console.error)
  
// wallet balance
bfx.walletBalance()
  .then(data => console.log(data)) // wallet data
  .catch(console.error)
```
