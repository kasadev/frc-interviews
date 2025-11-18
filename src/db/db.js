const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

// Read data from file
async function readData(collection) {
  const filePath = path.join(DATA_DIR, `${collection}.json`);

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty array
      return [];
    }
    throw error;
  }
}

// Write data to file
async function writeData(collection, data) {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, `${collection}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Database facade for file-based storage
 */
class Database {
  /**
   * Find all records in a collection
   * @param {string} collection - Collection name
   * @returns {Promise<Array>}
   */
  async findAll(collection) {
    return await readData(collection);
  }

  /**
   * Find records matching filter criteria
   * @param {string} collection - Collection name
   * @param {Object} filter - Filter object (key-value pairs)
   * @returns {Promise<Array>}
   */
  async find(collection, filter = {}) {
    const data = await readData(collection);

    if (Object.keys(filter).length === 0) {
      return data;
    }

    return data.filter(record => {
      return Object.entries(filter).every(([key, value]) => {
        return record[key] === value;
      });
    });
  }

  /**
   * Find a single record matching filter criteria
   * @param {string} collection - Collection name
   * @param {Object} filter - Filter object (key-value pairs)
   * @returns {Promise<Object|null>}
   */
  async findOne(collection, filter) {
    const data = await readData(collection);

    return data.find(record => {
      return Object.entries(filter).every(([key, value]) => {
        return record[key] === value;
      });
    }) || null;
  }

  /**
   * Find record by ID
   * @param {string} collection - Collection name
   * @param {string} id - Record ID
   * @returns {Promise<Object|null>}
   */
  async findById(collection, id) {
    const data = await readData(collection);
    const idField = this.getIdField(collection);
    return data.find(record => record[idField] === id) || null;
  }

  /**
   * Insert a new record
   * @param {string} collection - Collection name
   * @param {Object} record - Record to insert
   * @returns {Promise<Object>}
   */
  async insert(collection, record) {
    const data = await readData(collection);
    data.push(record);
    await writeData(collection, data);
    return record;
  }

  /**
   * Update a record by ID
   * @param {string} collection - Collection name
   * @param {string} id - Record ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>}
   */
  async update(collection, id, updates) {
    const data = await readData(collection);
    const idField = this.getIdField(collection);
    const index = data.findIndex(record => record[idField] === id);

    if (index === -1) {
      return null;
    }

    data[index] = { ...data[index], ...updates };
    await writeData(collection, data);
    return data[index];
  }

  /**
   * Delete a record by ID
   * @param {string} collection - Collection name
   * @param {string} id - Record ID
   * @returns {Promise<boolean>}
   */
  async delete(collection, id) {
    const data = await readData(collection);
    const idField = this.getIdField(collection);
    const filteredData = data.filter(record => record[idField] !== id);

    if (filteredData.length === data.length) {
      return false; // No record was deleted
    }

    await writeData(collection, filteredData);
    return true;
  }

  /**
   * Delete all records matching filter
   * @param {string} collection - Collection name
   * @param {Object} filter - Filter object
   * @returns {Promise<number>} - Number of records deleted
   */
  async deleteMany(collection, filter) {
    const data = await readData(collection);
    const filteredData = data.filter(record => {
      return !Object.entries(filter).every(([key, value]) => {
        return record[key] === value;
      });
    });

    const deletedCount = data.length - filteredData.length;

    if (deletedCount > 0) {
      await writeData(collection, filteredData);
    }

    return deletedCount;
  }

  /**
   * Get the ID field name for a collection
   * @param {string} collection - Collection name
   * @returns {string}
   */
  getIdField(collection) {
    const idMap = {
      'rates': 'rate_id',
      'properties': 'property_id',
      'room_types': 'room_type_id',
      'units': 'unit_id',
      'bookings': 'booking_id'
    };
    return idMap[collection] || 'id';
  }

  /**
   * Initialize seed data if collections are empty
   */
  async seed() {
    const collections = ['properties', 'room_types', 'units', 'rates', 'bookings'];

    for (const collection of collections) {
      const data = await readData(collection);
      if (data.length === 0) {
        const seedData = require('./seed')[collection];
        if (seedData && seedData.length > 0) {
          await writeData(collection, seedData);
        }
      }
    }
  }
}

module.exports = new Database();
