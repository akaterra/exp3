const _ = require('lodash');
const { ObjectId } = require('mongodb');
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
}

class Resolver {
  constructor() {
    this._relations = new Map();
    this._sources = new Map();
  }

  addRelaton(source, sourceFieldOrMapper, target, targetFieldOrMapper, opts) {
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

  addSource(source) {
    if (!this._sources.has(source.name)) {
      this._sources.set(source.name, source);
    }

    return this;
  }

  async query(source, query, ...relations) {
    if (!this._sources.has(source)) {
      return [];
    }

    const items = await this._sources.get(source).query(query);
    const related = {};

    if (relations.length) {
      for (let relation of relations) {
        const sourceRelations = this._relations.get(source);
        let currentRelation = sourceRelations.get(relation);

        if (!relation) {
          throw new Error(`Unknown subrelation source ${subrelation}`)
        }

        related[relation] = {};

        while (currentRelation) {
          let sourceFields = [];

          if (typeof currentRelation.sourceFieldOrMapper === 'string') {
            sourceFields = items.map((r, index) => {
              let queryFieldVal = _.get(r, currentRelation.sourceFieldOrMapper);

              if (currentRelation.opts?.targetPk) {
                queryFieldVal = currentRelation.target.map('pk', currentRelation.opts.targetPk, queryFieldVal);
              }

              const sourceField = {
                id: _.get(r, currentRelation.sourceFieldOrMapper),
                index: r.$$_ind !== undefined ? r.$$_ind : index,
                query: queryFieldVal === undefined ? undefined : {
                  filter: {
                    [currentRelation.targetFieldOrMapper]: queryFieldVal,
                  },
                },
              };

              if (query?.$$_rel?.[relation]?.filter) {
                sourceField.query.filter = Object.assign(sourceField.query.filter, query.$$_rel[relation].filter);
              }

              return sourceField;
            });
          } else if (typeof currentRelation.sourceFieldOrMapper === 'function') {
            sourceFields = await currentRelation.sourceFieldOrMapper(currentRelation.source, items, currentRelation.opts);
          } else {
            throw new Error('Unsupported type of source field mapper');
          }

          if (typeof currentRelation.targetFieldOrMapper === 'string') {
            for (const sourceField of sourceFields) {
              if (!items[sourceField.index].$$_rel) {
                items[sourceField.index].$$_rel = {};
              }

              if (!items[sourceField.index].$$_rel[relation]) {
                items[sourceField.index].$$_rel[relation] = [];
              }

              if (sourceField.query !== undefined) {
                const relatedTargets = await currentRelation.target.query(sourceField.query);
                related[relation][sourceField.id] = relatedTargets;

                for (const relatedTarget of relatedTargets) {
                  relatedTarget.$$_ind = sourceField.index;
                }

                items[sourceField.index].$$_rel[relation].push(String(sourceField.id));
              }
            }
          } else if (typeof currentRelation.targetFieldOrMapper === 'function') {
            for (const sourceField of sourceFields) {
              if (!items[sourceField.index].$$_rel) {
                items[sourceField.index].$$_rel = {};
              }

              if (!items[sourceField.index].$$_rel[relation]) {
                items[sourceField.index].$$_rel[relation] = [];
              }

              if (sourceField.query !== undefined) {
                const relatedTargets = await currentRelation.targetFieldOrMapper(currentRelation.target, sourceField.query);
                related[relation][sourceField.id] = relatedTargets;

                for (const relatedTarget of relatedTargets) {
                  relatedTarget.$$_ind = sourceField.index;
                }

                items[sourceField.index].$$_rel[relation].push(String(sourceField.id));
              }
            }
          } else {
            throw new Error('Unsupported type of target field mapper');
          }

          currentRelation = currentRelation.next;
        }
      }
    }

    return { items, related };
  }
}

module.exports = {
  Resolver,
};
