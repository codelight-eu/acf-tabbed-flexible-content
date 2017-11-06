(function($, acf, _) {
  var Flexible_Content = acf.fields.flexible_content; // Ref to parent impl
  
  Flexible_Content.fields = {};
  Flexible_Content._remove_event = function(name) {
  	// Vars
  	var model = this, 
  	    event = name.substr(0, name.indexOf(' ')), 
  	    selector = name.substr(name.indexOf(' ') + 1),
  	    context = acf.get_selector(model.type);
  
  	// Remove event
  	$(document).off(event, context + ' ' + selector);
  };
  
  Flexible_Content._remove_action = function(action) {
  	// Vars
  	var model = this, 
  	    name = action + '_field/type=' + model.type;
  
  	// console.log('Flexible_Content::_remove_action()', name);
  
  	// Remove action
  	acf.remove_action(name);
  };
  
  Flexible_Content.extend = function(args) {
  	// console.log('Flexible_Content::extend()', args);
  
  	// Remove parent events
  	for (var evt in this.events)
  		this._remove_event(evt, this.events[evt]);
  
  	// Remove parent actions
  	for ( var action in this.actions)
  		this._remove_action(action);
  
  	// Extend
  	var model = $.extend({}, this, args);
  
  	// Setup actions
  	$.each(model.actions, function(name, callback) {
  		model._add_action(name, callback);
  	});
  
  	// Setup filters
  	$.each(model.filters, function(name, callback) {
  		model._add_filter(name, callback);
  	});
  
  	// Setup events
  	$.each(model.events, function(name, callback) {
  		model._add_event(name, callback);
  	});
  
  	return model;
  };

	/*
	 * Custom impl for ACF Flexible Content field
	 */
	acf.fields.flexible_content = Flexible_Content
			.extend({
				actions : {
					'ready' : 'initialize',
					'append' : 'initialize',
					'show' : 'show'
				},

				events : {
					'click [data-event="add-layout"]' : '_open',
					'click [data-event="remove-layout"]' : '_remove',
					'click .acf-fc-popup a' : '_add',
					'blur .acf-fc-popup .focus' : '_close',
					'mouseenter .ui-tabs-nav' : '_mouseenter'
				},

				focus : function() {
					
					// Vars
					var self = this,
						  key = this.key();
				
					this.$el = this.$field.find('.acf-flexible-content:first');
					
					// console.log('flexible_content::focus()', 'Key:', key);

					this.$input = this.$el.siblings('input');
					this.$clones = this.$el.children('.clones');
					this.$tabs = this.$el.children('.tabs');
					this.$tabs_nav = this.$tabs.children('ul').first();
					this.tabs = this.data();

					// Get options
					this.o = acf.get_data(this.$el);

					// Min / max
					this.o.min = this.o.min || 0;
					this.o.max = this.o.max || 0;
					
					this.init_tabs();

					// console.log('flexible_content::focus()',
					// 'Form:', acf.serialize(this.$el));
				},

				key : function() {
					return this.$field.data('key');
				},

				data : function(reset) {
					var k = this.key(),
						  inStore = Flexible_Content.fields[k];
					
					// console.log(inStore);

					if (!inStore || reset)
						inStore = Flexible_Content.fields[k] = {
							tabs : [],
							active : inStore ? inStore.active : 0,
							initialized: false,
							key: k
						};

					return inStore;
				},
				
				
				initialized: function () {
					return this.data().initialized;
				},

				count : function() {
					//console.log('flexible_content::count()', 'Key:', this.key(), 'Count:', this.tabs.tabs.length);

					return this.tabs.tabs.length;
				},

				count_layouts : function(layout) {
					return _.reduce(this.tabs.tabs, function(c, o) {
						return c + (o.layout === layout ? 1 : 0);
					}, 0);
				},

				initialize : function() {
					//console.log('flexible_content::initialize()', 'Key:', this.key(), 
					//		 this.data().initialized ? 'ALLREADY INITIALIZED!' : 'NOT INITIALIZED!');

					// Already initialized?
					if (this.initialized())
						return;
					else
						this.data().initialized = true;

					// Disable clone inputs
					this.$clones.find('input, textarea, select').attr('disabled', 'disabled');
				},

				init_tabs : function() {
					var self = this, 
  						key = this.key(),
  						data = this.data(true),
  						tabs = data.tabs;

					//console.log('init_tabs', key, tabs);
					
					this.$tabs.tabs().tabs('destroy');

					this.$tabs.children('.tab').each(function(i) {
						var tab = $(this);
						tabs[i] = {
							$tab : tab,
							layout : tab.data('layout')
						};
					});

					this.$tabs.tabs({
						active : data.active,
						heightStyle : 'content',
						create : function(event, ui) {
							// console.log('create tabs', key);
							// ui: { tab, panel }
						},
						beforeActivate : function(event, ui) {
							// ui: { newTab, oldTab, newPanel, oldPanel }
						},
						activate : function(event, ui) {
							// ui: { newTab, oldTab, newPanel, oldPanel }
							
							// console.log('tab::activate', self.data().active);
						  self.data().active = self.get_active_tab_index();
						}
					});

					// Sortable
					this.$tabs_nav.sortable({
						axis : 'y',
						items: '> li',
						scroll : true,
						start : function(event, ui) {
							var id = ui.item.find('a').first().attr('href'),
							    layout = self.$el.find(id).find('> .layout:eq(0)');

							acf.do_action('sortstart', layout, ui.placeholder);
						},
						stop : function(event, ui) {
							var id = ui.item.find('a').first().attr('href'),
							    layout = self.$el.find(id).find('> .layout:eq(0)');

							// Reorder & render
							self.reorder_tabs(event, ui);
							self.init_tabs();

							acf.do_action('sortstop', layout, ui.placeholder);
						},
						update : function(event, ui) {
							self.$input.trigger('change');
						}
					});
				},

				show : function() {
					// console.log('flexible_content::show()');
					var tabs = this.tabs.tabs;
					for ( var i in tabs) {
						var tab = tabs[i];
						tab.$tab.find('.acf-field:visible').each(function() {
							acf.do_action('show_field', $(this));
						});
					}
				},

				get_active_tab_index : function() {
					// console.log('flexible_content::get_active_tab_index()',
					// 'Key:', this.key());

					return this.$tabs.tabs('option', 'active');
				},

				get_active_tab : function() {
					// console.log('flexible_content::get_active_tab()', 'Key:',
					// this.key());

					return this.tabs[this.get_active_tab_index()];
				},

				render : function() {
					//console.log('flexible_content::render()', 'Key:', this.key());

					// Empty?
					if (this.count() == 0 && this.tabs.active == 0)
						this.$el.addClass('-empty');
					else
						this.$el.removeClass('-empty');

					// Row limit reached
					this.$el.find('> .acf-actions .button').toggleClass('disabled', 
							this.o.max > 0 && this.count() >= this.o.max);
					
					// Refresh
					this.$tabs.tabs('refresh');
				},

				validate_add : function(layout) {
					// console.log('flexible_content::validate_add()', 'Key:',
					// this.key(),
					// 'Layout:', layout);

					// Validate max
					if (this.o.max > 0 && this.count() >= this.o.max) {

						// Vars
						var identifier = (this.o.max == 1) ? 
						      'layout' : 'layouts', 
					      s = acf._e('flexible_content', 'max');

						// Translate
						s = s.replace('{max}', this.o.max);
						s = s.replace('{identifier}', 
						      acf._e('flexible_content', identifier));

						// Alert
						alert(s);

						return false;
					}

					// Validate max layout
					var $popup = $(this.$el.children('.tmpl-popup').html()), 
					    $a = $popup.find('[data-layout="' + layout + '"]'), 
					    layout_max = parseInt($a.attr('data-max')), 
					    layout_count = this.count_layouts(layout);

					if (layout_max > 0 && layout_count >= layout_max) {
  					// Vars
  					var identifier = (layout_max == 1) ? 
  					      'layout' : 'layouts', 
  				      s = acf._e('flexible_content', 'max_layout');
  
  					// Translate
  					s = s.replace('{max}', layout_count);
  					s = s.replace('{label}', '"' + $a.text() + '"');
  					s = s.replace('{identifier}', 
  					      acf._e('flexible_content', identifier));
  
  					// Alert
  					alert(s);
  
  					return false;
					}

					return true;
				},

				validate_remove : function(layout) {
					// console.log('flexible_content::validate_remove()',
					// 'Key:', this.key(), 'Layout:', layout);

					// Vadiate Min
					if (this.o.min > 0 && this.count() <= this.o.min) {

						// Vars
						var identifier = (this.o.min == 1) ? 'layout' : 'layouts', 
						    s = acf._e('flexible_content','min') + ', ' + 
						        acf._e('flexible_content', 'remove');

						// Translate
						s = s.replace('{min}', this.o.min);
						s = s.replace('{identifier}', acf._e('flexible_content', identifier));
						s = s.replace('{layout}', acf._e('flexible_content', 'layout'));

						return confirm(s);
					}

					// Vadiate max layout
					var $popup = $(this.$el.children('.tmpl-popup').html()), 
						  $a = $popup.find('[data-layout="' + layout + '"]'), 
						  layout_min = parseInt($a.attr('data-min')), 
						  layout_count = this.count_layouts(layout);

					if (layout_min > 0 && layout_count <= layout_min) {

						// Vars
						var identifier = (layout_min == 1) ? 'layout' : 'layouts', 
						    s = acf._e('flexible_content', 'min_layout') + ', ' + 
								  acf._e('flexible_content', 'remove');

						// Translate
						s = s.replace('{min}', layout_count);
						s = s.replace('{label}', '"' + $a.text() + '"');
						s = s.replace('{identifier}', acf._e('flexible_content', identifier));
						s = s.replace('{layout}', acf._e('flexible_content', 'layout'));

						return confirm(s);
					}

					return true;
				},

				add : function(layout, $before) {
					//console.log('flexible_content::add()', 'Layout:', layout, '$before', $before);
					
					// Defaults
					$before = $before || false;

					// Bail early if validation fails
					if (!this.validate_add(layout))
						return false;

					// console.log('flexible_content::add()', 'Passed
					// validation.');

					// Reference
					var self = this,
						  $field = this.$field;

					// Vars
					var $clone = this.$clones.children('.layout[data-layout="'	+ layout + '"]');

					// Duplicate
					var $el = acf.duplicate($clone);

					// Enable inputs (ignore inputs disabled for life)
					$el.find('input, textarea, select').not('.acf-disabled').removeAttr('disabled');

					// Hide no values message
					this.$el.children('.no-value-message').hide();
					
					// Create tab
					var id = 'tab-' + acf.get_uniqid() + '-' + acf.get_uniqid(),
						tab = {
							layout : layout,
							$tab : $('<div />')
										.attr('id', id)
										.addClass('tab')
										.attr('data-layout', layout)
										.append($el),
							$tab_hndl: $('<li/>')
									.attr('data-id', id)
									.append(
										$('<a/>')
											.attr('href', '#' + id)
											.text($el.data('layout-label'))
									)
						};

					// Collection
					this.tabs.tabs.push(tab);
					
					// Append
					this.$tabs_nav.append(tab.$tab_hndl);
					this.$tabs.append(tab.$tab);

					// Validation
					acf.validation.remove_error(this.$field);
					
					// Tabs
					this.init_tabs();
					this.render();
					
					// Switch to newly created tab
					var count = this.count() - 1, 
						lastIndex = count >= 0 ? count : 0;

					this.$tabs.tabs('option', 'active', lastIndex);
					
					// Focus (may have added sub flexible content)
					this.doFocus($field);
				},

				reorder_tabs : function(e, ui) {
					// console.log('flexible_content::reorder_tabs()',
					// 'Key:', this.key(), 'Evt:', e, 'Ui:', ui);

					var items = this.$tabs_nav.children('li'), 
						item = $(ui.item), 
						index = items.index(item), 
						id = item.data('id'), 
						tab = this.$tabs.find('#' + id),
						last = items.length - 1;

					switch (index) {
						case 0:
							var target = this.$tabs.children('.ui-tabs-nav');
							
							//console.log('case 0', target, target.attr('id'), tab.attr('id'));
							
							if(target.attr('id') != tab.attr('id'))
								tab.detach().insertAfter(target);
							break;
	
						case last:
							var target = this.$tabs.children('.tab').last();
							
							//console.log('case last', target.attr('id'), tab.attr('id'));
							
							if(target.attr('id') != tab.attr('id'))
								tab.detach().insertAfter(target);
							break;
	
						default:
							if(Math.abs(ui.position.top - ui.originalPosition.top) > 30) {
								if (ui.position.top < ui.originalPosition.top) {// Moved upwards 
									//console.log(index, this.$tabs.children('.tab').eq(index).attr('id'), tab.attr('id'));
									
									tab.detach().insertBefore(this.$tabs.children('.tab').eq(index));
								} else {
									//console.log(index, this.$tabs.children('.tab').eq(index).attr('id'), tab.attr('id'))
									
									tab.detach().insertAfter(this.$tabs.children('.tab').eq(index));
								}
							}
						
							break;
					}
				},

				/*
				 * Event handlers
				 */

				_open : function(e) {
					// console.log('flexible_content::_open()', 'Evt:', e,
					// this.$el);

					// Vars
					var self = this, 
						$popup = $(this.$el.children('.tmpl-popup').html());

					// Modify popup
					$popup.find('ul li a').each(function() {
						// Vars
						var $a = $(this), 
							min = $a.data('min') || 0, 
							max = $a.data('max') || 0, 
							name = $a.data('layout'),
							count = self.count_layouts(name);

						// console.log(min, max, count);

						// Max
						if (max && count >= max) {
							$a.addClass('disabled');
							return;
						}

						// Min
						if (min) {
							// Find diff
							var required = min - count, 
								s = acf._e('flexible_content', 'required'), 
								identifier = (required == 1) ? 'layout'	: 'layouts',

							// Translate
							s = s.replace('{required}', required);
							s = s.replace('{min}', min);
							s = s.replace('{label} ', '');
							s = s.replace('{identifier}', acf._e('flexible_content', identifier));

							// Limit reached?
							if (required > 0) {
								var $badge = $('<span class="badge"></span>')
									.attr('title', s).text(required);
								$a.append($badge);
							}
						}
					});

					// Within layout?
					var $layout = null;
					if(e.$el.closest('.acf-fc-layout-controlls').exists()) {
						$layout = $popup.closest('.layout');
						$layout.addClass('-open');
					}

					// Append
					$('body').append($popup);

					// Position
					this.position_popup($popup, e.$el);

					// Events
					var event = function(e, layout){
						// Prevent all listeners
						e.preventDefault();
						e.stopImmediatePropagation();

						// Remove events
						$popup.off('click', 'a', event_y);
						$('body').off('click', event_n);

						// Remove tooltip
						$popup.remove();
						
						// Hide controlls?
						if( $layout !== null ) {
							$layout.removeClass('-open');
						}

						// Callback
						if( layout !== null ) {
							self.add( layout, $layout );
						}
					};
					
					var event_y = function( e ){
						event( e, $(this).attr('data-layout') );
					};
					
					var event_n = function( e ){
						event( e, null );
					};

					// Add events
					$popup.on('click', 'a', event_y);
					$('body').on('click', event_n);
				},

				_close : function(e) {
					// console.log('flexible_content::_close()', 'Evt:', e);

					var self = this, $popup = e.$el.parent(), $layout = $popup
							.closest('.layout');

					// Hide controlls?
					$layout.removeClass('-open');

					// Remove popup
					setTimeout(function() {
						$popup.remove();
					}, 200);
				},

				_add : function(e) {
					//console.log('flexible_content::_add()', 'Evt:', e);
					
					// Vars
					var $popup = e.$el.closest('.acf-fc-popup'),
						layout = e.$el.attr('data-layout'),
						$before = false;
					
					
					// Move row
					if( $popup.closest('.acf-fc-layout-controlls').exists() ) {
						$before = $popup.closest('.layout');
					}
					
					// Add row
					this.add( layout, $before );
				},

				_remove : function(e) {
					// console.log('flexible_content::_remove()', 'Evt:', e);

					var self = this;

					// Vars
					var $layout = e.$el.closest('.layout');

					// Bail early if validation fails
					if (!this.validate_remove($layout.attr('data-layout')))
						return;

					// Ref for empty message
					var $message = this.$el.children('.no-value-message');

					// Action for 3rd party customization
					acf.do_action('remove', $layout);

					// Remove
					var $tab = $layout.closest('.tab'), id = $tab.attr('id'), pos = this.$tabs
							.children('.tab').index($tab), $tab_hndl = this.$tabs
							.children('ul').first()
							.find('[data-id=' + id + ']');

					acf.remove_el($layout, function() {
						// Tab & link
						$tab_hndl.remove();
						$tab.remove();
						self.tabs.tabs.splice(pos, 1);

						// Render
						self.render();

						// Trigger change to allow attachment save
						self.$input.trigger('change');

						// Empty?
						if (!self.count())
							$message.show();
					});
				},

				_mouseenter : function(e) {
					//console.log('_mouseenter', 'key:', this.key());
				}
			});

})($ || jQuery, acf, _ || Underscore);
