"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paths = exports.path = exports.final = exports.stage = void 0;
const path_1 = require("path");
function evalTemplate(template, map) {
    return template.replace(/\$\{\w+\}/g, (match) => {
        console.log("map ", match, " -> ", map[match.slice(2, -1)]);
        return map[match.slice(2, -1)];
    });
}
function resolveAll(template) {
    while (template.match(/\$\{\w+\}/))
        template = evalTemplate(template, path_table);
    return path_1.resolve(template);
}
function stage(sel) {
    return resolveAll(path_1.join(path_table.DEST, path_table[sel]));
}
exports.stage = stage;
function final(sel) {
    return resolveAll(path_table[sel]);
}
exports.final = final;
function path(s, d) {
    if (d === undefined || d === null)
        return path_table[s];
    path_table[s] = d;
}
exports.path = path;
function paths() {
    return Object.keys(path_table).sort();
}
exports.paths = paths;
const path_table = {
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
    src: path_1.resolve(),
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
