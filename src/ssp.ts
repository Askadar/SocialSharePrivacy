/**
 * @license
 * jquery.socialshareprivacy.js | 2 Klicks fuer mehr Datenschutz
 *
 * http://www.heise.de/extras/socialshareprivacy/
 * http://www.heise.de/ct/artikel/2-Klicks-fuer-mehr-Datenschutz-1333879.html
 *
 * Copyright (c) 2011 Hilko Holweg, Sebastian Hilbig, Nicolas Heiringhoff, Juergen Schmidt,
 * Heise Zeitschriften Verlag GmbH & Co. KG, http://www.heise.de
 *
 * Copyright (c) 2012-2013 Mathias Panzenböck
 *
 * is released under the MIT License http://www.opensource.org/licenses/mit-license.php
 *
 * Spread the word, link to us if you can.
 */
(function ($, undefined) {
	"use strict";

	/*
	 * helper functions
	 */








	// display info-overlays a tiny bit delayed
	function enterHelpInfo () {
		var $info_wrapper = $(this);
		if ($info_wrapper.hasClass('info_off')) return;
		var timeout_id = window.setTimeout(function () {
			$info_wrapper.addClass('display');
			$info_wrapper.removeData('timeout_id');
		}, 500);
		$info_wrapper.data('timeout_id', timeout_id);
	}

	function leaveHelpInfo () {
		var $info_wrapper = $(this);
		var timeout_id = $info_wrapper.data('timeout_id');
		if (timeout_id !== undefined) {
			window.clearTimeout(timeout_id);
		}
		$info_wrapper.removeClass('display');
	}

	function permCheckChangeHandler () {
		var $input = $(this);
		var $share = $input.parents('.social_share_privacy_area').first().parent();
		var options = $share.data('social-share-privacy-options');
		if ($input.is(':checked')) {
			options.set_perma_option($input.attr('data-service'), options);
			$input.parent().addClass('checked');
		} else {
			options.del_perma_option($input.attr('data-service'), options);
			$input.parent().removeClass('checked');
		}
	}

	function enterSettingsInfo () {
		var $settings = $(this);
		var timeout_id = window.setTimeout(function () {
			$settings.find('.settings_info_menu').removeClass('off').addClass('on');
			$settings.removeData('timeout_id');
		}, 500);
		$settings.data('timeout_id', timeout_id);
	}

	function leaveSettingsInfo () {
		var $settings = $(this);
		var timeout_id = $settings.data('timeout_id');
		if (timeout_id !== undefined) {
			window.clearTimeout(timeout_id);
		}
		$settings.find('.settings_info_menu').removeClass('on').addClass('off');
	}

	function setPermaOption (service_name, options) {
		$.cookie('socialSharePrivacy_'+service_name, 'perma_on', options.cookie_expires, options.cookie_path, options.cookie_domain);
	}

	function delPermaOption (service_name, options) {
		$.cookie('socialSharePrivacy_'+service_name, null, -1, options.cookie_path, options.cookie_domain);
	}

	function getPermaOption (service_name, options) {
		return !!options.get_perma_options(options)[service_name];
	}

	function getPermaOptions (options) {
		var cookies = $.cookie();
		var permas = {};
		for (var name in cookies) {
			var match = /^socialSharePrivacy_(.+)$/.exec(name);
			if (match) {
				permas[match[1]] = cookies[name] === 'perma_on';
			}
		}
		return permas;
	}


	// extend jquery with our plugin function
	function socialSharePrivacy (options) {

		if (typeof options === "string") {
			var command = options;
			if (arguments.length === 1) {
				switch (command) {
					case "enable":
						this.find('.switch.off').click();
						break;

					case "disable":
						this.find('.switch.on').click();
						break;

					case "toggle":
						this.find('.switch').click();
						break;

					case "options":
						return this.data('social-share-privacy-options');

					case "destroy":
						this.trigger({type: 'socialshareprivacy:destroy'});
						this.children('.social_share_privacy_area').remove();
						this.removeData('social-share-privacy-options');
						break;

					case "enabled":
						var enabled = {};
						this.each(function () {
							var $self = $(this);
							var options = $self.data('social-share-privacy-options');
							for (var name in options.services) {
								enabled[name] = $self.find('.'+(options.services[name].class_name||name)+' .switch').hasClass('on');
							}
						});
						return enabled;

					case "disabled":
						var disabled = {};
						this.each(function () {
							var $self = $(this);
							var options = $self.data('social-share-privacy-options');
							for (var name in options.services) {
								disabled[name] = $self.find('.'+(options.services[name].class_name||name)+' .switch').hasClass('off');
							}
						});
						return disabled;

					default:
						throw new Error("socialSharePrivacy: unknown command: "+command);
				}
			}
			else {
				var arg = arguments[1];
				switch (command) {
					case "enable":
						this.each(function () {
							var $self = $(this);
							var options = $self.data('social-share-privacy-options');
							$self.find('.'+(options.services[arg].class_name||arg)+' .switch.off').click();
						});
						break;

					case "disable":
						this.each(function () {
							var $self = $(this);
							var options = $self.data('social-share-privacy-options');
							$self.find('.'+(options.services[arg].class_name||arg)+' .switch.on').click();
						});
						break;

					case "toggle":
						this.each(function () {
							var $self = $(this);
							var options = $self.data('social-share-privacy-options');
							$self.find('.'+(options.services[arg].class_name||arg)+' .switch').click();
						});
						break;

					case "option":
						if (arguments.length > 2) {
							var value = {};
							value[arg] = arguments[2];
							this.each(function () {
								$.extend(true, $(this).data('social-share-privacy-options'), value);
							});
						}
						else {
							return this.data('social-share-privacy-options')[arg];
						}
						break;

					case "options":
						$.extend(true, options, arg);
						break;

					case "enabled":
						var options = this.data('social-share-privacy-options');
						return this.find('.'+(options.services[arg].class_name||arg)+' .switch').hasClass('on');

					case "disabled":
						var options = this.data('social-share-privacy-options');
						return this.find('.'+(options.services[arg].class_name||arg)+' .switch').hasClass('off');

					default:
						throw new Error("socialSharePrivacy: unknown command: "+command);
				}
			}
			return this;
		}

		return this.each(function () {
			// parse options passed via data-* attributes:
			var data = {};
			if (this.lang) data.language = this.lang;
			for (var i = 0, attrs = this.attributes; i < attrs.length; ++ i) {
				var attr = attrs[i];
				if (/^data-./.test(attr.name)) {
					var path = attr.name.slice(5).replace(/-/g,"_").split(".");
					var ctx = data, j = 0;
					for (; j < path.length-1; ++ j) {
						var name = path[j];
						if (name in ctx) {
							ctx = ctx[name];
							if (typeof ctx === "string") {
								ctx = (new Function("$", "return ("+ctx+");")).call(this, $);
							}
						}
						else {
							ctx = ctx[name] = {};
						}
					}
					var name = path[j];
					if (typeof ctx[name] === "object") {
						ctx[name] = $.extend(true, (new Function("$", "return ("+attr.value+");")).call(this, $), ctx[name]);
					}
					else {
						ctx[name] = attr.value;
					}
				}
			}
			// parse global option values:
			if ('cookie_expires'   in data) data.cookie_expires  = Number(data.cookie_expires);
			if ('perma_option'     in data) data.perma_option    = $.trim(data.perma_option).toLowerCase()    === "true";
			if ('ignore_fragment'  in data) data.ignore_fragment = $.trim(data.ignore_fragment).toLowerCase() === "true";
			if ('set_perma_option' in data) {
				data.set_perma_option = new Function("service_name", "options", data.set_perma_option);
			}
			if ('del_perma_option' in data) {
				data.del_perma_option = new Function("service_name", "options", data.del_perma_option);
			}
			if ('get_perma_option' in data) {
				data.get_perma_option = new Function("service_name", "options", data.get_perma_option);
			}
			if ('get_perma_options' in data) {
				data.get_perma_options = new Function("options", data.get_perma_options);
			}
			if ('order' in data) {
				data.order = $.trim(data.order);
				if (data.order) {
					data.order = data.order.split(/\s+/g);
				}
				else {
					delete data.order;
				}
			}
			if (typeof data.services === "string") {
				data.services = (new Function("$", "return ("+data.services+");")).call(this, $);
			}
			if ('options' in data) {
				data = $.extend(data, (new Function("$", "return ("+data.options+");")).call(this, $));
				delete data.options;
			}
			if ('services' in data) {
				for (var service_name in data.services) {
					var service = data.services[service_name];
					if (typeof service === "string") {
						data.services[service_name] = (new Function("$", "return ("+service+");")).call(this, $);
					}
					// only values of common options are parsed:
					if (typeof service.status === "string") {
						service.status = $.trim(service.status).toLowerCase() === "true";
					}
					if (typeof service.perma_option === "string") {
						service.perma_option = $.trim(service.perma_option).toLowerCase() === "true";
					}
				}
			}
			// overwrite default values with user settings
			var this_options = $.extend(true,{},socialSharePrivacy.settings,options,data);
			var order = this_options.order || [];

			var dummy_img  = this_options.layout === 'line' ? 'dummy_line_img' : 'dummy_box_img';
			var any_on     = false;
			var any_perm   = false;
			var any_unsafe = false;
			var unordered  = [];
			for (var service_name in this_options.services) {
				var service = this_options.services[service_name];
				if (service.status) {
					any_on = true;
					if ($.inArray(service_name, order) === -1) {
						unordered.push(service_name);
					}
					if (service.privacy !== 'safe') {
						any_unsafe = true;
						if (service.perma_option) {
							any_perm = true;
						}
					}
				}
				if (!('language' in service)) {
					service.language = this_options.language;
				}
				if (!('path_prefix' in service)) {
					service.path_prefix = this_options.path_prefix;
				}
				if (!('referrer_track' in service)) {
					service.referrer_track = '';
				}
			}
			unordered.sort();
			order = order.concat(unordered);

			// check if at least one service is activated
			if (!any_on) {
				return;
			}

			// insert stylesheet into document and prepend target element
			if (this_options.css_path) {
				var css_path = (this_options.path_prefix||"") + this_options.css_path;
				// IE fix (needed for IE < 9 - but done for all IE versions)
				if (document.createStyleSheet) {
					document.createStyleSheet(css_path);
				} else if ($('link[href="'+css_path+'"]').length === 0) {
					$('<link/>',{rel:'stylesheet',type:'text/css',href:css_path}).appendTo(document.head);
				}
			}

			// get stored perma options
			var permas;
			if (this_options.perma_option && any_perm) {
				if (this_options.get_perma_options) {
					permas = this_options.get_perma_options(this_options);
				}
				else {
					permas = {};
					for (var service_name in this_options.services) {
						permas[service_name] = this_options.get_perma_option(service_name, this_options);
					}
				}
			}

			// canonical uri that will be shared
			var uri = this_options.uri;
			if (typeof uri === 'function') {
				uri = uri.call(this, this_options);
			}

			var $context = $('<ul class="social_share_privacy_area"></ul>').addClass(this_options.layout);
			var $share = $(this);

			$share.prepend($context).data('social-share-privacy-options',this_options);

			for (var i = 0; i < order.length; ++ i) {
				var service_name = order[i];
				var service = this_options.services[service_name];

				if (service && service.status) {
					var class_name = service.class_name || service_name;
					var button_class = service.button_class || service_name;
					var $help_info;

					if (service.privacy === 'safe') {
						$help_info = $('<li class="help_info"><div class="info">' +
							service.txt_info + '</div><div class="dummy_btn"></div></li>').addClass(class_name);
						$help_info.find('.dummy_btn').
							addClass(button_class).
							append(service.button.call(this,service,uri,this_options));
					}
					else {
						$help_info = $('<li class="help_info"><div class="info">' +
							service.txt_info + '</div><span class="switch off">' + (service.txt_off||'\u00a0') +
							'</span><div class="dummy_btn"></div></li>').addClass(class_name);
						$help_info.find('.dummy_btn').
							addClass(button_class).
							append($('<img/>').addClass(button_class+'_privacy_dummy privacy_dummy').
								attr({
									alt: service.dummy_alt,
									src: service.path_prefix + service[dummy_img]
								}));

						$help_info.find('.dummy_btn img.privacy_dummy, span.switch').click(
							buttonClickHandler(service_name));
					}
					$context.append($help_info);
				}
			}

			//
			// append Info/Settings-area
			//
			if (any_unsafe) {
				var $settings_info = $('<li class="settings_info"><div class="settings_info_menu off perma_option_off"><a>' +
					'<span class="help_info icon"><span class="info">' + this_options.txt_help + '</span></span></a></div></li>');
				var $info_link = $settings_info.find('> .settings_info_menu > a').attr('href', this_options.info_link);
				if (this_options.info_link_target) {
					$info_link.attr("target",this_options.info_link_target);
				}
				$context.append($settings_info);

				$context.find('.help_info').on('mouseenter', enterHelpInfo).on('mouseleave', leaveHelpInfo);

				// menu for permanently enabling of service buttons
				if (this_options.perma_option && any_perm) {

					// define container
					var $container_settings_info = $context.find('li.settings_info');

					// remove class that fomrats the i-icon, because perma-options are shown
					var $settings_info_menu = $container_settings_info.find('.settings_info_menu');
					$settings_info_menu.removeClass('perma_option_off');

					// append perma-options-icon (.settings) and form (hidden)
					$settings_info_menu.append(
						'<span class="settings">' + this_options.txt_settings + '</span><form><fieldset><legend>' +
						this_options.settings_perma + '</legend></fieldset></form>');

					// write services with <input> and <label> and checked state from cookie
					var $fieldset = $settings_info_menu.find('form fieldset');
					for (var i = 0; i < order.length; ++ i) {
						var service_name = order[i];
						var service = this_options.services[service_name];

						if (service && service.status && service.perma_option && service.privacy !== 'safe') {
							var class_name = service.class_name || service_name;
							var perma = permas[service_name];
							var $field = $('<label><input type="checkbox"' + (perma ? ' checked="checked"/>' : '/>') +
								service.display_name + '</label>');
							$field.find('input').attr('data-service', service_name);
							$fieldset.append($field);

							// enable services when cookie set and refresh cookie
							if (perma) {
								$context.find('li.'+class_name+' span.switch').click();
								this_options.set_perma_option(service_name, this_options);
							}
						}
					}

					// indicate clickable setings gear
					$container_settings_info.find('span.settings').css('cursor', 'pointer');

					// show settings menu on hover
					$container_settings_info.on('mouseenter', enterSettingsInfo).on('mouseleave', leaveSettingsInfo);

					// interaction for <input> to enable services permanently
					$container_settings_info.find('fieldset input').on('change', permCheckChangeHandler);
				}
			}
			$share.trigger({type: 'socialshareprivacy:create', options: this_options});
		});
	};

	// expose helper functions:
	socialSharePrivacy.absurl     = absurl;
	socialSharePrivacy.escapeHtml = escapeHtml;
	socialSharePrivacy.getTitle   = getTitle;
	socialSharePrivacy.getImage   = getImage;
	socialSharePrivacy.getEmbed   = getEmbed;
	socialSharePrivacy.getDescription = getDescription;
	socialSharePrivacy.abbreviateText = abbreviateText;
	socialSharePrivacy.formatNumber   = formatNumber;

	socialSharePrivacy.settings = {
		'services'          : {},
		'info_link'         : 'http://panzi.github.io/SocialSharePrivacy/',
		'info_link_target'  : '',
		'txt_settings'      : 'Settings',
		'txt_help'          : 'If you activate these fields via click, data will be sent to a third party (Facebook, Twitter, Google, ...) and stored there. For more details click <em>i</em>.',
		'settings_perma'    : 'Permanently enable share buttons:',
		'layout'            : 'line', // possible values: 'line' (~120x20) or 'box' (~58x62)
		'set_perma_option'  : setPermaOption,
		'del_perma_option'  : delPermaOption,
		'get_perma_options' : getPermaOptions,
		'get_perma_option'  : getPermaOption,
		'perma_option'      : !!$.cookie,
		'cookie_path'       : '/',
		'cookie_domain'     : document.location.hostname,
		'cookie_expires'    : 365,
		'path_prefix'       : '',
		'css_path'          : "stylesheets/socialshareprivacy.css",
		'uri'               : getURI,
		'language'          : 'en',
		'ignore_fragment'   : true
	};

	$.fn.socialSharePrivacy = socialSharePrivacy;
}(jQuery));
