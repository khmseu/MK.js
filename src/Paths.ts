import { resolve } from "path";

function evalTemplate(template: string, map: { [x: string]: string }) {
  return template.replace(/\$\{\w+\}/g, (match) => {
    console.log("map ", match, " -> ", map[match.slice(2, -1)]);
    return map[match.slice(2, -1)];
  });
}

function resolveAll(template: string) {
  while (template.match(/\$\{\w+\}/)) template = evalTemplate(template, vars);
  return resolve(template);
}
export function stage(sel: string) {
  return resolveAll(vars.DEST + vars[sel]);
}

export function final(sel: string) {
  return resolveAll(vars[sel]);
}

export function set_var(s: string, d: string) {
  vars[s] = d;
}

const vars: {
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
} & {
  [sel: string]: string;
} = {
  DEST: "",
  prefix: "/usr/local",
  exec_prefix: "${prefix}",
  bin: "${exec_prefix}/bin",
  sbin: "${exec_prefix}/sbin",
  libexec: "${exec_prefix}/libexec",
  dataroot: "${prefix}/share",
  data: "${dataroot}",
  sysconf: "${prefix}/etc",
  sharedstate: "${prefix}/com",
  localstate: "${prefix}/var",
  include: "${prefix}/include",
  oldinclude: "/usr/include",
  doc: "${dataroot}/doc/${YOURPKG}",
  info: "${dataroot}/info",
  html: "${docdir}",
  dvi: "${docdir}",
  pdf: "${docdir}",
  ps: "${docdir}",
  lib: "${exec_prefix}/lib",
  lisp: "${dataroot}/emacs/site-lisp",
  locale: "${dataroot}/locale",
  man: "${dataroot}/man",
  man1: "${man}/man1",
  man2: "${man}/man2",
  man3: "${man}/man3",
  man4: "${man}/man4",
  man5: "${man}/man5",
  man6: "${man}/man6",
  man7: "${man}/man7",
  man8: "${man}/man8",
  man9: "${man}/man9",
  src: resolve(),
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
