(function($) {
    'use strict';

CKEDITOR.plugins.add( 'scalarfootnotes', {
    footnote_max_id: 0,

    requires: 'widget',

    icons: 'scalarfootnotes',

    init: function( editor ) {
        // editor.widgets.add( 'scalarfootnotes', {
        //
        //     editables: {
        //         title: {
        //             selector: '.simplebox-title',
        //             allowedContent: 'br strong em'
        //         },
        //         content: {
        //             selector: '.simplebox-content',
        //             allowedContent: 'p br ul ol li strong em'
        //         }
        //     },
        //
        //     allowedContent:
        //         'div(!simplebox); div(!simplebox-content); h2(!simplebox-title)',
        //
        //     requiredContent: 'div(simplebox)',
        //
        //
        //     upcast: function( element ) {
        //         return element.name == 'div' && element.hasClass( 'simplebox' );
        //     },
        //
        // } );
        editor.ui.addButton('scalarfootnotes', {

            // The text part of the button (if available) and tooptip.
            label: 'Insert Footnote',

            // The command to execute on click.
            command: 'scalarfootnotes',

            // The button placement in the toolbar (toolbar group name).
            toolbar: 'insert'
        });
        editor.addCommand('scalarfootnotes', new CKEDITOR.dialogCommand('scalarfootnotesDialog', {
            // @TODO: This needs work:
            allowedContent: 'div[*](*);header[*](*);li[*];a[*];cite(*)[*];sup[*]',
            requiredContent: 'div[*](*);header[*](*);li[*];a[*];cite(*)[*];sup[*]'
        }));
        CKEDITOR.dialog.add('scalarfootnotesDialog', this.path + 'dialogs/scalarfootnotes.js');
    },
    build: function (editor){
        console.log('execute the build function')
        console.log(this.generateId(editor))

    },

    generateId: function (editor){
        this.footnote_max_id += 1;
        return "sfn-" + this.footnote_max_id.toString();

    },

    numberMarkers: function (editor){

    }
} );
}(window.jQuery));