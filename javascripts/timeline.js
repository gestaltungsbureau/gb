gb.ui.Timeline = new Class({
  Implements: Options,

  initialize: function(element, options) {
    this.element = document.id(element);
    this.setOptions(options);
    this.pin = $('timeline_pin');
    this.connector = $('timeline_connector');
    this.tooltip = $('timeline_tooltip');
    this.list = this.element.getChildren('ul')[0];
    this.registerBehaviors();
    this.setActive(this.list.getChildren('li.active')[0]);
    this.placePin();
    this.drawConnector();
  },
  
  registerBehaviors: function() {
    this.drag = new Drag(this.list, {
      limit: { y: [5, 5] },
      onComplete: function() { this.list.fireEvent('timeline:position:changed'); }.bind(this),
      onDrag: function() {
        this.placePin();
        this.drawConnector();
        this.hideTooltip();
      }.bind(this)
    });
    this.list.addEvent('click:relay(li a)', this.onClick.bind(this));
    this.list.addEvent('timeline:position:changed', this.positionChanged.bind(this));
    if (this.options.next) {
      this.options.next.addEvent('click', this.next.bind(this));
    }
    if (this.options.previous) {
      this.options.previous.addEvent('click', this.previous.bind(this));
    }
    this.list.getChildren('li').addEvent('mouseenter', this.onMouseEnter.bind(this));
    this.list.getChildren('li').addEvent('mouseleave', this.hideTooltip.bind(this));
    this.list.addEvent('mouseleave', this.hideTooltip.bind(this));
    window.addEvent('resize', function() {
      this.placePin();
      this.drawConnector();
      this.hideTooltip();
    }.bind(this));
  },

  onClick: function(event, element) {
    this.setActive(element);
    this.animatePin(function() {
      new Fx.Move(this.list, {
        relativeTo: $('timeline_indicator'),
        position: 'upperLeft',
        edge: 'upperLeft',
        transition: 'pow:in:out',
        offset: { x: -element.getPosition(this.list).x, y: -64 },
        onStart: this.hideTooltip.bind(this),
        onComplete: function() { 
          this.list.fireEvent('timeline:position:changed');
        }.bind(this),
        onStep: function() {
          this.placePin();
          this.drawConnector();
        }.bind(this)
      }).start();
    });
  },

  onMouseEnter: function(event) {
    var element = $(event.target);
    if (element.tagName != 'LI') {
      element = element.getParent('li');
    }
    element.addClass('tooltip-open');
    this.tooltip.getChildren('.body')[0].set('html', element.getChildren('.tooltip')[0].get('html'));
    this.tooltip.position({
      relativeTo: element,
      position: 'bottomLeft',
      edge: 'upperLeft',
      offset: { x: -5, y: -5 }
    }).show();
  },

  hideTooltip: function(event) {
    this.list.getChildren('.tooltip-open').removeClass('tooltip-open');
    this.tooltip.hide();
  },

  setActive: function(element) {
    if (this.active)
      this.active.removeClass('active');
    this.active = element.addClass('active');
  },
  
  drawConnector: function() {
    var afterIndicator = this.pin.getPosition().x > $('timeline_indicator').getPosition().x,
        left = afterIndicator ? $('timeline_indicator').getPosition(this.element).x : this.pin.getStyle('left').toInt() + 5,
        width = ($('timeline_indicator').getPosition().x - this.pin.getPosition().x).abs() + (afterIndicator ? 8 : -2);
    this.connector.setStyles({
      left: left,
      width: width
    });
  },

  placePin: function() {
    this.pin.position({
      relativeTo: this.active,
      position: 'upperLeft',
      edge: 'upperLeft',
      offset: { x: -6, y: -4 }
    });
  },

  animatePin: function(callback) {
    new Fx.Move(this.pin, {
      relativeTo: this.active,
      position: 'upperLeft',
      edge: 'upperLeft',
      transition: 'pow:in:out',
      offset: { x: -6, y: -4 },
      onComplete: callback.bind(this),
      onStep: function() {
        this.drawConnector();
      }.bind(this)
    }).start();
  },

  next: function() {
    new Fx.Morph(this.list, {
      transition: 'pow:in:out',
      onComplete: function() { this.list.fireEvent('timeline:position:changed'); }.bind(this),
      onStep: function() {
        this.placePin();
        this.drawConnector();
      }.bind(this)
    }).start({
      left: ((this.list.getStyle('left').toInt()/98).toInt()-4)*98
    });
  },

  previous: function() {
    new Fx.Morph(this.list, { 
      transition: 'pow:in:out',
      onComplete: function() { this.list.fireEvent('timeline:position:changed'); }.bind(this),
      onStep: function() {
        this.placePin();
        this.drawConnector();
      }.bind(this)
    }).start({
      left: ((this.list.getStyle('left').toInt()/98).toInt()+4)*98
    });
  },

  positionChanged: function() {
    var max = -(this.list.getChildren().length*98-$('timeline_indicator').getPosition(this.element).x-196),
        min = (this.element.getPosition($('timeline_indicator')).x).abs() - 98;
    if (this.list.getStyle('left').toInt() >= min) {
      this.options.previous.hide();
      new Fx.Morph(this.list, {
        transition: 'pow:in:out',
        onStep: function() {
          this.placePin();
          this.drawConnector();
        }.bind(this)
      }).start({ left: min + 98 });
    }
    else {
      this.options.previous.show();
    }
    if (this.list.getStyle('left').toInt() <= max) {
      this.options.next.hide();
      new Fx.Morph(this.list, {
        transition: 'pow:in:out',
        onStep: function() {
          this.placePin();
          this.drawConnector();
        }.bind(this)
      }).start({ left: max - 98 });
    }
    else {
      this.options.next.show();
    }
  }
});
