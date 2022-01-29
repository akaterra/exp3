export type RelationRef = Array<string | Function>;

export type RelationOpts = {
  includes?: string[] | Function,
  requires?: string[] | Function,
}

export class Relation {
  l: RelationRef;
  opts: RelationOpts;
  r: RelationRef;
  resolver: Resolver;
  source: Source;
  target: Source;

  constructor(
    resolver: Resolver,
    source: Source,
    relation:
      string |
      [

        string |
        Function |
        string[] |
        Function[],

        string |
        Function |
        string[] |
        Function[]

      ] |
      Map<string, string | Function>,
    target: Source,
    opts?: RelationOpts,
  );
}

export class Resolver {};

export class Source {};
