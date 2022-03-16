/**
 * The scalarfootnotes dialogue definition
 * Version 0.1.0-mvp
 * https://github.com/UIUCLibrary/scalarfootnotes
 */

(function (){
    'use strict';
    CKEDITOR.dialog.add( 'scalarfootnotesDialogue', function ( editor ) {

        return {
            editor_name: false,
            scalarfootnotes_editor: false,
            dialog_dom_id: false,
            // Basic properties of the dialog window: title, minimum size.
            title: 'Manage Footnotes',
            minWidth: 400,
            minHeight: 200,
            // Contents of the dialog window
            //TODO: add tab to configure footnotes
            contents: [
                {
                    // Definition of the Basic Settings dialog tab (page).
                    id: 'tab-basic',
                    label: 'Basic Settings',

                    // The tab contents.
                    elements: [
                        {
                            // Text input field for the footnotes text.
                            type: 'textarea',
                            id: 'new_footnote',
                            'class': 'footnote_text',
                            label: 'New footnote:',
                            inputStyle: 'height: 100px',
                        }
                    ]
                },
            ],
            //Fires when dialog opens, instantiates the dialogue components
            onShow: function () {
                this.setupContent();
                var dialog = this;

                CKEDITOR.on( 'instanceLoaded', function( evt ) {
                    dialog.editor_name = evt.editor.name;
                    dialog.scalarfootnotes_editor = evt.editor;
                } );
                var current_editor_id = dialog.getParentEditor().id;
                CKEDITOR.replaceAll( function( textarea, config ) {
                    // Make sure the textarea has the correct class:
                    if (!textarea.className.match(/footnote_text/)) {
                        return false;
                    }

                    //add the elements to the toolbar for the footnote textarea
                    config.toolbar_Scalar = [
                        { name: 'clipboard', items : ['Undo','Redo' ] },
                        { name: 'basicstyles', items : [ 'Bold','Italic','Underline','TextColor', 'BGColor' ] },
                        { name: 'clear', items : [ 'RemoveFormat','Link','Unlink' ] },

                    ]
                    config.allowedContent = 'br em strong; a[!href]';
                    config.enterMode = CKEDITOR.ENTER_BR;
                    config.autoParagraph = false;
                    config.height = 80;
                    config.resize_enabled = false;
                    config.autoGrow_minHeight = 80;
                    config.removePlugins = 'scalarfootnotes, scalar';

                    var extra_config = editor.config.scalarfootnotesDialogEditorExtraConfig;
                    if (extra_config) {
                        for (var attribute in extra_config) {
                            config[attribute] = extra_config[attribute];
                        }
                    }
                    return true;
                });


            },

            //Fires when user hits Okay
            onOk: function() {
                var dialog = this;
                var footnote_editor = CKEDITOR.instances[dialog.editor_name];
                var footnote_data   = footnote_editor.getData();

                //TODO: need to make sure this is the correct type of check
                if (footnote_data != ''){
                    // Calls function from the core plugin to build the footnote
                    editor.plugins.scalarfootnotes.build(footnote_data, editor);
                }
                // Destroy the editor so it's rebuilt properly next time
                footnote_editor.destroy();
            },

            //Fires if user hits Cancel
            onCancel: function() {
                var dialog = this;
                var footnote_editor = CKEDITOR.instances[dialog.editor_name];
                footnote_editor.destroy();
            }
        };
    });
}(window.jQuery));