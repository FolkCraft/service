//           ________________    __________                        
//            ___  __ \_  ___/    ___  ____/___________________ ___ 
//            __  / / /____ \     __  /_   _  __ \_  ___/_  __ `__ |
//            _  /_/ /____/ /     _  __/   / /_/ /  /   _  / / / / /
//            /_____/ /____/      /_/      \____//_/    /_/ /_/ /_/ 
//                                                                
dsformROOT = '/ds-comf/ds-form/';

function compareVersionjQuery(v) {
    var required = v.split('.', 2),
        current = gKweri.fn.jquery.split('.', 2);
    return (parseInt(current[0]) > parseInt(required[0])) ||
        (parseInt(current[0]) == parseInt(required[0]) &&
            parseInt(current[1]) >= parseInt(required[1]));
}
if (!window.gKweri && window.jQuery) {
    window.gKweri = window.jQuery
}

if (!window.gKweri || !compareVersionjQuery('1.5')) {
    console.error('Version jQuery < 1.5 or jQuery is not found!');
}
else {

    (function(window, document, $, undefined) {
        "use strict";
        var W = $(window),
            D = $(document),
            version = '4.1.0',
            root = dsformROOT,
            lib = dsformROOT + 'js/plugins/',
            F,
            gData = window.dsformglobaldata = {},
            Modals = window.dsformglobaldata.buttonindexes = {},
            usings = 'External included scripts: \n \
                   Input Mask: https://github.com/RobinHerbots/jquery.inputmask \n \
                   jQuery Form Styler: http://dimox.name/jquery-form-styler/ \n \
                   popDate: https://github.com/jokernakartama/popdate',
            pseudoRandom = function() {
                var now = new Date,
                    res = String(Math.abs(now.getMilliseconds() - (Math.floor(Math.random() * (999 - 1)) + 1))) +
                    String((Math.floor(Math.random() * (999 - 1)) + 1));
                return res;
            },
            F = function(o, options) {

                var self = this; //simple way 



                /*private vars*/
                var _id = '', //form id
                    _modal,
                    _formLoaded = false,
                    _visible,
                    _bi = pseudoRandom() + pseudoRandom(), // kinda unique index for buttons
                    _o = o && o.hasOwnProperty && o instanceof $ ? o : $(o); // wrap DOM objects in jQuery


                /*public vars*/
                self.options = {},
                self.container = {},
                self.form = {},
                self.report = undefined,
                self.config = undefined,
                self.sended = false,
                self.element = _o;



                /* defaults */
                var defaults = {
                    formID: undefined,
                    modal: true, // if true, the determined element uses as button
                    additionalClass: undefined,
                    config: '',
                    inputmask: {}, //options for inputmask
                    dates: {},
                    showLoader: true,
                    useFormStyler: false, // uses jQuery Form Styler plugin http://dimox.name/jquery-form-styler/
                    reload: true,
                    stackErrors: true,
                    clearErrors: false,


                    // callbacks
                    onLoad: undefined, // when form loads, mostly runs one time for each defined element
                    onShow: undefined, // when modal window opens
                    onSuccess: undefined, // when form data successfully sends
                    onFail: undefined, // in case of input errors 
                    onClose: undefined, // when modal window close
                    onServerError: undefined, // in case of form data cannot be send
                    onInit: undefined, // when inits form

                    // modals
                    animationspeed: 300, //how fast animations are
                    closeonbackgroundclick: true, //if you click background will modal close

                    formstyler: {},
                };

                /* private methods */
                var __init__ = function() {

                        _o.get(0).dsformmarker = true;

                        //extendnig defaults with options
                        self.options = $.extend({}, defaults, options);
                        _id = self.options.formID; // for comfortable coding
                        _modal = self.options.modal;
                        self.config = self.options.config;

                        if (typeof onInit === 'function') {
                            self.options.onInit.call(self, $);
                        }

                        if (!compareVersionjQuery('1.7') && self.options.useFormStyler) {
                            self.options.useFormStyler = false;
                            console.warn('DSFORM(#' + _id + '): Form Styler uses version jQuery 1.7.1 and higher. ');
                        }

                        if (self.options.useFormStyler) {
                            self.run(lib + 'formstyler.js', function() {
                                $(null).styler(null);
                            }, 'formstyler');
                        } //preload if use styler

                        if (_modal) { // if button
                            // check the container existing
                            if ($('*[data-dsform-id="' + _id + '"]').get().length > 0) {
                                self.container = $('*[data-dsform-id="' + _id + '"]');
                            }
                            else {
                                self.container = $('<div class="ds-form dspopup-modal ' + _id + '"><div/>').appendTo('body');
                                self.container.attr('data-dsform-id', _id);
                            }

                            // binding modal on click
                            _o.bind('click', function(e) {
                                e.preventDefault();
                                self.config = $(this).attr('data-dsconfig') || self.config;
                                //refresh form only if another button was clicked
                                if (_bi != Modals[_id] || (self.sended && self.options.reload)) {
                                    Modals[_id] = _bi;
                                    self.getForm();
                                }
                                if (_formLoaded) __align__();
                                __reveal__();
                                if (self.options.additionalClass) self.container.addClass(self.options.additionalClass);
                            });
                        }
                        else { // if container
                            self.container = _o;
                            if (self.options.additionalClass) self.container.addClass(self.options.additionalClass);
                            self.container.addClass('ds-form');
                            self.config = _o.attr('data-dsconfig') || self.config;
                            self.getForm();
                        }
                    } // init ends

                var __align__ = function() {
                        // restart modal window geometry if this function was used before
                        if (self.container.children().is('.scrollform')) {
                            self.form.appendTo(self.container);
                            self.container.find('.scrollform').remove();
                            self.container.css({
                                'height': 'auto'
                            });
                        }
                        var scrollbar = 0;
                        self.container.css({
                            'height': '',
                            'width': ''
                        }); // remove inline styles at first
                        // determine browser geometry
                        var windowWidth = window.innerWidth ||
                            document.documentElement.clientWidth ||
                            document.body.clientWidth,
                            windowHeight = window.innerHeight ||
                            document.documentElement.clientHeight ||
                            document.body.clientHeight;
                        if (window.innerWidth && document.documentElement.clientWidth) {
                            scrollbar = window.innerWidth - document.documentElement.clientWidth;
                        }

                        // but if width is too large, make the modal window a bit smaller than browser window
                        if (windowWidth < (self.container.innerWidth() + 20)) {
                            self.container.width(+windowWidth - scrollbar - 20 - (self.container.innerWidth() - self.container.width()));
                        }

                        var widthForm = self.container.innerWidth(),
                            heightForm = self.container.outerHeight(true),
                            leftForm = Math.round((windowWidth - widthForm - scrollbar) / 2); // calculate left margin with some fixes

                        if (windowHeight <= (heightForm + 20)) {
                            var topForm = 20,
                                marginScroll = 15,
                                paddingForm = heightForm - self.container.height();
                            self.container.append('<div class="scrollform"></div>');
                            self.form.appendTo(self.container.find('.scrollform'));
                            console.log(1, self.form)
                            heightForm = windowHeight - topForm * 2;
                            self.container.find('.scrollform').height(heightForm - paddingForm - marginScroll);
                            self.container.find('.scrollform').css({
                                'overflow-y': 'scroll',
                                'margin': marginScroll + 'px 0'
                            });
                        }
                        else {
                            // if evrthng is ok, calculate margins
                            var topForm = Math.round((windowHeight - heightForm) / 2);
                        }
                        // use the geometry
                        self.container.css({
                            'top': topForm + 'px',
                            'left': leftForm + 'px',
                        });
                    } // align ends

                var __send__ = function() {

                        if (self.options.showLoader) {
                            var h = self.container.find('input[type="submit"]').outerHeight(true),
                                w = self.container.find('input[type="submit"]').outerWidth(true),
                                mt = 0,
                                ml;

                            if (+h > 32) {
                                mt = (+h - 32) / 2;
                                h = 32;
                            }
                            ml = (((+w) - (+h)) / 2),
                                mt = mt + 'px';
                            ml = ml + 'px';

                            $('img.loadform').siblings('input[type="submit"]').toggle();

                            self.form.find('input[type="submit"]').hide();

                            $('img.loadform').appendTo(self.container.find('input[type="submit"]').parent()).css({
                                'height': h,
                                'width': h,
                                'margin': mt + ' ' + ml,
                                'display': 'inline',
                                'verticalAlign': 'middle',
                            });
                        }

                        if (!window.FormData) {
                            var dataform = self.form.serialize();
                            dataform = dataform + '&formid=' + _id + '&route=DSFormSend';
                            $.ajax({
                                type: "POST",
                                url: root + "index.php",
                                dataType: "json",
                                cache: false,
                                data: dataform,
                                success: function(data) {
                                    __result__(data);
                                }
                            });
                            // new browsers use FormData
                        }
                        else {
                            var formData = new FormData(self.form.get(0));
                            formData.append('formid', _id);
                            formData.append('route', 'DSFormSend');
                            $.ajax({
                                url: root + "index.php",
                                type: "POST",
                                contentType: false,
                                processData: false,
                                data: formData,
                                dataType: 'json',
                                success: function(data) {
                                    __result__(data);
                                }
                            });
                        }
                        return false;
                    } // send ends

                var __help__ = function() {

                    self.form.find('input[data-dsform-date]').each(function() {
                        var field = $(this),
                            format = field.attr('data-dsform-date');
                        if (!self.options.dates[field.attr('name')]) self.options.dates[field.attr('name')] = {};
                        if (!self.options.dates[field.attr('name')].format) {
                            self.options.dates[field.attr('name')].format = format;
                        }
                    });

                    self.form.find('input[data-dsform-mask]').each(function() {
                        var field = $(this),
                            format = field.attr('data-dsform-mask');
                        if (!self.options.inputmask[field.attr('name')]) self.options.inputmask[field.attr('name')] = {};
                        if (!self.options.inputmask[field.attr('name')].mask) {
                            self.options.inputmask[field.attr('name')].mask = format;
                        }
                    });


                    (function() {
                        for (var i in self.options.dates) {
                            if (i) {
                                var field = self.form.find('input[name="' + i + '"]');
                                var customs = typeof self.options.dates[i] === 'object' ? self.options.dates[i] : {};
                                customs.format = customs.format ? customs.format : field.attr('data-dsform-date');
                                self.run(lib + 'dscalendar.js', function() {
                                    dscalendar(field.get(0), customs);
                                }, 'dscalendar');
                            }
                        }
                    })();


                    (function() {
                        for (var i in self.options.inputmask) {
                            if (i) {
                                var field = self.form.find('input[name="' + i + '"]');
                                var customs = typeof self.options.inputmask[i] === 'object' ? self.options.inputmask[i] : {};
                                customs.mask = customs.mask ? customs.mask : field.attr('data-dsform-mask');
                                self.run(lib + 'inputmask.js', function() {
                                    field.inputmask(customs);
                                }, 'inputmask');
                            }
                        }
                    })();

                    if (self.options.useFormStyler !== false) {
                        var s = typeof self.options.useFormStyler === 'string' ? self.options.useFormStyler : 'select, input';
                        self.run(lib + 'formstyler.js', function() {
                            self.form.find(s).styler(self.options.formstyler);
                        }, 'formstyler');
                    }
                }

                var __validate__ = function() {
                        self.form.find('input, textarea').bind('keyup', function() {
                            var field = $(this);

                            if (field.attr('pattern') && !field.val().match(field.attr('pattern'))) {
                                field.addClass('improper-value');
                                if (!self.options.stackErrors) {
                                    field.siblings('.dsform-field-error.named_as_' + field.attr('name')).removeClass('hint-proper');
                                }
                            }
                            else if (field.attr('pattern') && field.hasClass('improper-value')) {
                                field.removeClass('improper-value');
                                if (!self.options.stackErrors) {
                                    field.siblings('.dsform-field-error.named_as_' + field.attr('name')).addClass('hint-proper');
                                }
                            }

                            if (!field.attr('pattern') && field.hasClass('improper-value')) {
                                field.removeClass('improper-value');
                                if (!self.options.stackErrors) {
                                    field.siblings('.dsform-field-error.named_as_' + field.attr('name')).addClass('hint-proper');
                                }
                            }
                        });
                    } //validate ends

                var __construct__ = function(jsoncode) {
                        var htmlcode = '',
                            response = JSON.parse(jsoncode);

                        if (response.error == 0) {
                            htmlcode = response.error_text;
                        }
                        else if (response.error == 3) {
                            console.error(response.error_text);
                        }

                        // clean container from other forms (actual for buttons)
                        if (self.container.find('form').get().length > 0) {
                            self.container.find('form').remove();
                        };

                        self.container.find('#' + _id + 'formmessagereport').remove();
                        self.container.append(htmlcode);
                        
                        self.form = self.container.find('form');

                        // auto resize modals
                        if (!_formLoaded && _modal) {
                            _formLoaded = true;
                            $('.dspopup-modal-bg .loadform').hide();
                        }

                        if (self.form && self.form.length > 0) {
                            __help__();
                            __validate__();
                            self.form.bind('submit', __send__);
                            __refocus__();
                        }

                        if (!window.FormData) {
                            self.container.find(' *[type="file"]').css('display', 'none');
                        }
                        
                        
                        // call onLoad
                        if (typeof(self.options.onLoad) == "function") {
                            self.options.onLoad.call(self, $);
                        }
                        
                        // focus autofocused on simple blocks
                        if (!self.container.hasClass('dspopup-modal') || !_modal) {
                            self.container.find('*[autofocus]').focus();
                        }
                        else {
                            // calculate geometry of modal 
                            __align__();
                        }

                    } //construct ends

                var __result__ = function(data) {
                        // hide animation
                        if (self.options.showLoader) {
                            self.container.find('img.loadform').hide();
                            self.container.find('input[type="submit"]').show();
                        }

                        // order recieved data
                        delete(data['formid']);
                        // validation error
                        if (data['error'] == 1) {
                            delete(data['error']);
                            if (self.options.stackErrors) {
                                self.container.find('.error_form').empty();
                            }
                            else {
                                self.container.find('.dsform-field-error').remove();
                            }
                            var error_array = [];
                            // define "alert" class for improper fields 
                            $.each(data, function(index, val) {
                                if ($.inArray(val, error_array) == -1 && val != 1) error_array.push(val);
                                self.container.find('*[name="' + index + '"]').addClass('improper-value');
                                if (!self.options.stackErrors) {
                                    $('<span class="dsform-field-error named_as_' + index + '"><span>' + val + '</span></span>').appendTo(self.form.find('[name="' + index + '"]').parent());
                                }
                            });
                            self.container.find('*[required]').each(function() {
                                var field = $(this);
                                if (field.hasClass('improper-value') && !data[field.attr('name')]) {
                                    field.removeClass('improper-value');
                                }
                            });

                            if (self.options.stackErrors) {
                                var error_text = '<ul class="error-form">' + "\n";
                                $.each(error_array, function(index, val) {
                                    error_text += '<li>' + val + '</li>' + "\n";
                                })
                                error_text += '</ul>' + "\n";
                                self.container.find('.error_form').append(error_text);
                            }
                            if (typeof self.options.onFail === 'function') {
                                self.options.onFail.call(self, $);
                            }
                            // recalc geometry for modals
                            if (_modal) {
                                __align__();
                            }
                            else {
                                self.container.css('height', 'auto');
                            }
                            // if data was send successfully or not, show response message
                        }
                        else if (data['error'] == 0 || data['error'] == 2) {
                            self.form.remove();
                            self.container.find('.scrollform').remove();
                            console.log(2, self.form);
                            self.container.find('.scrollform').css('height', 'auto');
                            self.container.css('height', 'auto');
                            self.report = document.createElement('div');
                            self.report.id = _id + 'formmessagereport';
                            self.report.className = 'report-message';
                            self.report = $(self.report);
                            self.report.append(data['error_text']);
                            self.container.append(self.report);
                            self.report.find('.repeatform').bind('click', function(e) {
                                e.preventDefault();
                                $(this).unbind('click');
                                self.report.remove();
                                self.getForm();
                            });


                            // call user functions if need
                            if (data['error'] == 0) self.sended = true;

                            if (data['error'] == 0 && typeof self.options.onSuccess === 'function') {
                                self.options.onSuccess.call(self, $);
                            }
                            if (data['error'] == 2 && typeof self.options.onServerError === 'function') {
                                self.options.onServerError.call(self, $);
                            }

                            if (self.container.hasClass('dspopup-modal') || _modal) {
                                __align__();
                            }

                        }
                    } // result ends

                var __refocus__ = function() {
                        self.form.find('input, textarea, select').bind('focusin', function() {
                            self.form.find('input[type="text"], textarea, select').each(function() {
                                $(this).removeClass('focusout');
                            });
                        });
                        self.form.find('input[type="text"]:not(input[readonly]),textarea:not(textarea[readonly]), select').bind('focusout', function() {
                            $(this).addClass('focusout');
                        });
                    } // refocus ends

                // just copy reveal modal code locked on the container
                var __reveal__ = function() {
                        var modal = self.container,
                            locked = false,
                            modalBG = $('.dspopup-modal-bg');

                        if (modalBG.length == 0) {
                            modalBG = $('<div class="dspopup-modal-bg"></div>').insertAfter(modal);
                        }

                        if (!_formLoaded) {
                            var windowHeight = window.innerHeight ||
                                document.documentElement.clientHeight ||
                                document.body.clientHeight;
                            $('img.loadform').appendTo('.dspopup-modal-bg').css({
                                'height': '64px',
                                'width': '64px',
                                'margin': ((+windowHeight / 2) - 32) + 'px auto auto',
                                'display': 'block',
                            });
                        }

                        modal.bind('dspopup:open', function() {
                            modalBG.unbind('click.modalEvent');
                            $('.close-dspopup-modal').unbind('click.modalEvent');
                            if (!locked) {
                                lockModal();
                                modal.append('<div class="close-dspopup-modal dsclose-button"></div>');
                                modal.css({
                                    'opacity': 0,
                                    'visibility': 'visible',
                                    'display': 'block'
                                });
                                modal.addClass('active-dspopup');
                                modalBG.fadeIn(self.options.animationspeed / 2);
                                modal.delay(self.options.animationspeed / 2).animate({
                                        "opacity": 1
                                    },
                                    self.options.animationspeed,
                                    function() {
                                        _visible = true;
                                        self.container.find('*[autofocus]').focus();
                                        if (typeof self.options.onShow === "function") {
                                            self.options.onShow.call(self, $);
                                        }
                                        unlockModal();
                                    });
                            }
                            modal.unbind('dspopup:open');
                        });

                        modal.bind('dspopup:close', function() {
                            if (!locked) {
                                lockModal();
                                $('.close-dspopup-modal').remove();
                                modal.removeClass('active-dspopup');
                                modalBG.delay(self.options.animationspeed).fadeOut(self.options.animationspeed);
                                modal.animate({
                                        "opacity": 0
                                    },
                                    self.options.animationspeed,
                                    function() {
                                        _visible = false;
                                        modal.css({
                                            'opacity': 1,
                                            'visibility': 'hidden',
                                            'display': 'none'
                                        });
                                        if (self.options.additionalClass) self.container.removeClass(self.options.additionalClass);
                                        if (typeof self.options.onClose === "function") {
                                            self.options.onClose.call(self, $);
                                        }
                                        unlockModal();
                                        if (self.options.clearErrors) {
                                            self.form.find('.error-form, .dsform-field-error').remove();
                                            self.form.find('input.improper-value, textarea.improper-value').removeClass('improper-value');                                 
                                        }
                                    }
                                );
                            }
                            modal.unbind('dspopup:close');
                        });

                        modal.trigger('dspopup:open');
                        var closeButton = $('.close-dspopup-modal').bind('click.modalEvent', function() {
                            modal.trigger('dspopup:close');
                        });
                        if (self.options.closeonbackgroundclick) {
                            modalBG.css({
                                "cursor": "pointer"
                            })
                            modalBG.bind('click.modalEvent', function() {
                                modal.trigger('dspopup:close');
                            });
                        }
                        $('body').keyup(function(e) {
                            if (e.which === 27) {
                                modal.trigger('dspopup:close');
                            } // 27 is the keycode for the Escape key
                        });

                        function unlockModal() {
                            locked = false;
                        }

                        function lockModal() {
                            locked = true;
                        }
                    } // reveal ends
                    

                var __path__ = function($o, path) {
                        // The first time this function is called, path won't be defined.
                        if (typeof path == 'undefined') path = '';

                        // If this element is <html> we've reached the end of the path.
                        if ($o.is('html'))
                            return 'html' + path;

                        // Add the element name.

                        var cur = $o.get(0).nodeName.toLowerCase();

                        // Determine the IDs and path.
                        var id = $o.attr('id'),
                            className = $o.attr('class');


                        // Add the #id if there is one.
                        if (typeof id != 'undefined')
                            cur += '#' + id;

                        // Add any classes.
                        if (typeof className != 'undefined')
                            cur += '.' + className.split(/[\s\n]+/).join('.');

                        // Recurse up the DOM.
                        return __path__($o.parent(), ' > ' + cur + path);
                    } // path ends


                /* public methods */
                
                self.open = function() {
                        if (_modal) self.element.trigger('click');
                    } //open ends    

                self.close = function() {
                        if (_modal) self.container.trigger('dspopup:close');
                    } //close ends
                    
                self.getPath = function(e) {
                    if (!e) e = self.element;
                    return __path__(e);                
                }

                self.run = function(path, func, fname) {
                        try {
                            func.apply(this, arguments);
                            if (!gData[fname]) console.info('DSFORM: ' + fname + ' was loaded before');
                        }
                        catch (err) {
                            if (!gData[fname]) { // if script includes first time              
                                var s = document.createElement('script');
                                s.src = path;
                                document.head.appendChild(s);
                                gData[fname] = true;
                            }
                            setTimeout(function() {
                                self.run(path, func, fname);
                            }, 1000);
                        }
                    } // run ends


                self.getForm = function() {
                        self.sended = false;
                        // create query string for ajax
                        var datajax;
                        datajax = "formid=" + _id + '&route=DSFormView';
                        if (self.config) {
                            var configs = self.config.replace(/'/g, '"');
                            try {
                                eval(JSON.parse(configs));
                                datajax += "&dsconfig=" + configs;
                            }
                            catch (e) {
                                console.error('JSON array is improper for #' + _id + '!');
                            }
                        }
                        // send to template constructor
                        $.ajax({
                            url: root + "index.php",
                            type: "POST",
                            dataType: "text",
                            data: datajax,
                            cache: false,
                            success: function(data) {
                                __construct__(data);
                            }
                        });
                    } //getform ends
                    
                self.isOpen = function(){
                    return _visible;                
                }

                self.field = function(name) {
                    if (name.indexOf('#') === 0) {
                        return $(name);
                    }
                    else {
                        return $('[name="' + name + '"]');
                    }
                }


                if (o && options.formID && !_o.get(0).dsformmarker) {
                    __init__();
                }
                else if (_o.get(0).dsformmarker === true) {
                    console.warn('DSFORM (' + options.formID + '): element already uses \n Path: ' + __path__(self.element) + '\n Element:', self.element.get(0));
                }
                else if (!options.formID) {
                    console.warn('DSFORM: formID is undefined \n Path: ' + __path__(self.element) + ' \n Element:', self.element.get(0));
                }
                return self;
            } // dsform object ends

        // jQuery method
        $.dsform = function(opts, o) {
            if (o === undefined) {
                opts.modal = true;
                o = document.createElement('figure');
            }
            var result = new F(o, opts);
            return result;
        }

        $.dsform.ver = function() {
            return version;
        }
        $.dsform.uses = function() {
            return usings;
        }
        $.dsform.close = function(f_id) {
            $('[data-dsform-id="' + f_id + '"]').trigger('dspopup:close')
        }

        // jQuery plugin
        $.fn.dsform = function(options) {
            this.each(function() {
                new F($(this), options);
            });
            return this;
        }

        D.ready(function() {
            $('<img />', {
                'src': root + 'images/loading.gif',
                'class': 'loadform'
            }).css("display", "none").appendTo('body');
            var styleforms = document.createElement('link');
            styleforms.rel = "stylesheet";
            styleforms.href = root + "index.php?m=getcss";
            document.head.appendChild(styleforms);

            $('.ds-form').each(function() {
                $.dsform({
                    formID: $(this).attr('id'),
                    modal: false
                }, $(this));
            });

            $('*[data-dspopup-id]').each(function() {
                var id = $(this).attr('data-dspopup-id');
                $.dsform({
                    formID: id
                }, $(this));
            });
        }); // ready ends

    }(window, document, gKweri));

}