
# GConf

Global Configuration for the masses.

## GConf

```javascript
  const gconf_instance = new GConf();
```

The ```GConf``` Object is the base and main API for the library.

The constructor for the class can register modifiers and providers (Note currenty there can be only one provider) from the options object.

###```options```

```javascript
  {
    provider: {
      ...providerOptions
    },
    modifierA: true,
    modifierB: {
      ...modifierOptions
    }
  }
```

The options object is based by the key being the Name of the provider or modifier, and the Object being the options Object for the provider's/modifier's constructor.

example config for creating a [memory provider](#memory-provider) with an [env modifier](#env-modifier):
```javascript
  {
    memory: {
      dev: {
        foo: 'bar'
      },
      prod: {
        foo: 'bar2000'
      }
    },
    env: {
      prefix: 'CONF'
    },
  }
```

this gives me a object ``` { foo: 'bar' } ``` for requesting dev and  ``` { foo: 'bar2000' } ``` for prod.

###``` GConf.get(domain, path) ```

this is the function to use to get the data from the config, meaning (with the example config above) you will get 

```javascript

  gconf_instance.get('dev') // { foo: 'bar' }
  gconf_instance.get('dev', 'foo') // 'bar'

```

```domain``` is the domain (maybe env or any other generlisation) where to look, defined in provider's constructor (options)
```path``` is for geting specific parts of the config and not the entire thing

### GConf.meta

This is a meta-options for gconf, for example the default domain when none is given

###``` gconf.registerProvider(provider, options) ``` & ``` gconf.registerModifier(modifier, options) ```

Are a way to register modifiers and providers not in the constructor

### GConf.default

Allows to acess functions with default domain, this defaults to 'default' =|

```javascript

// lets say in our domain named 'default' has { foo: 'bar' }

gconf_instance.get('default', 'foo'); // -> 'bar'
gconf_instance.default.get('foo'); // -> 'bar'

and if we change it to 'dev' it should be like:

gconf_instance.meta.default_domain = 'dev';

gconf_instance.get('dev') === gconf_instance.default.get();

```

### Singleton Registration

The library implements a singleton factory to save the loaded config.

```javascript

var options = {
  // ...
}

gconf_instance = new GConf(options);

gconf.load(gconf_instance); // The 'load' will retrive ither GConf instance

gconf.load(options); // or the constructor params for the GConf instance

```

and then you can access it from any part the application

```javascript

var gconf = require('gconf');

gconf.instance // == a gconf instance created in 'load'.

```

### .gconfrc

Gconf can get the initial configuration for the singleton instance from a .gconfrc file (it's a json) aswell as external plugin loading

```json
{
  "plugins": ["plugin-a", "plugin-b"],
  "config": {
    // ... gconf config
  }
}

```

## Providers

### Memory Provider

Made to load configuration from an object.

provider name: ``` memory ```

```javascript
  memory: {
    domain: {
      ...objectForEnvConfig
    }
  }
```

returns the object corresponding to the requested domain 


### File Provider
File based fetching of config with ```json``` and ```yaml``` support

provider name: ``` file ```

```javascript
file: {
  dev: {
    path: './config.dev.json',
    watch: true
  },
  prod: {
    path: './config.prod.json',
    watch: false
  }
}
```

Will load yaml and json files and ```watch``` will keep them up to date


## Modifiers

### Env Modifier

modifies the base config with Enviroment Variables

modifier name: ``` env ```

``` {prefix}{splitter}{path} ```
example:

``` 
GCONF_a_b_c = 'd' => { a: { b: { c: 'd' } } } 
/// when GCONF is prefix and '_' is splitter
```

Splitter and Prefix are defined in the modifier's constructor

### Argv Modifier

modifies the base config with the arguments provided in run

modifier name: ``` argv ```

the splitter is ```.```

so:
```bash
node test.js --foo.bar=2000 // config => { foo: { bar: 2000 } }
```

## Extend API

### Creating modifier / provider

There are two classes in ``` gconf.components ```, the ``` Modifier ``` and ``` Provider ``` classes are the base classes for all providers and modifiers accordingly

By extending the base class you can create modifiers or providers

```javascript

class NewProvider extends Provider{
  
  // Override the base function
  request(domain, path){
    // domain is the config domain, and the path is a path to get to the specified value, both are optional
  }

}

```

then after creating a class you need to regiter it, this you do through the ``` components.registerProvider('newProvider', NewProvider) ``` and ``` components.registerModifier('newMofifier', NewMofifier) ``` where you need to send the name and class (keep in mind, the class and not an instance). After registration you can use it like every other provider/modifier



###### Credits

Created by [Dmitry Dodzin](http://github.com/DmitryDodzin) under MIT license.
