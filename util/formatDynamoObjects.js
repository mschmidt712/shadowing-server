exports.formatObject = function formatObject (obj, formattedObject, originalKey) {
    for (const key in obj) {
      let newKey = originalKey ? originalKey : key;
      
      if (typeof obj[key] == 'object' && !Array.isArray(obj[key]) && Object.keys(obj)[0] !== 'M') {
        formatObject(obj[key], formattedObject, newKey);
      } else if (Object.keys(obj)[0] == 'M') {
        formattedObject[newKey] = formatObject(obj[key], {});
      } else {
        formattedObject[originalKey] = obj[key];
      }
    }
  
    return formattedObject;
  };