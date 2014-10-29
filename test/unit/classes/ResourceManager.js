var expect = require('expect.js');
var ResourceManager = require('../../../classes/ResourceManager');
var EventEmitter = require('../../../classes/EventEmitter');
var imageMock = require('../mocks/image');

describe('ResourceManager', function() {

  before(function() {
    imageMock.on();
    imageMock.setDirName(__dirname);
  });

  after(function() {
    imageMock.off();
  });

  it('should inherit from EventEmitter', function() {
    var manager = new ResourceManager();
    expect(ResourceManager.prototype).to.be.an(EventEmitter);
    expect(manager).to.be.an(EventEmitter);
  });

  describe('ResourceManager constructor', function() {

    var manager = new ResourceManager();

    it('should set any properties passed in', function() {
      var manager = new ResourceManager({name: 'foo'});
      expect(manager.name).to.equal('foo');
    });

    it('should set the default value of property `loadingProgress` to 1', function() {
      expect(manager.loadingProgress).to.equal(1);
    });

    it('should set the default value of property `resourceCount` to 0', function() {
      expect(manager.resourceCount).to.equal(0);
    });

    it('should set the default value of property `loadedCount` to 0', function() {
      expect(manager.loadedCount).to.equal(0);
    });

    it('should set the default value of property `loadedResourcePaths` to an empty array', function() {
      expect(manager.loadedResourcePaths).to.be.an('array');
      expect(manager.loadedResourcePaths.length).to.equal(0);
    });

    it('should set the default value of property `resourcePaths` to an empty array', function() {
      expect(manager.resourcePaths).to.be.an('array');
      expect(manager.resourcePaths.length).to.equal(0);
    });

    it('should set the default value of property `loadedResources` to an empty object', function() {
      expect(manager.loadedResources).to.eql({});
    });

  });

  describe('#loadImages()', function() {

    it('should load the specified images and emit an event when each resource has loaded', function(done) {
      var manager = new ResourceManager();

      manager.loadImages(['resources/images/1.png', 'resources/images/2.png']);

      var loaded = {
        'resources/images/1.png': false,
        'resources/images/2.png': false
      };
      var count = 0;

      manager.on('resource-load', function handler(event) {
        expect(event.resource).to.be.an(Image);
        expect(event.resource.complete).to.equal(true);

        loaded[event.resource.src] = true;
        count++;

        if (count === 2) {
          manager.off('resource-load', handler);
          expect(loaded['resources/images/1.png']).to.equal(true);
          expect(loaded['resources/images/2.png']).to.equal(true);
          done();
        }
      });
    });

    it('should emit an event if a resource fails to load', function(done) {
      var manager = new ResourceManager();

      manager.loadImages(['resources/images/1.png', 'resources/images/failing.png']);

      var count = 0;

      manager.on('resource-load', function handler(event) {
        manager.off('resource-load', handler);
        expect(event.resourcePath).to.equal('resources/images/1.png');
        expect(event.resource).to.be.an(Image);
        expect(event.resource.complete).to.equal(true);
        expect(event.resource.src).to.equal('resources/images/1.png');

        if (++count === 2) done();
      });

      manager.on('resource-error', function handler(event) {
        manager.off('resource-error', handler);
        expect(event.resourcePath).to.equal('resources/images/failing.png');

        if (++count === 2) done();
      });
    });

    it('should update `resourceCount`', function() {
      var manager = new ResourceManager();

      expect(manager.resourceCount).to.equal(0);
      manager.loadImages(['resources/images/1.png', 'resources/images/2.png']);
      expect(manager.resourceCount).to.equal(2);
    });

    it('should update `loadedCount` when done loading', function(done) {
      var manager = new ResourceManager();

      expect(manager.loadedCount).to.equal(0);
      manager.loadImages(['resources/images/1.png', 'resources/images/2.png']);
      expect(manager.loadedCount).to.equal(0);

      var count = 0;
      manager.on('resource-load', function handler() {
        count++;

        expect(manager.loadedCount).to.equal(count);

        if (count === 2) {
          manager.off('resource-load', handler);
          done();
        }
      });
    });

    it('should update `resourcePaths`', function() {
      var manager = new ResourceManager();

      expect(manager.resourcePaths.length).to.equal(0);
      manager.loadImages(['resources/images/1.png', 'resources/images/2.png']);
      expect(manager.resourcePaths.length).to.equal(2);
      expect(manager.resourcePaths[0]).to.equal('resources/images/1.png');
      expect(manager.resourcePaths[1]).to.equal('resources/images/2.png');
    });

    it('should update `loadingProgress`', function(done) {
      var manager = new ResourceManager();

      expect(manager.loadingProgress).to.equal(1);
      manager.loadImages(['resources/images/1.png', 'resources/images/2.png']);
      expect(manager.loadingProgress).to.equal(0);

      var count = 0;
      manager.on('resource-load', function handler() {
        count++;

        if (count === 1) {
          expect(manager.loadingProgress).to.equal(0.5);
        } else if (count === 2) {
          expect(manager.loadingProgress).to.equal(1);
        } else if (count === 3) {
          expect(manager.loadingProgress).to.equal(0.75);
        } else if (count === 4) {
          expect(manager.loadingProgress).to.equal(1);
        }

        if (count === 2) {
          manager.loadImages(['resources/images/3.png', 'resources/images/4.png']);
          expect(manager.loadingProgress).to.equal(0.5);
        }

        if (count === 4) {
          manager.off('resource-load', handler);
          done();
        }
      });
    });

    it('should update `loadedResourcePaths` when done loading', function(done) {
      var manager = new ResourceManager();

      expect(manager.loadedResourcePaths.length).to.equal(0);
      manager.loadImages(['resources/images/1.png', 'resources/images/2.png']);
      expect(manager.loadedResourcePaths.length).to.equal(0);

      var count = 0;
      manager.on('resource-load', function handler() {
        count++;

        expect(manager.loadedResourcePaths.length).to.equal(count);

        var pathRegExp = /resources\/images\/(1|2)\.png/;
        var path = manager.loadedResourcePaths[count - 1];
        expect(pathRegExp.test(path)).to.be.ok();

        if (count === 2) {
          manager.off('resource-load', handler);
          done();
        }
      });
    });

    it('should update `loadedResources` when done loading', function(done) {
      var manager = new ResourceManager();

      expect(manager.loadedResources).to.eql({});
      manager.loadImages(['resources/images/1.png', 'resources/images/2.png']);
      expect(manager.loadedResources).to.eql({});

      var count = 0;
      manager.on('resource-load', function handler() {
        count++;

        if (count === 2) {
          manager.off('resource-load', handler);
          expect(manager.loadedResources['resources/images/1.png']).to.be.an(Image);
          expect(manager.loadedResources['resources/images/2.png']).to.be.an(Image);
          done();
        }
      });
    });

  });

  describe('#hasResource()', function() {

    it('should return `false` if resource has not been loaded', function() {
      var manager = new ResourceManager();
      expect(manager.hasResource('resources/images/1.png')).to.equal(false);
    });

    it('should return `true` if resource has been loaded', function(done) {
      var manager = new ResourceManager();

      manager.loadImages(['resources/images/1.png']);

      expect(manager.hasResource('resources/images/1.png')).to.equal(false);

      manager.on('resource-load', function handler() {
        manager.off('resource-load', handler);

        expect(manager.hasResource('resources/images/1.png')).to.equal(true);

        done();
      });
    });

  });

  describe('#unload()', function() {

    it('should unload the specified resources from the manager and emit an event when done', function(done) {
      var manager = new ResourceManager();

      manager.loadImages(['resources/images/1.png', 'resources/images/2.png']);

      var count = 0;
      manager.on('resource-load', function handler1(event) {
        count++;

        if (count === 2) {
          manager.off('resource-load', handler1);

          expect(manager.hasResource('resources/images/1.png')).to.equal(true);
          manager.unload(['resources/images/1.png']);
          expect(manager.hasResource('resources/images/1.png')).to.equal(false);

          manager.on('resource-unload', function handler2(event) {
            manager.off('resource-unload', handler2);

            expect(event.resourcePath).to.equal('resources/images/1.png');

            done();
          });
        }
      });
    });

    it('should update `resourceCount`', function() {
      var manager = new ResourceManager();

      expect(manager.resourceCount).to.equal(0);
      manager.loadImages(['resources/images/1.png', 'resources/images/2.png']);
      expect(manager.resourceCount).to.equal(2);
      manager.unload(['resources/images/1.png']);
      expect(manager.resourceCount).to.equal(1);
    });

    it('should not update `resourceCount` if the resource was not requested before', function() {
      var manager = new ResourceManager();

      expect(manager.resourceCount).to.equal(0);
      manager.unload(['resources/images/1.png']);
      expect(manager.resourceCount).to.equal(0);
    });

    it('should update `resourcePaths`', function() {
      var manager = new ResourceManager();

      expect(manager.resourcePaths.length).to.equal(0);
      manager.loadImages(['resources/images/1.png', 'resources/images/2.png']);
      expect(manager.resourcePaths.length).to.equal(2);
      expect(manager.resourcePaths[0]).to.equal('resources/images/1.png');
      expect(manager.resourcePaths[1]).to.equal('resources/images/2.png');
      manager.unload(['resources/images/1.png']);
      expect(manager.resourcePaths.length).to.equal(1);
      expect(manager.resourcePaths[0]).to.equal('resources/images/2.png');
    });

    it('should not update `resourcePaths` if the resource was not requested before', function() {
      var manager = new ResourceManager();

      expect(manager.resourcePaths.length).to.equal(0);
      manager.unload(['resources/images/1.png']);
      expect(manager.resourcePaths.length).to.equal(0);
    });

    it('should update `loadedCount` if the resource was loaded', function(done) {
      var manager = new ResourceManager();

      expect(manager.loadedCount).to.equal(0);
      manager.loadImages(['resources/images/1.png', 'resources/images/2.png']);
      expect(manager.loadedCount).to.equal(0);

      var count = 0;
      manager.on('resource-load', function handler() {
        count++;

        if (count === 2) {
          manager.off('resource-load', handler);

          expect(manager.loadedCount).to.equal(2);
          manager.unload(['resources/images/1.png']);
          expect(manager.loadedCount).to.equal(1);
          done();
        }
      });
    });

    it('should not update `loadedCount` if the resource was not loaded', function() {
      var manager = new ResourceManager();

      expect(manager.loadedCount).to.equal(0);
      manager.loadImages(['resources/images/1.png', 'resources/images/2.png']);
      expect(manager.loadedCount).to.equal(0);
      manager.unload(['resources/images/1.png']);
      expect(manager.loadedCount).to.equal(0);
    });

    it('should cancel any ongoing loads for the specified resources', function(done) {
      var manager = new ResourceManager();

      expect(manager.loadedCount).to.equal(0);
      manager.loadImages(['resources/images/1.png', 'resources/images/2.png']);
      expect(manager.loadedCount).to.equal(0);
      manager.unload(['resources/images/1.png']);
      expect(manager.loadedCount).to.equal(0);

      var count = 0;
      var handler = function(event) {
        count++;
        expect(event.resourcePath).to.equal('resources/images/2.png');
      };
      manager.on('resource-load', handler);

      setTimeout(function() {
        manager.off('resource-load', handler);

        expect(count).to.equal(1);
        expect(manager.resourceCount).to.equal(1);
        expect(manager.loadedCount).to.equal(1);
        expect(manager.loadedResources['resources/images/1.png']).to.not.be.ok();
        expect(manager.loadedResources['resources/images/2.png']).to.be.ok();
        expect(manager.loadedResourcePaths.length).to.equal(1);

        done();
      }, 30);
    });

    it('should update `loadingProgress`', function(done) {
      var manager = new ResourceManager();

      expect(manager.loadingProgress).to.equal(1);
      manager.loadImages(['resources/images/1.png', 'resources/images/2.png']);
      expect(manager.loadingProgress).to.equal(0);

      var count = 0;
      manager.on('resource-load', function handler() {
        count++;

        if (count === 1) {
          expect(manager.loadingProgress).to.equal(0.5);

        } else if (count === 2) {
          expect(manager.loadingProgress).to.equal(1);
          manager.loadImages(['resources/images/3.png', 'resources/images/4.png']);
          expect(manager.loadingProgress).to.equal(0.5);
          manager.unload(['resources/images/3.png']);
          expect(manager.loadingProgress).to.equal(2 / 3);
          manager.unload(['resources/images/1.png']);
          expect(manager.loadingProgress).to.equal(0.5);

        } else if (count === 3) {
          expect(manager.loadingProgress).to.equal(1);
        }

        if (count === 3) {
          manager.off('resource-load', handler);
          done();
        }
      });
    });

    it('should update `loadedResourcePaths` if the resource was loaded', function(done) {
      var manager = new ResourceManager();

      expect(manager.loadedResourcePaths.length).to.equal(0);
      manager.loadImages(['resources/images/1.png', 'resources/images/2.png']);
      expect(manager.loadedResourcePaths.length).to.equal(0);

      var count = 0;
      manager.on('resource-load', function handler() {
        count++;

        if (count === 2) {
          manager.off('resource-load', handler);

          expect(manager.loadedResourcePaths.length).to.equal(2);
          manager.unload(['resources/images/1.png']);
          expect(manager.loadedResourcePaths.length).to.equal(1);
          expect(manager.loadedResourcePaths[0]).to.equal('resources/images/2.png');

          done();
        }
      });
    });

    it('should not update `loadedResourcePaths` if the resource was not loaded', function() {
      var manager = new ResourceManager();

      expect(manager.loadedResourcePaths.length).to.equal(0);
      manager.loadImages(['resources/images/1.png', 'resources/images/2.png']);
      expect(manager.loadedResourcePaths.length).to.equal(0);
      manager.unload(['resources/images/1.png']);
      expect(manager.loadedResourcePaths.length).to.equal(0);
    });

    it('should update `loadedResources` if the resource was loaded', function(done) {
      var manager = new ResourceManager();

      expect(manager.loadedResources).to.eql({});
      manager.loadImages(['resources/images/1.png', 'resources/images/2.png']);
      expect(manager.loadedResources).to.eql({});

      var count = 0;
      manager.on('resource-load', function handler() {
        count++;

        if (count === 2) {
          manager.off('resource-load', handler);

          expect(manager.loadedResources['resources/images/1.png']).to.be.ok();
          expect(manager.loadedResources['resources/images/2.png']).to.be.ok();

          manager.unload(['resources/images/1.png']);

          expect(manager.loadedResources['resources/images/1.png']).to.not.be.ok();
          expect(manager.loadedResources['resources/images/2.png']).to.be.ok();

          done();
        }
      });
    });

  });

  describe('#get()', function() {

    it('should return a loaded resource', function(done) {
      var manager = new ResourceManager();
      manager.loadImages(['resources/images/1.png']);

      manager.on('resource-load', function handler(event) {
        manager.off('resource-load', handler);

        var image = manager.get('resources/images/1.png');
        expect(image).to.be.an(Image);
        expect(image).to.equal(event.resource);

        done();
      });
    });

    it('should return null for a non-loaded resource', function() {
      var manager = new ResourceManager();
      var image = manager.get('resources/images/1.png');
      expect(image).to.equal(null);
    });

    it('should return null for an unloaded resource', function(done) {
      var manager = new ResourceManager();
      manager.loadImages(['resources/images/1.png']);

      manager.on('resource-load', function handler(event) {
        manager.off('resource-load', handler);

        manager.unload(['resources/images/1.png']);

        var image = manager.get('resources/images/1.png');
        expect(image).to.equal(null);

        done();
      });
    });

  });

  describe('#getImage()', function() {

    it('should load and provide the image in the callback if not loaded', function(done) {
      var manager = new ResourceManager();
      manager.getImage('resources/images/1.png', function(error, image) {
        if (error) throw error;
        expect(image).to.be.an(Image);
        expect(image.src).to.equal('resources/images/1.png');
        expect(image.complete).to.equal(true);
        done();
      });
    });

    it('should load and store the image if not loaded', function(done) {
      var manager = new ResourceManager();

      expect(manager.get('resources/images/1.png')).to.equal(null);

      manager.getImage('resources/images/1.png', function(error, image) {
        if (error) throw error;
        expect(image).to.be.an(Image);
        expect(manager.get('resources/images/1.png')).to.equal(image);
        done();
      });
    });

    it('should provide the image in the callback if loaded', function(done) {
      var manager = new ResourceManager();
      manager.loadImages(['resources/images/1.png']);

      manager.on('resource-load', function handler() {
        manager.off('resource-load', handler);

        var loadedImage = manager.get('resources/images/1.png');
        expect(loadedImage).to.be.an(Image);

        manager.getImage('resources/images/1.png', function(error, image) {
          if (error) throw error;
          expect(image).to.equal(loadedImage);
          done();
        });
      });
    });

    it('should provide the correct image in the callback', function(done) {
      var manager = new ResourceManager();

      manager.loadImages([
        'resources/images/failing.png',
        'resources/images/1.png',
        'resources/images/2.png'
      ]);

      manager.getImage('resources/images/2.png', function(error, image) {
        if (error) throw error;
        expect(image).to.be.an(Image);
        expect(image.src).to.equal('resources/images/2.png');
        expect(image).to.equal(manager.get('resources/images/2.png'));
        done();
      });
    });

    it('should provide an error object in the callback if the image fails to load', function(done) {
      var manager = new ResourceManager();
      manager.getImage('resources/images/failing.png', function(error, image) {
        expect(error).to.be.an(Error);
        expect(image).to.not.be.ok();
        done();
      });
    });

  });

});
