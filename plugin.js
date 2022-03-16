/**
 * Insert footnotes elements into CKEditor editing area.
 *
 * Version 0.1.0-mvp
 * https://github.com/UIUCLibrary/scalarfootnotes
 */

(function ($) {
    'use strict';

    CKEDITOR.plugins.add('scalarfootnotes', {
        footnote_ids: [],
        requires: 'widget',
        icons: 'scalarfootnotes',

        init: function(editor) {

            // Check for jQuery
            // @TODO - remove if/when JQ dep. is removed.
            if (typeof(window.jQuery) == 'undefined') {
                console.warn('jQuery required but undetected so quitting scalarfootnotes.');
                return false;
            }

            // Allow `cite` to be editable:
            CKEDITOR.dtd.$editable['cite'] = 1;

            // Add some CSS tweaks:
            var css = '.scalarfootnotes{background:#eee; padding:1px 15px;} .scalarfootnotes cite{font-style: normal;}';
            CKEDITOR.addCss(css);

            var $this = this;

            // Build the initial scalarfootnotes widget editables definition:
            var prefix = editor.config.scalarfootnotesPrefix ? '-' + editor.config.scalarfootnotesPrefix : '';
            var def = {
                header: {
                    selector: 'header > *',
                    //allowedContent: ''
                    allowedContent: 'strong em span sub sup;'
                }
            };
            var contents = $('<div>' + editor.element.$.textContent + '</div>')
                , l = contents.find('.scalarfootnotes li').length
                , i = 1;
            for (i; i <= l; i++) {
                def['footnote_' + i] = {selector: '#footnote' + prefix + '-' + i + ' cite', allowedContent: 'a[href]; cite[*](*); strong em span br'};
            }

            // Register the scalarfootnotes widget.
            editor.widgets.add('scalarfootnotes', {

                // Minimum HTML which is required by this widget to work.
                requiredContent: 'div(scalarfootnotes)',

                // Check the elements that need to be converted to widgets.
                upcast: function(element) {
                    return element.name == 'div' && element.hasClass('scalarfootnotes');
                },

                editables: def
            });

            // Register the footnotemarker widget.
            editor.widgets.add('footnotemarker', {

                // Minimum HTML which is required by this widget to work.
                requiredContent: 'sup[data-footnote-id]',

                // Check the elements that need to be converted to widgets.
                upcast: function(element) {
                    return element.name == 'sup' && element.attributes['data-footnote-id'] != 'undefined';
                },
            });

            // Define an editor command that opens our dialog.
            editor.addCommand('scalarfootnotes', new CKEDITOR.dialogCommand('scalarfootnotesDialog', {
                // @TODO: This needs work:
                allowedContent: 'div[*](*);header[*](*);li[*];a[*];cite(*)[*];sup[*]',
                requiredContent: 'div[*](*);header[*](*);li[*];a[*];cite(*)[*];sup[*]'
            }));

            // Create a toolbar button that executes the above command.
            editor.ui.addButton('Footnotes', {

                // The text part of the button (if available) and tooptip.
                label: 'Insert Footnotes',

                // The command to execute on click.
                command: 'scalarfootnotes',

                // The button placement in the toolbar (toolbar group name).
                toolbar: 'insert'
            });

            // Register our dialog file. this.path is the plugin folder path.
            CKEDITOR.dialog.add('scalarfootnotesDialog', this.path + 'dialogs/scalarfootnotes.js');
        },

    });
}(window.jQuery))