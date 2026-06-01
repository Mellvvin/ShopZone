// frontend/src/pages/AdminProductEditPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Admin product create / edit form.
//
// Confirm modal behaviour:
//   - On load, every field is snapshotted into originalSnapshot ref.
//   - On save, current values are diffed against the snapshot.
//   - One modal lists all changes. After save, snapshot advances.
//   - If nothing changed, save runs silently.
//
// Fixes applied:
//   - config object moved inside executeSave (no stale token risk)
//   - Field-level error highlighting via fieldErrors state
//   - Tag count capped at 15 with frontend warning
//   - Description and name diffs show truncated previews
//   - Help modals use infoOnly prop (no cancel button)
//   - Legacy unit dropdown labelled to avoid admin confusion
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Form, Button, Card, Alert,
  Spinner, Row, Col, Image,
} from 'react-bootstrap';
import { FaQuestionCircle } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import axios from 'axios';
import { showToast } from '../components/Toast/Toast';
import './AdminProductEditPage.css';

// ── Constants ─────────────────────────────────────────────────
const CATEGORIES = [
  'Electronics','Fashion & Apparel','Fabric & Textiles','Home & Kitchen',
  'Food & Grocery','Beauty & Personal Care','Hardware & Tools',
  'Office & Stationery','Agriculture & Garden','Baby & Kids',
  'Sports & Outdoors','Health & Wellness','General Merchandise',
];

const CATEGORY_TAGS = {
  'Electronics':            ['electronics','gadgets','wholesale','bulk','accessories','cables','tech'],
  'Fashion & Apparel':      ['fashion','clothing','wholesale','bulk','apparel','garments','uniforms'],
  'Fabric & Textiles':      ['fabric','textiles','wholesale','bulk','material','cotton','thread'],
  'Home & Kitchen':         ['home','kitchen','household','wholesale','bulk','utensils','cookware'],
  'Food & Grocery':         ['food','grocery','wholesale','bulk','packaged','beverages','staples'],
  'Beauty & Personal Care': ['beauty','cosmetics','wholesale','bulk','skincare','haircare','grooming'],
  'Hardware & Tools':       ['hardware','tools','wholesale','bulk','industrial','construction','fittings'],
  'Office & Stationery':    ['office','stationery','wholesale','bulk','school','supplies','paper'],
  'Agriculture & Garden':   ['agriculture','garden','wholesale','bulk','farming','seeds','fertiliser'],
  'Baby & Kids':            ['baby','kids','children','wholesale','bulk','toys','feeding'],
  'Sports & Outdoors':      ['sports','outdoor','wholesale','bulk','fitness','equipment','activewear'],
  'Health & Wellness':      ['health','wellness','wholesale','bulk','supplements','vitamins','hygiene'],
  'General Merchandise':    ['general','merchandise','wholesale','bulk','variety','assorted'],
};

const UNIT_HINTS = {
  'Per Unit': 'Single item — e.g. one phone, one chair',
  'Bale':     'Compressed bundle — e.g. 50 pieces of fabric per bale',
  'Carton':   'Sealed box — e.g. 24 tins per carton',
  'Dozen':    '12 pieces per dozen',
  'Kg':       'Price per kilogram — e.g. maize flour, sugar',
  'Box':      'Open box — e.g. 100 pens per box',
  'Sack':     'Large bag — e.g. 50kg sack of rice',
  'Roll':     'Roll of material — e.g. fabric, wire, polythene sheet',
  'Litre':    'Price per litre — e.g. cooking oil, paint',
  'Pallet':   'Full pallet load — for very large bulk orders',
  'Piece':    'Individual piece within a larger unit',
  'Pack':     'Sealed multi-item pack — e.g. pack of 5 notebooks',
};

const LEAD_TIME_OPTIONS = [
  { value: '',  label: 'Not specified' },
  { value: 1,   label: '1 day' },
  { value: 2,   label: '2 days' },
  { value: 3,   label: '3 days' },
  { value: 5,   label: '5 days' },
  { value: 7,   label: '7 days' },
  { value: 10,  label: '10 days' },
  { value: 14,  label: '14 days' },
  { value: 21,  label: '21 days' },
  { value: 30,  label: '30 days' },
];

const INVALID_NAMES = [
  'new product','sample product','product name','enter product name','draft product',
];

// ── Max tags allowed per product ──────────────────────────────
const MAX_TAGS = 15;

// ── Field help content ────────────────────────────────────────
const FIELD_HELP = {
  name:        { title: 'Product Name',           body: 'The public name buyers see on listings and search results. Use a clear, descriptive name. Required before saving.' },
  brand:       { title: 'Brand',                  body: 'The manufacturer or supplier brand name, e.g. Unilever, Bidco, Samsung. Used on the Brands page and in brand filtering. Leave blank if no specific brand.' },
  price:       { title: 'Price (KES)',             body: 'The regular selling price in Kenyan Shillings. VAT is inclusive — do not add VAT on top. Must be greater than zero.' },
  salePrice:   { title: 'Sale Price (KES)',        body: 'A discounted price shown when this product is marked as On Sale. Must be lower than the regular price.' },
  category:    { title: 'Category',               body: 'Determines where this product appears in browse and filter views. Changing category replaces suggested tags automatically.' },
  unit:        { title: 'Display Unit Type',      body: 'Legacy display field — how this product appears on cards and at checkout. Use the Wholesale Unit Type inside the Wholesale Details section for new products.' },
  countInStock:{ title: 'Count In Stock',         body: 'How many units are available right now. Decremented automatically when orders are placed and restored on cancellation.' },
  tags:        { title: 'Search Tags',            body: `Keywords that help buyers find this product. Suggested tags are auto-added from the category. Maximum ${MAX_TAGS} tags per product.` },
  unitType:    { title: 'Wholesale Unit Type',    body: 'The wholesale selling unit for this product. Used for B2B buyer clarity and Tier 2 delivery calculations. This is the primary unit field — use this for new products.' },
  moq:         { title: 'Minimum Order Quantity', body: 'The minimum number of units a buyer must order. Defaults to 1.' },
  itemsPerUnit:{ title: 'Items Per Unit',         body: 'How many individual pieces are inside one unit, e.g. 24 bars of soap per carton.' },
  weight:      { title: 'Weight Per Unit (kg)',   body: 'The weight of one unit in kilograms. Used by the Tier 2 delivery quote system.' },
  dimensions:  { title: 'Dimensions',             body: 'Physical size of one unit, e.g. 60 x 40 x 30 cm. Used for storage planning and Tier 2 delivery quotes.' },
  leadTime:    { title: 'Lead Time',              body: 'Days from confirmed order to dispatch. Shown on product detail pages.' },
  bulkOnly:    { title: 'Bulk Only',              body: 'Tick this if the product cannot be bought as individual pieces — complete units only.' },
  featured:    { title: 'Featured',               body: 'Featured products appear in the Featured Products section on the homepage. Use sparingly for high-quality, well-stocked items.' },
  onSale:      { title: 'On Sale',                body: 'Marks this product as a sale item. Appears in Special Offers under the Sale tab with a discount badge. Requires a valid sale price lower than the regular price.' },
  clearance:   { title: 'Clearance',              body: 'Marks this product as clearance. Appears under the Clearance tab on Special Offers. Use for end-of-line or overstocked items.' },
  image:       { title: 'Product Image',          body: 'Upload a clear, high-quality product photo. JPG or PNG only. Required before the product can be saved.' },
  imageUrl:    { title: 'Image URL',              body: 'Auto-filled after upload. You can also paste a direct image URL if the image is already hosted.' },
  description: { title: 'Description',            body: 'Visible to all buyers. Minimum 30 characters. Include key specs, unit contents, and who this product is for. Good descriptions improve search ranking.' },
};

// ── Truncate helper for diff display ─────────────────────────
const trunc = (str, len) => {
  if (!str) return '—';
  const s = String(str).trim();
  return s.length > len ? s.slice(0, len) + '…' : s;
};

// ── Human-readable change labels ──────────────────────────────
const CHANGE_LABELS = {
  name:                 (o, n) => `Name: "${trunc(o, 40)}" → "${trunc(n, 40)}"`,
  brand:                (o, n) => `Brand: "${o || 'none'}" → "${n || 'none'}"`,
  price:                (o, n) => `Price: KES ${o} → KES ${n}`,
  salePrice:            (o, n) => `Sale price: KES ${o || '—'} → KES ${n || '—'}`,
  category:             (o, n) => `Category: ${o || 'none'} → ${n}`,
  unit:                 (o, n) => `Display unit type: ${o} → ${n}`,
  countInStock:         (o, n) => `Stock: ${o} → ${n} units`,
  tags:                 (o, n) => `Search tags updated (${n.length} tag${n.length !== 1 ? 's' : ''})`,
  unitType:             (o, n) => `Wholesale unit type: ${o} → ${n}`,
  minimumOrderQuantity: (o, n) => `MOQ: ${o} → ${n}`,
  itemsPerUnit:         (o, n) => `Items per unit: ${o || '—'} → ${n || '—'}`,
  weightPerUnit:        (o, n) => `Weight per unit: ${o || '—'} → ${n || '—'} kg`,
  dimensions:           (o, n) => `Dimensions: "${o || '—'}" → "${n || '—'}"`,
  leadTimeDays:         (o, n) => `Lead time: ${o || 'not set'} → ${n || 'not set'}`,
  isBulkOnly:           (o, n) => n ? 'Marked as bulk only' : 'Removed bulk only restriction',
  isFeatured:           (o, n) => n ? 'Marked as featured' : 'Removed from featured',
  isOnSale:             (o, n) => n ? 'Listed as ON SALE' : 'Removed from sale',
  isClearance:          (o, n) => n ? 'Listed as CLEARANCE' : 'Removed from clearance',
  image:                (o, n) => 'Product image updated',
  description:          (o, n) => `Description: "${trunc(o, 60)}" → "${trunc(n, 60)}"`,
};

const AdminProductEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => { document.title = 'Admin: Edit Product — ShopZone'; }, []);

  // ── Form field state ──────────────────────────────────────
  const [name, setName]               = useState('');
  const [price, setPrice]             = useState('');
  const [salePrice, setSalePrice]     = useState('');
  const [image, setImage]             = useState('');
  const [category, setCategory]       = useState('');
  const [description, setDescription] = useState('');
  const [countInStock, setCountInStock] = useState('');
  const [unit, setUnit]               = useState('Per Unit');
  const [isFeatured, setIsFeatured]   = useState(false);
  const [isOnSale, setIsOnSale]       = useState(false);
  const [isClearance, setIsClearance] = useState(false);
  const [brand, setBrand]             = useState('');
  const [unitType, setUnitType]       = useState('Per Unit');
  const [minimumOrderQuantity, setMinimumOrderQuantity] = useState(1);
  const [itemsPerUnit, setItemsPerUnit]   = useState('');
  const [weightPerUnit, setWeightPerUnit] = useState('');
  const [dimensions, setDimensions]       = useState('');
  const [isBulkOnly, setIsBulkOnly]       = useState(false);
  const [leadTimeDays, setLeadTimeDays]   = useState('');
  const [tagList, setTagList]   = useState([]);
  const [tagInput, setTagInput] = useState('');

  // ── UI state ──────────────────────────────────────────────
  const [uploading, setUploading]     = useState(false);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [successMsg, setSuccessMsg]   = useState(null);
  const [isNewUnsaved, setIsNewUnsaved] = useState(false);

  // ── Field-level error state ───────────────────────────────
  // Keys match field names. A truthy value means that field
  // failed validation and should show a red border.
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Confirm modal state ───────────────────────────────────
  const [showConfirm, setShowConfirm] = useState(false);
  const [changeList, setChangeList]   = useState([]);

  // ── Field help modal ──────────────────────────────────────
  const [helpField, setHelpField] = useState(null);

  // ── Original snapshot ref ─────────────────────────────────
  // Every field's last-saved value. Updated on load and after
  // each successful save. Diff at save time compares against this.
  const originalSnapshot = useRef(null);

  // ── Fetch product ─────────────────────────────────────────
  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) { navigate('/login'); return; }
    fetchProduct();
  }, [userInfo, navigate]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/products/${id}`);

      const loaded = {
        name:                 data.name === 'Draft Product' ? '' : data.name,
        price:                data.price ?? '',
        salePrice:            data.salePrice ?? '',
        image:                data.image ?? '',
        category:             data.category ?? '',
        description:          data.description === 'Draft — please complete all fields before saving.'
                                ? '' : (data.description ?? ''),
        countInStock:         data.countInStock ?? '',
        unit:                 data.unit || 'Per Unit',
        isFeatured:           data.isFeatured || false,
        isOnSale:             data.isOnSale || false,
        isClearance:          data.isClearance || false,
        brand:                data.brand || '',
        unitType:             data.unitType || 'Per Unit',
        minimumOrderQuantity: data.minimumOrderQuantity || 1,
        itemsPerUnit:         data.itemsPerUnit ?? '',
        weightPerUnit:        data.weightPerUnit ?? '',
        dimensions:           data.dimensions || '',
        isBulkOnly:           data.isBulkOnly || false,
        leadTimeDays:         data.leadTimeDays ?? '',
        tags:                 data.tags || [],
      };

      setIsNewUnsaved(data.name === 'Draft Product' && !data.image);
      setName(loaded.name);
      setPrice(loaded.price);
      setSalePrice(loaded.salePrice);
      setImage(loaded.image);
      setCategory(loaded.category);
      setDescription(loaded.description);
      setCountInStock(loaded.countInStock);
      setUnit(loaded.unit);
      setIsFeatured(loaded.isFeatured);
      setIsOnSale(loaded.isOnSale);
      setIsClearance(loaded.isClearance);
      setBrand(loaded.brand);
      setUnitType(loaded.unitType);
      setMinimumOrderQuantity(loaded.minimumOrderQuantity);
      setItemsPerUnit(loaded.itemsPerUnit);
      setWeightPerUnit(loaded.weightPerUnit);
      setDimensions(loaded.dimensions);
      setIsBulkOnly(loaded.isBulkOnly);
      setLeadTimeDays(loaded.leadTimeDays);
      setTagList(loaded.tags);

      originalSnapshot.current = loaded;
      setLoading(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      showToast(msg, 'error');
      setLoading(false);
    }
  };

  // ── Clear a specific field error when the user edits it ───
  // Called from onChange on every validated field so the red
  // border disappears as soon as the admin starts correcting it.
  const clearFieldError = (field) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev; // nothing to clear
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // ── Category change ───────────────────────────────────────
  const handleCategoryChange = (value) => {
    setCategory(value);
    clearFieldError('category');
    setTagList(CATEGORY_TAGS[value] ? [...CATEGORY_TAGS[value]] : []);
  };

  // ── Tag management ────────────────────────────────────────
  const removeTag = (tagToRemove) => {
    setTagList((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      // Enforce cap
      if (tagList.length >= MAX_TAGS) return;
      const newTag = tagInput.trim().toLowerCase().replace(/,/g, '');
      if (newTag && !tagList.includes(newTag)) {
        setTagList((prev) => [...prev, newTag]);
      }
      setTagInput('');
    }
  };

  // ── Image upload ──────────────────────────────────────────
  const uploadImageHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      setUploading(true);
      setUploadError(null);
      const { data } = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      setImage(data);
      clearFieldError('image');
      setUploading(false);
      showToast('Image uploaded successfully.', 'success');
    } catch (err) {
      const msg = 'Image upload failed. Please try again.';
      setUploadError(msg);
      showToast(msg, 'error');
      setUploading(false);
    }
  };

  // ── Back / cancel ─────────────────────────────────────────
  const handleBack = async () => {
    if (isNewUnsaved) {
      try {
        await axios.delete(`/api/products/${id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
      } catch (err) {
        console.error('Could not delete unsaved product:', err.message);
      }
    }
    navigate('/admin/products');
  };

  // ── Build current values object ───────────────────────────
  // Plain function — not memoised. Called only inside submit
  // and executeSave so there is no stale closure risk.
  const buildCurrentValues = () => ({
    name:                 name.trim(),
    price:                String(price),
    salePrice:            String(salePrice),
    image,
    category,
    description:          description.trim(),
    countInStock:         String(countInStock),
    unit,
    isFeatured,
    isOnSale,
    isClearance,
    brand:                brand.trim(),
    unitType,
    minimumOrderQuantity: String(minimumOrderQuantity),
    itemsPerUnit:         String(itemsPerUnit),
    weightPerUnit:        String(weightPerUnit),
    dimensions:           dimensions.trim(),
    isBulkOnly,
    leadTimeDays:         String(leadTimeDays),
    tags:                 tagList,
  });

  // ── Diff current vs snapshot ──────────────────────────────
  const buildChangeList = (current, snap) => {
    // Normalise snapshot numeric fields to strings for fair comparison
    const normalised = {
      ...snap,
      price:                String(snap.price ?? ''),
      salePrice:            String(snap.salePrice ?? ''),
      countInStock:         String(snap.countInStock ?? ''),
      minimumOrderQuantity: String(snap.minimumOrderQuantity ?? ''),
      itemsPerUnit:         String(snap.itemsPerUnit ?? ''),
      weightPerUnit:        String(snap.weightPerUnit ?? ''),
      leadTimeDays:         String(snap.leadTimeDays ?? ''),
    };

    const changes = [];
    Object.keys(CHANGE_LABELS).forEach((key) => {
      const oldVal = key === 'tags' ? (normalised.tags || []) : normalised[key];
      const newVal = key === 'tags' ? current.tags : current[key];
      const oldStr = Array.isArray(oldVal) ? [...oldVal].sort().join(',') : String(oldVal ?? '');
      const newStr = Array.isArray(newVal) ? [...newVal].sort().join(',') : String(newVal ?? '');
      if (oldStr !== newStr) {
        changes.push(CHANGE_LABELS[key](oldVal, newVal));
      }
    });
    return changes;
  };

  // ── Submit — validate → diff → modal or silent save ───────
  const submitHandler = async (e) => {
    e.preventDefault();
    setError(null);

    // Collect all field errors in one pass so every failing
    // field highlights at once instead of one at a time.
    const errors = {};

    if (!name || INVALID_NAMES.includes(name.toLowerCase().trim())) {
      errors.name = true;
    }
    if (!price || Number(price) <= 0) {
      errors.price = true;
    }
    if (!category) {
      errors.category = true;
    }
    if (!description || description.trim().length < 30) {
      errors.description = true;
    }
    if (!image) {
      errors.image = true;
    }
    if (!countInStock || Number(countInStock) < 1) {
      errors.countInStock = true;
    }
    if (isOnSale) {
      if (!salePrice || Number(salePrice) <= 0) errors.salePrice = true;
      if (salePrice && Number(salePrice) >= Number(price)) errors.salePrice = true;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Single toast summarising what needs fixing
      const count = Object.keys(errors).length;
      showToast(`${count} field${count > 1 ? 's need' : ' needs'} attention before saving.`, 'error');
      setError(`Please fix the highlighted field${count > 1 ? 's' : ''} before saving.`);
      return;
    }

    // Clear any leftover field errors from a previous attempt
    setFieldErrors({});

    const current = buildCurrentValues();
    const changes = originalSnapshot.current
      ? buildChangeList(current, originalSnapshot.current)
      : [];

    if (changes.length === 0) {
      await executeSave(current);
      return;
    }

    setChangeList(changes);
    setShowConfirm(true);
  };

  // ── Execute save ──────────────────────────────────────────
  // Accepts the current values object so it never has to
  // re-read state after the modal confirm delay.
  // config is built here to always use the current token.
  const executeSave = async (currentValues) => {
    // If called from modal onConfirm, currentValues is undefined
    // because React synthetic events don't pass arguments —
    // rebuild from state in that case.
    const current = currentValues && typeof currentValues === 'object' && !currentValues.nativeEvent
      ? currentValues
      : buildCurrentValues();

    const authConfig = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    try {
      setSaving(true);
      setShowConfirm(false);

      await axios.put(
        `/api/products/${id}`,
        {
          name:                 current.name,
          price:                Number(current.price),
          salePrice:            current.salePrice !== '' ? Number(current.salePrice) : null,
          image:                current.image,
          category:             current.category,
          description:          current.description,
          countInStock:         Number(current.countInStock),
          unit:                 current.unit,
          tags:                 current.tags,
          isFeatured:           current.isFeatured,
          isOnSale:             current.isOnSale,
          isClearance:          current.isClearance,
          brand:                current.brand,
          unitType:             current.unitType,
          minimumOrderQuantity: Number(current.minimumOrderQuantity) || 1,
          itemsPerUnit:         current.itemsPerUnit !== '' ? Number(current.itemsPerUnit) : null,
          weightPerUnit:        current.weightPerUnit !== '' ? Number(current.weightPerUnit) : null,
          dimensions:           current.dimensions,
          isBulkOnly:           current.isBulkOnly,
          leadTimeDays:         current.leadTimeDays !== '' ? Number(current.leadTimeDays) : null,
        },
        authConfig
      );

      // Advance snapshot so next save only tracks new changes
      originalSnapshot.current = { ...current, tags: [...current.tags] };

      setSuccessMsg('Product saved successfully!');
      setSaving(false);
      showToast('Product saved successfully!', 'success');
      setTimeout(() => navigate('/admin/products'), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      showToast(msg, 'error');
      setSaving(false);
    }
  };

  // ── Help icon ─────────────────────────────────────────────
  const HelpIcon = ({ field }) => (
    <button
      type='button'
      className='ape-help-icon'
      onClick={() => setHelpField(field)}
      aria-label={`Help for ${FIELD_HELP[field]?.title}`}
    >
      <FaQuestionCircle />
    </button>
  );

  // ── Field label with optional required star + help icon ───
  const FieldLabel = ({ field, children, required: req }) => (
    <Form.Label className='ape-field-label'>
      {children}
      {req && <span className='ape-required'>*</span>}
      <HelpIcon field={field} />
    </Form.Label>
  );

  // ── Change list JSX for the confirm modal ─────────────────
  const changeListMessage = (
    <div>
      <p className='ape-modal-intro'>You are about to make the following changes:</p>
      <ul className='ape-modal-change-list'>
        {changeList.map((item, i) => (
          <li key={i} className='ape-modal-change-item'>{item}</li>
        ))}
      </ul>
    </div>
  );

  if (loading) {
    return (
      <div className='text-center py-5'>
        <Spinner animation='border' className='ape-spinner' />
      </div>
    );
  }

  return (
    <>
      {/* ── Field help modal — info only, no cancel button ── */}
      {helpField && (
        <ConfirmModal
          show={!!helpField}
          onConfirm={() => setHelpField(null)}
          onCancel={() => setHelpField(null)}
          title={FIELD_HELP[helpField]?.title}
          message={FIELD_HELP[helpField]?.body}
          confirmLabel='Got it'
          confirmVariant='primary-branded'
          infoOnly
        />
      )}

      {/* ── Changes confirmation modal ────────────────────── */}
      <ConfirmModal
        show={showConfirm}
        onConfirm={executeSave}
        onCancel={() => setShowConfirm(false)}
        title='Confirm Changes'
        message={changeListMessage}
        confirmLabel='Yes, Save Changes'
        confirmVariant='primary-branded'
      />

      {/* ── Back button ───────────────────────────────────── */}
      <button type='button' className='btn ape-back-btn mb-4' onClick={handleBack}>
        ← Back to Products
      </button>

      <Row className='justify-content-center'>
        <Col lg={9}>
          <Card className='p-4 shadow-sm'>
            <h2 className='ape-page-title mb-4'>
              {name === 'New Product' ? 'Create Product' : `Edit — ${name}`}
            </h2>

            {error       && <Alert variant='danger'>{error}</Alert>}
            {uploadError && <Alert variant='danger'>{uploadError}</Alert>}
            {successMsg  && <Alert className='ape-success-alert'>{successMsg} Redirecting...</Alert>}

            <Form onSubmit={submitHandler}>
              <Row>

                {/* ── LEFT COLUMN ───────────────────────── */}
                <Col md={6}>

                  {/* Product name */}
                  <Form.Group className='mb-3'>
                    <FieldLabel field='name' required>Product Name</FieldLabel>
                    <Form.Control
                      type='text'
                      placeholder='e.g. Heavy Duty Steel Shelving Unit'
                      value={name}
                      onChange={(e) => { setName(e.target.value); clearFieldError('name'); }}
                      className={fieldErrors.name ? 'ape-field--error' : ''}
                      required
                    />
                    {fieldErrors.name && (
                      <Form.Text className='ape-error-text'>Please enter a proper product name.</Form.Text>
                    )}
                  </Form.Group>

                  {/* Brand */}
                  <Form.Group className='mb-3'>
                    <FieldLabel field='brand'>Brand</FieldLabel>
                    <Form.Control
                      type='text'
                      placeholder='e.g. Unilever, Samsung, Bidco, Generic'
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                    />
                    <Form.Text className='ape-hint'>
                      Used to group products on the Brands page. Leave blank if no specific brand.
                    </Form.Text>
                  </Form.Group>

                  {/* Price */}
                  <Form.Group className='mb-3'>
                    <FieldLabel field='price' required>Price (KES)</FieldLabel>
                    <Form.Control
                      type='number'
                      placeholder='e.g. 8500'
                      value={price}
                      min='1'
                      onChange={(e) => { setPrice(e.target.value); clearFieldError('price'); }}
                      className={fieldErrors.price ? 'ape-field--error' : ''}
                      required
                    />
                    {fieldErrors.price && (
                      <Form.Text className='ape-error-text'>Price must be greater than 0.</Form.Text>
                    )}
                  </Form.Group>

                  {/* Sale price */}
                  {isOnSale && (
                    <Form.Group className='mb-3'>
                      <FieldLabel field='salePrice' required>Sale Price (KES)</FieldLabel>
                      <Form.Control
                        type='number'
                        placeholder='Must be lower than regular price'
                        value={salePrice}
                        min='1'
                        onChange={(e) => { setSalePrice(e.target.value); clearFieldError('salePrice'); }}
                        className={fieldErrors.salePrice ? 'ape-field--error' : ''}
                      />
                      {fieldErrors.salePrice && (
                        <Form.Text className='ape-error-text'>
                          Sale price must be greater than 0 and lower than KES {price}.
                        </Form.Text>
                      )}
                    </Form.Group>
                  )}

                  {/* Category */}
                  <Form.Group className='mb-3'>
                    <FieldLabel field='category' required>Category</FieldLabel>
                    <Form.Select
                      value={category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className={fieldErrors.category ? 'ape-field--error' : ''}
                      required
                    >
                      <option value=''>Select a category...</option>
                      {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </Form.Select>
                    {fieldErrors.category && (
                      <Form.Text className='ape-error-text'>Please select a category.</Form.Text>
                    )}
                  </Form.Group>

                  {/* Legacy unit */}
                  <Form.Group className='mb-3'>
                    <FieldLabel field='unit'>Display Unit Type</FieldLabel>
                    <Form.Select value={unit} onChange={(e) => setUnit(e.target.value)}>
                      {Object.keys(UNIT_HINTS).map((u) => <option key={u} value={u}>{u}</option>)}
                    </Form.Select>
                    <Form.Text className='ape-hint'>
                      {UNIT_HINTS[unit]}
                    </Form.Text>
                    {/* Legacy field note — directs admins to the wholesale section */}
                    <Form.Text className='ape-hint ape-hint--legacy'>
                      Legacy display field. For new products, use Wholesale Unit Type below.
                    </Form.Text>
                  </Form.Group>

                  {/* Count in stock */}
                  <Form.Group className='mb-3'>
                    <FieldLabel field='countInStock' required>Count In Stock</FieldLabel>
                    <Form.Control
                      type='number'
                      placeholder='e.g. 50'
                      value={countInStock}
                      min='1'
                      onChange={(e) => { setCountInStock(e.target.value); clearFieldError('countInStock'); }}
                      className={fieldErrors.countInStock ? 'ape-field--error' : ''}
                      required
                    />
                    {fieldErrors.countInStock ? (
                      <Form.Text className='ape-error-text'>Stock count must be at least 1.</Form.Text>
                    ) : (
                      <Form.Text className='ape-hint'>How many units do you have available right now?</Form.Text>
                    )}
                  </Form.Group>

                  {/* Tags */}
                  <Form.Group className='mb-3'>
                    <FieldLabel field='tags'>Search Tags</FieldLabel>
                    {tagList.length > 0 && (
                      <div className='ape-tag-list'>
                        {tagList.map((tag) => (
                          <span key={tag} className='ape-tag-chip'>
                            {tag}
                            <button
                              type='button'
                              className='ape-tag-remove'
                              onClick={() => removeTag(tag)}
                              aria-label={`Remove tag ${tag}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <Form.Control
                      type='text'
                      placeholder={
                        tagList.length >= MAX_TAGS
                          ? `Maximum ${MAX_TAGS} tags reached`
                          : 'Type a tag and press Enter to add'
                      }
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      disabled={tagList.length >= MAX_TAGS}
                      className={tagList.length >= MAX_TAGS ? 'ape-field--disabled' : ''}
                    />
                    {tagList.length >= MAX_TAGS ? (
                      <Form.Text className='ape-error-text'>
                        Maximum {MAX_TAGS} tags reached. Remove a tag to add a new one.
                      </Form.Text>
                    ) : (
                      <Form.Text className='ape-hint'>
                        {category
                          ? `Suggested tags auto-added from your category. Remove irrelevant ones or add your own. ${tagList.length}/${MAX_TAGS} tags.`
                          : `Select a category first to get suggested tags. ${tagList.length}/${MAX_TAGS} tags.`}
                      </Form.Text>
                    )}
                  </Form.Group>

                  {/* ── Wholesale Details ──────────────────── */}
                  <div className='ape-section-box ape-section-box--blue'>
                    <p className='ape-section-label'>Wholesale Details</p>

                    <Form.Group className='mb-3'>
                      <FieldLabel field='unitType'>Wholesale Unit Type</FieldLabel>
                      <Form.Select value={unitType} onChange={(e) => setUnitType(e.target.value)}>
                        {Object.keys(UNIT_HINTS).map((u) => <option key={u} value={u}>{u}</option>)}
                      </Form.Select>
                      <Form.Text className='ape-hint'>{UNIT_HINTS[unitType]}</Form.Text>
                    </Form.Group>

                    <Form.Group className='mb-3'>
                      <FieldLabel field='moq'>Minimum Order Quantity (MOQ)</FieldLabel>
                      <Form.Control
                        type='number'
                        placeholder='e.g. 5'
                        value={minimumOrderQuantity}
                        min='1'
                        onChange={(e) => setMinimumOrderQuantity(e.target.value)}
                      />
                      <Form.Text className='ape-hint'>Minimum units a buyer must order. Defaults to 1.</Form.Text>
                    </Form.Group>

                    <Form.Group className='mb-3'>
                      <FieldLabel field='itemsPerUnit'>Items Per Unit</FieldLabel>
                      <Form.Control
                        type='number'
                        placeholder='e.g. 24 (bars of soap per carton)'
                        value={itemsPerUnit}
                        min='1'
                        onChange={(e) => setItemsPerUnit(e.target.value)}
                      />
                      <Form.Text className='ape-hint'>How many individual pieces are inside one unit. Optional.</Form.Text>
                    </Form.Group>

                    <Form.Group className='mb-3'>
                      <FieldLabel field='weight'>Weight Per Unit (kg)</FieldLabel>
                      <Form.Control
                        type='number'
                        placeholder='e.g. 12.5'
                        value={weightPerUnit}
                        min='0'
                        step='0.1'
                        onChange={(e) => setWeightPerUnit(e.target.value)}
                      />
                      <Form.Text className='ape-hint'>Used for Tier 2 delivery quote calculations.</Form.Text>
                    </Form.Group>

                    <Form.Group className='mb-3'>
                      <FieldLabel field='dimensions'>Dimensions</FieldLabel>
                      <Form.Control
                        type='text'
                        placeholder='e.g. 60 x 40 x 30 cm'
                        value={dimensions}
                        onChange={(e) => setDimensions(e.target.value)}
                      />
                      <Form.Text className='ape-hint'>Physical size of one unit. Optional.</Form.Text>
                    </Form.Group>

                    <Form.Group className='mb-3'>
                      <FieldLabel field='leadTime'>Lead Time</FieldLabel>
                      <Form.Select value={leadTimeDays} onChange={(e) => setLeadTimeDays(e.target.value)}>
                        {LEAD_TIME_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </Form.Select>
                      <Form.Text className='ape-hint'>Days from confirmed order to dispatch.</Form.Text>
                    </Form.Group>

                    <div className='ape-checkbox-row'>
                      <Form.Check
                        type='checkbox'
                        id='isBulkOnly'
                        label=''
                        checked={isBulkOnly}
                        onChange={(e) => setIsBulkOnly(e.target.checked)}
                      />
                      <span className='ape-checkbox-label'>Bulk only — cannot be bought as single pieces</span>
                      <HelpIcon field='bulkOnly' />
                    </div>
                  </div>

                  {/* ── Merchandising ──────────────────────── */}
                  <div className='ape-section-box ape-section-box--tan'>
                    <p className='ape-section-label'>Merchandising</p>

                    <div className='ape-checkbox-row mb-2'>
                      <Form.Check
                        type='checkbox' id='isFeatured' label=''
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                      />
                      <span className='ape-checkbox-label'>Featured — show in Featured Products on homepage</span>
                      <HelpIcon field='featured' />
                    </div>

                    <div className='ape-checkbox-row mb-2'>
                      <Form.Check
                        type='checkbox' id='isOnSale' label=''
                        checked={isOnSale}
                        onChange={(e) => {
                          setIsOnSale(e.target.checked);
                          if (!e.target.checked) { setSalePrice(''); clearFieldError('salePrice'); }
                        }}
                      />
                      <span className='ape-checkbox-label'>On Sale — show in Deals section (sale price required)</span>
                      <HelpIcon field='onSale' />
                    </div>

                    <div className='ape-checkbox-row'>
                      <Form.Check
                        type='checkbox' id='isClearance' label=''
                        checked={isClearance}
                        onChange={(e) => setIsClearance(e.target.checked)}
                      />
                      <span className='ape-checkbox-label'>Clearance — show in Clearance section</span>
                      <HelpIcon field='clearance' />
                    </div>
                  </div>

                </Col>

                {/* ── RIGHT COLUMN ──────────────────────── */}
                <Col md={6}>

                  {/* Image upload */}
                  <Form.Group className='mb-3'>
                    <FieldLabel field='image' required>Product Image</FieldLabel>
                    <div className={`ape-image-drop${image ? ' ape-image-drop--filled' : ''}${fieldErrors.image ? ' ape-image-drop--error' : ''}`}>
                      {uploading ? (
                        <div className='text-center'>
                          <Spinner animation='border' size='sm' className='ape-spinner' />
                          <p className='ape-image-uploading'>Uploading...</p>
                        </div>
                      ) : image ? (
                        <Image src={image} alt='product preview' className='ape-image-preview' />
                      ) : (
                        <div className='text-center'>
                          <span className='ape-image-placeholder-icon'>📷</span>
                          <p className='ape-image-placeholder-text'>No image uploaded</p>
                        </div>
                      )}
                    </div>
                    <Form.Control
                      type='file'
                      accept='image/jpeg,image/jpg,image/png'
                      onChange={uploadImageHandler}
                      className='ape-file-input'
                    />
                    {fieldErrors.image ? (
                      <Form.Text className='ape-error-text'>Please upload a product image before saving.</Form.Text>
                    ) : (
                      <Form.Text className='ape-hint'>JPG or PNG only. Image is required before saving.</Form.Text>
                    )}
                  </Form.Group>

                  {/* Image URL */}
                  <Form.Group className='mb-3'>
                    <FieldLabel field='imageUrl'>
                      Image URL
                      <span className='ape-label-note'>(auto-filled after upload)</span>
                    </FieldLabel>
                    <Form.Control
                      type='text'
                      placeholder='/uploads/image.jpg'
                      value={image}
                      onChange={(e) => { setImage(e.target.value); clearFieldError('image'); }}
                    />
                  </Form.Group>

                </Col>
              </Row>

              {/* Description — full width */}
              <Form.Group className='mb-4'>
                <FieldLabel field='description' required>Description</FieldLabel>
                <Form.Control
                  as='textarea'
                  rows={4}
                  placeholder='Describe the product in detail — minimum 30 characters. Include key specs, what is included, and who this product is for.'
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); clearFieldError('description'); }}
                  className={fieldErrors.description ? 'ape-field--error' : ''}
                  required
                />
                {fieldErrors.description ? (
                  <Form.Text className='ape-error-text'>
                    Description must be at least 30 characters. Currently {description.length}.
                  </Form.Text>
                ) : (
                  <Form.Text className={description.length < 30 && description.length > 0 ? 'ape-error-text' : 'ape-hint'}>
                    {description.length} / 30 characters minimum
                  </Form.Text>
                )}
              </Form.Group>

              <div className='d-flex gap-3'>
                <Button type='submit' className='w-100 ape-save-btn' disabled={saving || uploading}>
                  {saving ? <Spinner animation='border' size='sm' /> : 'Save Changes'}
                </Button>
                <Button type='button' className='w-100 ape-cancel-btn' onClick={handleBack}>
                  Cancel
                </Button>
              </div>

            </Form>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AdminProductEditPage;