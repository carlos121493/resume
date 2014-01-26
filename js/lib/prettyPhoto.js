 $.prettyPhoto.stopSlideshow();
$pp_pic_holder.stop().find('object,embed').css('visibility','hidden');
$('div.pp_pic_holder,div.ppt,.pp_fade').fadeOut(settings.animation_speed,function(){ $(this).remove(); });
$pp_overlay.fadeOut(settings.animation_speed, function(){
if(settings.hideflash) $('object,embed,iframe[src*=youtube],iframe[src*=vimeo]').css('visibility','visible'); // Show the flash
$(this).remove(); // No more need for the prettyPhoto markup
$(window).unbind('scroll.prettyphoto');
clearHashtag();
settings.callback();
doresize = true;
pp_open = false;
delete settings;
});
};
/**
* Set the proper sizes on the containers and animate the content in.
*/
function _showContent(){
$('.pp_loaderIcon').hide();
// Calculate the opened top position of the pic holder
projectedTop = scroll_pos['scrollTop'] + ((windowHeight/2) - (pp_dimensions['containerHeight']/2));
if(projectedTop < 0) projectedTop = 0;
$ppt.fadeTo(settings.animation_speed,1);
// Resize the content holder
$pp_pic_holder.find('.pp_content')
.animate({
height:pp_dimensions['contentHeight'],
width:pp_dimensions['contentWidth']
},settings.animation_speed);
// Resize picture the holder
$pp_pic_holder.animate({
'top': projectedTop,
'left': ((windowWidth/2) - (pp_dimensions['containerWidth']/2) < 0) ? 0 : (windowWidth/2) - (pp_dimensions['containerWidth']/2),
width:pp_dimensions['containerWidth']
},settings.animation_speed,function(){
$pp_pic_holder.find('.pp_hoverContainer,#fullResImage').height(pp_dimensions['height']).width(pp_dimensions['width']);
$pp_pic_holder.find('.pp_fade').fadeIn(settings.animation_speed); // Fade the new content
// Show the nav
if(isSet && _getFileType(pp_images[set_position])=="image") { $pp_pic_holder.find('.pp_hoverContainer').show(); }else{ $pp_pic_holder.find('.pp_hoverContainer').hide(); }
if(settings.allow_expand) {
if(pp_dimensions['resized']){ // Fade the resizing link if the image is resized
$('a.pp_expand,a.pp_contract').show();
}else{
$('a.pp_expand').hide();
}
}
if(settings.autoplay_slideshow && !pp_slideshow && !pp_open) $.prettyPhoto.startSlideshow();
settings.changepicturecallback(); // Callback!
pp_open = true;
});
_insert_gallery();
pp_settings.ajaxcallback();
};
/**
* Hide the content...DUH!
*/
function _hideContent(callback){
// Fade out the current picture
$pp_pic_holder.find('#pp_full_res object,#pp_full_res embed').css('visibility','hidden');
$pp_pic_holder.find('.pp_fade').fadeOut(settings.animation_speed,function(){
$('.pp_loaderIcon').show();
callback();
});
};
/**
* Check the item position in the gallery array, hide or show the navigation links
* @param setCount {integer} The total number of items in the set
*/
function _checkPosition(setCount){
(setCount > 1) ? $('.pp_nav').show() : $('.pp_nav').hide(); // Hide the bottom nav if it's not a set.
};
/**
* Resize the item dimensions if it's bigger than the viewport
* @param width {integer} Width of the item to be opened
* @param height {integer} Height of the item to be opened
* @return An array containin the "fitted" dimensions
*/
function _fitToViewport(width,height){
resized = false;
_getDimensions(width,height);
// Define them in case there's no resize needed
imageWidth = width, imageHeight = height;
if( ((pp_containerWidth > windowWidth) || (pp_containerHeight > windowHeight)) && doresize && settings.allow_resize && !percentBased) {
resized = true, fitting = false;
while (!fitting){
if((pp_containerWidth > windowWidth)){
imageWidth = (windowWidth - 200);
imageHeight = (height/width) * imageWidth;
}else if((pp_containerHeight > windowHeight)){
imageHeight = (windowHeight - 200);
imageWidth = (width/height) * imageHeight;
}else{
fitting = true;
};
pp_containerHeight = imageHeight, pp_containerWidth = imageWidth;
};
if((pp_containerWidth > windowWidth) || (pp_containerHeight > windowHeight)){
_fitToViewport(pp_containerWidth,pp_containerHeight)
};
_getDimensions(imageWidth,imageHeight);
};
return {
width:Math.floor(imageWidth),
height:Math.floor(imageHeight),
containerHeight:Math.floor(pp_containerHeight),
containerWidth:Math.floor(pp_containerWidth) + (settings.horizontal_padding * 2),
contentHeight:Math.floor(pp_contentHeight),
contentWidth:Math.floor(pp_contentWidth),
resized:resized
};
};
/**
* Get the containers dimensions according to the item size
* @param width {integer} Width of the item to be opened
* @param height {integer} Height of the item to be opened
*/
function _getDimensions(width,height){
width = parseFloat(width);
height = parseFloat(height);
// Get the details height, to do so, I need to clone it since it's invisible
$pp_details = $pp_pic_holder.find('.pp_details');
$pp_details.width(width);
detailsHeight = parseFloat($pp_details.css('marginTop')) + parseFloat($pp_details.css('marginBottom'));
$pp_details = $pp_details.clone().addClass(settings.theme).width(width).appendTo($('body')).css({
'position':'absolute',
'top':-10000
});
detailsHeight += $pp_details.height();
detailsHeight = (detailsHeight <= 34) ? 36 : detailsHeight; // Min-height for the details
$pp_details.remove();
// Get the titles height, to do so, I need to clone it since it's invisible
$pp_title = $pp_pic_holder.find('.ppt');
$pp_title.width(width);
titleHeight = parseFloat($pp_title.css('marginTop')) + parseFloat($pp_title.css('marginBottom'));
$pp_title = $pp_title.clone().appendTo($('body')).css({
'position':'absolute',
'top':-10000
});
titleHeight += $pp_title.height();
$pp_title.remove();
// Get the container size, to resize the holder to the right dimensions
pp_contentHeight = height + detailsHeight;
pp_contentWidth = width;
pp_containerHeight = pp_contentHeight + titleHeight + $pp_pic_holder.find('.pp_top').height() + $pp_pic_holder.find('.pp_bottom').height();
pp_containerWidth = width;
}
function _getFileType(itemSrc){
if (itemSrc.match(/youtube\.com\/watch/i) || itemSrc.match(/youtu\.be/i)) {
return 'youtube';
}else if (itemSrc.match(/vimeo\.com/i)) {
return 'vimeo';
}else if(itemSrc.match(/\b.mov\b/i)){
return 'quicktime';
}else if(itemSrc.match(/\b.swf\b/i)){
return 'flash';
}else if(itemSrc.match(/\biframe=true\b/i)){
return 'iframe';
}else if(itemSrc.match(/\bajax=true\b/i)){
return 'ajax';
}else if(itemSrc.match(/\bcustom=true\b/i)){
return 'custom';
}else if(itemSrc.substr(0,1) == '#'){
return 'inline';
}else{
return 'image';
};
};
function _center_overlay(){
if(doresize && typeof $pp_pic_holder != 'undefined') {
scroll_pos = _get_scroll();
contentHeight = $pp_pic_holder.height(), contentwidth = $pp_pic_holder.width();
projectedTop = (windowHeight/2) + scroll_pos['scrollTop'] - (contentHeight/2);
if(projectedTop < 0) projectedTop = 0;
if(contentHeight > windowHeight)
return;
$pp_pic_holder.css({
'top': projectedTop,
'left': (windowWidth/2) + scroll_pos['scrollLeft'] - (contentwidth/2)
});
};
};
function _get_scroll(){
if (self.pageYOffset) {
return {scrollTop:self.pageYOffset,scrollLeft:self.pageXOffset};
} else if (document.documentElement && document.documentElement.scrollTop) { // Explorer 6 Strict
return {scrollTop:document.documentElement.scrollTop,scrollLeft:document.documentElement.scrollLeft};
} else if (document.body) {// all other Explorers
return {scrollTop:document.body.scrollTop,scrollLeft:document.body.scrollLeft};
};
};
function _resize_overlay() {
windowHeight = $(window).height(), windowWidth = $(window).width();
if(typeof $pp_overlay != "undefined") $pp_overlay.height($(document).height()).width(windowWidth);
};
function _insert_gallery(){
if(isSet && settings.overlay_gallery && _getFileType(pp_images[set_position])=="image") {
itemWidth = 52+5; // 52 beign the thumb width, 5 being the right margin.
navWidth = (settings.theme == "facebook" || settings.theme == "pp_default") ? 50 : 30; // Define the arrow width depending on the theme
itemsPerPage = Math.floor((pp_dimensions['containerWidth'] - 100 - navWidth) / itemWidth);
itemsPerPage = (itemsPerPage < pp_images.length) ? itemsPerPage : pp_images.length;
totalPage = Math.ceil(pp_images.length / itemsPerPage) - 1;
// Hide the nav in the case there's no need for links
if(totalPage == 0){
navWidth = 0; // No nav means no width!
$pp_gallery.find('.pp_arrow_next,.pp_arrow_previous').hide();
}else{
$pp_gallery.find('.pp_arrow_next,.pp_arrow_previous').show();
};
galleryWidth = itemsPerPage * itemWidth;
fullGalleryWidth = pp_images.length * itemWidth;
// Set the proper width to the gallery items
$pp_gallery
.css('margin-left',-((galleryWidth/2) + (navWidth/2)))
.find('div:first').width(galleryWidth+5)
.find('ul').width(fullGalleryWidth)
.find('li.selected').removeClass('selected');
goToPage = (Math.floor(set_position/itemsPerPage) < totalPage) ? Math.floor(set_position/itemsPerPage) : totalPage;
$.prettyPhoto.changeGalleryPage(goToPage);
$pp_gallery_li.filter(':eq('+set_position+')').addClass('selected');
}else{
$pp_pic_holder.find('.pp_content').unbind('mouseenter mouseleave');
// $pp_gallery.hide();
}
}
function _build_overlay(caller){
// Inject Social Tool markup into General markup
if(settings.social_tools)
facebook_like_link = settings.social_tools.replace('{location_href}', encodeURIComponent(location.href));
settings.markup = settings.markup.replace('{pp_social}','');
$('body').append(settings.markup); // Inject the markup
$pp_pic_holder = $('.pp_pic_holder') , $ppt = $('.ppt'), $pp_overlay = $('div.pp_overlay'); // Set my global selectors
// Inject the inline gallery!
if(isSet && settings.overlay_gallery) {
currentGalleryPage = 0;
toInject = "";
for (var i=0; i < pp_images.length; i++) {
if(!pp_images[i].match(/\b(jpg|jpeg|png|gif)\b/gi)){
classname = 'default';
img_src = '';
}else{
classname = '';
img_src = pp_images[i];
}
toInject += "<li class='"+classname+"'><a href='#'><img src='" + img_src + "' width='50' alt='' /></a></li>";
};
toInject = settings.gallery_markup.replace(/{gallery}/g,toInject);
$pp_pic_holder.find('#pp_full_res').after(toInject);
$pp_gallery = $('.pp_pic_holder .pp_gallery'), $pp_gallery_li = $pp_gallery.find('li'); // Set the gallery selectors
$pp_gallery.find('.pp_arrow_next').click(function(){
$.prettyPhoto.changeGalleryPage('next');
$.prettyPhoto.stopSlideshow();
return false;
});
$pp_gallery.find('.pp_arrow_previous').click(function(){
$.prettyPhoto.changeGalleryPage('previous');
$.prettyPhoto.stopSlideshow();
return false;
});
$pp_pic_holder.find('.pp_content').hover(
function(){
$pp_pic_holder.find('.pp_gallery:not(.disabled)').fadeIn();
},
function(){
$pp_pic_holder.find('.pp_gallery:not(.disabled)').fadeOut();
});
itemWidth = 52+5; // 52 beign the thumb width, 5 being the right margin.
$pp_gallery_li.each(function(i){
$(this)
.find('a')
.click(function(){
$.prettyPhoto.changePage(i);
$.prettyPhoto.stopSlideshow();
return false;
});
});
};
// Inject the play/pause if it's a slideshow
if(settings.slideshow){
$pp_pic_holder.find('.pp_nav').prepend('<a href="#" class="pp_play">Play</a>')
$pp_pic_holder.find('.pp_nav .pp_play').click(function(){
$.prettyPhoto.startSlideshow();
return false;
});
}
$pp_pic_holder.attr('class','pp_pic_holder ' + settings.theme); // Set the proper theme
$pp_overlay
.css({
'opacity':0,
'height':$(document).height(),
'width':$(window).width()
})
.bind('click',function(){
if(!settings.modal) $.prettyPhoto.close();
});
$('a.pp_close').bind('click',function(){ $.prettyPhoto.close(); return false; });
if(settings.allow_expand) {
$('a.pp_expand').bind('click',function(e){
// Expand the image
if($(this).hasClass('pp_expand')){
$(this).removeClass('pp_expand').addClass('pp_contract');
doresize = false;
}else{
$(this).removeClass('pp_contract').addClass('pp_expand');
doresize = true;
};
_hideContent(function(){ $.prettyPhoto.open(); });
return false;
});
}
$pp_pic_holder.find('.pp_previous, .pp_nav .pp_arrow_previous').bind('click',function(){
$.prettyPhoto.changePage('previous');
$.prettyPhoto.stopSlideshow();
return false;
});
$pp_pic_holder.find('.pp_next, .pp_nav .pp_arrow_next').bind('click',function(){
$.prettyPhoto.changePage('next');
$.prettyPhoto.stopSlideshow();
return false;
});
_center_overlay(); // Center it
};
if(!pp_alreadyInitialized && getHashtag()){
pp_alreadyInitialized = true;
// Grab the rel index to trigger the click on the correct element
hashIndex = getHashtag();
hashRel = hashIndex;
hashIndex = hashIndex.substring(hashIndex.indexOf('/')+1,hashIndex.length-1);
hashRel = hashRel.substring(0,hashRel.indexOf('/'));
// Little timeout to make sure all the prettyPhoto initialize scripts has been run.
// Useful in the event the page contain several init scripts.
setTimeout(function(){ $("a["+pp_settings.hook+"^='"+hashRel+"']:eq("+hashIndex+")").trigger('click'); },50);
}
return this.unbind('click.prettyphoto').bind('click.prettyphoto',$.prettyPhoto.initialize); // Return the jQuery object for chaining. The unbind method is used to avoid click conflict when the plugin is called more than once
};
function getHashtag(){
var url = location.href;
hashtag = (url.indexOf('#prettyPhoto') !== -1) ? decodeURI(url.substring(url.indexOf('#prettyPhoto')+1,url.length)) : false;
return hashtag;
};
function setHashtag(){
if(typeof theRel == 'undefined') return; // theRel is set on normal calls, it's impossible to deeplink using the API
location.hash = theRel + '/'+rel_index+'/';
};
function clearHashtag(){
if ( location.href.indexOf('#prettyPhoto') !== -1 ) location.hash = "prettyPhoto";
}
function getParam(name,url){
name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
var regexS = "[\\?&]"+name+"=([^&#]*)";
var regex = new RegExp( regexS );
var results = regex.exec( url );
return ( results == null ) ? "" : results[1];
}
})(jQuery);
var pp_alreadyInitialized = false; // Used for the deep linking to make sure not to call the same function several times. 