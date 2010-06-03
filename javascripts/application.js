gb.application.StackAnimator = {
  options: {
    stackRotation: 20,
    scatterRotation: 10,
    delay: 40,
    duration: 900,
    transition: 'back:out'
  },

  initialize: function() {
    this.container = document.id('wrapper');
    this.table = document.id('table');
    this.stack = document.id('stack');
    this.pos;
    this.stackItems = [];
    this.build();
  },

  build: function() {
    var paths = this.Pool.map(function(item) {
      return item.src;
    });
    new Asset.images(paths, {
      onProgress: function(counter, index) {
        var container = new Element('div', {
          'class': 'card ' + this.Pool[index].tags
        });
        var image = new Element('img', { 
          'src': this.Pool[index].src,
          'styles': { height: '100%' }
        });
        image.inject(container);
        container.inject(this.container);
        this.stackItems.push(container);
      }.bind(this),
      onComplete: this.onImagesLoaded.bind(this)
    });
  },

  onImagesLoaded: function() {
    this.setupStack();
    this.registerBehaviors();
    this.scatter();
  },

  showTag: function(tag) {
    var tags = $$('.' + tag),
        stacked = this.stackItems.filter(function(image) {
          return tags.indexOf(image) == -1;
        });
    this.layout(tags, this.table);
    this.layout(stacked, this.stack);
  },

  registerBehaviors: function() {
    this.stack.addEvent('click', this.scatter.bind(this));
    $('all').addEvent('click', this.scatter.bind(this));
    'new favorite discussed'.split(' ').each(function(tag) {
      $(tag).addEvent('click', this.showTag.pass(tag, this));
    }.bind(this));
  },

  setupStack: function() {
    this.stackItems.each(function(stackItem) {
      this.pos = stackItem.getPosition(this.container);
      stackItem.store('default:coords', this.pos);
      stackItem.set('styles', {
        top: this.pos.y,
        left: this.pos.x
      });
      stackItem.set('morph', {
        transition: this.options.transition,
        duration: this.options.duration
      });
      (function() {
        this.setStyle('position', 'absolute');
      }).delay(1, stackItem);
    }, this);
  },

  updateTablePositions: function(elements) {
    var clones = elements.map(function(element) {
      var clone = element.clone(true, false).set('styles', {
        visibility: 'hidden',
        position: 'relative',
        left: 0,
        top: 0
      });
      return clone.store('element:origin', element).inject(this.table);
    }.bind(this));
    clones.each(function(clone) {
      var position = clone.getPosition(this.table);
      clone.retrieve('element:origin').store('table:coords', position);
      (function() { clone.destroy(); }).delay(1700);
    });
  },

  layout: function(elements, target) {
    if (target == this.table) {
      this.updateTablePositions(elements);
    }
    this.stack.hide().removeClass('active');
    elements.each(function(element, i) {
      var top = element.retrieve('default:coords').y,
          left = element.retrieve('default:coords').x,
          r = this.options.scatterRotation;

      if (target && target == this.table) {
        top = element.retrieve('table:coords').y;
        left = element.retrieve('table:coords').x;
      }
      else if (target && target == this.stack) {
        this.stack.show().addClass('active');
        var position = this.stack.getPosition();
        top = position.y;
        left = position.x;
        r = this.options.stackRotation;
      }
      var r = $random(-r, r);
      element.set('styles', {
        '-webkit-transform': 'rotate(' + r + 'deg)',
        '-moz-transform': 'rotate(' + r + 'deg)'
      });
      (function() {
        element.morph({
          top: top + r,
          left: left + r
        });
      }).delay(this.options.delay * i);
    }.bind(this))
  },

  scatter: function() {
    this.layout(this.stackItems);
  }
};

gb.application.StackAnimator.Pool = [
  { src: 'images/kassazettel/1.png', tags: 'new' },
  { src: 'images/kassazettel/2.png', tags: 'new' },
  { src: 'images/kassazettel/3.png', tags: 'new' },
  { src: 'images/kassazettel/4.png', tags: 'new' },
  { src: 'images/kassazettel/5.png', tags: 'new' },
  { src: 'images/kassazettel/6.png', tags: 'discussed' },
  { src: 'images/kassazettel/7.png', tags: 'discussed' },
  { src: 'images/kassazettel/8.png', tags: 'discussed' },
  { src: 'images/kassazettel/9.png', tags: 'discussed' },
  { src: 'images/kassazettel/10.png', tags: 'discussed' },
  { src: 'images/kassazettel/11.png', tags: 'discussed' },
  { src: 'images/kassazettel/12.png', tags: 'discussed' },
  { src: 'images/kassazettel/13.png', tags: 'discussed' },
  { src: 'images/kassazettel/14.png', tags: 'favorite' },
  { src: 'images/kassazettel/15.png', tags: 'favorite' },
  { src: 'images/kassazettel/16.png', tags: 'favorite' },
  { src: 'images/kassazettel/17.png', tags: 'favorite' },
  { src: 'images/kassazettel/18.png', tags: 'favorite' },
  { src: 'images/kassazettel/19.png', tags: 'favorite' },
  { src: 'images/kassazettel/20.png', tags: '' },
  { src: 'images/kassazettel/22.png', tags: '' },
  { src: 'images/kassazettel/23.png', tags: '' },
  { src: 'images/kassazettel/24.png', tags: '' },
  { src: 'images/kassazettel/25.png', tags: '' },
  { src: 'images/kassazettel/26.png', tags: '' },
  { src: 'images/kassazettel/27.png', tags: '' }
];

window.addEvent('domready', function() {
  gb.application.StackAnimator.initialize();
});
