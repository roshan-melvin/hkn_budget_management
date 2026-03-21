// src/utils/timezone.js
/**
 * Utility functions for handling timezone conversions
 * All timestamps are stored as Unix timestamps (seconds since epoch) in UTC
 * This module provides functions to convert them to user-friendly formats
 */

/**
 * Convert Unix timestamp to ISO string in UTC
 * @param {number} unixTimestamp - Unix timestamp in seconds
 * @returns {string|null} ISO 8601 formatted string or null
 */
function toISO(unixTimestamp) {
    if (!unixTimestamp) return null;
    return new Date(unixTimestamp * 1000).toISOString();
}

/**
 * Convert Unix timestamp to a localized string in the user's timezone
 * @param {number} unixTimestamp - Unix timestamp in seconds
 * @param {string} timezone - IANA timezone string (e.g., 'Asia/Kolkata', 'America/New_York')
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string|null} Formatted date string or null
 */
function toLocalizedString(unixTimestamp, timezone = 'UTC', options = {}) {
    if (!unixTimestamp) return null;

    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
        ...options
    };

    try {
        const date = new Date(unixTimestamp * 1000);
        return new Intl.DateTimeFormat('en-US', {
            ...defaultOptions,
            timeZone: timezone
        }).format(date);
    } catch (error) {
        console.error(`Invalid timezone: ${timezone}`, error);
        // Fallback to UTC if timezone is invalid
        return new Intl.DateTimeFormat('en-US', {
            ...defaultOptions,
            timeZone: 'UTC'
        }).format(new Date(unixTimestamp * 1000));
    }
}

/**
 * Format a Unix timestamp for API responses with multiple representations
 * @param {number} unixTimestamp - Unix timestamp in seconds
 * @param {string} timezone - User's IANA timezone string
 * @returns {object|null} Object with unix, iso, and localized representations
 */
function formatTimestamp(unixTimestamp, timezone = 'UTC') {
    if (!unixTimestamp) return null;

    return {
        unix: unixTimestamp,
        iso: toISO(unixTimestamp),
        localized: toLocalizedString(unixTimestamp, timezone),
        timezone: timezone
    };
}

/**
 * Get current Unix timestamp in seconds
 * @returns {number} Current Unix timestamp
 */
function getCurrentTimestamp() {
    return Math.floor(Date.now() / 1000);
}

/**
 * Calculate the difference between two timestamps in days
 * @param {number} startTimestamp - Start Unix timestamp in seconds
 * @param {number} endTimestamp - End Unix timestamp in seconds (defaults to now)
 * @returns {number} Difference in days
 */
function getDaysDifference(startTimestamp, endTimestamp = null) {
    if (!startTimestamp) return null;
    const end = endTimestamp || getCurrentTimestamp();
    return Math.floor((end - startTimestamp) / 86400);
}

/**
 * Validate if a string is a valid IANA timezone
 * @param {string} timezone - Timezone string to validate
 * @returns {boolean} True if valid, false otherwise
 */
function isValidTimezone(timezone) {
    if (!timezone) return false;
    try {
        Intl.DateTimeFormat(undefined, { timeZone: timezone });
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Format multiple timestamps for a user
 * @param {object} data - Object containing timestamp fields
 * @param {string[]} timestampFields - Array of field names that are timestamps
 * @param {string} timezone - User's timezone
 * @returns {object} Object with formatted timestamps
 */
function formatTimestamps(data, timestampFields, timezone = 'UTC') {
    const result = { ...data };

    timestampFields.forEach(field => {
        if (data[field]) {
            result[field] = formatTimestamp(data[field], timezone);
        }
    });

    return result;
}

module.exports = {
    toISO,
    toLocalizedString,
    formatTimestamp,
    getCurrentTimestamp,
    getDaysDifference,
    isValidTimezone,
    formatTimestamps
};
