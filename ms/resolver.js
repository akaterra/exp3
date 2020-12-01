const { Arr } = require('invary');
const _ = require('lodash');
const { ObjectId } = require('mongodb');
const BELONGS = 0;
const HAS = 1;
const Empty = require('./const').Empty;

class Relation {
  constructor(
    resolver,
    source,
    sourceFieldOrMapper,
    target,
    targetFieldOrMapper,
    opts,
  ) {
    this.resolver = resolver;
    this.source = source;
    this.sourceFieldOrMapper = sourceFieldOrMapper;
    this.target = target;
    this.targetFieldOrMapper = targetFieldOrMapper;
    this.opts = opts;
    this.next = null;
  }

  getSource(source) {
    if (this._sources.has(source)) {
      return this._sources.get(source);
    }

    throw new Error(`Source not registered "${source}"`);
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
    if (!this._sources.has(source)) {
      return [];
    }

    const items = await this._sources.get(source).select(query);
    const related = {};

    if (relations.length) {
      for (let relation of relations) {
        const sourceRelations = this._relations.get(source);

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

          if (typeof sourceRelation.sourceFieldOrMapper === 'string') {
            sourceFields = sourceItems.map((r, index) => {
              let queryFieldVal = _.get(r, sourceRelation.sourceFieldOrMapper);

              if (sourceRelation.opts?.targetPk) {
                queryFieldVal = sourceRelation.target.map('pk', sourceRelation.opts.targetPk, queryFieldVal);
              }

              const sourceField = {
                id: _.get(r, sourceRelation.sourceFieldOrMapper),
                index: r.$$_ind !== undefined ? r.$$_ind : index,
                query: queryFieldVal === undefined ? undefined : {
                  filter: {
                    [sourceRelation.targetFieldOrMapper]: queryFieldVal,
                  },
                },
              };

              if (query?.$$_rel?.[relation]?.filter) {
                sourceField.query.filter = Object.assign(sourceField.query.filter, query.$$_rel[relation].filter);
              }

              return sourceField;
            });
          } else if (typeof sourceRelation.sourceFieldOrMapper === 'function') {
            sourceFields = await sourceRelation.sourceFieldOrMapper(sourceRelation.source, items, sourceRelation.opts);
          } else {
            throw new Error('Unsupported type of source field mapper');
          }

          const prevSourceItems = sourceItems;
          sourceItems = [];

          let select;

          if (typeof sourceRelation.targetFieldOrMapper === 'string') {
            select = sourceRelation.target.select.bind(sourceRelation.target);
          } else if (typeof sourceRelation.targetFieldOrMapper === 'function') {
            select = sourceRelation.targetFieldOrMapper.bind(sourceRelation.targetFieldOrMapper);
          } else {
            throw new Error('Unsupported type of target field mapper');
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
                related[sourceRelation.target.name][sourceField.id] = relatedTargets;
              }

              for (const relatedTarget of relatedTargets) {
                relatedTarget.$$_ind = opts?.graph ? i : sourceField.index;
              }

              if (opts?.graph) {
                prevSourceItems[sourceField.index][sourceRelation.target.name] = relatedTargets;
              } else {
                items[sourceField.index].$$_rel[sourceRelation.target.name].push(String(sourceField.id));
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

  async selectGraph(source, query, ...relations) {
    return this.select(source, query, { graph: true }, ...relations);
  }

  async upsertGraph(source, graph) {

  }
}

module.exports = {
  Resolver,
  BELONGS,
  HAS,
};
