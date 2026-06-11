/**
 * @typedef {Object} HomeStatItem
 * @property {string} value
 * @property {string} label
 */

/**
 * @typedef {Object} HomeWhyItem
 * @property {string} number
 * @property {string} title
 * @property {string} description
 */

/**
 * @typedef {Object} HomeAreaItem
 * @property {string} title
 * @property {string} [subtitle]
 * @property {string} imageUrl
 * @property {string} [priceFrom]
 * @property {string} filterCity
 * @property {boolean} [isFeatured]
 * @property {boolean} [comingSoon]
 */

/**
 * @typedef {Object} HomeKindItem
 * @property {'homestay'|'mini_hotel'|'villa'|'serviced_apartment'} kind
 * @property {string} [badge]
 * @property {string} [countLabel]
 * @property {string} imageUrl
 */

/**
 * @typedef {Object} HomeReviewItem
 * @property {string} quote
 * @property {string} name
 * @property {string} [meta]
 * @property {string} [initials]
 * @property {number} [rating]
 */

/**
 * @typedef {Object} HomePageConfig
 * @property {boolean} statsEnabled
 * @property {HomeStatItem[]} stats
 * @property {boolean} whyEnabled
 * @property {string} whyEyebrow
 * @property {string} whyTitle
 * @property {string} whyDescription
 * @property {HomeWhyItem[]} whyItems
 * @property {boolean} areasEnabled
 * @property {string} areasEyebrow
 * @property {string} areasTitle
 * @property {string} areasSeeAllLabel
 * @property {string} areasSeeAllHref
 * @property {HomeAreaItem[]} areas
 * @property {boolean} kindsEnabled
 * @property {string} kindsEyebrow
 * @property {string} kindsTitle
 * @property {string} kindsDescription
 * @property {HomeKindItem[]} kinds
 * @property {boolean} reviewsEnabled
 * @property {string} reviewsEyebrow
 * @property {string} reviewsTitle
 * @property {HomeReviewItem[]} reviews
 * @property {boolean} newsletterEnabled
 * @property {string} newsletterTitle
 * @property {string} newsletterDescription
 * @property {string} newsletterPlaceholder
 * @property {string} newsletterButtonLabel
 * @property {string} newsletterSuccessMessage
 */

export {};
