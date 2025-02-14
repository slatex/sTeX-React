
export function hasFtmlAttribute(node) {
  if (node.tagName.toLowerCase() === "img") {
    // replace "srv:" by server url
    const attributes = node.attributes;
    for (let i = 0; i < attributes.length; i++) {
        if (attributes[i].name === 'src') {
            const src = attributes[i].value;
            if (src.startsWith('srv:')) {
                attributes[i].value = src.replace('srv:', window.FLAMS_SERVER_URL);
            }
        }
    }
  }
  //if (node.tagName.toLowerCase() === "section") {return true}
  const attributes = node.attributes;
  for (let i = 0; i < attributes.length; i++) {
      if (attributes[i].name.startsWith('data-ftml-')) {
          return true;
      }
  }
  return false;
}

window.FLAMS_SERVER_URL = "https://flams.mathhub.info";

export function setServerUrl(url) {
  window.FLAMS_SERVER_URL = url;
  set_server_url(url);
}
