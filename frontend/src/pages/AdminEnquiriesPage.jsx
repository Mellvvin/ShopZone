// frontend/src/pages/AdminEnquiriesPage.jsx
// ─────────────────────────────────────────────────────────────
// Admin Enquiries page — shows all form submissions from across
// the ShopZone site in one place.
//
// Sources:
//   BulkOrdersPage    → type: bulk_order
//   BecomeSellerPage  → type: seller_application
//   ContactPage       → type: contact
//   General           → type: general
//
// Migration path:
//   bulk_order         → RFQ model (Step 8)
//   seller_application → Seller application model (Step 6)
//   contact/general    → Support ticket model (Step 15)
//
// Features:
//   - Filter by type (all/bulk_order/seller_application/contact/general)
//   - Filter by status (all/new/read/actioned/closed)
//   - Filter by resolved/unresolved
//   - Search across name, email, business, message
//   - View full enquiry detail in a side panel
//   - Update status and add internal admin notes
//   - Badge counts on filter tabs
//   - Link to user profile when enquiry is from a registered user
// ─────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { showToast } from '../components/Toast/Toast';
import {
    FaEnvelope, FaBoxOpen, FaStore, FaHeadset,
    FaQuestionCircle, FaSearch, FaFilter,
    FaCheckCircle, FaClock, FaTimesCircle,
    FaChevronRight, FaUser, FaPhone, FaBriefcase,
    FaCalendar, FaStickyNote, FaTimes,
    FaExclamationTriangle,
} from 'react-icons/fa';
import './AdminEnquiriesPage.css';

// ── Type config — label, icon, colour for each enquiry type ──
const TYPE_CONFIG = {
    bulk_order:          { label: 'Bulk Order',          icon: FaBoxOpen,       color: '#2980b9' },
    seller_application:  { label: 'Seller Application',  icon: FaStore,         color: '#8e44ad' },
    contact:             { label: 'Contact',              icon: FaHeadset,       color: '#27ae60' },
    general:             { label: 'General',              icon: FaQuestionCircle,color: '#e67e22' },
    support:             { label: 'Support',              icon: FaEnvelope,      color: '#c0392b' },
};

// ── Status config — label and colour for each status ─────────
const STATUS_CONFIG = {
    new:      { label: 'New',      color: '#c0392b', bg: '#fdf0f0' },
    read:     { label: 'Read',     color: '#e67e22', bg: '#fff8f0' },
    actioned: { label: 'Actioned', color: '#2980b9', bg: '#eaf4fd' },
    closed:   { label: 'Closed',   color: '#27ae60', bg: '#eafaf1' },
};

// ── Helper: format date ───────────────────────────────────────
const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-KE', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

// ── Helper: format KES ────────────────────────────────────────
const fmtKES = (n) =>
    `KES ${Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;

// ─────────────────────────────────────────────────────────────
// EnquiryDetailPanel — right side panel showing full enquiry
// ─────────────────────────────────────────────────────────────
const EnquiryDetailPanel = ({ enquiry, onClose, onUpdated, config }) => {
    const [status, setStatus] = useState(enquiry.status);
    const [notes, setNotes] = useState(enquiry.adminNotes || '');
    const [saving, setSaving] = useState(false);

    // Sync state when a different enquiry is selected
    useEffect(() => {
        setStatus(enquiry.status);
        setNotes(enquiry.adminNotes || '');
    }, [enquiry._id]);

    const handleSave = async () => {
        try {
            setSaving(true);
            await axios.put(
                `/api/enquiries/${enquiry._id}`,
                { status, adminNotes: notes },
                config
            );
            showToast('Enquiry updated', 'success');
            onUpdated();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update', 'error');
        } finally {
            setSaving(false);
        }
    };

    const typeCfg   = TYPE_CONFIG[enquiry.type]   || TYPE_CONFIG.general;
    const statusCfg = STATUS_CONFIG[enquiry.status] || STATUS_CONFIG.new;
    const TypeIcon  = typeCfg.icon;

    return (
        <div className='enq-panel'>

            {/* Panel header */}
            <div className='enq-panel__header'>
                <div className='enq-panel__header-left'>
                    <div
                        className='enq-panel__type-icon'
                        style={{ background: typeCfg.color }}
                    >
                        <TypeIcon aria-hidden='true' />
                    </div>
                    <div>
                        <h3 className='enq-panel__title'>{typeCfg.label}</h3>
                        <p className='enq-panel__id'>#{enquiry._id.slice(-8).toUpperCase()}</p>
                    </div>
                </div>
                <button
                    className='enq-panel__close'
                    onClick={onClose}
                    aria-label='Close detail panel'
                >
                    <FaTimes aria-hidden='true' />
                </button>
            </div>

            <div className='enq-panel__body'>

                {/* Submitter info */}
                <div className='enq-panel__section'>
                    <h4 className='enq-panel__section-title'>Submitter</h4>
                    <div className='enq-panel__info-grid'>
                        <div className='enq-panel__info-row'>
                            <FaUser aria-hidden='true' />
                            <span>{enquiry.name}</span>
                        </div>
                        <div className='enq-panel__info-row'>
                            <FaEnvelope aria-hidden='true' />
                            <a href={`mailto:${enquiry.email}`}>{enquiry.email}</a>
                        </div>
                        {enquiry.phone && (
                            <div className='enq-panel__info-row'>
                                <FaPhone aria-hidden='true' />
                                <span>{enquiry.phone}</span>
                            </div>
                        )}
                        {enquiry.business && (
                            <div className='enq-panel__info-row'>
                                <FaBriefcase aria-hidden='true' />
                                <span>{enquiry.business}</span>
                            </div>
                        )}
                        <div className='enq-panel__info-row'>
                            <FaCalendar aria-hidden='true' />
                            <span>{formatDate(enquiry.createdAt)}</span>
                        </div>
                        {/* Link to user profile if registered */}
                        {enquiry.userId && (
                            <div className='enq-panel__info-row'>
                                <FaUser aria-hidden='true' />
                                <Link
                                    to={`/admin/users/${enquiry.userId._id || enquiry.userId}`}
                                    className='enq-panel__user-link'
                                >
                                    View User Profile
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Message */}
                {enquiry.message && (
                    <div className='enq-panel__section'>
                        <h4 className='enq-panel__section-title'>Message</h4>
                        <p className='enq-panel__message'>{enquiry.message}</p>
                    </div>
                )}

                {/* Structured form data — rendered based on type */}
                {enquiry.data && Object.keys(enquiry.data).length > 0 && (
                    <div className='enq-panel__section'>
                        <h4 className='enq-panel__section-title'>Form Details</h4>
                        <div className='enq-panel__data-grid'>
                            {Object.entries(enquiry.data).map(([key, value]) => (
                                value ? (
                                    <div key={key} className='enq-panel__data-row'>
                                        {/* Convert camelCase key to readable label */}
                                        <span className='enq-panel__data-label'>
                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                                        </span>
                                        <span className='enq-panel__data-value'>{String(value)}</span>
                                    </div>
                                ) : null
                            ))}
                        </div>
                    </div>
                )}

                {/* Status update */}
                <div className='enq-panel__section'>
                    <h4 className='enq-panel__section-title'>Status</h4>
                    <select
                        className='enq-panel__select'
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value='new'>New</option>
                        <option value='read'>Read</option>
                        <option value='actioned'>Actioned</option>
                        <option value='closed'>Closed</option>
                    </select>
                </div>

                {/* Admin notes — internal only, never shown to submitter */}
                <div className='enq-panel__section'>
                    <h4 className='enq-panel__section-title'>
                        <FaStickyNote aria-hidden='true' /> Internal Notes
                        <span className='enq-panel__notes-hint'>Never shown to submitter</span>
                    </h4>
                    <textarea
                        className='enq-panel__notes'
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder='Add sourcing notes, follow-up reminders, or action taken...'
                        rows={4}
                    />
                </div>

                <button
                    className='enq-panel__save-btn'
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Saving…' : 'Save Changes'}
                </button>

            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// AdminEnquiriesPage — main component
// ─────────────────────────────────────────────────────────────
const AdminEnquiriesPage = () => {
    const navigate   = useNavigate();
    const { userInfo } = useSelector((state) => state.auth);

    // ── Page title ────────────────────────────────────────────
    useEffect(() => { document.title = 'Admin: Enquiries — ShopZone'; }, []);

    // ── Data state ────────────────────────────────────────────
    const [enquiries, setEnquiries]   = useState([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);

    // ── Filter state ──────────────────────────────────────────
    const [typeFilter, setTypeFilter]       = useState('all');
    const [statusFilter, setStatusFilter]   = useState('all');
    const [resolvedFilter, setResolvedFilter] = useState('all'); // all/resolved/unresolved
    const [search, setSearch]               = useState('');

    // ── Selected enquiry for detail panel ─────────────────────
    const [selected, setSelected] = useState(null);

    // ── Auth header ───────────────────────────────────────────
    const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
    };

 // ── Fetch enquiries with current filters ──────────────────
    const fetchEnquiries = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (typeFilter !== 'all')     params.append('type',     typeFilter);
            if (statusFilter !== 'all')   params.append('status',   statusFilter);
            if (resolvedFilter === 'resolved')   params.append('resolved', 'true');
            if (resolvedFilter === 'unresolved') params.append('resolved', 'false');
            if (search)                   params.append('search',   search);

            const { data } = await axios.get(
                `/api/enquiries?${params.toString()}`,
                config
            );
            setEnquiries(data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load enquiries');
        } finally {
            setLoading(false);
        }
    }, [typeFilter, statusFilter, resolvedFilter, search]);

    useEffect(() => {
        if (!userInfo?.isAdmin) { navigate('/'); return; }
        fetchEnquiries();
    }, [fetchEnquiries]);

    // ── Count enquiries by type for tab badges ─────────────────
    const countByType = (type) =>
        enquiries.filter(e => type === 'all' ? true : e.type === type).length;

    // ── Count new (unread) enquiries ──────────────────────────
    const newCount = enquiries.filter(e => e.status === 'new').length;

  // ── Type filter tabs ──────────────────────────────────────
    const TYPE_TABS = [
        { key: 'all',                label: 'All',                 icon: FaEnvelope,       countMod: '' },
        { key: 'unread',             label: 'Unread',              icon: FaExclamationTriangle, countMod: 'red' },
        { key: 'bulk_order',         label: 'Bulk Orders',         icon: FaBoxOpen,        countMod: 'typed' },
        { key: 'seller_application', label: 'Seller Applications', icon: FaStore,          countMod: 'typed' },
        { key: 'contact',            label: 'Contact',             icon: FaHeadset,        countMod: 'typed' },
        { key: 'general',            label: 'General',             icon: FaQuestionCircle, countMod: 'typed' },
    ];

    return (
        <div className='enq-page'>

            {/* ── Page header ─────────────────────────────── */}
            <div className='enq-page__header'>
                <div className='enq-page__title-row'>
                    <FaEnvelope className='enq-page__title-icon' aria-hidden='true' />
                    <div>
                        <h1 className='enq-page__title'>Enquiries</h1>
                        <p className='enq-page__subtitle'>
                            All form submissions from across ShopZone
                        </p>
                    </div>
                </div>

                {/* New enquiries alert badge */}
                {newCount > 0 && (
                    <div className='enq-page__new-alert'>
                        <FaExclamationTriangle aria-hidden='true' />
                        {newCount} new unread {newCount === 1 ? 'enquiry' : 'enquiries'}
                    </div>
                )}
            </div>

           {/* ── Type filter tabs ────────────────────────── */}
            <div className='enq-tabs' role='tablist'>
                {TYPE_TABS.map(tab => {
                    const Icon = tab.icon;
                    // Unread tab count comes from newCount — a separate
                    // count that is always available regardless of active filters.
                    // All other tabs count from the current enquiries list.
                    const count = tab.key === 'unread'
                        ? newCount
                        : countByType(tab.key);

                    // Unread tab is active when typeFilter is all AND statusFilter is new.
                    // All other tabs are active when their key matches typeFilter.
                    const isActive = tab.key === 'unread'
                        ? typeFilter === 'all' && statusFilter === 'new'
                        : typeFilter === tab.key && statusFilter !== 'new';

                    // Unread tab sets statusFilter to new and resets typeFilter.
                    // All other tabs reset statusFilter to all and set their typeFilter.
                    const handleClick = tab.key === 'unread'
                        ? () => { setTypeFilter('all'); setStatusFilter('new'); setSelected(null); }
                        : () => { setTypeFilter(tab.key); setStatusFilter('all'); setSelected(null); };

                    return (
                        <button
                            key={tab.key}
                            className={`enq-tab ${isActive ? 'enq-tab--active' : ''}`}
                            onClick={handleClick}
                            role='tab'
                            aria-selected={isActive}
                        >
                            <Icon aria-hidden='true' />
                            {tab.label}
                            {count > 0 && (
                                <span className={`enq-tab__count ${tab.countMod ? `enq-tab__count--${tab.countMod}` : ''}`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
            {/* ── Filters and search bar ───────────────────── */}
            <div className='enq-filters'>

                {/* Search bar */}
                <div className='enq-search'>
                    <FaSearch className='enq-search__icon' aria-hidden='true' />
                    <input
                        type='text'
                        className='enq-search__input'
                        placeholder='Search by name, email, business, or message...'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label='Search enquiries'
                    />
                    {search && (
                        <button
                            className='enq-search__clear'
                            onClick={() => setSearch('')}
                            aria-label='Clear search'
                        >
                            <FaTimes aria-hidden='true' />
                        </button>
                    )}
                </div>

                {/* Status filter */}
                <div className='enq-filter-group'>
                    <FaFilter className='enq-filter-group__icon' aria-hidden='true' />
                    <select
                        className='enq-filter-select'
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        aria-label='Filter by status'
                    >
                        <option value='all'>All Statuses</option>
                        <option value='new'>New</option>
                        <option value='read'>Read</option>
                        <option value='actioned'>Actioned</option>
                        <option value='closed'>Closed</option>
                    </select>
                </div>

                {/* Resolved / unresolved filter */}
                <div className='enq-filter-group'>
                    <select
                        className='enq-filter-select'
                        value={resolvedFilter}
                        onChange={(e) => setResolvedFilter(e.target.value)}
                        aria-label='Filter by resolved state'
                    >
                        <option value='all'>All Enquiries</option>
                        <option value='unresolved'>Unresolved</option>
                        <option value='resolved'>Resolved</option>
                    </select>
                </div>
            </div>

            {/* ── Main content area — list + optional panel ── */}
            <div className={`enq-content ${selected ? 'enq-content--split' : ''}`}>

                {/* Enquiry list */}
                <div className='enq-list'>

                    {loading ? (
                        <div className='enq-state enq-state--loading'>
                            <div className='enq-spinner' aria-label='Loading…' />
                            <p>Loading enquiries…</p>
                        </div>
                    ) : error ? (
                        <div className='enq-state enq-state--error'>
                            <FaExclamationTriangle aria-hidden='true' />
                            <p>{error}</p>
                            <button className='enq-retry-btn' onClick={fetchEnquiries}>
                                Retry
                            </button>
                        </div>
                    ) : enquiries.length === 0 ? (
                        <div className='enq-state enq-state--empty'>
                            <FaEnvelope aria-hidden='true' />
                            <p>No enquiries found.</p>
                            {(search || typeFilter !== 'all' || statusFilter !== 'all') && (
                                <button
                                    className='enq-retry-btn'
                                    onClick={() => {
                                        setSearch('');
                                        setTypeFilter('all');
                                        setStatusFilter('all');
                                        setResolvedFilter('all');
                                    }}
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <p className='enq-results-count'>
                                {enquiries.length} {enquiries.length === 1 ? 'enquiry' : 'enquiries'}
                            </p>
                            <ul className='enq-list__items'>
                                {enquiries.map(enq => {
                                    const typeCfg   = TYPE_CONFIG[enq.type] || TYPE_CONFIG.general;
                                    const statusCfg = STATUS_CONFIG[enq.status] || STATUS_CONFIG.new;
                                    const TypeIcon  = typeCfg.icon;
                                    const isSelected = selected?._id === enq._id;

                                    return (
                                        <li
                                            key={enq._id}
                                            className={`enq-item ${isSelected ? 'enq-item--selected' : ''} ${enq.status === 'new' ? 'enq-item--new' : ''}`}
                                            onClick={() => setSelected(enq)}
                                            role='button'
                                            tabIndex={0}
                                            onKeyDown={(e) => e.key === 'Enter' && setSelected(enq)}
                                            aria-label={`View enquiry from ${enq.name}`}
                                        >
                                            {/* Type icon */}
                                            <div
                                                className='enq-item__icon'
                                                style={{ background: typeCfg.color }}
                                                aria-hidden='true'
                                            >
                                                <TypeIcon />
                                            </div>

                                            {/* Main content */}
                                            <div className='enq-item__content'>
                                                <div className='enq-item__top-row'>
                                                    <span className='enq-item__name'>{enq.name}</span>
                                                    <span className='enq-item__date'>
                                                        {formatDate(enq.createdAt)}
                                                    </span>
                                                </div>
                                                <div className='enq-item__mid-row'>
                                                    <span className='enq-item__email'>{enq.email}</span>
                                                    {enq.business && (
                                                        <span className='enq-item__business'>
                                                            {enq.business}
                                                        </span>
                                                    )}
                                                </div>
                                                {enq.message && (
                                                    <p className='enq-item__preview'>
                                                        {enq.message.slice(0, 100)}
                                                        {enq.message.length > 100 ? '…' : ''}
                                                    </p>
                                                )}
                                                <div className='enq-item__bottom-row'>
                                                    {/* Type badge */}
                                                    <span
                                                        className='enq-item__type-badge'
                                                        style={{ background: typeCfg.color }}
                                                    >
                                                        {typeCfg.label}
                                                    </span>
                                                    {/* Status badge */}
                                                    <span
                                                        className='enq-item__status-badge'
                                                        style={{
                                                            color: statusCfg.color,
                                                            background: statusCfg.bg,
                                                        }}
                                                    >
                                                        {statusCfg.label}
                                                    </span>
                                                    {/* Resolved indicator */}
                                                    {enq.resolvedAt && (
                                                        <span className='enq-item__resolved'>
                                                            <FaCheckCircle aria-hidden='true' /> Resolved
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <FaChevronRight
                                                className='enq-item__arrow'
                                                aria-hidden='true'
                                            />
                                        </li>
                                    );
                                })}
                            </ul>
                        </>
                    )}
                </div>

                {/* Detail panel — shown when an enquiry is selected */}
                {selected && (
                    <EnquiryDetailPanel
                        enquiry={selected}
                        onClose={() => setSelected(null)}
                        onUpdated={() => {
                            fetchEnquiries();
                            setSelected(null);
                        }}
                        config={config}
                    />
                )}

            </div>
        </div>
    );
};

export default AdminEnquiriesPage;