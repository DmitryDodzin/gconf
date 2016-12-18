
# GConf

Global Configuration for the masses.

## GConf

```javascript
  const gconf = new GConf();
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

###``` gconf.request(env, path) ```

this is the function to use to get the data from the config, meaning (with the example config above) you will get 

```javascript

  gconf.request('dev') // { foo: 'bar' }
  gconf.request('dev', 'foo') // 'bar'

```

```env``` is the env where to look, defined in provider's constructor (options)
```path``` is for geting specific parts of the config and not the entire thing

###``` gconf.registerProvider(provider, options) ``` & ``` gconf.registerModifier(modifier, options) ```

Are a way to register modifiers and providers not in the constructor

### Memory Provider

Made to load configuration from an object.

provider name: ``` memory ```

```javascript
  memory: {
    env: {
      ...objectForEnvConfig
    }
  }
```

returns the object corresponding to the requested env 

### Env Modifier

modifies the base config with Enviroment Variables

``` {prefix}{splitter}{path} ```
example:
``` GCONF_a_b_c = 'd' => { a: { b: { c: 'd' } } } /// when GCONF is prefix and '_' is splitter```

Splitter and Prefix are defined in the modifier's constructor


###### Credits

Created by [Dmitry Dodzin](http://github.com/DmitryDodzin) under MIT license.
