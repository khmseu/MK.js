import { existsSync } from "fs";
import { join, resolve } from "path";
import { vars } from "./oVariables";
import { interpolate } from "./evalTemplate";

function resolveAll(template: string) {
  template = interpolate(template);
  return resolve(template);
}
export function stage(sel: string) {
  return resolveAll(join(path_table.DEST, path_table[sel]));
}

export function final(sel: string) {
  return resolveAll(path_table[sel]);
}

export function path(s: string, d: string): void;
export function path(s: string): string;
export function path(s: string, d?: string) {
  if (d === undefined || d === null) return path_table[s];
  path_table[s] = d;
}

export function paths() {
  return Object.keys(path_table).sort();
}

const path_table: {
  DEST: string;
  prefix: string;
  exec_prefix: string;
  bin: string;
  sbin: string;
  libexec: string;
  dataroot: string;
  data: string;
  sysconf: string;
  sharedstate: string;
  localstate: string;
  include: string;
  oldinclude: string;
  doc: string;
  info: string;
  html: string;
  dvi: string;
  pdf: string;
  ps: string;
  lib: string;
  lisp: string;
  locale: string;
  man: string;
  man1: string;
  man2: string;
  man3: string;
  man4: string;
  man5: string;
  man6: string;
  man7: string;
  man8: string;
  man9: string;
  src: string;
  pkgdatadir: string;
  pkgincludedir: string;
  pkglibdir: string;
  pkglibexecdir: string;
  distdir: string;
} & {
  [sel: string]: string;
} = {
  DEST: "",
  prefix: "/usr/local",
  exec_prefix: "${PATH.prefix}",
  bin: "${PATH.exec_prefix}/bin",
  sbin: "${PATH.exec_prefix}/sbin",
  libexec: "${PATH.exec_prefix}/libexec",
  dataroot: "${PATH.prefix}/share",
  data: "${PATH.dataroot}",
  sysconf: "${PATH.prefix}/etc",
  sharedstate: "${PATH.prefix}/com",
  localstate: "${PATH.prefix}/var",
  include: "${PATH.prefix}/include",
  oldinclude: "/usr/include",
  doc: "${PATH.dataroot}/doc/${PKG.PACKAGE}",
  info: "${PATH.dataroot}/info",
  html: "${PATH.docdir}",
  dvi: "${PATH.docdir}",
  pdf: "${PATH.docdir}",
  ps: "${PATH.docdir}",
  lib: "${PATH.exec_prefix}/lib",
  lisp: "${PATH.dataroot}/emacs/site-lisp",
  locale: "${PATH.dataroot}/locale",
  man: "${PATH.dataroot}/man",
  man1: "${PATH.man}/man1",
  man2: "${PATH.man}/man2",
  man3: "${PATH.man}/man3",
  man4: "${PATH.man}/man4",
  man5: "${PATH.man}/man5",
  man6: "${PATH.man}/man6",
  man7: "${PATH.man}/man7",
  man8: "${PATH.man}/man8",
  man9: "${PATH.man}/man9",
  src: resolve(),
  pkgdatadir: "${PATH.datadir}/${PKG.PACKAGE}",
  pkgincludedir: "${PATH.includedir}/${PKG.PACKAGE}",
  pkglibdir: "${PATH.libdir}/${PKG.PACKAGE}",
  pkglibexecdir: "${PATH.libexecdir}/${PKG.PACKAGE}",
  distdir: "${PKG.PACKAGE}-${PKG.VERSION}",
  manext: ".1",
  man1ext: ".1",
  man2ext: ".2",
  man3ext: ".3",
  man4ext: ".4",
  man5ext: ".5",
  man6ext: ".6",
  man7ext: ".7",
  man8ext: ".8",
  man9ext: ".9",
};

vars.PATH = path_table;
vars.VPATH = ["${PATH.srcdir}"];

export function source(sel: string) {
  const fn = interpolate(sel);
  for (const entry of vars.VPATH as string[]) {
    const full = resolve(interpolate(entry), fn);
    if (existsSync(full)) return full;
  }
  return resolve(fn);
}
