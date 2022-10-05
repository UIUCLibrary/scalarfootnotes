
CKEDITOR.plugins.add( 'scalarfootnotes', {
    // footnote_max_id: [],
    footnote_ids : [],

    requires: 'widget',

    icons: 'scalarfootnotes',

    //todo: make it so the footnote marker id and child href can't be changed
    //todo: make it so the footnote text id and the href of the return to text link can't be changed
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

    //builds a new footnote and reorder all markers and footnotes
    build: function (footnote_text, editor){

        //todo: lock and unlock snapshot

        //make the footnote list item
        const footnote_id = this.generateId();
        let footnote = editor.document.createElement('li', {
            attributes: {
                'id' : 'footnote-text-' + footnote_id,
                'data-footnote-relation-id' : footnote_id,
                'data-footnote-order' : -1
            }
        })
        footnote.appendText(footnote_text)

        //make the link that returns to the marker
        const footnote_marker_link = editor.document.createElement('a', {
            attributes : {
                'href' : 'footnote-marker-' + footnote_id,
                'class' : 'return-to-marker'
            }
        })
        footnote_marker_link.appendText('↵')

        //add the return to text link to the end of the footnote li
        footnote.append(footnote_marker_link)


        //insert the marker
        let footnote_marker =  editor.document.createElement('sup', {
            attributes: {
                'id': 'footnote-marker-' + footnote_id,
                'data-footnote-relation-id' : footnote_id,
                'data-footnote-order' : -1

            }
        })

        let footnote_link = editor.document.createElement('a', {
            attributes: {
                'href': 'footnote-text-' + footnote_id
            }
        })

        //give the link some dummy text else it won't be inserted
        footnote_link.appendText('X')

        //add the link to the marker
        footnote_marker.append(footnote_link)

        //insert the marker at the current focus
        editor.insertElement(footnote_marker);

        //insert note in the footnotes section
        this.insertNote(footnote, editor)

        //go through and renumber the markers
        this.updateMarkerData(editor)

        //go through and update the footnote ids
        this.updateFootnoteData(editor)

        // //rearrange the list items in the footnotes section
        this.reorderFootnotes(editor)

    },

    //reorders all footnotes and markers when a marker is moved
    moveMarker: function (marker, editor){
        //todo: lock and unlock snapshot

        //go through and renumber the markers
        this.updateMarkerData(editor)

        //go through and update the footnote ids
        this.updateFootnoteIds()

        //rearrange the list items in the footnotes section
        this.reorderFootnotes()
    },

    //helper function placeholder for refactoring
    buildMarker: function (marker_id, editor){},

    //helper function placeholder for refactoring to build the list item
    buildNote: function (footnote_text, footnote_id, editor){},

    //inserts the note into the footnoes section and builds the footnote section if needed
    insertNote: function (footnote, editor){

        //todo: should this be findOne?
        let footnotes = editor.document.find('div.footnotes')
        if (footnotes.$.length === 0){
            var container = '<div class="footnotes"><ol id="footnote-text"></ol></div>';
            // Move cursor to end of content:
            var range = editor.createRange();
            range.moveToElementEditEnd(range.root);
            editor.getSelection().selectRanges([range]);
            // Insert the container:
            editor.insertHtml(container);
        }
            editor.document.findOne('div.footnotes > ol').append(footnote)


    },

    //generates the id used for data-footnote-id which links a marker to a note
    //this facilitates an id for markers and notes that has semantic meaning (1,2.3)
    //while keeping track of marker<=>note relationships during reordering
    //todo: evaluate if it would be a better idea to have the semantic information in a data-footnote-id attribute and have the ids/links be a random string
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

    //order data and order metadata
    updateMarkerData: function (editor){

        //generates a static nodeList
        const markers = editor.document.find('sup[data-footnote-relation-id]')

        //update the text of the markers and their links
        for (let i = 0; i < markers.count(); i++){
            const footnote_number = i+1;
            let marker = markers.getItem(i);
            marker.setAttribute('data-footnote-order', footnote_number)
            let footnote_link = marker.getChild(0);
            if (footnote_link && footnote_link.hasAttribute('href')){
                footnote_link.setText(footnote_number.toString())
            }

        }
    },

    //update footnote order metadata
    updateFootnoteData: function (editor){
        //get the order of the markers
        const markers = editor.document.find('sup[data-footnote-relation-id]')

        for (let i = 0; i < markers.count(); i++){
            const marker = markers.getItem(i)
            const relation_id = marker.getAttribute('data-footnote-relation-id');
            const order = marker.getAttribute('data-footnote-order')
            if (relation_id && order) {
                let note = editor.document.findOne(`li[data-footnote-relation-id="${relation_id}"]`)
                note.setAttribute('data-footnote-order', order )
            }
        }


    },

    reorderFootnotes: function (editor){

        let footnotes_list = editor.document.findOne('ol#footnote-text')
        let footnotes = editor.document.find('ol#footnote-text li').toArray()

        footnotes.sort((a,b) => a.getAttribute('data-footnote-order') - b.getAttribute('data-footnote-order'))

        footnotes.forEach(el => footnotes_list.append(el))
    },
} );
