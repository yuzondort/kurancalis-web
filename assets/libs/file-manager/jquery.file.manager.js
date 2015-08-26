/*
CONFIGURATION
 */

//Url to the image-manager folder and include the trailing slash
var url_to_file_manager = 'http://test.kurancalis.com/assets/libs/file-manager/';

//These two variables can be used to translate. All you will need to do is change the text
var image_manager_insert_text = 'Insert';
var image_manager_cancel_text ='Cancel';

$(document).ready(function(){
    var element;

    $('body').append('<div id="myModal" class="reveal-modal xlarge"><div id="image-manager-frame"></div><p style="text-align: right; padding-right: 10px; padding-top: 5px;"><button id="image-manager-insert" type="button" class="image-manager-btn image-manager-btn-primary">' + image_manager_insert_text + '</button>&nbsp;<button id="image-manager-cancel" type="button" class="image-manager-btn image-manager-btn-default">' + image_manager_cancel_text + '</button></p></div>');

    $( "input.image-manager" ).each(function() {
        //$( this ).prop("readonly",true);
    });

    $(document).on('focus', 'input.file-manager', function () {
        element = $(this);

        $('#image-manager-frame').empty().append(GetTheHtml(element.val()));

        $('#myModal').reveal();
    });

    $(document).on('click', '.file-manager-linked', function () {
        element = $('#' + $(this).data('input-id'));

        $('#image-manager-frame').empty().append(GetTheHtml(element.val()));

        $('#myModal').reveal();
    });

    $(document).on('click', '#image-manager-insert', function () {
        element.val($('#image-manager-src').val());
        element.triggerHandler("change");
        //element.trigger('input');
        $('#myModal').trigger('reveal:close');
    });

    $(document).on('click', '#image-manager-cancel', function () {
        $('#myModal').trigger('reveal:close');
    });

    function GetTheHtml(existing_files){
        var html = '';
        html += '<input type="hidden" name="image-manager-src" id="image-manager-src" value="' + existing_files + '"/>';
        html += '<iframe src="' + url_to_file_manager + 'image.php'+ '?' + new Date().getTime() + '&user_id=111&src=' + encodeURI(existing_files) + '" frameborder="0" width="885" height="400"></iframe>';

        return html;
    }

});

/*
 * jQuery Reveal Plugin 1.0
 * www.ZURB.com
 * Copyright 2010, ZURB
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */


(function($) {

    /*---------------------------
     Defaults for Reveal
     ----------------------------*/

    /*---------------------------
     Listener for data-reveal-id attributes
     ----------------------------*/

    $('a[data-reveal-id]').on('click', function(e) {
        e.preventDefault();
        var modalLocation = $(this).attr('data-reveal-id');
        $('#'+modalLocation).reveal($(this).data());
    });

    /*---------------------------
     Extend and Execute
     ----------------------------*/

    $.fn.reveal = function(options) {


        var defaults = {
            animation: 'fadeAndPop', //fade, fadeAndPop, none
            animationspeed: 300, //how fast animtions are
            closeonbackgroundclick: true, //if you click background will modal close?
            dismissmodalclass: 'close-reveal-modal' //the class of a button or element that will close an open modal
        };

        //Extend dem' options
        var options = $.extend({}, defaults, options);

        return this.each(function() {

            /*---------------------------
             Global Variables
             ----------------------------*/
            var modal = $(this),
                topMeasure  = parseInt(modal.css('top')),
                topOffset = modal.height() + topMeasure,
                locked = false,
                modalBG = $('.reveal-modal-bg');

            /*---------------------------
             Create Modal BG
             ----------------------------*/
            if(modalBG.length == 0) {
                modalBG = $('<div class="reveal-modal-bg" />').insertAfter(modal);
            }

            /*---------------------------
             Open & Close Animations
             ----------------------------*/
            //Entrance Animations
            modal.bind('reveal:open', function () {
                modalBG.unbind('click.modalEvent');
                $('.' + options.dismissmodalclass).unbind('click.modalEvent');
                if(!locked) {
                    lockModal();
                    if(options.animation == "fadeAndPop") {
                        modal.css({'top': $(document).scrollTop()-topOffset, 'opacity' : 0, 'visibility' : 'visible'});
                        modalBG.fadeIn(options.animationspeed/2);
                        modal.delay(options.animationspeed/2).animate({
                            "top": $(document).scrollTop()+topMeasure + 'px',
                            "opacity" : 1
                        }, options.animationspeed,unlockModal());
                    }
                    if(options.animation == "fade") {
                        modal.css({'opacity' : 0, 'visibility' : 'visible', 'top': $(document).scrollTop()+topMeasure});
                        modalBG.fadeIn(options.animationspeed/2);
                        modal.delay(options.animationspeed/2).animate({
                            "opacity" : 1
                        }, options.animationspeed,unlockModal());
                    }
                    if(options.animation == "none") {
                        modal.css({'visibility' : 'visible', 'top':$(document).scrollTop()+topMeasure});
                        modalBG.css({"display":"block"});
                        unlockModal()
                    }
                }
                modal.unbind('reveal:open');
            });

            //Closing Animation
            modal.bind('reveal:close', function () {
                if(!locked) {
                    lockModal();
                    if(options.animation == "fadeAndPop") {
                        modalBG.delay(options.animationspeed).fadeOut(options.animationspeed);
                        modal.animate({
                            "top":  $(document).scrollTop()-topOffset + 'px',
                            "opacity" : 0
                        }, options.animationspeed/2, function() {
                            modal.css({'top':topMeasure, 'opacity' : 1, 'visibility' : 'hidden'});
                            unlockModal();
                        });
                    }
                    if(options.animation == "fade") {
                        modalBG.delay(options.animationspeed).fadeOut(options.animationspeed);
                        modal.animate({
                            "opacity" : 0
                        }, options.animationspeed, function() {
                            modal.css({'opacity' : 1, 'visibility' : 'hidden', 'top' : topMeasure});
                            unlockModal();
                        });
                    }
                    if(options.animation == "none") {
                        modal.css({'visibility' : 'hidden', 'top' : topMeasure});
                        modalBG.css({'display' : 'none'});
                    }
                }
                modal.unbind('reveal:close');
            });

            /*---------------------------
             Open and add Closing Listeners
             ----------------------------*/
            //Open Modal Immediately
            modal.trigger('reveal:open')

            //Close Modal Listeners
            var closeButton = $('.' + options.dismissmodalclass).bind('click.modalEvent', function () {
                modal.trigger('reveal:close')
            });

            if(options.closeonbackgroundclick) {
                modalBG.css({"cursor":"pointer"})
                modalBG.bind('click.modalEvent', function () {
                    modal.trigger('reveal:close')
                });
            }
            $('body').keyup(function(e) {
                if(e.which===27){ modal.trigger('reveal:close'); } // 27 is the keycode for the Escape key
            });


            /*---------------------------
             Animations Locks
             ----------------------------*/
            function unlockModal() {
                locked = false;
            }
            function lockModal() {
                locked = true;
            }

        });//each call
    }//orbit plugin call
})(jQuery);