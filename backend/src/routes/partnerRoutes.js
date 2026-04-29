const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  applyPartner, getMyApplication, getMyEbooks, createPartnerEbook, getPartnerStats,
  getAllApplications, approveApplication, rejectApplication,
  getPendingEbooks, approveEbook, rejectEbook,
} = require('../controllers/partnerController');

// ===== USER / PARTNER routes =====
router.post('/apply',          protect, applyPartner);
router.get('/application',     protect, getMyApplication);
router.get('/my-ebooks',       protect, getMyEbooks);
router.post('/ebooks',         protect, createPartnerEbook);
router.get('/stats',           protect, getPartnerStats);

// ===== ADMIN routes =====
router.get('/admin/applications',              protect, adminOnly, getAllApplications);
router.put('/admin/applications/:id/approve',  protect, adminOnly, approveApplication);
router.put('/admin/applications/:id/reject',   protect, adminOnly, rejectApplication);
router.get('/admin/ebooks/pending',            protect, adminOnly, getPendingEbooks);
router.put('/admin/ebooks/:id/approve',        protect, adminOnly, approveEbook);
router.put('/admin/ebooks/:id/reject',         protect, adminOnly, rejectEbook);

module.exports = router;
