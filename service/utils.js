module.exports = {
    isString : isString
}

/**
 * Returns true if the passed parameter is a string.
 * 
 * @param {*} parameter - The object we're checking is a String
 * @return {boolean}
 */
function isString(parameter) {
    return parameter != null && (typeof parameter === "string" || parameter instanceof String) ? true : false;
}