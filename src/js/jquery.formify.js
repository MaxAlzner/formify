/**
 * jquery.formify.js
 * 
 * Created by: Max Alzner (https://github.com/MaxAlzner)
 * 
 * formify is released under the MIT License
 * 
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

(function ($) {
    'use strict';

    $.fn.formify = function (options) {
        var _options = $.extend({}, $.fn.formify.defaults, options),
            _stack = this.find(_options.targets || '');

        function _parser (value, type, name) {
            switch (type) {
                case 'number':
                case 'range':
                    return _options.parseNumber ? _options.numberParser(value) : value;
                case 'date':
                case 'datetime':
                case 'datetime-local':
                    return _options.parseDate ? _options.dateParser(value) : value;
                default: return value;
            }
        }

        var pairs = [];
        _stack.each(function () {
            var element = $(this),
                type = element.attr('data-formify-type') || element.attr('type') || this.tagName,
                value = element.val();
            if (type) {
                type = type.toLowerCase();
                if (this.name) {
                    pairs.push({
                        name: this.name,
                        value: (type === 'checkbox') ? this.checked : value,
                        type: type,
                        element: this
                    });
                }
                else {
                    console.error('Element does not have a name defined: ', this);
                }
            }
            else {
                console.error('Element type is invalid: ', this);
            }
        });

        pairs = pairs.filter(function (pair) {
            if (_options.ignoreEmpty && !pair.value.length) {
                return false;
            }

            return _options.filter(pair.value, pair.name, pair.element);
        });

        var result = {};
        pairs.forEach(function (pair) {
            var route = pair.name
                .split('[')
                .map(function (str) {
                    return str.replace(']', '');
                }),
                context = result;
            for (var i = 0; i < route.length; i++) {
                var key = route[i];
                if (i >= route.length - 1) {
                    context[key] = _parser(pair.value, pair.type, pair.name);
                }
                else {
                    if (context[key] === undefined) {
                        context[key] = {};
                    }

                    context = context[key];
                }
            }
        });

        return result;
    };

    $.fn.formify.defaults = {
        targets: 'input, select',

        ignoreEmpty: false,

        parseNumber: true,
        parseDate: true,

        filter: function (type, name, element) {
            return true;
        },

        numberParser: function (value) {
            return parseInt(value, 10);
        },
        dateParser: function (value) {
            return (new Date(value));
        }
    };
} ($));