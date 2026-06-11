// backend/controllers/enquiryController.js
// ─────────────────────────────────────────────────────────────
// Handles all enquiry-related logic.
//
// Public routes:
//   POST /api/enquiries        — create a new enquiry (any form)
//
// Admin-only routes:
//   GET  /api/enquiries        — list all enquiries with filters
//   GET  /api/enquiries/:id    — get single enquiry detail
//   PUT  /api/enquiries/:id    — update status or admin notes
//
// Filter options on GET /api/enquiries:
//   ?type=bulk_order|seller_application|contact|general|support
//   ?status=new|read|actioned|closed
//   ?resolved=true|false
//   ?search=name or email or business or message text
//   ?userId=mongoId — all enquiries from a specific user
// ─────────────────────────────────────────────────────────────
const Enquiry = require('../models/Enquiry');
const User    = require('../models/User');

// @desc    Create a new enquiry (from any form on the site)
// @route   POST /api/enquiries
// @access  Public
const createEnquiry = async (req, res) => {
  try {
    const {
      type,
      name,
      email,
      phone,
      business,
      message,
      data,
    } = req.body;

    // ── Basic validation ────────────────────────────────────
    if (!type || !name || !email) {
      return res.status(400).json({
        message: 'type, name, and email are required',
      });
    }

    // ── Build the enquiry document ──────────────────────────
    const enquiry = new Enquiry({
      type,
      name:     name.trim(),
      email:    email.trim().toLowerCase(),
      phone:    phone    || '',
      business: business || '',
      message:  message  || '',
      // Store the full form payload for future migration
      data:     data     || {},
      status:   'new',
      // If a logged-in user submitted this form, link to their account
      // req.user is set by authMiddleware when a JWT is present.
      // For public forms it will be undefined — that is fine.
      userId: req.user._id,
    });

const saved = await enquiry.save();

 // ── If this is a seller application from a logged-in user ──
    // Set sellerStatus to 'pending' AND upsert the User document
    // with all profile and seller-specific fields from the form.
    // This makes the User document the single source of truth —
    // not just the Enquiry data field.
    //
    // Fields updated on the User document:
    //   isSeller           — true, they have started the process
    //   sellerStatus       — pending, waiting for admin review
    //   phone              — if provided and not already set
    //   county             — if provided and not already set
    //   businessName       — top-level user field
    //   businessType       — always 'business' for seller applicants
    //   sellerProfile.*    — seller-specific sub-document fields
    if (type === 'seller_application' && req.user) {
      // Build the update object — only overwrite fields that have
      // values in the form so we never blank out existing profile data
      const userUpdate = {
        isSeller:     true,
        sellerStatus: 'pending',
        businessType: 'business',
      };

      // Top-level profile fields — only set if the form provided them
      // and the user hasn't already set them on their profile
      if (req.body.business) userUpdate.businessName = req.body.business.trim();
      if (req.body.phone)    userUpdate.phone        = req.body.phone.trim();

      // County comes from the data payload (structured form field)
      if (data?.county) userUpdate.county = data.county.trim();

      // Seller profile sub-document — these fields only exist here
      // They are set regardless of whether they existed before because
      // this application form is the canonical source for seller data
      userUpdate['sellerProfile.businessName']    = req.body.business?.trim() || '';
      userUpdate['sellerProfile.description']     = data?.description?.trim()  || '';
      if (data?.kraPin)      userUpdate['sellerProfile.kraPin']       = data.kraPin.trim();
      if (data?.mpesaNumber) userUpdate['sellerProfile.mpesaNumber']  = data.mpesaNumber.trim();

      await User.findByIdAndUpdate(
        req.user._id,
        { $set: userUpdate },
        { new: true }
      );
    }

    res.status(201).json({
      message: 'Enquiry received. We will be in touch within 24 hours.',
      id: saved._id,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all enquiries with optional filters (admin only)
// @route   GET /api/enquiries
// @access  Private/Admin
const getEnquiries = async (req, res) => {
  try {
    const filter = {};

    // ── Filter by type ──────────────────────────────────────
    // e.g. ?type=bulk_order
    if (req.query.type) {
      filter.type = req.query.type;
    }

    // ── Filter by status ────────────────────────────────────
    // e.g. ?status=new
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // ── Filter resolved vs unresolved ───────────────────────
    // ?resolved=true  → resolvedAt is not null
    // ?resolved=false → resolvedAt is null
    if (req.query.resolved === 'true') {
      filter.resolvedAt = { $ne: null };
    } else if (req.query.resolved === 'false') {
      filter.resolvedAt = null;
    }

    // ── Filter by user ───────────────────────────────────────
    // Used on the admin user detail page to show all enquiries
    // submitted by a specific registered user.
    // e.g. ?userId=64abc...
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }

    // ── Text search across key fields ────────────────────────
    // Searches name, email, business, and message using
    // case-insensitive regex. This powers the admin search bar.
    if (req.query.search) {
      const regex = { $regex: req.query.search, $options: 'i' };
      filter.$or = [
        { name:     regex },
        { email:    regex },
        { business: regex },
        { message:  regex },
      ];
    }

    // ── Fetch and sort newest first ──────────────────────────
    const enquiries = await Enquiry.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email'); // show user name/email if linked

    res.json(enquiries);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single enquiry by ID (admin only)
// @route   GET /api/enquiries/:id
// @access  Private/Admin
const getEnquiryById = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id)
      .populate('userId', 'name email');

    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    res.json(enquiry);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update enquiry status or admin notes (admin only)
// @route   PUT /api/enquiries/:id
// @access  Private/Admin
const updateEnquiry = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    // ── Update status ────────────────────────────────────────
    if (status) {
      enquiry.status = status;

      // If being marked closed, record who resolved it and when
      if (status === 'closed' && !enquiry.resolvedAt) {
        enquiry.resolvedAt = new Date();
        enquiry.resolvedBy = req.user._id;
      }

      // If being re-opened after close, clear resolution fields
      if (status !== 'closed') {
        enquiry.resolvedAt = null;
        enquiry.resolvedBy = null;
      }
    }

    // ── Update admin notes ───────────────────────────────────
    // Admin notes are internal only — never shown to the submitter
    if (adminNotes !== undefined) {
      enquiry.adminNotes = adminNotes;
    }

    const updated = await enquiry.save();
    res.json(updated);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Exports ───────────────────────────────────────────────────
module.exports = {
  createEnquiry,
  getEnquiries,
  getEnquiryById,
  updateEnquiry,
};