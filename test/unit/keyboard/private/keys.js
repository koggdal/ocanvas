var expect = require('expect.js');
var keys = require('../../../../keyboard/private/keys');

describe('keyboard/keys', function() {

  describe('.getKeyString()', function() {

    it('should convert an event with a `key` property to that key', function() {
      expect(keys.getKeyString({key: 'Escape'})).to.equal('Escape');
    });

    it('should correct key values from old implementations of `key`', function() {
      expect(keys.getKeyString({key: 'Esc'})).to.equal('Escape');
      expect(keys.getKeyString({key: 'Left'})).to.equal('ArrowLeft');
      expect(keys.getKeyString({key: 'Up'})).to.equal('ArrowUp');
      expect(keys.getKeyString({key: 'Right'})).to.equal('ArrowRight');
      expect(keys.getKeyString({key: 'Down'})).to.equal('ArrowDown');
      expect(keys.getKeyString({key: 'Del'})).to.equal('Delete');
      expect(keys.getKeyString({key: 'Scroll'})).to.equal('ScrollLock');
    });

    it('should convert an event with only a `keyCode` property to the correct modifier key', function() {
      expect(keys.getKeyString({keyCode: 8})).to.equal('Backspace');
      expect(keys.getKeyString({keyCode: 9})).to.equal('Tab');
      expect(keys.getKeyString({keyCode: 13})).to.equal('Enter');
      expect(keys.getKeyString({keyCode: 16})).to.equal('Shift');
      expect(keys.getKeyString({keyCode: 17})).to.equal('Control');
      expect(keys.getKeyString({keyCode: 18})).to.equal('Alt');
      expect(keys.getKeyString({keyCode: 20})).to.equal('CapsLock');
      expect(keys.getKeyString({keyCode: 27})).to.equal('Escape');
      expect(keys.getKeyString({keyCode: 33})).to.equal('PageUp');
      expect(keys.getKeyString({keyCode: 34})).to.equal('PageDown');
      expect(keys.getKeyString({keyCode: 35})).to.equal('End');
      expect(keys.getKeyString({keyCode: 36})).to.equal('Home');
      expect(keys.getKeyString({keyCode: 37})).to.equal('ArrowLeft');
      expect(keys.getKeyString({keyCode: 38})).to.equal('ArrowUp');
      expect(keys.getKeyString({keyCode: 39})).to.equal('ArrowRight');
      expect(keys.getKeyString({keyCode: 40})).to.equal('ArrowDown');
      expect(keys.getKeyString({keyCode: 45})).to.equal('Insert');
      expect(keys.getKeyString({keyCode: 46})).to.equal('Delete');
      expect(keys.getKeyString({keyCode: 91})).to.equal('OS');
      expect(keys.getKeyString({keyCode: 92})).to.equal('OS');
      expect(keys.getKeyString({keyCode: 112})).to.equal('F1');
      expect(keys.getKeyString({keyCode: 113})).to.equal('F2');
      expect(keys.getKeyString({keyCode: 114})).to.equal('F3');
      expect(keys.getKeyString({keyCode: 115})).to.equal('F4');
      expect(keys.getKeyString({keyCode: 116})).to.equal('F5');
      expect(keys.getKeyString({keyCode: 117})).to.equal('F6');
      expect(keys.getKeyString({keyCode: 118})).to.equal('F7');
      expect(keys.getKeyString({keyCode: 119})).to.equal('F8');
      expect(keys.getKeyString({keyCode: 120})).to.equal('F9');
      expect(keys.getKeyString({keyCode: 121})).to.equal('F10');
      expect(keys.getKeyString({keyCode: 122})).to.equal('F11');
      expect(keys.getKeyString({keyCode: 123})).to.equal('F12');
      expect(keys.getKeyString({keyCode: 144})).to.equal('NumLock');
      expect(keys.getKeyString({keyCode: 145})).to.equal('ScrollLock');
      expect(keys.getKeyString({keyCode: 224})).to.equal('Meta');
      expect(keys.getKeyString({keyCode: 225})).to.equal('AltGraph');
    });

    it('should convert a `keyCode` for a normal character to that character', function() {
      expect(keys.getKeyString({keyCode: 97})).to.equal('a');
    });

    it('should convert a `keyCode` for a normal character to that character, but lowercase', function() {
      expect(keys.getKeyString({keyCode: 65})).to.equal('a'); // 65 is the keycode for uppercase A
    });

  });

});
