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
    sourceFieldOrMapper,
    target,
    targetFieldOrMapper,
    opts,
  ) {
    if (typeof sourceFieldOrMapper === 'function') {

    } else if (Array.isArray(sourceFieldOrMapper)) {
      for (const field of sourceFieldOrMapper) {
        if (!(typeof field === 'string')) {
          throw new Error(`Source "" field must be a function, string or list of strings`);
        }
      }
    } else if (typeof sourceFieldOrMapper === 'string') {
      sourceFieldOrMapper = [sourceFieldOrMapper];
    } else {
      throw new Error(`Source "" field must be a function, string or list of strings`);
    }

    if (typeof targetFieldOrMapper === 'function') {

    } else if (Array.isArray(targetFieldOrMapper)) {
      for (const field of targetFieldOrMapper) {
        if (!(typeof field === 'string')) {
          throw new Error(`Target "" field must be a function, string or list of strings`);
        }
      }
    } else if (typeof targetFieldOrMapper === 'string') {
      targetFieldOrMapper = [targetFieldOrMapper];
    } else {
      throw new Error(`Target "" field must be a function, string or list of strings`);
    }

    this.resolver = resolver;
    this.source = source;
    this.sourceFieldOrMapper = sourceFieldOrMapper;
    this.target = target;
    this.targetFieldOrMapper = targetFieldOrMapper;
    this.opts = opts;
    this.next = null;
  }

  addRelaton(sourceFieldOrMapper, target, targetFieldOrMapper, opts) {
    this.next = this.resolver.addRelaton(
      this.target,
      sourceFieldOrMapper,
      target,
      targetFieldOrMapper,
      opts,
    );

    return this.next;
  }

  addBelongsRelation(sourceFieldOrMapper, target, targetFieldOrMapper, opts) {
    return this.addRelaton(sourceFieldOrMapper, target, targetFieldOrMapper, { ...opts, direction: BELONGS });
  }

  addHasRelation(sourceFieldOrMapper, target, targetFieldOrMapper, opts) {
    return this.addRelaton(sourceFieldOrMapper, target, targetFieldOrMapper, { ...opts, direction: HAS });
  }
}

class Resolver {
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

  addRelaton(source, sourceFieldOrMapper, target, targetFieldOrMapper, opts) {
    if (Array.isArray(source)) {
      source = (source[0] instanceof Source ? source : this.getSource(source)).asSource(source[1]);
    }

    if (Array.isArray(target)) {
      target = (target[0] instanceof Source ? target : this.getSource(target)).asSource(target[1]);
    }

    const sourceRelation = new Relation(
      this,
      source,
      sourceFieldOrMapper,
      target,
      targetFieldOrMapper,
      opts,
    );

    if (!this._relations.has(source.name)) {
      this._relations.set(source.name, new Map());
    }

    this._relations.get(source.name).set(target.name, sourceRelation);

    // const targetRelation = new Relation(
    //   this,
    //   target,
    //   targetFieldOrMapper,
    //   source,
    //   sourceFieldOrMapper,
    //   opts,
    // );

    // if (!this._relations.has(target.name)) {
    //   this._relations.set(target.name, new Map());
    // }

    // this._relations.get(target.name).set(source.name, targetRelation);

    this.addSource(source).addSource(target);

    return sourceRelation;
  }

  addBelongsRelation(source, sourceFieldOrMapper, target, targetFieldOrMapper, opts) {
    return this.addRelaton(source, sourceFieldOrMapper, target, targetFieldOrMapper, { ...opts, direction: BELONGS });
  }

  addHasRelation(source, sourceFieldOrMapper, target, targetFieldOrMapper, opts) {
    return this.addRelaton(source, sourceFieldOrMapper, target, targetFieldOrMapper, { ...opts, direction: HAS });
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
      for (let relation of relations) {
        const sourceRelations = this._relations.get(currentSource.name);

        if (!sourceRelations) {
          throw new Error(`Unknown source ${source}`);
        }
  
        let sourceItems = items;
        let sourceRelation = sourceRelations.get(Array.isArray(relation) ? relation[0] : relation);
        let sourceRelationIndex = 0;

        while (sourceRelation) {
          if (!opts.graph && !related[sourceRelation.target.name]) {
            related[sourceRelation.target.name] = {};
          }

          let sourceFields = [];

          if (typeof sourceRelation.sourceFieldOrMapper === 'function') {
            sourceFields = await sourceRelation.sourceFieldOrMapper(sourceRelation.source, items, sourceRelation.opts);
          } else {
            sourceFields = sourceItems.map((r, index) => {
              const filter = sourceRelation.source.getRelationFilter(sourceRelation.targetFieldOrMapper, sourceRelation.sourceFieldOrMapper, r);

              if (query?.$$_rel?.[relation]?.filter) {
                Object.assign(filter, query.$$_rel[relation].filter);
              }

              const sourceField = {
                idKey: sourceRelation.source.getCombinedKey(sourceRelation.source.pk, r),
                index: r.$$_ind !== undefined ? r.$$_ind : index,
                query: { filter },
              };

              return sourceField;
            });
          }

          const prevSourceItems = sourceItems;
          sourceItems = [];

          let select;

          if (typeof sourceRelation.targetFieldOrMapper === 'function') {
            select = sourceRelation.targetFieldOrMapper.bind(sourceRelation.targetFieldOrMapper);
          } else {
            select = sourceRelation.target.select.bind(sourceRelation.target);
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

            if (sourceField.query !== undefined) {
              const relatedTargets = await select(sourceField.query);

              if (!opts?.graph) {
                related[sourceRelation.target.name][sourceField.idKey] = relatedTargets;
              }

              for (const relatedTarget of relatedTargets) {
                relatedTarget.$$_ind = opts?.graph ? i : sourceField.index;
                relatedTarget.$$_drt = false;
              }

              if (opts?.graph) {
                prevSourceItems[sourceField.index][sourceRelation.target.name] = relatedTargets;
              } else {
                items[sourceField.index].$$_rel[sourceRelation.target.name].push(sourceField.idKey);
              }

              sourceItems.splice(sourceItems.length, 0, ...relatedTargets);
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

module.exports = {
  Resolver,
  BELONGS,
  HAS,
};
