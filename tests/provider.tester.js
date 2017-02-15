
const chai = require('chai');
const expect = chai.expect;

class ProviderTester {

  constructor(gconf_instance, domains=['default', 'prod', 'dev']){
    Object.assign(this, { gconf_instance, domains });
  }

  createTestData(domain='default'){
    return {
      foo: 'bar',
      complex: {
        domain,
        foo: {
          bar: 2000
        }
      }
    };
  }

  test(){

    it('base require', () => 
      this.domains.forEach(domain => 
        expect(this.gconf_instance.request(domain)).to.deep.equal(this.createTestData(domain))
      )
    );

    describe('path requrire', () => {

      it('simple', () => 
        this.domains.forEach(domain => 
          expect(this.gconf_instance.request(domain, 'foo')).to.equal(this.createTestData(domain).foo)
        )
      );

      it('complex', () => 
        this.domains.forEach(domain => 
          expect(this.gconf_instance.request(domain, 'complex')).to.deep.equal(this.createTestData(domain).complex)
        )
      );

      it('nested simple', () => 
        this.domains.forEach(domain => 
          expect(this.gconf_instance.request(domain, 'complex.domain')).to.equal(this.createTestData(domain).complex.domain)
        )
      );

      it('nested complex', () => 
        this.domains.forEach(domain => 
          expect(this.gconf_instance.request(domain, 'complex.foo')).to.deep.equal(this.createTestData(domain).complex.foo)
        )
      );

    });

  }

}

module.exports = ProviderTester;