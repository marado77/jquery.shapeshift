// Generated by CoffeeScript 1.4.0
(function() {

  (function($, window, document) {
    var Plugin, defaults, pluginName;
    pluginName = "shapeshift";
    defaults = {
      enableDrag: true,
      enableResize: true,
      align: "center",
      autoHeight: true,
      columns: null,
      minColumns: 1,
      height: 100,
      maxHeight: null,
      minHeight: 100,
      gutterX: 10,
      gutterY: 10,
      paddingX: 0,
      paddingY: 10,
      animated: true,
      animateOnInit: false,
      animationSpeed: 150,
      animationThreshold: 200,
      dragRate: 120,
      activeClass: "ss-active-child",
      draggedClass: "ss-dragged-child",
      placeholderClass: "ss-placeholder-child",
      selector: ""
    };
    Plugin = (function() {

      function Plugin(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);
        this.globals = {};
        this.$container = $(element);
        this.init();
      }

      Plugin.prototype.init = function() {
        this.createEvents();
        this.setGlobals();
        this.setIdentifier();
        this.setActiveChildren();
        this.enableFeatures();
        this.gridInit();
        this.render();
        return this.afterInit();
      };

      Plugin.prototype.createEvents = function() {
        var $container, options,
          _this = this;
        options = this.options;
        $container = this.$container;
        $container.off("ss-arrange").on("ss-arrange", function() {
          return _this.render();
        });
        $container.off("ss-rearrange").on("ss-rearrange", function() {
          return _this.render(true);
        });
        return $container.off("ss-setTargetPosition").on("ss-setTargetPosition", function() {
          return _this.setTargetPosition();
        });
      };

      Plugin.prototype.setGlobals = function() {
        return this.globals.animated = this.options.animateOnInit;
      };

      Plugin.prototype.afterInit = function() {
        return this.globals.animated = this.options.animated;
      };

      Plugin.prototype.setIdentifier = function() {
        this.identifier = "shapeshifted_container_" + Math.random().toString(36).substring(7);
        return this.$container.addClass(this.identifier);
      };

      Plugin.prototype.enableFeatures = function() {
        if (this.options.enableResize) {
          this.enableResize();
        }
        if (this.options.enableDrag) {
          return this.enableDragNDrop();
        }
      };

      Plugin.prototype.setActiveChildren = function() {
        var $children, active_child_class, colspan, columns, i, min_columns, options, total, _i, _j, _results;
        options = this.options;
        $children = this.$container.children(options.selector);
        active_child_class = options.activeClass;
        total = $children.length;
        for (i = _i = 0; 0 <= total ? _i < total : _i > total; i = 0 <= total ? ++_i : --_i) {
          $($children[i]).addClass(active_child_class);
        }
        this.setParsedChildren();
        columns = options.columns;
        _results = [];
        for (i = _j = 0; 0 <= total ? _j < total : _j > total; i = 0 <= total ? ++_j : --_j) {
          colspan = this.parsedChildren[i].colspan;
          min_columns = options.minColumns;
          if (colspan > columns && colspan > min_columns) {
            options.minColumns = colspan;
            _results.push(console.error("Shapeshift ERROR: There are child elements that have a larger colspan than the minimum columns set through options.\noptions.minColumns has been set to " + colspan));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };

      Plugin.prototype.setParsedChildren = function() {
        var $child, $children, child, i, parsedChildren, total, _i;
        $children = this.$container.find("." + this.options.activeClass);
        total = $children.length;
        parsedChildren = [];
        for (i = _i = 0; 0 <= total ? _i < total : _i > total; i = 0 <= total ? ++_i : --_i) {
          $child = $($children[i]);
          child = {
            i: i,
            el: $child,
            colspan: parseInt($child.attr("data-ss-colspan")),
            height: $child.outerHeight()
          };
          parsedChildren.push(child);
        }
        return this.parsedChildren = parsedChildren;
      };

      Plugin.prototype.gridInit = function() {
        var fc_colspan, fc_width, first_child, gutter_x, single_width;
        gutter_x = this.options.gutterX;
        first_child = this.parsedChildren[0];
        fc_width = first_child.el.outerWidth();
        fc_colspan = first_child.colspan;
        single_width = (fc_width - ((fc_colspan - 1) * gutter_x)) / fc_colspan;
        return this.globals.col_width = single_width + gutter_x;
      };

      Plugin.prototype.render = function(reparse) {
        if (reparse == null) {
          reparse = false;
        }
        this.setGridColumns();
        return this.arrange(reparse);
      };

      Plugin.prototype.setGridColumns = function() {
        var children_count, col_width, columns, globals, grid_width, gutter_x, inner_width, minColumns, options, padding_x;
        globals = this.globals;
        options = this.options;
        col_width = globals.col_width;
        gutter_x = options.gutterX;
        padding_x = options.paddingX;
        inner_width = this.$container.innerWidth() - (padding_x * 2);
        minColumns = options.minColumns;
        columns = options.columns || Math.floor((inner_width + gutter_x) / col_width);
        if (minColumns && minColumns > columns) {
          columns = minColumns;
        }
        globals.columns = columns;
        children_count = this.parsedChildren.length;
        if (columns > children_count) {
          columns = children_count;
        }
        globals.child_offset = padding_x;
        switch (options.align) {
          case "center":
            grid_width = (columns * col_width) - gutter_x;
            return globals.child_offset += (inner_width - grid_width) / 2;
          case "right":
            grid_width = (columns * col_width) - gutter_x;
            return globals.child_offset += inner_width - grid_width;
        }
      };

      Plugin.prototype.arrange = function(reparse) {
        var $child, $container, animated, animation_speed, attributes, child_positions, container_height, dragged_class, globals, i, is_dragged_child, max_height, min_height, options, parsed_children, placeholder_class, total_children, _i;
        if (reparse) {
          this.setParsedChildren();
        }
        globals = this.globals;
        options = this.options;
        $container = this.$container;
        child_positions = this.getPositions();
        parsed_children = this.parsedChildren;
        total_children = parsed_children.length;
        animated = globals.animated && total_children <= options.animationThreshold;
        animation_speed = options.animationSpeed;
        dragged_class = options.draggedClass;
        for (i = _i = 0; 0 <= total_children ? _i < total_children : _i > total_children; i = 0 <= total_children ? ++_i : --_i) {
          $child = parsed_children[i].el;
          attributes = child_positions[i];
          is_dragged_child = $child.hasClass(dragged_class);
          if (is_dragged_child) {
            placeholder_class = options.placeholderClass;
            $child = $child.siblings("." + placeholder_class);
          }
          if (animated && !is_dragged_child) {
            $child.stop(true, false).animate(attributes, animation_speed);
          } else {
            $child.css(attributes);
          }
        }
        if (options.autoHeight) {
          container_height = globals.container_height;
          max_height = options.maxHeight;
          min_height = options.minHeight;
          if (min_height && container_height < min_height) {
            container_height = min_height;
          } else if (max_height && container_height > max_height) {
            container_height = max_height;
          }
          $container.height(container_height);
        } else {
          $container.height(options.height);
        }
        return $container.trigger("ss-arranged");
      };

      Plugin.prototype.getPositions = function() {
        var col_heights, determineMultiposition, determinePositions, globals, grid_height, gutter_y, i, options, padding_y, parsed_children, positions, recalculateSavedChildren, savePosition, saved_children, total_children, _i, _ref,
          _this = this;
        globals = this.globals;
        options = this.options;
        gutter_y = options.gutterY;
        padding_y = options.paddingY;
        parsed_children = this.parsedChildren;
        total_children = parsed_children.length;
        col_heights = [];
        for (i = _i = 0, _ref = globals.columns; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          col_heights.push(padding_y);
        }
        savePosition = function(child) {
          var col, colspan, j, offset_x, offset_y, _j, _results;
          col = child.col;
          colspan = child.colspan;
          offset_x = (child.col * globals.col_width) + globals.child_offset;
          offset_y = col_heights[col];
          positions[child.i] = {
            left: offset_x,
            top: offset_y
          };
          col_heights[col] += child.height + gutter_y;
          if (colspan >= 1) {
            _results = [];
            for (j = _j = 1; 1 <= colspan ? _j < colspan : _j > colspan; j = 1 <= colspan ? ++_j : --_j) {
              _results.push(col_heights[col + j] = col_heights[col]);
            }
            return _results;
          }
        };
        determineMultiposition = function(child) {
          var chosen_col, col, colspan, height, kosher, next_height, offset, possible_col_heights, possible_cols, span, _j, _k;
          possible_cols = col_heights.length - child.colspan + 1;
          possible_col_heights = col_heights.slice(0).splice(0, possible_cols);
          chosen_col = void 0;
          for (offset = _j = 0; 0 <= possible_cols ? _j < possible_cols : _j > possible_cols; offset = 0 <= possible_cols ? ++_j : --_j) {
            col = _this.lowestCol(possible_col_heights, offset);
            colspan = child.colspan;
            height = col_heights[col];
            kosher = true;
            for (span = _k = 1; 1 <= colspan ? _k < colspan : _k > colspan; span = 1 <= colspan ? ++_k : --_k) {
              next_height = col_heights[col + span];
              if (height < next_height) {
                kosher = false;
                break;
              }
            }
            if (kosher) {
              chosen_col = col;
              break;
            }
          }
          return chosen_col;
        };
        saved_children = [];
        recalculateSavedChildren = function() {
          var index, pop_i, saved_child, saved_i, to_pop, _j, _k, _ref1, _ref2, _results;
          to_pop = [];
          for (saved_i = _j = 0, _ref1 = saved_children.length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; saved_i = 0 <= _ref1 ? ++_j : --_j) {
            saved_child = saved_children[saved_i];
            saved_child.col = determineMultiposition(saved_child);
            if (saved_child.col >= 0) {
              savePosition(saved_child);
              to_pop.push(saved_i);
            }
          }
          _results = [];
          for (pop_i = _k = _ref2 = to_pop.length - 1; _k >= 0; pop_i = _k += -1) {
            index = to_pop[pop_i];
            _results.push(saved_children.splice(index, 1));
          }
          return _results;
        };
        positions = [];
        (determinePositions = function() {
          var child, _j, _results;
          _results = [];
          for (i = _j = 0; 0 <= total_children ? _j < total_children : _j > total_children; i = 0 <= total_children ? ++_j : --_j) {
            child = parsed_children[i];
            if (child.colspan > 1) {
              child.col = determineMultiposition(child);
            } else {
              child.col = _this.lowestCol(col_heights);
            }
            if (child.col === void 0) {
              saved_children.push(child);
            } else {
              savePosition(child);
            }
            _results.push(recalculateSavedChildren());
          }
          return _results;
        })();
        if (options.autoHeight) {
          grid_height = col_heights[this.highestCol(col_heights)] - gutter_y;
          globals.container_height = grid_height + padding_y;
        }
        return positions;
      };

      Plugin.prototype.enableDragNDrop = function() {
        var $container, $placeholder, $selected, active_class, drag, drag_rate, dragged_class, dragging, options, over, placeholder_class, selected_offset_x, selected_offset_y, start, stop,
          _this = this;
        options = this.options;
        $container = this.$container;
        active_class = options.activeClass;
        dragged_class = options.draggedClass;
        placeholder_class = options.placeholderClass;
        drag_rate = options.dragRate;
        $selected = $placeholder = selected_offset_y = selected_offset_x = null;
        dragging = false;
        $container.children("." + active_class).draggable({
          addClasses: false,
          containment: 'document',
          zIndex: 9999,
          start: function(e, ui) {
            return start(e, ui);
          },
          drag: function(e, ui) {
            return drag(e, ui);
          },
          stop: function() {
            return stop();
          }
        });
        start = function(e, ui) {
          var selected_tag;
          $selected = $(e.target);
          $selected.addClass(dragged_class);
          selected_tag = $selected.prop("tagName");
          $placeholder = $("<" + selected_tag + " class='" + placeholder_class + "' style='height: " + ($selected.height()) + "; width: " + ($selected.width()) + "'></" + selected_tag + ">");
          $selected.parent().addClass("ss-current-container");
          selected_offset_y = $selected.outerHeight() / 2;
          return selected_offset_x = $selected.outerWidth() / 2;
        };
        drag = function(e, ui) {
          if (!dragging) {
            $placeholder.remove().appendTo(".ss-current-container");
            $(".ss-current-container").trigger("ss-setTargetPosition");
            dragging = true;
            window.setTimeout((function() {
              return dragging = false;
            }), drag_rate);
          }
          ui.position.left = e.pageX - $selected.parent().offset().left - selected_offset_x;
          return ui.position.top = e.pageY - $selected.parent().offset().top - selected_offset_y;
        };
        stop = function() {
          $selected.removeClass(dragged_class);
          $placeholder.remove();
          $selected = $placeholder = null;
          $(".ss-current-container").trigger("ss-arrange").removeClass("ss-current-container");
          return $(".ss-previous-container").trigger("ss-arrange").removeClass("ss-previous-container");
        };
        $container.droppable({
          tolerance: 'intersect',
          over: function(e) {
            return over(e);
          }
        });
        return over = function(e) {
          $(".ss-previous-container").removeClass("ss-previous-container");
          $(".ss-current-container").removeClass("ss-current-container").addClass("ss-previous-container");
          return $(e.target).addClass("ss-current-container");
        };
      };

      Plugin.prototype.setTargetPosition = function() {
        var $selected, $start_container, $target, attributes, child_positions, distance, dragged_class, parsed_children, position_i, selected_x, selected_y, shortest_distance, target_position, total_positions, x_dist, y_dist, _i;
        dragged_class = this.options.draggedClass;
        $selected = $("." + dragged_class);
        selected_x = $selected.position().left + $selected.width() / 2;
        selected_y = $selected.position().top + $selected.height() / 2;
        shortest_distance = 9999999;
        $start_container = $selected.parent();
        parsed_children = this.parsedChildren;
        child_positions = this.getPositions();
        total_positions = child_positions.length;
        target_position = 0;
        for (position_i = _i = 0; 0 <= total_positions ? _i < total_positions : _i > total_positions; position_i = 0 <= total_positions ? ++_i : --_i) {
          attributes = child_positions[position_i];
          if (selected_x > attributes.left && selected_y > attributes.top) {
            y_dist = selected_x - attributes.left;
            x_dist = selected_y - attributes.top;
            distance = Math.sqrt((x_dist * x_dist) + (y_dist * y_dist));
            if (distance < shortest_distance) {
              shortest_distance = distance;
              target_position = position_i;
            }
          }
        }
        if (target_position === parsed_children.length) {
          $target = parsed_children[target_position - 1].el;
          $selected.insertAfter($target);
        } else {
          $target = parsed_children[target_position].el;
          $selected.insertBefore($target);
        }
        this.arrange(true);
        if ($start_container[0] !== $selected.parent()[0]) {
          return $(".ss-previous-container").trigger("ss-rearrange");
        }
      };

      Plugin.prototype.enableResize = function() {
        var animation_speed, binding, resizing,
          _this = this;
        animation_speed = this.options.animationSpeed;
        resizing = false;
        binding = "resize." + this.identifier;
        return $(window).on(binding, function() {
          if (!resizing) {
            resizing = true;
            setTimeout((function() {
              return _this.render();
            }), animation_speed / 2);
            setTimeout((function() {
              return _this.render();
            }), animation_speed);
            return setTimeout(function() {
              resizing = false;
              return _this.render();
            }, animation_speed * 1.5);
          }
        });
      };

      Plugin.prototype.lowestCol = function(array, offset) {
        var augmented_array;
        if (offset == null) {
          offset = 0;
        }
        augmented_array = array.map(function(val, index) {
          return [val, index];
        });
        augmented_array.sort(function(a, b) {
          var ret;
          ret = a[0] - b[0];
          if (ret === 0) {
            ret = a[1] - b[1];
          }
          return ret;
        });
        return augmented_array[offset][1];
      };

      Plugin.prototype.highestCol = function(array) {
        return $.inArray(Math.max.apply(window, array), array);
      };

      return Plugin;

    })();
    return $.fn[pluginName] = function(options) {
      return this.each(function() {
        var bound_indentifier, old_class, _ref;
        old_class = (_ref = $(this).attr("class").match(/shapeshifted_container_\w+/)) != null ? _ref[0] : void 0;
        if (old_class) {
          bound_indentifier = "resize." + old_class;
          $(window).off(bound_indentifier);
          $(this).removeClass(old_class);
        }
        return $.data(this, "plugin_" + pluginName, new Plugin(this, options));
      });
    };
  })(jQuery, window, document);

}).call(this);
