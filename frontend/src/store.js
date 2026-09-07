function keyFor(name) {
  return 'itisep_offline_' + name;
}

export function getCollection(name) {
  try {
    return JSON.parse(localStorage.getItem(keyFor(name)) || '[]');
  } catch {
    return [];
  }
}

export function pushItem(name, item) {
  const list = getCollection(name);
  list.unshift(item);
  try {
    localStorage.setItem(keyFor(name), JSON.stringify(list));
  } catch {
    // storage may be full or unavailable
  }
  window.dispatchEvent(new Event('storage'));
}