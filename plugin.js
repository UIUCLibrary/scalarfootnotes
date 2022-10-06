
CKEDITOR.plugins.add( 'scalarfootnotes', {
    // footnote_max_id: [],
    footnote_ids : [],

    requires: 'widget',

    icons: 'scalarfootnotes',

    //configurations
    //todo: make it so the footnote marker id and child href can't be changed
    //todo: make it so the footnote text id and the href of the return to text link can't be changed
    //todo: maybe not possible, but make it so the ol is not editable butt the li are editable to prevent accidental additions of list items

    //features
    //todo: move the marker

    //events
    //todo: on delete marker, delete note
    //todo: on delete note, delete marker
    //todo: on moving a marker, update marker data, update footnote data, rearrange footnotes

    //edge cases
    //todo: do nothing if marker is dragged into the footnote area
    //todo: footnote with no body
    //todo: footnote as first character
    //todo: footnote as last character
    init: function( editor ) {

        //placeholder css
        var css = '.footnotes{background:#eee; padding:1px 15px;} .footnotes li{font-style: normal;}';
        CKEDITOR.addCss(css);
        CKEDITOR.dtd.$editable['cite'] = 1;
        CKEDITOR.dtd.$editable['ol'] = 1;
        CKEDITOR.dtd.$editable['li'] = 1;
        var $this = this;
        editor.on('change', function (event){
            // SetTimeout seems to be necessary (it's used in the core but can't be 100% sure why)
            setTimeout(function(){
                //get the markers
                let in_sync = true;
                let markers = editor.document.find('sup[data-footnote-relation-id]').toArray();
                let notes = editor.document.find('li[data-footnote-relation-id]').toArray();
                if (markers.length > 0 && notes.length > 0){
                    let marker_order = markers.map(a => a.getAttribute('data-footnote-relation-id'))
                    let note_order = notes.map(a => a.getAttribute('data-footnote-relation-id'))

                    if (marker_order !== note_order){
                        console.log('not in sync')
                        //go through and renumber the markers
                        $this.updateMarkerData(editor)

                        //go through and update the footnote ids
                        $this.updateFootnoteData(editor)

                        // //rearrange the list items in the footnotes section
                        $this.reorderFootnotes(editor)
                    }
                }
                },
                10
            );
        })
        // editor.on('afterPaste', function (event){
        //     console.log('the on afterPaste event has been triggered')
        // })
        // editor.on('dragStart', function (event){
        //     console.log('the on dragStart event has been triggered')
        // })
        // editor.on('dragEnd', function (event){
        //     console.log('the on dragEnd event has been triggered')
        // })
        // editor.on('paste', function (event){
        //     console.log('the on paste event has been triggered')
        // })
        // Register the scalarfootnotes widget.
        editor.widgets.add('scalarfootnotes', {

            // Minimum HTML which is required by this widget to work.
            requiredContent: 'div(footnotes)',


            // Check the elements that need to be converted to widgets.
            upcast: function(element) {
                return element.name == 'div' && element.hasClass('footnotes');
            },

        });

        // Register the footnotemarker widget.
        editor.widgets.add('footnotemarker', {

            // Minimum HTML which is required by this widget to work.
            requiredContent: 'sup[data-footnote-relation-id]',

            // Check the elements that need to be converted to widgets.
            upcast: function(element) {
                return element.name == 'sup' && element.attributes['data-footnote-relation-id'] != 'undefined';
            },
        });


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
        let footnote_id = this.generateId();
        let footnote = editor.document.createElement('li', {
            attributes: {
                'class' : 'footnote-text',
                'id' : 'footnote-text-' + footnote_id,
                'data-footnote-relation-id' : footnote_id,
                'data-footnote-order' : -1
            }
        })
        footnote.appendHtml(footnote_text)

        //make the link that returns to the marker
        let footnote_marker_link = editor.document.createElement('a', {
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
                'class' : 'footnote-marker',
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

        //insert the marker at the current focus. Don't understand why, but must be inserted as html not object
        //or it won't become a widget
        editor.insertHtml(footnote_marker.getOuterHtml());

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
        const footnotes = editor.document.find('ol#footnote-text li')

        //set order to -1
        if (footnotes.count()){
            for (let i = 0; i < footnotes.count(); i++){
                let fn = footnotes.getItem(i);
                fn.setAttribute('data-footnote-order','-1');
            }
        }

        //apply the correct order from markers
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
        if(footnotes_list){
            //get a copy of the footnotes
            let footnotes = editor.document.find('ol#footnote-text li').toArray()
            //remove the notes
            footnotes_list.setHtml('')

            //sort the copied footnotes by order id
            footnotes.sort((a,b) => a.getAttribute('data-footnote-order') - b.getAttribute('data-footnote-order'))

            for (let i=0; i < footnotes.length; i++){
                if(footnotes[i].getAttribute('data-footnote-order') > 0 ){
                    footnotes_list.append(footnotes[i])
                }
            }
        }

    },
} );
