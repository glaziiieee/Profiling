// routes/api.js
const express = require('express');
const barangayController = require('../controllers/barangay');

const router = express.Router();

// Barangay profile routes
router.get('/profiles', barangayController.getAllProfiles);
router.get('/profiles/:id', barangayController.getProfileById);
router.post('/profiles', barangayController.createProfile);
router.put('/profiles/:id', barangayController.updateProfile);
router.delete('/profiles/:id', barangayController.deleteProfile);

// Demographics statistics route
router.get('/profile/stats', barangayController.getStats);

// Health check route
router.get('/health', barangayController.checkHealth);

module.exports = router;