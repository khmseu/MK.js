import { ArrayOrOne } from './../../DependencyEngine/ArrayOrOne';

enum Flag {
  base,
  check,
  dist,
  EXTRA,
  inst,
  nobase = 10,
  nocheck,
  nodist,
  noEXTRA,
  noinst,
}
type ProgramArgs = {
  dir: string;
  flags?: ArrayOrOne<Flag>;

  sources?: ArrayOrOne<string>;
};

type SubdirFlag = Flag.dist | Flag.nodist;
type SubdirArgs = {
  flags?: ArrayOrOne<SubdirFlag>;

  dir: string;
};

// function

export function BuiltSources(sources: ArrayOrOne<string>) {}

export function Subdir({ dir, flags }: SubdirArgs) {}

export function Data({ dir, flags, sources }: ProgramArgs) {}
export function Header({ dir, flags, sources }: ProgramArgs) {}
export function Java({ dir, flags, sources }: ProgramArgs) {}
export function Library({ dir, flags, sources }: ProgramArgs) {}
export function Lisp({ dir, flags, sources }: ProgramArgs) {}
export function Ltlibrary({ dir, flags, sources }: ProgramArgs) {}
export function Man({ dir, flags, sources }: ProgramArgs) {}
export function Program({ dir, flags, sources }: ProgramArgs) {}
export function Python({ dir, flags, sources }: ProgramArgs) {}
export function Script({ dir, flags, sources }: ProgramArgs) {}
export function Texinfo({ dir, flags, sources }: ProgramArgs) {}
