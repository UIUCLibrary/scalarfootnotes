/**
 * Insert footnotes elements into CKEditor editing area.
 *
 * Version 0.1.0-mvp
 * https://github.com/UIUCLibrary/scalarfootnotes
 */

(function () {
    'use strict';

    CKEDITOR.plugins.add('scalarfootnotes', {
        footnote_ids: [],
        requires: 'widget',
        icons: 'footnotes',

        init: function ( editor ) {
            // Allow `cite` to be editable:
            CKEDITOR.dtd.$editable['cite'] = 1;

            // Add some CSS tweaks:
            var css = '.footnotes{background:#eee; padding:1px 15px;} .footnotes cite{font-style: normal;}';
            CKEDITOR.addCss(css);

            var $this = this;

            // Build the initial footnotes widget editables definition:
            var prefix = editor.config.footnotesPrefix ? '-' + editor.config.footnotesPrefix : '';
            var def = {};

            if (!editor.config.footnotesDisableHeader) {
                def.header = {
                    selector: 'header > *',
                    //allowedContent: ''
                    allowedContent: 'strong em span sub sup;'
                };
            }

            // Get the number of existing footnotes. Note that the editor document isn't populated
            // yet so we need to use vanilla JS:
            var div = document.createElement('div');
            div.innerHTML = editor.element.$.textContent.trim();

            var l = div.querySelectorAll('.footnotes li').length,
                i = 1;

            for (i; i <= l; i++) {
                def['footnote_' + i] = {selector: '#footnote' + prefix + '-' + i + ' cite', allowedContent: 'a[*]; cite[*](*); strong em span br'};
            }

            // Register the footnotes widget.
            editor.widgets.add('scalarfootnotes', {

                // Minimum HTML which is required by this widget to work.
                requiredContent: 'section(footnotes)',

                // Check the elements that need to be converted to widgets.
                upcast: function(element) {
                    return element.name == 'section' && element.hasClass('footnotes');
                },

                editables: def
            });

            // Register the footnotemarker widget.
            editor.widgets.add('footnotemarker', {

                // Minimum HTML which is required by this widget to work.
                requiredContent: 'sup[data-footnote-id]',

                // Check the elements that need to be converted to widgets.
                upcast: function(element) {
                    return element.name == 'sup' && typeof(element.attributes['data-footnote-id']) != 'undefined';
                },
            });

            //create toolbar button and its texts
            editor.ui.addButton('Footnotes', {

                // The text part of the button (if available) and tooptip.
                label: 'Insert Footnotes',

                // The command to execute on click.
                command: 'footnotes',

                // The button placement in the toolbar (toolbar group name).
                //not sure if this is needed. In the scalar implementation this is set explicitly in config
                toolbar: 'insert'
            });

            // Register our dialog file. this.path is the plugin folder path.
            CKEDITOR.dialog.add('scalarfootnotesDialog', this.path + 'dialogs/scalarfootnotes.js');

            // open the dialogue
            editor.addCommand('scalarfootnotes', new CKEDITOR.dialogCommand('scalarfootnotesDialog', {
                // @TODO: This needs work:
                allowedContent: 'section[*](*);header[*](*);li[*];a[*];cite(*)[*];sup[*]',
                requiredContent: 'section(footnotes);header;li[id,data-footnote-id];a[href,id,rel];cite;sup[data-footnote-id]'
            }));
        }
    })
}())