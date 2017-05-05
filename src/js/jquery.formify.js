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

        function _parse(value, type) {
            switch (type) {
                case 'number':
                case 'range':
                    return parseInt(value, 10);
                case 'date':
                case 'datetime':
                case 'datetime-local':
                    return (new Date(value));
                default: return value;
            }
        }

        var pairs = [];
        _stack.each(function () {
            if (this.name) {
                var element = $(this),
                    type = element.attr('type') || this.tagName.toLowerCase(),
                    value = element.val();
                pairs.push({
                    name: this.name,
                    value: (type === 'checkbox') ? this.checked : value,
                    type: type
                });
            }
            else {
                console.error('Element does not have a name defined: ', this);
            }
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
                    context[key] = _parse(pair.value, pair.type);
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
        targets: 'input, select'
    };
} ($));