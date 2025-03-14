// server/scripts/sample-data.js
require('dotenv').config();
const redis = require('redis');
const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid');

// Sample data
const sampleProfiles = [
  {
    name: "Barangay San Miguel",
    province: "Metro Manila",
    population: 5000,
    budget: 1000000,
    captain: "Juan Dela Cruz",
    demographics: {
      gender: {
        male: 2300,
        female: 2700
      },
      employment: {
        employed: 3200,
        unemployed: 1800
      },
      fourPs: {
        members: 800,
        nonMembers: 4200
      }
    }
  },
  {
    name: "Barangay Poblacion",
    province: "Cebu",
    population: 7200,
    budget: 1500000,
    captain: "Maria Santos",
    demographics: {
      gender: {
        male: 3450,
        female: 3750
      },
      employment: {
        employed: 5040,
        unemployed: 2160
      },
      fourPs: {
        members: 1200,
        nonMembers: 6000
      }
    }
  },
  {
    name: "Barangay Mabuhay",
    province: "Davao",
    population: 3800,
    budget: 850000,
    captain: "Pedro Reyes",
    demographics: {
      gender: {
        male: 1900,
        female: 1900
      },
      employment: {
        employed: 2500,
        unemployed: 1300
      },
      fourPs: {
        members: 950,
        nonMembers: 2850
      }
    }
  },
  {
    name: "Barangay Nueva",
    province: "Iloilo",
    population: 2900,
    budget: 720000,
    captain: "Ana Villanueva",
    demographics: {
      gender: {
        male: 1400,
        female: 1500
      },
      employment: {
        employed: 1800,
        unemployed: 1100
      },
      fourPs: {
        members: 700,
        nonMembers: 2200
      }
    }
  },
  {
    name: "Barangay Bagong Silang",
    province: "Pampanga",
    population: 4300,
    budget: 950000,
    captain: "Roberto Garcia",
    demographics: {
      gender: {
        male: 2100,
        female: 2200
      },
      employment: {
        employed: 2800,
        unemployed: 1500
      },
      fourPs: {
        members: 900,
        nonMembers: 3400
      }
    }
  }
];

async function populateRedis() {
  console.log('Connecting to Redis...');
  
  const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
    process.exit(1);
  });

  try {
    // Connect to Redis
    await redisClient.connect();
    console.log('Connected to Redis successfully');

    // Clear existing data
    console.log('Clearing existing data...');
    const existingKeys = await redisClient.keys('profile:*');
    if (existingKeys && existingKeys.length > 0) {
      for (const key of existingKeys) {
        await redisClient.del(key);
      }
      console.log(`Cleared ${existingKeys.length} existing profiles`);
    }

    // Insert sample data
    console.log('Inserting sample profiles...');
    for (const profile of sampleProfiles) {
      const id = uuidv4();
      const profileWithId = { 
        _id: id,
        ...profile
      };
      
      await redisClient.set(`profile:${id}`, JSON.stringify(profileWithId));
      console.log(`Inserted: ${profile.name} with ID ${id}`);
    }

    console.log('Sample data population complete!');
    
    // Close Redis connection
    await redisClient.quit();
  } catch (error) {
    console.error('Error populating Redis:', error);
    process.exit(1);
  }
}

// Run the script
populateRedis();