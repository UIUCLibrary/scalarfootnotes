
CKEDITOR.plugins.add( 'scalarfootnotes', {
    // footnote_max_id: [],
    footnote_ids : [],

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

    build: function (footnote_text, editor){

        const footnote_id = this.generateId();
        let footnote = editor.document.createElement('li', {
            attributes: {
                'data-footnote-id':footnote_id
            }
        })
        footnote.appendText(footnote_text)

        //insert the marker
        let footnote_marker =  editor.document.createElement('sup', {
            attributes: {
                'data-footnote-id':footnote_id
            }
        })

        let footnote_link = editor.document.createElement('a', {
            attributes: {
                'href': '#'
            }
        })
        footnote_link.appendText('X')
        footnote_marker.append(footnote_link)
        // let footnote_marker = '<sup id="' + footnote_id + '" data-footnote-id="' + footnote_id + '">X</sup>';
        editor.insertElement(footnote_marker);
        // footnote = '<li>' + footnote + '</li>';
        // console.log(Object.getOwnPropertyNames(editor))

        //insert note in the footnotes section
        this.insertNote(footnote, editor)
        this.numberMarkers(editor)

    },

    buildMarker: function (marker_id, editor){},

    buildNote: function (footnote_text, footnote_id, editor){},

    insertNote: function (footnote, editor){
        // editor.editable

        //todo: should this be findOne?
        let footnotes = editor.document.find('div.footnotes')
        console.log(footnotes)

        console.log(footnotes.$.length)
        if (footnotes.$.length === 0){
            var container = '<div class="footnotes"><ol></ol></div>';
            // Move cursor to end of content:
            var range = editor.createRange();
            range.moveToElementEditEnd(range.root);
            editor.getSelection().selectRanges([range]);
            // Insert the container:
            editor.insertHtml(container);
        }
            console.log(editor.document.findOne('div.footnotes > ol'))
            console.log(footnote)

            editor.document.findOne('div.footnotes > ol').append(footnote)


    },

    generateId: function (){
        // this.footnote_max_id += 1;
        // return "sfn-" + this.footnote_max_id.toString();

        var id = Math.random().toString(36).substring(2, 8);
        if (this.footnote_ids.includes(id)) {
            this.generateId()
        }

        this.footnote_ids.push(id);
        return id;

    },

    numberMarkers: function (editor){

        //generates a static nodeList
        const markers = editor.document.find('sup[data-footnote-id]')

        //update the text of the markers and their links
        for (let i = 0; i < markers.count(); i++){
            const footnote_number = i+1;
            let marker = markers.getItem(i);
            let footnote_link = marker.getChild(0);
            if (footnote_link && footnote_link.hasAttribute('href')){
                footnote_link.setAttribute('href', '#footnote-' + footnote_number.toString())
                footnote_link.setText(footnote_number.toString())
            }
        }

    },

    reorderFootnotes: function (editor, footnotes){


        // footnotes will be an ordered list of footnotes

        //spitballing ideas to use the footnotes array as a single source of truth
        //perhaps it would be better to get a query selector of the vdom wih the footnote markers, because
        //that is a better source of truth, i.e. the markers as the user put arranges and sees them
        footnotes.detach().sort(function(a, b) {
            return footnotes.indexOf(this.footnote_ids) ;
        });
    },

    updateFootnoteIds: function (editor, footnotes){

    }
} );
