import { promisify } from 'util';
import { createClient } from 'redis';

/**
 * Represents a client for Redis database.
 */
class RedisClient {
    /**
     * Initializes a new instance of RedisClient.
     */
    constructor() {
        this.client = createClient();
        this.isConnected = true;
        this.client.on('error', (error) => {
            console.error('Failed to connect to Redis client:', error.message || error.toString());
            this.isConnected = false;
        });
        this.client.on('connect', () => {
            this.isConnected = true;
        });
    }

    /**
     * Checks if the connection to the Redis server is active.
     * @returns {boolean}
     */
    isAlive() {
        return this.isConnected;
    }

    /**
     * Fetches the value associated with a specified key.
     * @param {String} key The key of the item to fetch.
     * @returns {String | Object}
     */
    async get(key) {
        return promisify(this.client.GET).bind(this.client)(key);
    }

    /**
     * Saves a key-value pair with an expiration time.
     * @param {String} key The key of the item to save.
     * @param {String | Number | Boolean} value The value to save.
     * @param {Number} duration The expiration duration in seconds.
     * @returns {Promise<void>}
     */
    async set(key, value, duration) {
        await promisify(this.client.SETEX)
          .bind(this.client)(key, duration, value);
    }

    /**
     * Deletes the value associated with a specified key.
     * @param {String} key The key of the item to delete.
     * @returns {Promise<void>}
     */
    async del(key) {
        await promisify(this.client.DEL).bind(this.client)(key);
    }
}

export const redisClient = new RedisClient();
export default redisClient;
