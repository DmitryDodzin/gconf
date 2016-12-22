
const PROVIDERS = {
  memory: require('./providers/memory'),
  file: require('./providers/file'),
};

const MODIFIERS = {
  env: require('./modifiers/env')
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
  registerModifier
};

Object.defineProperties(module.exports, {
  'PROVIDERS': {
    get: () => Object.keys(PROVIDERS)
  },
  'MODIFIERS': {
    get: () => Object.keys(MODIFIERS)
  }
});