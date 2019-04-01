exports.formatZipCodes = function formatZipCodes (zipCodes) {
  return zipCodes.map(zip => {
    return parseInt(zip);
  });
};