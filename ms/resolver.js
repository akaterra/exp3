const { Arr } = require('invary');
const _ = require('lodash');
const { ObjectId } = require('mongodb');
const { type } = require('os');
const BELONGS = 0;
const HAS = 1;
const Empty = require('./const').Empty;
const Source = require('./source').Source;

class Relation {
  constructor(
    resolver,
    source,
    relation,
    target,
    opts,
  ) {
    if (typeof relation === 'string') {
      this.l = [relation];
      this.r = [relation];
    } else if (Array.isArray(relation) && relation.length >= 2) {
      this.l = Array.isArray(relation[0]) ? relation[0] : [relation[0]];
      this.r = Array.isArray(relation[1]) ? relation[1] : [relation[1]];
    } else if (relation && typeof relation === 'object') {
      this.l = Object.keys(relation);
      this.r = Object.values(relation);
    } else {
      throw new Error(`Relation must be string, list of strings/functions or mapping object`);
    }

    if (this.l.length !== this.r.length) {
      throw new Error(`Left relation length is not same as right`);
    }

    for (const mapper of this.l) {
      if (!(typeof mapper === 'string') && !(typeof mapper === 'function')) {
        throw new Error(`Left relation mapped must be string or function`);
      }
    }

    for (const mapper of this.r) {
      if (!(typeof mapper === 'string') && !(typeof mapper === 'function')) {
        throw new Error(`Right relation mapped must be string or function`);
      }
    }

    this.resolver = resolver;
    this.source = source;
    this.target = target;
    this.opts = opts;
    this.next = null;
  }

  addRelaton(relation, target, opts) {
    this.next = this.resolver.addRelaton(
      this.target,
      relation,
      target,
      opts,
    );

    return this.next;
  }

  addBelongsRelation(relation, target, opts) {
    return this.addRelaton(relation, target, { ...opts, direction: BELONGS });
  }

  addHasRelation(relation, target, opts) {
    return this.addRelaton(relation, target, { ...opts, direction: HAS });
  }

  getCombinedKeyOfSource(value) {
    return this.source.getCombinedKey(this.l, value);
  }

  getCombinedKeyOfTarget(value) {
    return this.target.getCombinedKey(this.r, value);
  }

  getRelationFilterOfSource(value) {
    return this.source.getRelationFilter(this.l, this.r, value);
  }

  getRelationFilterOfTarget(value) {
    return this.target.getRelationFilter(this.r, this.l, value);
  }
}

class Resolver {
  get parallel() {
    this._parallel = true;

    return this;
  }

  constructor() {
    this._relations = new Map();
    this._sources = new Map();
  }

  getSource(source) {
    if (source instanceof Source) {
      source = source.name;
    }

    if (this._sources.has(source)) {
      return this._sources.get(source);
    }

    throw new Error(`Source not registered "${source}"`);
  }

  addRelaton(source, relation, target, opts) {
    if (Array.isArray(source)) {
      source = (source[0] instanceof Source ? source : this.getSource(source)).asSource(source[1]);
    }

    if (Array.isArray(target)) {
      target = (target[0] instanceof Source ? target : this.getSource(target)).asSource(target[1]);
    }

    const sourceRelation = new Relation(
      this,
      source,
      relation,
      target,
      opts,
    );

    if (!this._relations.has(source.name)) {
      this._relations.set(source.name, new Map());
    }

    this._relations.get(source.name).set(target.name, sourceRelation);

    this.addSource(source).addSource(target);

    return sourceRelation;
  }

  addBelongsRelation(source, relation, target, opts) {
    return this.addRelaton(source, relation, target, { ...opts, direction: BELONGS });
  }

  addHasRelation(source, relation, target, opts) {
    return this.addRelaton(source, relation, target, { ...opts, direction: HAS });
  }

  addSource(source) {
    if (!this._sources.has(source.name)) {
      this._sources.set(source.name, source);
    }

    return this;
  }

  async select(source, query, opts, ...relations) {
    const currentSource = this.getSource(source);

    if (!currentSource) {
      return [];
    }

    const items = await currentSource.select(query);

    for (const item of items) {
      item.$$_drt = false;
    }

    const related = {};

    if (relations.length) {
      if (this._parallel) {
        this._parallel = false;

        await Promise.all(
          relations.map((relation) => select.call(this, items, related, currentSource, relation, null, query, opts)),
        );
      } else {
        const relatedTargets = new Map();

        for (let relation of relations) {
          await select.call(this, items, related, currentSource, relation, relatedTargets, query, opts);
        }
      }
    }

    return { items, related };
  }

  async insertGraph(source, graph, opts) {
    return this.upsertGraph(source, graph, { ...opts, insert: true });
  }
  
  async selectGraph(source, query, ...relations) {
    return this.select(source, query, { graph: true }, ...relations);
  }

  async upsertGraph(source, graph, opts) {
    const currentSource = this.getSource(source);

    if (!currentSource) {
      throw new Error(`Unknown source "${source}"`);
    }

    const sourceRelations = this._relations.get(currentSource.name);
    const items = graph.items;

    for (const item of items) {
      const related = { belongs: {}, has: {} };

      if (sourceRelations) {
        for (const relationKey of sourceRelations.keys()) {
          if (relationKey in item) {
            if (sourceRelations.get(relationKey).opts?.direction === BELONGS) {
              related.belongs[relationKey] = item[relationKey];
            } else {
              related.has[relationKey] = item[relationKey];
            }

            delete item[relationKey];
          }
        }
      }

      if (sourceRelations) {
        for (const [relationKey, relation] of Object.entries(related.belongs)) {
          const currentSourceRelation = sourceRelations.get(relationKey);

          if (relation?.length) {
            await this.upsertGraph(currentSourceRelation.target.name, { items: relation }, opts);

            item[currentSourceRelation.sourceFieldOrMapper] = relation[0][currentSourceRelation.targetFieldOrMapper];
          }
        }
      }

      Object.assign(
        item,
        opts?.insert
          ? (await this._sources.get(source).insert(item, opts))?.[0]
          : (await this._sources.get(source).upsert(item, opts))?.[0],
      );

      if (sourceRelations) {
        for (const [relationKey, relation] of Object.entries(related.has)) {
          const currentSourceRelation = sourceRelations.get(relationKey);

          if (relation?.length) {
            relation[0][currentSourceRelation.targetFieldOrMapper] = item[currentSourceRelation.sourceFieldOrMapper];

            await this.upsertGraph(currentSourceRelation.target.name, { items: relation }, opts);
          }
        }

        for (const [relationKey, relation] of Object.entries(related.belongs)) {
          item[relationKey] = relation;
        }

        for (const [relationKey, relation] of Object.entries(related.has)) {
          item[relationKey] = relation;
        }
      }
    }

    return graph;
  }
}

async function select(items, related, currentSource, relation, relatedTargets, query, opts) {
  if (!relatedTargets) {
    relatedTargets = new Map();
  }

  const sourceRelations = this._relations.get(currentSource.name);

  if (!sourceRelations) {
    throw new Error(`Unknown source ${source}`);
  }

  let sourceItems = items;
  let sourceRelation = sourceRelations.get(Array.isArray(relation) ? relation[0] : relation);
  let sourceRelationIndex = 0;

  while (sourceRelation) {
    relatedTargets.clear();

    if (!opts.graph && !related[sourceRelation.target.name]) {
      related[sourceRelation.target.name] = {};
    }

    let sourceFields = [];

    sourceFields = sourceItems.map((r, index) => {
      const filter = sourceRelation.getRelationFilterOfTarget(r);

      if (query?.$$_rel?.[relation]?.filter) {
        Object.assign(filter, query.$$_rel[relation].filter);
      }

      const sourceField = {
        idKey: sourceRelation.source.getCombinedKey(sourceRelation.source.pk, r),
        index: r.$$_ind !== undefined ? r.$$_ind : index,
        query: { filter },
        rfKey: sourceRelation.getCombinedKeyOfSource(r),
      };

      return sourceField;
    });

    const prevSourceItems = sourceItems;
    sourceItems = [];

    for (const relatedTarget of await sourceRelation.target.selectIn(sourceFields.map((f) => f.query.filter))) {
      const relatedTargetKey = sourceRelation.getCombinedKeyOfTarget(relatedTarget);

      if (!relatedTargets.has(relatedTargetKey)) {
        relatedTargets.set(relatedTargetKey, []);
      }

      relatedTargets.get(relatedTargetKey).push(relatedTarget);
    }

    for (let i = 0, l = sourceFields.length; i < l; i += 1) {
      const sourceField = sourceFields[i];

      if (opts?.graph) {
        if (!prevSourceItems[sourceField.index][sourceRelation.target.name]) {
          prevSourceItems[sourceField.index][sourceRelation.target.name] = [];
        }
      } else {
        if (!items[sourceField.index].$$_rel) {
          items[sourceField.index].$$_rel = {};
        }

        if (!items[sourceField.index].$$_rel[sourceRelation.target.name]) {
          items[sourceField.index].$$_rel[sourceRelation.target.name] = [];
        }
      }

      if (relatedTargets.get(sourceField.rfKey)) {
        if (!opts?.graph) {
          related[sourceRelation.target.name][sourceField.idKey] = relatedTargets.get(sourceField.rfKey);
        }

        for (const relatedTarget of relatedTargets.get(sourceField.rfKey)) {
          relatedTarget.$$_ind = opts?.graph ? i : sourceField.index;
          relatedTarget.$$_drt = false;
        }

        if (opts?.graph) {
          prevSourceItems[sourceField.index][sourceRelation.target.name] = relatedTargets.get(sourceField.rfKey);
        } else {
          items[sourceField.index].$$_rel[sourceRelation.target.name].push(sourceField.idKey);
        }

        sourceItems.splice(sourceItems.length, 0, ...relatedTargets.get(sourceField.rfKey));
      }
    }

    const targetRelations = this._relations.get(sourceRelation.target.name);

    if (!targetRelations) {
      sourceRelation = null;
    } else {
      sourceRelation = Array.isArray(relation) ? targetRelations.get(relation[sourceRelationIndex += 1]) : sourceRelation.next;
    }
  }
}

module.exports = {
  Resolver,
  BELONGS,
  HAS,
};
