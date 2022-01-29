const _ = require('lodash');
const BELONGS = 0;
const HAS = 1;
const Empty = require('./const').EMPTY;
const OperationContext = require('./operation_context').OperationContext;
const RelatiionParser = require('./relation_parser');
const Source = require('./source').Source;
const Transaction = require('./transaction').Transaction;

class Relation {
  /**
   * 
   * @param {*} resolver 
   * @param {*} source 
   * @param {*} relation
   * string : l=[value], r=[value]
   * [string|function, string|function] : l=[[0]], r=[[1]]
   * [string[]|function[], string[]|function[]] : l=[0], r=[1]
   * object : l=[keys], r=[values]
   * @param {*} target 
   * @param {*} opts
   * {
   *   includes: string[]|function
   *   requires: string[]|function
   * }
   */
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

    if (Array.isArray(this.l) && Array.isArray(this.r)) {
      if (this.l.length !== this.r.length) {
        throw new Error(`Left relation ref key length is not same as right`);
      }
    }

    if (Array.isArray(this.l)) {
      for (const mapper of this.l) {
        if (!(typeof mapper === 'string') && !(typeof mapper === 'function')) {
          throw new Error(`Left relation mapped must be string or function`);
        }
      }
    }

    if (Array.isArray(this.r)) {
      for (const mapper of this.r) {
        if (!(typeof mapper === 'string') && !(typeof mapper === 'function')) {
          throw new Error(`Right relation mapped must be string or function`);
        }
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
  get context() {
    return this._context ?? new OperationContext();
  }

  get parallel() {
    return this.setParallel();
  }

  get transactional() {
    return this.setTransactional();
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

  setParallel() {
    this._parallel = true;

    return this;
  }

  setTransactional(context) {
    this._context = context ?? this._context ?? new OperationContext();

    return this;
  }

  addRelaton(source, relation, target, opts) {
    if (Array.isArray(source)) {
      source = (source[0] instanceof Source ? source : this.getSource(source)).stream(source[1]);
    }

    if (Array.isArray(target)) {
      target = (target[0] instanceof Source ? target : this.getSource(target)).stream(target[1]);
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
      relations = relations.reduce((acc, relation) => {
        if (typeof relation === 'string') {
          acc.splice(acc.length - 1, 0, ...RelatiionParser.parseAndBuild(relation));
        } else {
          acc.push(relation);
        }

        return acc;
      }, []);

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

    return opts?.compact ? { items, related } : items;
  }

  async transaction(fn, opts) {
    const transaction = new Transaction(this, new OperationContext(opts?.operationName, opts));

    try {
      const result = fn(transaction);

      if (result instanceof Promise) {
        return result.then(async (res) => {
          await transaction.commit();

          return res;
        }).catch(async (err) => {
          await transaction.rollback();

          return Promise.reject(err);
        });
      }
      
      await transaction.commit();

      return result;
    } catch (err) {
      await transaction.rollback();

      return Promise.reject(err);
    }
  }

  async insertGraph(source, graph, opts, context) {
    return this.upsertGraph(source, graph, { ...opts, insert: true }, context);
  }

  async selectCompact(source, query, ...relations) {
    return this.select(source, query, { compact: true }, ...relations);
  }

  async selectGraph(source, query, ...relations) {
    return this.select(source, query, undefined, ...relations);
  }

  async upsertGraph(source, items, opts, context) {
    const internalContext = context ?? this._isContext();

    try {
      const currentSource = this.getSource(source);

      if (!currentSource) {
        throw new Error(`Unknown source "${source}"`);
      }

      const sourceRelations = this._relations.get(currentSource.name);

      for (const item of Array.isArray(items) ? items : [items.items]) {
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

            if (relation) {
              if (Array.isArray(opts?.unrelate) && opts.unrelate.includes(relationKey)) {
                for (const k of currentSourceRelation.l) {
                  item[k] = null;
                }  
              } else {
                await this.upsertGraph(currentSourceRelation.target.name, { items: relation }, opts, internalContext);

                if (Array.isArray(relation)) {
                  for (const rel of relation) {
                    Object.assign(item, currentSourceRelation.getRelationFilterOfSource(rel));
                  }
                } else {
                  Object.assign(item, currentSourceRelation.getRelationFilterOfSource(relation));
                }
              }
            }
          }
        }

        Object.assign(
          item,
          opts?.insert
            ? (await this._sources.get(source).insert(item, opts, internalContext))?.[0]
            : (await this._sources.get(source).upsert(item, opts, internalContext))?.[0],
        );

        if (sourceRelations) {
          for (const [relationKey, relation] of Object.entries(related.has)) {
            const currentSourceRelation = sourceRelations.get(relationKey);

            if (relation) {
              if (Array.isArray(opts?.unrelate) && opts.unrelate.includes(relationKey)) {
              } else {
                if (Array.isArray(relation)) {
                  for (const rel of relation) {
                    Object.assign(rel, currentSourceRelation.getRelationFilterOfTarget(item));
                  }
                } else {
                  Object.assign(relation, currentSourceRelation.getRelationFilterOfTarget(item));
                }

                await this.upsertGraph(currentSourceRelation.target.name, { items: relation }, opts, internalContext);
              }
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

      if (!context && internalContext) {
        await internalContext.commit();
      }

      return items;
    } catch (err) {
      if (!context && internalContext) {
        await internalContext.rollback();
      }

      return Promise.reject(err);
    }
  }

  _isContext() {
    const isContext = this._context;
    this._context = null;

    return isContext ?? null;
  }

  _isParallel() {
    const isParallel = this._parallel;
    this._parallel = false;

    return isParallel;
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

    if (opts?.compact && !related[sourceRelation.target.name]) {
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

      if (!opts?.compact) {
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
        if (opts?.compact) {
          related[sourceRelation.target.name][sourceField.idKey] = relatedTargets.get(sourceField.rfKey);
        }

        for (const relatedTarget of relatedTargets.get(sourceField.rfKey)) {
          relatedTarget.$$_ind = !opts?.compact ? i : sourceField.index;
          relatedTarget.$$_drt = false;
        }

        if (!opts?.compact) {
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
