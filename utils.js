export function isRelativePath(path) {
  return !/^(\/|http(s?)|asset)/.test(path);
}

export function djb2Code(str) {
  var hash = 5381, i, char;
  for (i = 0; i < str.length; i++) {
      char = str.charCodeAt(i);
      hash = ((hash << 5) + hash) + char; /* hash * 33 + c */
  }
  return hash;
}
