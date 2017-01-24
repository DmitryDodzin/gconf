
const BaseProvider = require('./provider');
const BaseModifier = require('./modifier');

const PROVIDERS = {
  memory: require('./providers/memory'),
  file: require('./providers/file'),
};

const MODIFIERS = {
  env: require('./modifiers/env'),
  argv: require('./modifiers/argv')
};

function createProvider(type, options){
  if(type in PROVIDERS){
    let Provider = PROVIDERS[type];
    return new Provider(options);
  } else {
    throw new Error('No Provider ' + type + ' registered');
  }
}

function createModifier(type, options){
  if(type in MODIFIERS){
    let Modifier = MODIFIERS[type];
    return new Modifier(options);
  } else {
    throw new Error('No Modifier ' + type + ' registered');
  }
}

function registerProvider(name, constructor){
  PROVIDERS[name] = constructor;
}

function registerModifier(name, constructor){
  MODIFIERS[name] = constructor;
}

module.exports = {
  createProvider,
  createModifier,
  registerProvider,
  registerModifier,
  Provider: BaseProvider,
  Modifier: BaseModifier,
};

Object.defineProperties(module.exports, {
  'PROVIDERS': {
    get: () => Object.keys(PROVIDERS)
  },
  'MODIFIERS': {
    get: () => Object.keys(MODIFIERS)
  }
});