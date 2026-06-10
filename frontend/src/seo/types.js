/**
 * @typedef {Object} SeoOrganization
 * @property {string} name
 * @property {string} description
 * @property {string} phone
 * @property {string} email
 * @property {string} address
 */

/**
 * @typedef {Object} SeoGlobalConfig
 * @property {string} siteName
 * @property {string} siteUrl
 * @property {string} defaultTitle
 * @property {string} defaultDescription
 * @property {string} defaultKeywords
 * @property {string} ogImageUrl
 * @property {string} twitterSite
 * @property {string} themeColor
 * @property {SeoOrganization} organization
 * @property {boolean} allowIndexing
 */

/**
 * @typedef {Object} SeoPageTemplate
 * @property {string} pageKey
 * @property {string} label
 * @property {string} titleTemplate
 * @property {string} descriptionTemplate
 * @property {string} keywordsTemplate
 * @property {string} robots
 * @property {string} ogImageUrl
 * @property {boolean} isActive
 */

/**
 * @typedef {Object} SeoPublicConfig
 * @property {SeoGlobalConfig} global
 * @property {SeoPageTemplate[]} pages
 */

export {};
