var gb = {
  version: '0.0.1',
  initialize: function() {
    'ui utils'.split(' ').each(function(module) { this[module] = {}; }.bind(this));
  }
};

gb.initialize();

gb.ui.Masonry = new Class({
  Implements: Options,

  options: {
    singleMode: false,
    columnWidth: undefined,
    itemSelector: undefined,
    appendedContent: undefined,
    resizeable: true
  },

  initialize: function(element, options) {
    this.element = document.id(element);
    this.start(options);
  },

  start: function(options) {
    this.setOptions(options);
    if (this.masoned && options.appendedContent != undefined) {
      this.brickParent = options.appendedContent;
    }
    else {
      this.brickParent = this.element;
    }
    if (this.brickParent.getChildren().length > 0) {
      this.setup();
      this.arrange();
      var resizeOn = this.options.resizeable;
      if (resizeOn) {
        if (this.bound == undefined) {
          this.bound = this.resize.bind(this);
          this.attach();
        }
      }
      if (!resizeOn) {
        this.detach();
      }
    }
  },

  attach: function() {
    window.addEvent('resize', this.bound);
    return this;
  },

  detach: function() {
    if (this.bound != undefined) {
      window.removeEvent('resize', this.bound);
      this.bound = undefined;
    }
    return this;
  },

  placeBrick : function(brick, setCount, setY, setSpan) {
    var shortCol = 0;
    for (var i = 0; i < setCount; i++) {
      if (setY[i] < setY[shortCol]) shortCol = i;
    }
    brick.setStyles({
      top: setY[shortCol],
      left: this.colW * shortCol + this.posLeft
    });
    var size = brick.getSize().y + brick.getStyle('margin-top').toInt() + brick.getStyle('margin-bottom').toInt();
    for (var i = 0; i < setSpan; i++) {
      this.colY[shortCol + i] = setY[shortCol] + size;
    }
  },

  setup: function() {
    var s = this.options.itemSelector;
    this.bricks = s == undefined ? this.brickParent.getChildren() : this.brickParent.getElements(s);
    if (this.options.columnWidth == undefined) {
      var b = this.bricks[0];
      this.colW = b.getSize().x + b.getStyle('margin-left').toInt() + b.getStyle('margin-right').toInt();
    }
    else {
      this.colW = this.options.columnWidth;
    }
    var size = this.element.getSize().x + this.element.getStyle('margin-left').toInt() + this.element.getStyle('margin-right').toInt();
    this.colCount = Math.floor(size / this.colW);
    this.colCount = Math.max(this.colCount, 1);
    return this;
  },

  resize: function() {
    this.brickParent = this.element;
    this.lastColY=this.colY;
    this.lastColCount = this.colCount;
    this.setup();
    if (this.colCount != this.lastColCount)
    this.arrange();
    return this;
  },

  arrange: function() {
    if (!this.masoned) {
      this.element.setStyle('position', 'relative');
    }
    if (!this.masoned || this.options.appendedContent != undefined) {
      this.bricks.setStyle('position', 'absolute');
    }
    var cursor = new Element('div').inject(this.element, 'top'),
        pos = cursor.getPosition(),
        epos = this.element.getPosition(),
        posTop = pos.y - epos.y;
    this.posLeft = pos.x - epos.x;
    cursor.dispose();
    if (this.masoned && this.options.appendedContent != undefined) {
      if (this.lastColY != undefined) {
        this.colY=this.lastColY;
      }
      for (var i = this.lastColCount; i < this.colCount; i++) {
        this.colY[i] = posTop;
      }
    }
    else {
      this.colY = [];
      for (var i = 0; i < this.colCount; i++) {
        this.colY[i] = posTop;
      }
    }
    if (this.options.singleMode) {
      for (var k = 0; k < this.bricks.length; k++) {
        var brick = this.bricks[k];
        this.placeBrick(brick, this.colCount, this.colY, 1);
      }
    }
    else {
      for (var k = 0; k < this.bricks.length; k++) {
        var brick = this.bricks[k],
            size = brick.getSize().x + brick.getStyle('margin-left').toInt() + brick.getStyle('margin-right').toInt(),
            colSpan = Math.ceil(size / this.colW);
        colSpan = Math.min(colSpan, this.colCount);
        if (colSpan == 1) {
          this.placeBrick(brick, this.colCount, this.colY, 1);
        }
        else {
          var groupCount = this.colCount + 1 - colSpan,
              groupY = [0];
          for (var i = 0; i < groupCount; i++) {
            groupY[i] = 0;
            for (var j = 0; j < colSpan; j++) {
              groupY[i] = Math.max(groupY[i], this.colY[i + j]);
            }
          }
          this.placeBrick(brick, groupCount, groupY, colSpan);
        }
      }
    }
    var wallH = 0;
    for (var i = 0; i < this.colCount; i++) {
      wallH = Math.max(wallH, this.colY[i]);
    }
    this.element.setStyle('height', wallH - posTop);
    this.element.fireEvent('masoned', this.element);
    this.masoned = true;
    this.options.appendedContent = undefined;
    return this;
  }
});