// implementation
import Redis from "ioredis";

export class RedisCacheProvider {
  client;

  constructor(config) {
    this.client = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      lazyConnect: true,
      maxLoadingRetryTime: 3
    });
    // for any error caused in redis cache server
    this.client.on('error', (err) => {
      console.log('[RedisCacheProvider] RedisCacheProvider Error: ', err.message);
    });
    // for errors in case connect function
    this.client.connect().catch(err => console.log('fail to connect to redis'));
  }

  async set(key, value, ttl) {
    return this.client.set(key, value, 'EX', ttl);
  }

  async get(key) {
    return this.client.get(key);
  }

  async del(key) {
    return this.client.del(key);
  }


  async ttl(key) {
    return this.client.ttl(key);
  }
}