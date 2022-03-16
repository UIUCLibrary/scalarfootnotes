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
        build: function(footnote, editor) {
            var footnote_id = this.generateFootnoteId();

            // Insert the marker with dummy content:
            var footnote_marker = '<sup data-footnote-id="' + footnote_id + '">X</sup>';

            editor.insertHtml(footnote_marker);

            editor.fire('lockSnapshot');
            this.addFootnote(this.buildFootnote(footnote_id, footnote, false, editor), editor);
            editor.fire('unlockSnapshot');

            this.reorderMarkers(editor);
        },

        buildFootnote: function(footnote_id, footnote_text, data, editor) {
            var links   = '',
                footnote,
                letters = 'abcdefghijklmnopqrstuvwxyz',
                order   = data ? data.order.indexOf(footnote_id) + 1 : 1,
                prefix  = editor.config.footnotesPrefix ? '-' + editor.config.footnotesPrefix : '';

            if (data && data.occurrences[footnote_id] == 1) {
                links = '<a href="#footnote-marker' + prefix + '-' + order + '-1">↵</a> ';
            } else if (data && data.occurrences[footnote_id] > 1) {
                var i = 0
                    , l = data.occurrences[footnote_id]
                    , n = l;
                for (i; i < l; i++) {
                    links += '<a href="#footnote-marker' + prefix + '-' + order + '-' + (i + 1) + '">' + letters.charAt(i) + '</a>';
                    if (i < l-1) {
                        links += ', ';
                    } else {
                        links += ' ';
                    }
                }
            }
            footnote = '<li id="footnote' + prefix + '-' + order + '" data-footnote-id="' + footnote_id + '"><cite>' + footnote_text + '</cite>' + links + '</li>';
            return footnote;
        },

        addFootnote: function(footnote, editor) {
            var $contents  = $(editor.editable().$);
            var $footnotes = $contents.find('.footnotes');

            if ($footnotes.length == 0) {
                var header_title = editor.config.footnotesTitle ? editor.config.footnotesTitle : 'Footnotes';
                var header_els = ['<h2>', '</h2>'];//editor.config.editor.config.footnotesHeaderEls
                if (editor.config.footnotesHeaderEls) {
                    header_els = editor.config.footnotesHeaderEls;
                }
                var container = '<div class="footnotes"><hr aria-label="Footnotes below"><header>' + header_els[0] + header_title + header_els[1] + '</header><ol>' + footnote + '</ol></div>';
                // Move cursor to end of content:
                var range = editor.createRange();
                range.moveToElementEditEnd(range.root);
                editor.getSelection().selectRanges([range]);
                // Insert the container:
                editor.insertHtml(container);
            } else {
                $footnotes.find('ol').append(footnote);
            }
        },

        generateFootnoteId: function() {
            var id = Math.random().toString(36).substr(2, 5);
            while ($.inArray(id, this.footnote_ids) != -1) {
                id = String(this.generateFootnoteId());
            }
            this.footnote_ids.push(id);
            return id;
        },






    });
}(window.jQuery))