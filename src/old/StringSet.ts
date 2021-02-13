export class StringSet extends Set<string> {
  isSubsetOf(other: StringSet) {
    for (let elem of this) {
      if (!other.has(elem)) {
        return false;
      }
    }
    return true;
  }
}
